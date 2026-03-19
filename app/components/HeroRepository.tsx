'use client'

import { useState } from 'react'
import Link from 'next/link'

type Hero = {
  id: string
  name: string
  primary_role: string
  secondary_role: string | null
}

const ROLES = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support']

export default function HeroRepository({ heroes }: { heroes: Hero[] }) {
  const [activeRole, setActiveRole] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = heroes.filter((hero) => {
    const matchesRole =
      activeRole === 'All' ||
      hero.primary_role === activeRole ||
      hero.secondary_role === activeRole

    const matchesSearch = hero.name.toLowerCase().includes(search.toLowerCase())

    return matchesRole && matchesSearch
  })

  return (
    <>
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          Hero <span style={{ color: '#00F5FF' }}>Repository</span>
        </h2>
        <p style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px' }}>
          Browse all heroes. Filter by role to find what you need.
        </p>

        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #21262D',
            backgroundColor: '#161B22',
            color: '#E6EDF3',
            fontSize: '14px',
            outline: 'none',
            marginBottom: '20px',
          }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className="role-btn"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: activeRole === role ? '1px solid #00F5FF' : '1px solid #21262D',
                backgroundColor: activeRole === role ? '#0B2E2F' : '#161B22',
                color: activeRole === role ? '#00F5FF' : '#8B949E',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      <p style={{ color: '#8B949E', fontSize: '13px', marginBottom: '16px' }}>
        {filtered.length} hero{filtered.length !== 1 ? 'es' : ''} found
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px',
      }}>
        {filtered.map((hero) => (
          <Link
            key={hero.id}
            href={`/hero/${hero.id}`}
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
        {filtered.length === 0 && (
          <p style={{ color: '#8B949E', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
            No heroes found.
          </p>
        )}
      </div>
    </>
  )
}