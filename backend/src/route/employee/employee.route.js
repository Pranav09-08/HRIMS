import { Router } from 'express'
import { getEmployeeDashboard } from '../../controller/employee/employee.controller.js'

const router = Router()

router.get('/dashboard', getEmployeeDashboard)

export default router
