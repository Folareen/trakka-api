import express from 'express'
import { addTransaction, deleteTransaction, editTransaction, getTransaction, getTransactions } from '../controllers/transaction'

const router = express.Router()

router.route('/').get(getTransactions).post(addTransaction)
router.route('/:id').get(getTransaction).patch(editTransaction).delete(deleteTransaction)

export default router