/**
 * Migration: Add student_name column to conversations table
 * Run: node scripts/add-student-name.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vvjbyshndugnvuipgntm.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function migrate() {
  console.log('🔄 Adding student_name column to conversations table...')

  // Use rpc to run raw SQL (requires pg_net or use the REST API workaround)
  // We'll try to insert a dummy row to see if column already exists
  const { error: checkError } = await supabase
    .from('conversations')
    .select('student_name')
    .limit(1)

  if (!checkError) {
    console.log('✅ Column student_name already exists! No migration needed.')
    process.exit(0)
  }

  if (checkError.code === '42703') {
    console.log('⚠️  Column not found. Attempting to add via SQL...')
    // Use the management API or instruct user to run SQL manually
    console.log('\n📋 Please run this SQL in your Supabase Dashboard SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/vvjbyshndugnvuipgntm/sql/new\n')
    console.log('─'.repeat(60))
    console.log('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS student_name TEXT;')
    console.log('─'.repeat(60))
    console.log('\nThen run this script again to verify.')
    process.exit(0)
  }

  console.log('✅ Migration check complete. Error detail:', checkError)
}

migrate().catch(console.error)
