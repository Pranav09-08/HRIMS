import 'dotenv/config'
import { hashPassword } from '../src/utils/password.js'
import { supabase } from '../src/config/supabase.js'

const adminSeed = {
  employee_code: 'EMP-ADMIN',
  role: 'admin',
  status: 'active',
  first_name: process.env.ADMIN_SEED_FIRST_NAME || 'Super',
  last_name: process.env.ADMIN_SEED_LAST_NAME || 'Admin',
  email: (process.env.ADMIN_SEED_EMAIL || 'admin@hrims.com').trim().toLowerCase(),
  phone: null,
  password_hash: '',
}

async function seedAdmin() {
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@123'
  adminSeed.password_hash = await hashPassword(password)

  const { data, error } = await supabase
    .from('employees')
    .upsert(adminSeed, { onConflict: 'email' })
    .select('id, employee_code, first_name, last_name, email, role, status')
    .single()

  if (error) {
    throw error
  }

  console.log('Admin seeded successfully:')
  console.log(data)
}

seedAdmin().catch((error) => {
  console.error('Failed to seed admin:')
  console.error(error.message)
  process.exit(1)
})
