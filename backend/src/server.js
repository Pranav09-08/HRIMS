import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabase } from './config/supabase.js'

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  const configured = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let supabaseReachable = false
  if (configured) {
    const { error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })
    supabaseReachable = !error
  }

  res.json({
    ok: true,
    service: 'hrims-backend',
    supabaseConfigured: configured,
    supabaseReachable,
    timestamp: new Date().toISOString(),
  })
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
