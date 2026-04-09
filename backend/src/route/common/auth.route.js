import { Router } from 'express'
import { login, logout } from '../../controller/common/auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)

export default router
