import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default async function Home() {
  const { data: heroes } = await supabase
    .from('heroes')
    .select('id, name, primary_role, secondary_role')
    .order('name')

  return (
    <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>

      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          Find Your <span style={{ color: '#00F5FF' }}>Counter</span>
        </h2>
        <p style={{ color: '#8B949E', fontSize: '16px', marginBottom: '24px' }}>
          Search any hero to find counters, builds, and strategy
        </p>
        <input
          type="text"
          placeholder="Search hero name..."
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #21262D',
            backgroundColor: '#161B22',
            color: '#E6EDF3',
            fontSize: '16px',
            outline: 'none',
          }}
        />
      </section>

      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          All Heroes
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '16px',
        }}>
          {heroes?.map((hero) => (
            <Link
              key={hero.id}
              href={`/hero/${hero.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                backgroundColor: '#161B22',
                borderRadius: '12px',
                padding: '20px 16px',
                textAlign: 'center',
                border: '1px solid #21262D',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: '#21262D',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#00F5FF',
                }}>
                  {hero.name.charAt(0)}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#E6EDF3', margin: '0 0 4px' }}>
                  {hero.name}
                </p>
                <p style={{ fontSize: '12px', color: '#8B949E', margin: 0 }}>
                  {hero.primary_role}{hero.secondary_role ? ` / ${hero.secondary_role}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}