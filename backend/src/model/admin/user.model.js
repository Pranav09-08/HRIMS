import { supabase } from '../../config/supabase.js'

export const findEmployeeByEmail = async (email) => {
  return supabase
    .from('employees')
    .select('id, employee_code, first_name, last_name, email, role, status, password_hash, created_at, updated_at')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
}

export const findEmployeeById = async (id) => {
  return supabase
    .from('employees')
    .select('id, employee_code, first_name, last_name, email, role, status, phone, password_hash, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()
}

export const createEmployeeRecord = async (payload) => {
  return supabase.from('employees').insert(payload).select('*').single()
}

export const updateEmployeeRecord = async (id, payload) => {
  return supabase.from('employees').update(payload).eq('id', id).select('*').single()
}

export const deleteEmployeeRecord = async (id) => {
  return supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .select('id, role')
    .single()
}

export const listEmployeeRecords = async ({ role } = {}) => {
  let query = supabase
    .from('employees')
    .select('id, employee_code, first_name, last_name, email, role, status, phone, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (role) {
    query = query.eq('role', role)
  }

  return query
}
