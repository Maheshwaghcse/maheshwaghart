import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sketch'
    }],
    uid: {
        type: String,
        unique: true,
        sparse: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Hash password and assign UID before saving
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isNew && !this.uid) {
        // Collision-safe UID generation:
        // Count only users that already have a uid, then check if the candidate is taken.
        // Retry up to 10 times to handle concurrent registrations on serverless.
        let uid = null;
        let attempts = 0;
        while (attempts < 10) {
            const base = await mongoose.model('User').countDocuments({ uid: { $exists: true, $ne: null } });
            const candidate = `U-${String(base + 1 + attempts).padStart(3, '0')}`;
            const conflict = await mongoose.model('User').findOne({ uid: candidate }).lean();
            if (!conflict) {
                uid = candidate;
                break;
            }
            attempts++;
        }
        // Fallback: timestamp suffix guarantees uniqueness if all 10 slots collide
        this.uid = uid || `U-T${Date.now()}`;
    }
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

export default mongoose.model('User', userSchema);
