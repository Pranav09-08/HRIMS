import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import NotFoundPage from './pages/NotFound.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboard.jsx'
import HrUsersPage from './pages/admin/HrUsers.jsx'
import ManagerUsersPage from './pages/admin/ManagerUsers.jsx'
import AdminEmployeeUsersPage from './pages/admin/EmployeeUsers.jsx'
import HrDashboardPage from './pages/hr/HrDashboard.jsx'
import HrEmployeeUsersPage from './pages/hr/EmployeeUsers.jsx'
import ManagerDashboardPage from './pages/manager/ManagerDashboard.jsx'
import EmployeeDashboardPage from './pages/employee/EmployeeDashboard.jsx'
import EmployeeProfilePage from './pages/employee/Profile.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard/admin', element: <AdminDashboardPage /> },
  { path: '/admin/people/hr', element: <HrUsersPage /> },
  { path: '/admin/people/manager', element: <ManagerUsersPage /> },
  { path: '/admin/people/employee', element: <AdminEmployeeUsersPage /> },
  { path: '/dashboard/hr', element: <HrDashboardPage /> },
  { path: '/hr/people/employee', element: <HrEmployeeUsersPage /> },
  { path: '/dashboard/manager', element: <ManagerDashboardPage /> },
  { path: '/dashboard/employee', element: <EmployeeDashboardPage /> },
  { path: '/employee/profile', element: <EmployeeProfilePage /> },
  { path: '*', element: <NotFoundPage /> },
])

function AppRoutes() {
  return <RouterProvider router={router} />
}

export default AppRoutes
