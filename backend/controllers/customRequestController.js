import nodemailer from 'nodemailer';

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
            subject: `New Custom Sketch Request from ${requestData.name}`,
            text: `Hi Maheshwagh,\n\nYou have received a new custom sketch request commission!\n\nDetails:\nName: ${requestData.name}\nEmail: ${requestData.email}\nDescription:\n${requestData.description || 'No description provided.'}\n\nReference URL: ${requestData.referenceUrl || 'None Provided'}\n\nBest,\nMaheshwar Art System`
        };

        // Confirmation email to the customer
        const customerMailOptions = {
            from: `Maheshwagh Art <${process.env.EMAIL_USER}>`,
            to: requestData.email,
            subject: 'We Received Your Custom Sketch Request! - Maheshwagh Art',
            text: `Hi ${requestData.name},\n\nThank you for reaching out to Maheshwagh Art Academy!\nI have received your custom sketch request details:\n\n"${requestData.description || 'Custom Request Reference'}"\n\nI will review your request and get back to you with a quote/timeline within 24 hours.\n\nKeep dreaming, stay inspired!\n\nBest,\nMaheshwagh Art Team`
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

        const requestData = { name, email, description, referenceUrl };

        // Send email alerts
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await sendNotificationEmail(requestData);
        } else {
            console.warn('Email credentials not configured on backend.');
            throw new Error('Email service is currently unavailable.');
        }

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
