import mongoose, { ConnectOptions } from 'mongoose';

export default async () => {
    await mongoose.connect(process.env.MONGO_URI as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
}