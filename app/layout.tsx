import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Mythic Path',
  description: 'Counter picks, builds, and strategy for Mobile Legends: Bang Bang',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: '#161B22',
          borderBottom: '1px solid #21262D',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#00F5FF', margin: 0 }}>
              Mythic Path
            </h1>
          </Link>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/" className="nav-link" style={{ color: '#E6EDF3', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
            <Link href="/about" className="nav-link" style={{ color: '#8B949E', textDecoration: 'none', fontSize: '14px' }}>About</Link>
            <span style={{ color: '#8B949E', fontSize: '14px', opacity: 0.5, cursor: 'default' }}>
              Terminology
              <span style={{
                marginLeft: '6px',
                fontSize: '10px',
                backgroundColor: '#21262D',
                padding: '2px 6px',
                borderRadius: '4px',
                color: '#FFD700',
              }}>SOON</span>
            </span>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}