import express from 'express'
import {login, requestPasswordReset, signup} from '../controllers/auth'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.patch('/request-password-reset', requestPasswordReset)

export default router