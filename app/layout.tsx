import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'MLBB Strategic Companion',
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
              MLBB Strategic Companion
            </h1>
          </Link>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link href="/" className="nav-link" style={{ color: '#E6EDF3', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
            <Link href="/heroes" className="nav-link" style={{ color: '#8B949E', textDecoration: 'none', fontSize: '14px' }}>Heroes</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}