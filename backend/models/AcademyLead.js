import mongoose from 'mongoose';

const academyLeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: false,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model('AcademyLead', academyLeadSchema);
