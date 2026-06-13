import mongoose from 'mongoose';

const customRequestSchema = new mongoose.Schema({
    uid: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    referenceUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Pre-save middleware to assign UID: CR-001, CR-002, etc.
customRequestSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const count = await mongoose.model('CustomRequest').countDocuments();
            this.uid = `CR-${String(count + 1).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

export default mongoose.model('CustomRequest', customRequestSchema);
