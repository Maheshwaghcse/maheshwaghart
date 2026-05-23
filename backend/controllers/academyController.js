import AcademyLead from '../models/AcademyLead.js';
import nodemailer from 'nodemailer';

// Helper function to send email notification
const sendAcademyEmails = async (leadDetails) => {
    const { name, email, mobile, message } = leadDetails;

    try {
        console.log('Initializing Nodemailer transport...');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 1. Email to the Student
        const studentMailOptions = {
            from: `"Mahesh Wagh Art Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Mahesh Wagh Art Academy! 🎨',
            text: `Hi ${name},\n\nThank you for joining Art Academy. We will notify you when classes launch.\n\nIn the meantime, keep creating and stay inspired!\n\nBest regards,\nMahesh Wagh Art Studio Team`
        };

        // 2. Email to the Admin
        const adminMailOptions = {
            from: `"Art Academy Server" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `🚨 New Art Academy Lead: ${name}`,
            text: `Hello Admin,\n\nA new student has joined the Art Academy waitlist!\n\nStudent Details:\n- Name: ${name}\n- Email: ${email}\n- Mobile: ${mobile}\n- Message: ${message || 'No custom message provided'}\n\nReview this entry in your MERN database platform.\n\nBest,\nYour Art Academy Server`
        };

        console.log(`Sending confirmation email to student: ${email}...`);
        await transporter.sendMail(studentMailOptions);
        console.log('Student email sent successfully.');

        console.log(`Sending alert notification email to admin: ${process.env.EMAIL_USER}...`);
        await transporter.sendMail(adminMailOptions);
        console.log('Admin alert email sent successfully.');

    } catch (error) {
        console.error('Nodemailer failed inside Art Academy helper:', error);
    }
};

// @desc    Register a lead for Art Academy
// @route   POST /api/academy
// @access  Public
const joinAcademy = async (req, res) => {
    try {
        const { name, email, mobile, message } = req.body;
        console.log('Received Art Academy submission:', { name, email, mobile, message });

        // Backend Validations
        if (!name || name.trim().length < 3) {
            return res.status(400).json({ message: 'Full Name must be at least 3 characters long.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const mobileRegex = /^[0-9]{10}$/;
        if (!mobile || !mobileRegex.test(mobile.trim())) {
            return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number.' });
        }

        // Save to Database
        const newLead = new AcademyLead({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            message: message ? message.trim() : ''
        });

        const savedLead = await newLead.save();
        console.log('Successfully saved academy lead in MongoDB:', savedLead._id);

        // Send confirmation & notification emails asynchronously so response returns fast
        sendAcademyEmails({
            name: savedLead.name,
            email: savedLead.email,
            mobile: savedLead.mobile,
            message: savedLead.message
        });

        res.status(201).json(savedLead);

    } catch (error) {
        console.error('Error in joinAcademy controller:', error);
        res.status(500).json({ message: 'Server error processing your request. Please try again.' });
    }
};

export { joinAcademy };
