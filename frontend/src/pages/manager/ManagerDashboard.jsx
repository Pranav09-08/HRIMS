import DashboardLayout from '../../components/dashboard-layout.jsx'

function ManagerDashboardPage() {
  return (
    <DashboardLayout
      role="manager"
      title="Manager Dashboard"
      subtitle="Project teams, task updates, and day-to-day delivery tracking."
      stats={[
        { label: 'My Projects', value: '6' },
        { label: 'Tasks In Progress', value: '43', tone: 'warning' },
        { label: 'Completed This Week', value: '28', tone: 'success' },
        { label: 'Overdue Items', value: '5', tone: 'danger' },
      ]}
      highlights={[
        'Create project teams and reassign members when priorities shift.',
        'Monitor task completion and unblock work with quick decisions.',
        'Use task notes, media updates, and progress indicators for visibility.',
        'Review team workload and sprint outcomes across all active projects.',
      ]}
    />
  )
}

export default ManagerDashboardPage
