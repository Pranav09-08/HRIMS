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

function HrUsersPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const authHeaders = {
    Authorization: `Bearer ${getAuthToken()}`,
  }

  const fetchRows = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users?role=hr`, {
        headers: authHeaders,
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to fetch HR users.')
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
        isEdit ? `${API_BASE_URL}/api/admin/users/${editingId}` : `${API_BASE_URL}/api/admin/users`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form,
            role: 'hr',
          }),
        }
      )
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to save HR user.')
      }

      setSuccessMessage(isEdit ? 'HR user updated successfully.' : 'HR user created successfully.')
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
    if (!window.confirm('Delete this HR user?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to delete HR user.')
      }

      if (editingId === id) {
        resetForm()
      }

      setSuccessMessage('HR user deleted successfully.')
      await fetchRows()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const filteredRows = rows.filter((row) => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) {
      return true
    }

    return (
      `${row.first_name || ''} ${row.last_name || ''}`.toLowerCase().includes(q) ||
      (row.email || '').toLowerCase().includes(q) ||
      (row.phone || '').toLowerCase().includes(q)
    )
  })

  return (
    <DashboardLayout role="admin" title="Admin Dashboard" subtitle="People: HR">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/40">People</p>
          <h2 className="mt-3 text-2xl font-semibold text-black">HR</h2>
          <p className="mt-2 text-sm text-black/60">Manage HR users with full CRUD actions.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-black/10 bg-[#fafafa] p-4">
            <h3 className="text-lg font-semibold text-black">{editingId ? 'Edit HR User' : 'Create HR User'}</h3>
            <p className="mt-1 text-sm text-black/55">Fill details and save to update the HR directory.</p>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.first_name} onChange={handleChange('first_name')} placeholder="First name" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
              <input value={form.last_name} onChange={handleChange('last_name')} placeholder="Last name" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
              <input type="email" value={form.email} onChange={handleChange('email')} placeholder="Email" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm md:col-span-2" />
              <input value={form.phone} onChange={handleChange('phone')} placeholder="Phone" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
              <input type="password" value={form.password} onChange={handleChange('password')} placeholder={editingId ? 'New password (optional)' : 'Password'} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" disabled={saving} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
                  {saving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                </button>
                {editingId ? <button type="button" onClick={resetForm} className="rounded-xl border border-black/15 px-4 py-2 text-sm">Cancel</button> : null}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-black">HR Directory</h3>
                <p className="text-sm text-black/55">{filteredRows.length} result(s)</p>
              </div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name/email/phone"
                className="w-full max-w-xs rounded-xl border border-black/10 bg-[#f8f8fa] px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
              <table className="min-w-full divide-y divide-black/10 text-sm">
                <thead className="bg-[#f8f8fa] text-left text-black/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-4 text-black/50">Loading...</td></tr>
                  ) : filteredRows.length ? (
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid size-8 place-items-center rounded-full bg-black text-xs font-semibold text-white">
                              {(row.first_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <span>{row.first_name} {row.last_name || ''}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{row.email}</td>
                        <td className="px-4 py-3">{row.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-black/5 px-2 py-1 text-xs capitalize text-black/70">{row.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(row)} className="rounded-lg border border-black/15 px-3 py-1 text-xs">Edit</button>
                            <button onClick={() => handleDelete(row.id)} className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-700">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-4 py-4 text-black/50">No HR users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
        {successMessage ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
      </div>
    </DashboardLayout>
  )
}

export default HrUsersPage
