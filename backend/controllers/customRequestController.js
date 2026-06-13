import nodemailer from 'nodemailer';
import CustomRequest from '../models/CustomRequest.js';

const sendNotificationEmail = async (requestData) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email to the artist (Maheshwagh art / Mahesh Wagh)
        const artistMailOptions = {
            from: `Maheshwagh Art <${process.env.EMAIL_USER}>`,
            to: 'maheshwaghcse@gmail.com',
            subject: `New Custom Sketch Request [${requestData.uid}] from ${requestData.name}`,
            text: `Hi Maheshwagh,\n\nYou have received a new custom sketch request commission!\n\nDetails:\nUID: ${requestData.uid}\nName: ${requestData.name}\nEmail: ${requestData.email}\nDescription:\n${requestData.description || 'No description provided.'}\n\nReference URL: ${requestData.referenceUrl || 'None Provided'}\n\nBest,\nMaheshwagh Art System`
        };

        // Confirmation email to the customer
        const customerMailOptions = {
            from: `Maheshwagh Art <${process.env.EMAIL_USER}>`,
            to: requestData.email,
            subject: `We Received Your Custom Sketch Request! [${requestData.uid}] - Maheshwagh Art`,
            text: `Hi ${requestData.name},\n\nThank you for reaching out to Maheshwagh Art Academy!\nI have received your custom sketch request details (UID: ${requestData.uid}):\n\n"${requestData.description || 'Custom Request Reference'}"\n\nI will review your request and get back to you with a quote/timeline within 24 hours.\n\nKeep dreaming, stay inspired!\n\nBest,\nMaheshwagh Art Team`
        };

        await transporter.sendMail(artistMailOptions);
        await transporter.sendMail(customerMailOptions);
        console.log('Notification emails sent successfully.');
    } catch (error) {
        console.error('Error sending custom request notification emails:', error);
        throw error;
    }
};

const createCustomRequest = async (req, res) => {
    try {
        const { name, email, description, referenceUrl } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        // 1. Save to Database
        const requestData = await CustomRequest.create({ name, email, description, referenceUrl });

        // 2. Track as a visitor action in Visitor table
        try {
            const Visitor = (await import('../models/Visitor.js')).default;
            const visitor = new Visitor({
                userId: req.visitorInfo?.userId || (req.user ? req.user._id : null),
                guestId: req.body.guestId || null,
                isGuest: !(req.visitorInfo?.userId || req.user),
                action: 'custom_request',
                page: '/custom-request',
                ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            });
            await visitor.save();
        } catch (visErr) {
            console.error('Failed to log visitor action for custom request:', visErr);
        }

        // 3. Send email alerts in the background (fire-and-forget, non-blocking)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            sendNotificationEmail(requestData).catch((err) => {
                console.error('Background custom request email alert failed:', err);
            });
        } else {
            console.warn('Email credentials not configured on backend.');
        }

        // 4. Return immediately to the client
        res.status(201).json({
            success: true,
            message: 'Custom sketch request submitted successfully.',
            data: requestData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createCustomRequest };
