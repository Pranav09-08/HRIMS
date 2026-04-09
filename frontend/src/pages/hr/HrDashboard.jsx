import DashboardLayout from '../../components/dashboard-layout.jsx'

function HrDashboardPage() {
  return (
    <DashboardLayout
      role="hr"
      title="HR Dashboard"
      subtitle="People records, designations, responsibilities, and policies."
      stats={[
        { label: 'New Joiners', value: '9', tone: 'success' },
        { label: 'Pending Leaves', value: '14', tone: 'warning' },
        { label: 'Profiles Updated', value: '31' },
        { label: 'Training Due', value: '7', tone: 'danger' },
      ]}
      highlights={[
        'Maintain complete employee records: personal, academic, and professional.',
        'Manage designations and responsibilities with role-based access.',
        'Oversee leave and policy workflows with clear approval visibility.',
        'Publish notices, announcements, and event updates to employees.',
      ]}
    />
  )
}

export default HrDashboardPage
