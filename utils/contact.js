const nodemailer = require('nodemailer')
require('dotenv').config()


const contact = async (data) => {
    const { email, text } = data
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL, // generated ethereal user
            pass: process.env.APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: email,
        to: process.env.EMAIL,
        subject: "Messenger From Client !",
        text: text,
        html: ''
    });

    return info
}

module.exports = contact