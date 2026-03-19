import { supabase } from '../../lib/supabase'
import HeroRepository from '../components/HeroRepository'

export default async function HeroesPage() {
  const { data: heroes } = await supabase
    .from('heroes')
    .select('id, name, primary_role, secondary_role')
    .order('name')

  return (
    <main style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <HeroRepository heroes={heroes || []} />
    </main>
  )
}