import { Router } from 'express'
import { getAdminDashboard } from '../../controller/admin/admin.controller.js'

const router = Router()

router.get('/dashboard', getAdminDashboard)

export default router
