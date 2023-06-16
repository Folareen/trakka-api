import express from 'express'
import {login, requestPasswordReset, resetPassword, signup} from '../controllers/auth'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.patch('/request-password-reset', requestPasswordReset)
router.patch('/reset-password', resetPassword)

export default router