// ============================================
// MLBB Strategic Companion - Data Sync Script
// Pulls live data from mlbb-stats API into Supabase
// Usage: node scripts/sync-data.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local manually ──
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  env[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_BASE = 'https://mlbb-stats.rone.dev/api';

// ── Helpers ──

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function cleanHTML(text) {
  if (!text) return '';
  return text
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTrailingComma(text) {
  return text.replace(/,\s*$/, '').trim();
}

// ── Progress logging ──

function logStep(step, total, label) {
  const pct = Math.round((step / total) * 100);
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}% - ${label}    `);
}

// ============================================
// SYNC HEROES (132 heroes)
// ============================================
async function syncHeroes() {
  console.log('\n🦸 Syncing heroes...');
  const heroes = [];
  const allSkills = [];
  const TOTAL = 132;

  for (let heroId = 1; heroId <= TOTAL; heroId++) {
    logStep(heroId, TOTAL, `Hero ${heroId}`);

    try {
      const data = await fetchJSON(`${API_BASE}/hero-detail/${heroId}`);
      const record = data?.data?.records?.[0]?.data;
      if (!record) {
        console.log(`\n  ⚠ Hero ${heroId} not found, skipping`);
        continue;
      }

      const hero = record.hero?.data || {};
      const relation = record.relation || {};

      // Ability bars: abilityshow = [durability, offense, ability_effects, difficulty-ish]
      // But difficulty is a separate field
      const abilities = (hero.abilityshow || []).map(Number);

      heroes.push({
        hero_id: heroId,
        name: hero.name || `Hero ${heroId}`,
        roles: (hero.sortlabel || []).filter(r => r && r !== ''),
        lanes: (hero.roadsortlabel || []).filter(l => l && l !== ''),
        specialty: hero.speciality || [],
        durability: abilities[0] || 0,
        offense: abilities[1] || 0,
        ability_effects: abilities[2] || 0,
        difficulty: Number(hero.difficulty) || 0,
        icon_url: hero.head || '',
        splash_url: hero.painting || hero.squareheadbig || '',
        strong_against: relation.strong?.target_hero_id || [],
        weak_against: relation.weak?.target_hero_id || [],
        synergy_with: relation.assist?.target_hero_id || [],
        win_rate: 0,
        pick_rate: 0,
        ban_rate: 0,
        last_synced: new Date().toISOString(),
      });

      // Skills - handle multiple skill sets (Kagura, Selena, etc.)
      const skillLists = hero.heroskilllist || [];
      for (let setIndex = 0; setIndex < skillLists.length; setIndex++) {
        const skills = skillLists[setIndex]?.skilllist || [];
        for (let skillIdx = 0; skillIdx < skills.length; skillIdx++) {
          const s = skills[skillIdx];
          const isPassive = !s['skillcd&cost'] || s['skillcd&cost'].trim() === '';
          allSkills.push({
            hero_id: heroId,
            skill_set: setIndex + 1,
            skill_index: skillIdx,
            skill_name: s.skillname || '?',
            skill_type: isPassive && skillIdx === 0 ? 'passive' : 'active',
            description: cleanHTML(s.skilldesc || ''),
            cooldown_cost: s['skillcd&cost'] || '',
            icon_url: s.skillicon || '',
            tags: (s.skilltag || []).map(t => t.tagname).filter(Boolean),
            last_synced: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.log(`\n  ✗ Error on hero ${heroId}: ${err.message}`);
    }

    // Rate limit: small delay between requests
    if (heroId % 10 === 0) await sleep(500);
    else await sleep(100);
  }

  // Upsert heroes
  console.log(`\n  Inserting ${heroes.length} heroes...`);
  const { error: heroErr } = await supabase
    .from('heroes')
    .upsert(heroes, { onConflict: 'hero_id' });
  if (heroErr) {
    console.error('  ✗ Hero insert error:', heroErr.message);
  } else {
    console.log(`  ✓ ${heroes.length} heroes synced`);
  }

  // Insert skills (delete first, then bulk insert)
  console.log(`  Inserting ${allSkills.length} skills...`);
  const { error: delSkillErr } = await supabase.from('hero_skills').delete().gte('id', 0);
  if (delSkillErr) console.error('  ✗ Skill delete error:', delSkillErr.message);

  // Insert in batches of 200
  for (let i = 0; i < allSkills.length; i += 200) {
    const batch = allSkills.slice(i, i + 200);
    const { error: skillErr } = await supabase.from('hero_skills').insert(batch);
    if (skillErr) console.error(`  ✗ Skill batch ${i} error:`, skillErr.message);
  }
  console.log(`  ✓ ${allSkills.length} skills synced`);

  return heroes.length;
}

// ============================================
// SYNC WIN/PICK/BAN RATES
// ============================================
async function syncHeroRates() {
  console.log('\n📊 Syncing hero win/pick/ban rates...');
  const TOTAL = 132;

  for (let heroId = 1; heroId <= TOTAL; heroId++) {
    logStep(heroId, TOTAL, `Rates for hero ${heroId}`);

    try {
      const data = await fetchJSON(`${API_BASE}/hero-rate/${heroId}`);
      const record = data?.data?.records?.[0]?.data;
      if (!record) continue;

      // Get the latest date entry
      const rates = record.win_rate || [];
      if (rates.length === 0) continue;

      const latest = rates[0]; // First entry is most recent

      await supabase
        .from('heroes')
        .update({
          win_rate: latest.win_rate || 0,
          pick_rate: latest.app_rate || 0,
          ban_rate: latest.ban_rate || 0,
        })
        .eq('hero_id', heroId);
    } catch (err) {
      // Silent skip - rate data is bonus, not critical
    }

    if (heroId % 10 === 0) await sleep(500);
    else await sleep(100);
  }
  console.log('\n  ✓ Hero rates synced');
}

// ============================================
// SYNC ITEMS (152 items)
// ============================================
async function syncItems() {
  console.log('\n🗡️  Syncing items...');

  const data = await fetchJSON(`${API_BASE}/academy/equipment-details?size=200`);
  const records = data?.data?.records || [];

  const items = records.map(r => {
    const item = r.data;
    return {
      item_id: item.equipid,
      name: item.equipname || '?',
      category: item.equiptypename || '',
      stats_raw: stripTrailingComma(cleanHTML(item.equiptips || '')),
      passive_name: cleanHTML(item.equipskill1 || '').replace(/^Passive\s*-\s*/i, '').replace(/:\s*$/, ''),
      passive_desc: cleanHTML(item.equipskilldesc || ''),
      icon_url: item.equipicon || '',
      last_synced: new Date().toISOString(),
    };
  });

  console.log(`  Inserting ${items.length} items...`);
  const { error } = await supabase
    .from('items')
    .upsert(items, { onConflict: 'item_id' });
  if (error) {
    console.error('  ✗ Item insert error:', error.message);
  } else {
    console.log(`  ✓ ${items.length} items synced`);
  }
}

// ============================================
// SYNC SPELLS (12 spells)
// ============================================
async function syncSpells() {
  console.log('\n✨ Syncing battle spells...');

  const data = await fetchJSON(`${API_BASE}/academy/spells?size=50`);
  const records = data?.data?.records || [];

  const spells = records.map(r => {
    const s = r.data?.__data || r.data;
    return {
      spell_id: s.skillid,
      name: s.skillname || '?',
      description: cleanHTML(s.skilldesc || ''),
      icon_url: s.skillicon || '',
      last_synced: new Date().toISOString(),
    };
  });

  console.log(`  Inserting ${spells.length} spells...`);
  const { error } = await supabase
    .from('spells')
    .upsert(spells, { onConflict: 'spell_id' });
  if (error) {
    console.error('  ✗ Spell insert error:', error.message);
  } else {
    console.log(`  ✓ ${spells.length} spells synced`);
  }
}

// ============================================
// SYNC EMBLEM TALENTS (26 talents)
// ============================================
async function syncEmblemTalents() {
  console.log('\n🛡️  Syncing emblem talents...');

  const data = await fetchJSON(`${API_BASE}/academy/emblems?size=50`);
  const records = data?.data?.records || [];

  const talents = records.map(r => {
    const skill = r.data?.emblemskill || {};
    return {
      talent_id: skill.skillid,
      name: skill.skillname || '?',
      description: cleanHTML(skill.skilldesc || ''),
      icon_url: skill.skillicon || '',
      last_synced: new Date().toISOString(),
    };
  });

  console.log(`  Inserting ${talents.length} emblem talents...`);
  const { error } = await supabase
    .from('emblem_talents')
    .upsert(talents, { onConflict: 'talent_id' });
  if (error) {
    console.error('  ✗ Talent insert error:', error.message);
  } else {
    console.log(`  ✓ ${talents.length} emblem talents synced`);
  }
}

// ============================================
// SYNC HERO BUILDS (3 per hero)
// ============================================
async function syncBuilds() {
  console.log('\n🔧 Syncing hero builds...');
  const allBuilds = [];
  const TOTAL = 132;

  for (let heroId = 1; heroId <= TOTAL; heroId++) {
    logStep(heroId, TOTAL, `Builds for hero ${heroId}`);

    try {
      const data = await fetchJSON(`${API_BASE}/academy/guide/${heroId}/builds`);
      const record = data?.data?.records?.[0]?.data;
      if (!record) continue;

      const builds = record.build || [];
      for (let i = 0; i < builds.length; i++) {
        const b = builds[i];
        allBuilds.push({
          hero_id: heroId,
          build_index: i,
          item_ids: b.equipid || [],
          spell_id: b.battleskill?.data?.battleskillid || b.battleskill?.data?.__data?.skillid || 0,
          emblem_name: b.emblem?.data?.emblemname || '',
          talent_ids: b.new_rune_skill || [],
          win_rate: b.build_win_rate || 0,
          pick_rate: b.build_pick_rate || 0,
          last_synced: new Date().toISOString(),
        });
      }
    } catch (err) {
      // Silent skip
    }

    if (heroId % 10 === 0) await sleep(500);
    else await sleep(100);
  }

  // Delete old builds, insert fresh
  console.log(`\n  Inserting ${allBuilds.length} builds...`);
  const { error: delErr } = await supabase.from('hero_builds').delete().gte('id', 0);
  if (delErr) console.error('  ✗ Build delete error:', delErr.message);

  for (let i = 0; i < allBuilds.length; i += 200) {
    const batch = allBuilds.slice(i, i + 200);
    const { error } = await supabase.from('hero_builds').insert(batch);
    if (error) console.error(`  ✗ Build batch ${i} error:`, error.message);
  }
  console.log(`  ✓ ${allBuilds.length} builds synced`);
}

// ============================================
// SYNC HERO COUNTERS (matchup win rates)
// ============================================
async function syncCounters() {
  console.log('\n⚔️  Syncing hero counters...');
  const allCounters = [];
  const TOTAL = 132;

  for (let heroId = 1; heroId <= TOTAL; heroId++) {
    logStep(heroId, TOTAL, `Counters for hero ${heroId}`);

    try {
      const data = await fetchJSON(`${API_BASE}/academy/guide/${heroId}/counters`);
      const record = data?.data?.records?.[0]?.data;
      if (!record) continue;

      const subs = record.sub_hero || [];
      for (const sub of subs) {
        allCounters.push({
          hero_id: heroId,
          counter_hero_id: sub.heroid,
          win_rate: sub.hero_win_rate || 0,
          increase_win_rate: sub.increase_win_rate || 0,
          last_synced: new Date().toISOString(),
        });
      }
    } catch (err) {
      // Silent skip
    }

    if (heroId % 10 === 0) await sleep(500);
    else await sleep(100);
  }

  // Delete old counters, insert fresh
  console.log(`\n  Inserting ${allCounters.length} counter matchups...`);
  const { error: delErr } = await supabase.from('hero_counters').delete().gte('id', 0);
  if (delErr) console.error('  ✗ Counter delete error:', delErr.message);

  for (let i = 0; i < allCounters.length; i += 500) {
    const batch = allCounters.slice(i, i + 500);
    const { error } = await supabase.from('hero_counters').insert(batch);
    if (error) console.error(`  ✗ Counter batch ${i} error:`, error.message);
  }
  console.log(`  ✓ ${allCounters.length} counter matchups synced`);
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   MLBB Strategic Companion - Data Sync   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nSupabase: ${SUPABASE_URL}`);
  console.log(`API: ${API_BASE}`);
  console.log(`Time: ${new Date().toLocaleString()}`);

  const startTime = Date.now();

  try {
    const heroCount = await syncHeroes();
    await syncHeroRates();
    await syncItems();
    await syncSpells();
    await syncEmblemTalents();
    await syncBuilds();
    await syncCounters();

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║            ✓ SYNC COMPLETE               ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`  Heroes: ${heroCount}`);
    console.log(`  Time: ${elapsed}s`);
    console.log(`  Next sync: after the next Moonton patch\n`);
  } catch (err) {
    console.error('\n✗ FATAL ERROR:', err.message);
    process.exit(1);
  }
}

main();
