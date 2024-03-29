import { Request, Response } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";
import User from "../models/User";

export const getTransactions = async (req: Request & { user?: any }, res: Response) => {
    try {
        const { recent, type, month, stat } = req.query

        let transactions: any = null

        if (recent != undefined) {
            transactions = await Transaction.find({ ...(['income', 'expenses'].includes(type as string) && { type }), user: req.user._id }).sort({ date: -1 }).limit(5)

        } else {

            if (month) {

                if (stat != undefined) {

                    // transactions = await Transaction.find({
                    //     user: req.user._id, $expr: {
                    //         $eq: [{ $month: '$date' }, month]
                    //     }
                    // }).sort({ date: -1 })

                    const expenses = await Transaction.find({
                        type: 'expenses', user: req.user._id, $expr: {
                            $eq: [{ $month: '$date' }, month]
                        },
                    })
                    const expensesCategories = expenses.map((exp) => exp.category)
                    const expensesCategoriesAmounts: any = {}
                    expensesCategories.forEach((cgy) => {
                        const cgyObj = expenses.find((_) => cgy == _.category)
                        expensesCategoriesAmounts[cgy] = (expensesCategoriesAmounts[cgy] || 0) + (cgyObj?.amount || 0)
                    })
                    let expensesAmount = 0
                    expenses.forEach((expense) => {
                        expensesAmount += expense.amount
                    })

                    const income = await Transaction.find({
                        type: 'income', user: req.user._id, $expr: {
                            $eq: [{ $month: '$date' }, month]
                        },
                    })
                    const incomeCategories = income.map((exp) => exp.category)
                    const incomeCategoriesAmounts: any = {}
                    incomeCategories.forEach((cgy) => {
                        const cgyObj = income.find((_) => cgy == _.category)
                        incomeCategoriesAmounts[cgy] = (incomeCategoriesAmounts[cgy] || 0) + (cgyObj?.amount || 0)
                    })
                    let incomeAmount = 0
                    income.forEach((inc) => {
                        incomeAmount += inc.amount
                    })


                    return res.status(200).json({
                        income:
                        {
                            categories: incomeCategories, stat: incomeCategoriesAmounts, total: incomeAmount
                        },
                        expenses:
                        {
                            categories: expensesCategories, stat: expensesCategoriesAmounts, total: expensesAmount
                        },
                    })

                } else {

                    transactions = await Transaction.find({
                        ...(['income', 'expenses'].includes(type as string) && { type }), user: req.user._id, $expr: {
                            $eq: [{ $month: '$date' }, month]
                        }
                    }).sort({ date: -1 })
                }

            } else {
                transactions = await Transaction.find({ ...(['income', 'expenses'].includes(type as string) && { type }), user: req.user._id }).sort({ date: -1 })
            }

        }

        res.status(200).json({ transactions, accountBalance: req.user.accountBalance, incomeAmount: req.user.incomeAmount, expensesAmount: req.user.expensesAmount })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const addTransaction = async (req: Request & { user?: any }, res: Response) => {
    try {
        const { amount, type, category, date, description } = req.body
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' })
        }
        if (typeof amount != 'number') {
            return res.status(400).json({ message: 'Invalid amount' })
        }
        if (!type) {
            return res.status(400).json({ message: 'Type is required' })
        }
        if (type != 'income' && type != 'expenses') {
            return res.status(400).json({ message: 'Invalid type' })
        }
        if (!category) {
            return res.status(400).json({ message: 'Category is required' })
        }
        if (!date) {
            return res.status(400).json({ message: 'Date is required' })
        }

        const user: any = await User.findOne({ _id: req.user._id })

        if (type == 'income') {
            const formerBal = user?.accountBalance
            const formerIncomeBal = user.incomeAmount
            user.accountBalance = formerBal + amount
            user.incomeAmount = formerIncomeBal + amount
        }
        if (type == 'expenses') {
            const formerBal = user?.accountBalance
            const formerExpensesAmount = user.expensesAmount
            user.accountBalance = formerBal - amount
            user.expensesAmount = formerExpensesAmount + amount
        }

        await user.save()

        const transaction = await Transaction.create({ user: req.user._id, amount, type, category, date, description: description ? description : '' })

        return res.status(201).json({ message: 'Transaction added successfully', transaction })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const getTransaction = async (req: Request & { user?: any }, res: Response) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Transaction not found' })
        }
        const transaction: any = await Transaction.findById(id)

        if (String(transaction.user) != req.user._id) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        return res.status(200).json({ transaction })
    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const editTransaction = async (req: Request & { user?: any }, res: Response) => {
    try {
        const { amount, type, category, date, description } = req.body
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Transaction not found' })
        }
        const transaction: any = await Transaction.findById(id)

        if (String(transaction.user) != req.user._id) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        const user: any = await User.findOne({ _id: req.user._id })

        if (amount) {
            if (typeof amount != 'number') {
                return res.status(400).json({ message: 'Invalid amount' })
            }
        }
        if (type) {
            transaction.type = type
        }
        if (category) {
            transaction.category = category
        }
        if (date) {
            transaction.date = date
        }
        if (description) {
            transaction.description = description
        }

        if (!type) {
            return res.status(400).json({ message: 'Type is required' })
        }
        if (type != 'income' && type != 'expenses') {
            return res.status(400).json({ message: 'Invalid type' })
        }


        if (type == 'income') {
            const formerBal = user.accountBalance
            const formerIncomeBal = user.incomeAmount
            const formerExpensesAmount = user.expensesAmount
            if (transaction.type == 'expenses') {
                user.accountBalance = formerBal + amount + amount
                user.incomeAmount = formerIncomeBal + amount
                user.expensesAmount = formerExpensesAmount - amount
            } else {
                user.accountBalance = formerBal + (amount - transaction.amount)
                user.incomeAmount = formerIncomeBal + (amount - transaction.amount)
            }
        }

        if (type == 'expenses') {
            const formerBal = user.accountBalance
            const formerIncomeBal = user.incomeAmount
            const formerExpensesAmount = user.expensesAmount
            if (transaction.type == 'income') {
                user.accountBalance = formerBal - amount - amount
                user.incomeAmount = formerIncomeBal - amount
                user.expensesAmount = formerExpensesAmount + amount
            } else {
                user.accountBalance = formerBal - (amount - transaction.amount)
                user.expensesAmount = formerExpensesAmount + (amount - transaction.amount)
            }
        }

        transaction.amount = amount

        await transaction.save()

        await user.save()

        return res.status(200).json({ message: 'Transaction updated successfully', transaction, user })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const deleteTransaction = async (req: Request & { user?: any }, res: Response) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Transaction not found' })
        }
        const transaction: any = await Transaction.findById(id)


        if (String(transaction.user) != req.user._id) {
            return res.status(404).json({ message: 'Transaction not found' })
        }

        const user: any = await User.findById(req.user._id)

        if (transaction.type == 'income') {
            user.incomeAmount = req.user.incomeAmount - transaction.amount
            user.accountBalance = req.user.accountBalance - transaction.amount
        }
        if (transaction.type == 'expenses') {
            user.expensesAmount = req.user.expensesAmount - transaction.amount
            user.accountBalance = req.user.accountBalance + transaction.amount
        }

        await Transaction.deleteOne({ _id: transaction._id })
        await user.save()

        res.status(200).json({ message: 'Transaction deleted successfully' })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}