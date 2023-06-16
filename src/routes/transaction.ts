import express from 'express'
import { addTransaction, getTransactions } from '../controllers/transaction'

const router = express.Router()

router.route('/').get(getTransactions).post(addTransaction)

export default router