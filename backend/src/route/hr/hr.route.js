import { Router } from 'express'
import { getHrDashboard } from '../../controller/hr/hr.controller.js'

const router = Router()

router.get('/dashboard', getHrDashboard)

export default router
