import Link from 'next/link'

export const metadata = {
  title: 'About - Mythic Path',
  description: 'About Mythic Path - a fan-made strategic companion for Mobile Legends: Bang Bang',
}

export default function AboutPage() {
  return (
    <main style={{ padding: '48px 24px', maxWidth: '720px', margin: '0 auto' }}>

      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
        About <span style={{ color: '#00F5FF' }}>Mythic Path</span>
      </h2>
      <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '40px' }}>
        Your strategic companion for Mobile Legends: Bang Bang
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#E6EDF3' }}>
          What is Mythic Path?
        </h3>
        <p style={{ color: '#8B949E', fontSize: '15px', lineHeight: '1.7' }}>
          Mythic Path is a free tool that helps Mobile Legends players make smarter
          decisions in draft and in-game. Pick a hero, see who counters them, and get
          optimized builds tailored to your specific matchup.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#E6EDF3' }}>
          Who is it for?
        </h3>
        <p style={{ color: '#8B949E', fontSize: '15px', lineHeight: '1.7' }}>
          Every MLBB player, but especially beginners and casual players who want to
          improve without spending hours researching builds and matchups. No jargon,
          no guesswork. Just clear answers.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#E6EDF3' }}>
          How does it work?
        </h3>
        <p style={{ color: '#8B949E', fontSize: '15px', lineHeight: '1.7' }}>
          Mythic Path pulls real game data directly from official Mobile Legends sources
          and keeps it updated with every patch. On top of that, our algorithm analyzes
          enemy matchups and recommends builds optimized for the specific hero
          you&apos;re facing, not just generic cookie-cutter builds.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#E6EDF3' }}>
          Data Sources
        </h3>
        <p style={{ color: '#8B949E', fontSize: '15px', lineHeight: '1.7' }}>
          Hero stats, skills, items, emblems, and build data are sourced from
          official Mobile Legends game data provided by Moonton. Counter matchup
          win rates are based on aggregated player statistics.
        </p>
      </section>

      <section style={{
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#161B22',
        borderRadius: '12px',
        border: '1px solid #21262D',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#FFD700' }}>
          Disclaimer
        </h3>
        <p style={{ color: '#8B949E', fontSize: '14px', lineHeight: '1.7' }}>
          Mythic Path is a fan-made project and is not affiliated with, endorsed by,
          or connected to Moonton, Shanghai Moonton Technology Co., Ltd, or Mobile
          Legends: Bang Bang in any way. All game data, hero names, item names, and
          related assets are the property of their respective owners. This tool is
          provided for informational and educational purposes only.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#E6EDF3' }}>
          Contact & Feedback
        </h3>
        <p style={{ color: '#8B949E', fontSize: '15px', lineHeight: '1.7' }}>
          Have feedback, found a bug, or want to suggest a feature? Reach out at:
        </p>
        <p style={{ color: '#8B949E', fontSize: '15px', marginTop: '8px', fontStyle: 'italic' }}>
          Coming soon. Email and community links will be added here.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#E6EDF3' }}>
          Current Patch
        </h3>
        <p style={{ color: '#8B949E', fontSize: '15px', lineHeight: '1.7' }}>
          Data is synced with <span style={{ color: '#FFD700' }}>Patch 2.1.61</span> (Season 40).
        </p>
      </section>

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #21262D' }}>
        <Link href="/" className="nav-link" style={{
          color: '#00F5FF',
          textDecoration: 'none',
          fontSize: '14px',
        }}>
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}