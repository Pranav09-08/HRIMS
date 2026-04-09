import { supabase } from '../../config/supabase.js'

export const findEmployeeByEmail = async (email) => {
	return supabase
		.from('employees')
		.select('*')
		.eq('email', email.trim().toLowerCase())
		.maybeSingle()
}

export const findEmployeeById = async (id) => {
	return supabase.from('employees').select('*').eq('id', id).maybeSingle()
}
