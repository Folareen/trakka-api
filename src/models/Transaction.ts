import { Schema, model } from 'mongoose'

const TransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, amount: {
        type: Number,
        required: true
    }, transactionType: {
        type: String,
        required: true
    }, transactionCategory: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Transaction = model('Transaction', TransactionSchema)

export default Transaction