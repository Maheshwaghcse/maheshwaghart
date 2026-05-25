import mongoose from 'mongoose';

let cached = global._mongooseCache;
if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = process.env.MONGO_URI;
        cached.promise = mongoose.connect(uri).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        }).catch((error) => {
            console.error(`Error connecting to MongoDB: ${error.message}`);
            // Don't process.exit(1) here as it will kill the serverless function
            throw error; 
        });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
};

export default connectDB;