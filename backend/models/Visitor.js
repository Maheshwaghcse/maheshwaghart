import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    guestId: {
        type: String,
        default: null
    },
    isGuest: {
        type: Boolean,
        required: true,
        default: true
    },
    action: {
        type: String,
        required: true,
        default: 'visit' // 'visit' for page visits, buttonName for clicks
    },
    page: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        default: 'unknown'
    },
    userAgent: {
        type: String,
        default: 'unknown'
    },
    visitedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add indexes for efficient aggregation & queries on the dashboard
visitorSchema.index({ visitedAt: -1 });
visitorSchema.index({ action: 1 });
visitorSchema.index({ isGuest: 1 });

export default mongoose.model('Visitor', visitorSchema);
