const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const config = {
        from: 'No Reply <no-reply@natours.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(config);
}

module.exports = sendEmail;