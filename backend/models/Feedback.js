import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: false,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false,
        enum: ['Bug Report', 'Suggestion', 'Experience', 'Support']
    }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
