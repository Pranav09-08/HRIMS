import DashboardLayout from '../../components/dashboard-layout.jsx'

function AdminDashboardPage() {
  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Global controls, employee setup, and organization-wide access."
      stats={[
        { label: 'Total Employees', value: '248' },
        { label: 'Open Requests', value: '17', tone: 'warning' },
        { label: 'Active Projects', value: '12' },
        { label: 'Policy Alerts', value: '3', tone: 'danger' },
      ]}
      highlights={[
        'Monitor organization-wide workforce and compliance trends.',
        'Approve strategic changes across offices, projects, and access roles.',
        'Track critical system activities requiring admin-level decisions.',
        'Review dashboard summaries before drilling into module detail pages.',
      ]}
    />
  )
}

export default AdminDashboardPage
