import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/dashboard-layout.jsx'
import { API_BASE_URL } from '../../utils/api.js'
import { getAuthToken } from '../../utils/auth.js'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
}

function HrEmployeeUsersPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const authHeaders = {
    Authorization: `Bearer ${getAuthToken()}`,
  }

  const fetchRows = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        headers: authHeaders,
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to fetch employee users.')
      }

      setRows(payload.data || [])
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [])

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const isEdit = Boolean(editingId)
      const response = await fetch(
        isEdit ? `${API_BASE_URL}/api/hr/employees/${editingId}` : `${API_BASE_URL}/api/hr/employees`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form,
            role: 'employee',
          }),
        }
      )
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to save employee user.')
      }

      setSuccessMessage(isEdit ? 'Employee updated successfully.' : 'Employee created successfully.')
      resetForm()
      await fetchRows()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (row) => {
    setEditingId(row.id)
    setForm({
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      password: '',
    })
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee user?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to delete employee user.')
      }

      if (editingId === id) {
        resetForm()
      }

      setSuccessMessage('Employee user deleted successfully.')
      await fetchRows()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <DashboardLayout role="hr" title="HR Dashboard" subtitle="People: Employee">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/40">People</p>
          <h2 className="mt-3 text-2xl font-semibold text-black">Employee</h2>
          <p className="mt-2 text-sm text-black/60">Manage employee users with full CRUD actions.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-black/10 bg-[#fafafa] p-4 md:grid-cols-2 xl:grid-cols-6">
          <input value={form.first_name} onChange={handleChange('first_name')} placeholder="First name" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
          <input value={form.last_name} onChange={handleChange('last_name')} placeholder="Last name" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
          <input type="email" value={form.email} onChange={handleChange('email')} placeholder="Email" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
          <input value={form.phone} onChange={handleChange('phone')} placeholder="Phone" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
          <input type="password" value={form.password} onChange={handleChange('password')} placeholder={editingId ? 'New password (optional)' : 'Password'} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId ? <button type="button" onClick={resetForm} className="rounded-xl border border-black/15 px-3 py-2 text-sm">Cancel</button> : null}
          </div>
        </form>

        {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
        {successMessage ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successMessage}</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="min-w-full divide-y divide-black/10 text-sm">
            <thead className="bg-[#f8f8fa] text-left text-black/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-4 text-black/50">Loading...</td></tr>
              ) : rows.length ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.first_name} {row.last_name || ''}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.phone || '-'}</td>
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(row)} className="rounded-lg border border-black/15 px-3 py-1 text-xs">Edit</button>
                        <button onClick={() => handleDelete(row.id)} className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-4 py-4 text-black/50">No employee users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HrEmployeeUsersPage
