import express from 'express'
import { addTransaction, getTransaction, getTransactions } from '../controllers/transaction'

const router = express.Router()

router.route('/').get(getTransactions).post(addTransaction)
router.route('/:id').get(getTransaction)

export default router