import { Router } from 'express'
import { getManagerDashboard } from '../../controller/manager/manager.controller.js'

const router = Router()

router.get('/dashboard', getManagerDashboard)

export default router
