import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default async function HeroDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: hero } = await supabase
    .from('heroes')
    .select('*')
    .eq('id', id)
    .single()

  if (!hero) {
    return <main style={{ padding: '40px', textAlign: 'center' }}>Hero not found</main>
  }

  const { data: lanes } = await supabase
    .from('hero_lanes')
    .select('lane')
    .eq('hero_id', id)

  const { data: counters } = await supabase
    .from('hero_counters')
    .select(`
      strength,
      reason,
      counter_hero:counter_hero_id (name, primary_role)
    `)
    .eq('hero_id', id)

  const { data: builds } = await supabase
    .from('builds')
    .select(`
      id,
      build_name,
      lane,
      patch_version,
      spell:spell_id (name),
      emblem:emblem_id (name)
    `)
    .eq('hero_id', id)

  const buildItems: Record<string, any[]> = {}
  if (builds) {
    for (const build of builds) {
      const { data: items } = await supabase
        .from('build_items')
        .select(`
          slot_order,
          is_core,
          item:item_id (name, category, price)
        `)
        .eq('build_id', build.id)
        .order('slot_order')
      buildItems[build.id] = items || []
    }
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/" style={{ color: '#8B949E', textDecoration: 'none', fontSize: '14px' }}>
        ← Back to Home
      </Link>

      <section style={{ marginTop: '24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '16px',
            backgroundColor: '#161B22', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '36px', color: '#00F5FF',
            border: '2px solid #00F5FF',
          }}>
            {hero.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px' }}>{hero.name}</h2>
            <p style={{ color: '#8B949E', margin: '0 0 8px', fontSize: '16px' }}>
              {hero.primary_role}{hero.secondary_role ? ` / ${hero.secondary_role}` : ''}
              {hero.specialty ? ` • ${hero.specialty}` : ''}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {lanes?.map((l) => (
                <span key={l.lane} style={{
                  backgroundColor: '#161B22', border: '1px solid #21262D',
                  borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#E6EDF3',
                }}>
                  {l.lane}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#FFD700' }}>
          Counters
        </h3>
        {counters && counters.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {counters.map((c: any, i: number) => (
              <div key={i} style={{
                backgroundColor: '#161B22', borderRadius: '12px', padding: '16px',
                border: '1px solid #21262D',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    {(c.counter_hero as any)?.name}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
                    backgroundColor: c.strength === 'strong' ? '#1a3a1a' : '#3a3a1a',
                    color: c.strength === 'strong' ? '#4ADE80' : '#FBBF24',
                  }}>
                    {c.strength?.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#8B949E', fontSize: '14px', margin: 0 }}>{c.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#8B949E' }}>No counter data yet.</p>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#00F5FF' }}>
          Builds
        </h3>
        {builds && builds.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {builds.map((build: any) => (
              <div key={build.id} style={{
                backgroundColor: '#161B22', borderRadius: '12px', padding: '20px',
                border: '1px solid #21262D',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{build.build_name}</h4>
                  <span style={{ fontSize: '12px', color: '#8B949E' }}>Patch {build.patch_version}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
                  <span style={{ color: '#8B949E' }}>Lane: <span style={{ color: '#E6EDF3' }}>{build.lane}</span></span>
                  <span style={{ color: '#8B949E' }}>Spell: <span style={{ color: '#E6EDF3' }}>{build.spell?.name}</span></span>
                  <span style={{ color: '#8B949E' }}>Emblem: <span style={{ color: '#E6EDF3' }}>{build.emblem?.name}</span></span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#8B949E', marginBottom: '8px' }}>Core Items:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {buildItems[build.id]?.filter((bi: any) => bi.is_core).map((bi: any, i: number) => (
                      <span key={i} style={{
                        backgroundColor: '#21262D', borderRadius: '8px', padding: '8px 12px',
                        fontSize: '13px', color: '#E6EDF3',
                      }}>
                        {i + 1}. {bi.item?.name}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: '#8B949E', marginBottom: '8px' }}>Late Game:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {buildItems[build.id]?.filter((bi: any) => !bi.is_core).map((bi: any, i: number) => (
                      <span key={i} style={{
                        backgroundColor: '#21262D', borderRadius: '8px', padding: '8px 12px',
                        fontSize: '13px', color: '#FFD700', border: '1px solid #3a3a1a',
                      }}>
                        {bi.item?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#8B949E' }}>No builds yet.</p>
        )}
      </section>
    </main>
  )
}