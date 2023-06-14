import {Request, Response} from 'express'
import User from '../models/User'
import cloudinary from 'cloudinary'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const signup = async (req: Request & { files?: any },  res: Response) => {
    try {
        const { fullname, username, emailAddress, password, accountBalance = 0 } = req.body
        if (!fullname) {
            return res.status(400).json({ message: 'Fullname is required' })
        }
        if (!username) {
            return res.status(400).json({ message: 'Username is required' })
        }
        if (!emailAddress) {
            return res.status(400).json({ message: 'Email address is required' })
        }
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))) {
            return res.status(400).json({ message: 'Invalid email address' })
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password should be atleast 6 characters long' })
        }

        const usernameExists = await User.findOne({ username })
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is taken' })
        }

        const userExists = await User.findOne({ emailAddress })
        if (userExists) {
            return res.status(400).json({ message: 'User exists' })
        }

        let avatar = ''

        if (req?.files) {
            const result = await cloudinary.v2.uploader.upload(req.files.avatar.tempFilePath, { folder: 'trakka--user-avatars' })
            avatar = result.secure_url
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            fullname, username, emailAddress, password: hashedPassword, avatar, accountBalance
        })

        const token = jwt.sign({ _id: user._id, fullname, username, emailAddress, avatar, accountBalance }, process.env.JWT_SECRET as string)

        res.status(201).json({ message: 'Account created successfully', token })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}