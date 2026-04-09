import { Router } from 'express'
import { getMyProfile } from '../../controller/common/profile.controller.js'

const router = Router()

router.get('/me', getMyProfile)

export default router
