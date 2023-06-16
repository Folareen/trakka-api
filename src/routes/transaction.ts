import express from 'express'
import { getTransactions } from '../controllers/transaction'

const router = express.Router()

router.route('/').get(getTransactions)

export default router