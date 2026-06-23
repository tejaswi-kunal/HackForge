const nodemailer = require("nodemailer");

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists =", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if(error){
        console.error("TRANSPORTER VERIFY ERROR:", error);
    }
    else{
        console.log("MAIL SERVER READY");
    }
});

const sendEmail = async ({to, subject, html}) => {
    try{
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });

        console.log("EMAIL SENT:", info.messageId);

    }catch(err){
        console.error("SEND MAIL ERROR:", err);
        throw err;
    }
};

module.exports = sendEmail;