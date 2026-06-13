import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'yoursecretkey', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            // Send register email to admin (fire-and-forget)
            sendEmail({
                email: 'maheshwaghcse@gmail.com',
                subject: `[Maheshwagh Art] New User Registered: ${user.name}`,
                message: `A new user has registered on your website.\n\nDetails:\nUID: ${user.uid}\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nRegistered At: ${new Date().toLocaleString()}`
            }).catch(err => console.error('Error sending registration email alert:', err));

            // Log visitor registration action (non-blocking)
            try {
                const Visitor = (await import('../models/Visitor.js')).default;
                const visitor = new Visitor({
                    userId: user._id,
                    isGuest: false,
                    action: 'register',
                    page: '/register',
                    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                });
                await visitor.save();
            } catch (visErr) {
                console.error('Failed to log visitor registration:', visErr.message);
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                uid: user.uid,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('REGISTER ERROR:', error.message, error.stack);
        res.status(500).json({ message: error.message });
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Assign UID if missing — use updateOne to AVOID triggering pre-save (password re-hash)
            if (!user.uid) {
                let assignedUid = null;
                let attempts = 0;
                while (attempts < 10) {
                    const base = await User.countDocuments({ uid: { $exists: true, $ne: null } });
                    const candidate = `U-${String(base + 1 + attempts).padStart(3, '0')}`;
                    const conflict = await User.findOne({ uid: candidate }).lean();
                    if (!conflict) {
                        assignedUid = candidate;
                        break;
                    }
                    attempts++;
                }
                const finalUid = assignedUid || `U-T${Date.now()}`;
                await User.updateOne({ _id: user._id }, { $set: { uid: finalUid } });
                user.uid = finalUid;
            }

            // Send login email to admin (fire-and-forget)
            sendEmail({
                email: 'maheshwaghcse@gmail.com',
                subject: `[Maheshwagh Art] User Login: ${user.name}`,
                message: `A user has logged in to your website.\n\nDetails:\nUID: ${user.uid}\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nLogin At: ${new Date().toLocaleString()}`
            }).catch(err => console.error('Error sending login email alert:', err));

            // Log visitor login action
            try {
                const Visitor = (await import('../models/Visitor.js')).default;
                const visitor = new Visitor({
                    userId: user._id,
                    isGuest: false,
                    action: 'login',
                    page: '/login',
                    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                });
                await visitor.save();
            } catch (visErr) {
                console.error('Failed to log visitor login:', visErr.message);
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                uid: user.uid,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('LOGIN ERROR:', error.message, error.stack);
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                phone: user.phone
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // Use request headers to get origin dynamically for production deployment, or fallback to FRONTEND_URL env var
        const frontendUrl = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            console.error('Email sending failed:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent. Check backend console.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { registerUser, authUser, getUserProfile, forgotPassword, resetPassword };
