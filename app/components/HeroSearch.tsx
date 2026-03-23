'use client'

import { useState } from 'react'
import Link from 'next/link'

type Hero = {
  hero_id: number
  name: string
  roles: string[]
  icon_url: string | null
}

export default function HeroSearch({ heroes }: { heroes: Hero[] }) {
  const [search, setSearch] = useState('')

  const filtered = heroes.filter((hero) =>
    hero.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
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
        {search && (
          <p style={{ color: '#8B949E', fontSize: '13px', marginTop: '12px' }}>
            {filtered.length} hero{filtered.length !== 1 ? 'es' : ''} found
          </p>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          {search ? 'Results' : 'All Heroes'}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map((hero) => (
            <Link
              key={hero.hero_id}
              href={`/hero/${hero.hero_id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="hero-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: '#21262D',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {hero.icon_url ? (
                    <img
                      src={hero.icon_url}
                      alt={hero.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px', color: '#00F5FF' }}>
                      {hero.name.charAt(0)}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#E6EDF3', margin: '0 0 4px' }}>
                  {hero.name}
                </p>
                <p style={{ fontSize: '12px', color: '#8B949E', margin: 0 }}>
                  {hero.roles.join(' / ')}
                </p>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: '#8B949E', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
              No heroes found for &quot;{search}&quot;
            </p>
          )}
        </div>
      </section>
    </>
  )
}