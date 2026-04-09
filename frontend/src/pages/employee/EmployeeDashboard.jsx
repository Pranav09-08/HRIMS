import DashboardLayout from '../../components/dashboard-layout.jsx'

function EmployeeDashboardPage() {
  return (
    <DashboardLayout
      role="employee"
      title="Employee Dashboard"
      subtitle="Personal tasks, profile updates, and team collaboration."
      stats={[
        { label: 'Assigned Tasks', value: '12' },
        { label: 'Completed Today', value: '4', tone: 'success' },
        { label: 'Leave Balance', value: '14 days' },
        { label: 'Pending Updates', value: '2', tone: 'warning' },
      ]}
      highlights={[
        'Update personal profile details and keep records accurate.',
        'Track assigned tasks and submit updates with notes or attachments.',
        'Access leave status, announcements, and holiday calendar quickly.',
        'Follow team updates from manager and internal communication channels.',
      ]}
    />
  )
}

export default EmployeeDashboardPage
