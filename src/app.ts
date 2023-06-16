import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import cloudinary from 'cloudinary'
import connectToDB from './utils/connectToDB'
import fileUpload from 'express-fileupload'
import notFound from './middlewares/notFound'
import authenticate from './middlewares/authenticate'
import transactionRouter from './routes/transaction'


dotenv.config()

const app = express()

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
}))

app.use('/api/v1', authRouter)
app.use('/api/v1/transaction', authenticate, transactionRouter)

app.use(notFound)

const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        await connectToDB()
        app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
        console.log('Unable to start server')
    }
}

startServer()