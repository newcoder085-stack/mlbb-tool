import { supabase } from '../lib/supabase'
import HeroSearch from './components/HeroSearch'

export default async function Home() {
  const { data: heroes } = await supabase
    .from('heroes')
    .select('hero_id, name, roles, icon_url')
    .order('name')

  return (
    <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <HeroSearch heroes={heroes || []} />
    </main>
  )
}