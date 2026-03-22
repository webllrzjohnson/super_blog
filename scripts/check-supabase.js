/**
 * Quick script to verify Supabase connection.
 * Run: node scripts/check-supabase.js
 * Loads .env from project root (Node 20.6+: use --env-file=.env)
 */

const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
for (const f of ['.env.local', '.env']) {
  const p = path.join(root, f)
  if (fs.existsSync(p)) {
    fs.readFileSync(p, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    })
  }
}

async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('\n--- Supabase connection check ---\n')

  // 1. Env vars
  console.log('Environment variables:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', url ? `${url.slice(0, 40)}...` : '(missing)')
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'Set' : '(missing)')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? 'Set' : '(missing)')

  if (!url || !serviceKey) {
    console.log('\n❌ Missing required env vars. Load .env or .env.local.')
    process.exit(1)
  }

  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(url, serviceKey)

    // 2. Test connection by querying posts
    console.log('\nQuerying posts table...')
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, status')
      .limit(5)

    if (error) {
      console.log('\n❌ Supabase error:', error.message)
      console.log('   Code:', error.code)
      if (error.code === 'PGRST116') {
        console.log('\n   The "posts" table may not exist. Run the migration:')
        console.log('   supabase/migrations/00001_create_posts.sql')
      }
      process.exit(1)
    }

    console.log('\n✅ Connected successfully!')
    console.log(`   Found ${data?.length ?? 0} post(s)`)
    if (data?.length) {
      data.forEach((p) => console.log(`   - ${p.title} (${p.status})`))
    }
  } catch (err) {
    console.log('\n❌ Error:', err.message)
    process.exit(1)
  }

  console.log('\n--- Done ---\n')
}

checkSupabase()
