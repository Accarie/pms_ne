import { config } from 'dotenv';
import nodemailer from 'nodemailer'

config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

transporter.verify(function (error, success) {
    console.log("Server ready for incoming messages and requests");
});

const sendAccountVerificationEmail = async (email: string, names: string, verificationToken: string) => {
    try {
        const info = transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Account Verification Email",
            html:
                `
            <!DOCTYPE html>
                <html>
                <body>
                    <h2>Dear ${names}, </h2>
                    <h2> To verify your account, use this code below</h2>
                    <strong>Verification code: ${verificationToken}</strong> <br/>
                    <span>This code will remain valid for the next 6 hours</span>
                    <p>Regards,<br>Parking Management System</p>
                </body>
            </html>
            `

        });

        return {
            message: "Email sent successfully",
            status: true
        };
    } catch (error) {
        return { message: "Email Wasn't sent", status: false };
    }
};

const sendPaswordResetEmail = async (email: string, names: string, passwordResetToken: string) => {
    try {
        const info = transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Password Reset Email",
            html:
                `
            <!DOCTYPE html>
                <html>
                <body>
                    <h2>Dear ${names}, </h2>
                    <h2>To reset your password use this code below:</h2>
                    <strong>Reset code: ${passwordResetToken}</strong> <br/>
                    <span>This code will remain valid for the next 6 hours</span>
                    <p>Regards,<br>Parking Management System</p>
                </body>
            </html>
            `

        });

        return {
            message: "Email sent successfully",
            status: true
        };
    } catch (error) {
        return { message: "Email wasn't sent", status: false };
    }
};


const sendRejectionEmail = async (email: string, names: string) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Parking Request Denied",
      html: `
          <!DOCTYPE html>
          <html>
            <body>
              <h2>Dear ${names},</h2>
              <p>Your request to book this slot has been denied <strong style="color:red;">Denied</strong>.</p>
              <p>Currently, this service is temporarily unavailable due to capacity limitations or other factors. We apologize for the inconvenience and encourage you to reach out to us for more information or try again shortly.</p>
              <br/>
              <p>Regards,<br/>Parking Management System</p>
            </body>
          </html>
        `,
    });

    return {
      message: "Rejection email sent",
      status: true,
    };
  } catch (error) {
    return { message: "The rejection email wasn't sent", status: false };
  }
};
const sendParkingSlotConfirmationEmail = async (email: string, names: string, slotNumber: any) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Parking Slot Reservation Confirmation",
      html: `
          <!DOCTYPE html>
          <html>
            <body>
              <h2>Dear ${names},</h2>
              <p>Your parking slot reservation has been successfully confirmed.</p>
              <p>Your parking spot number is: <strong>${slotNumber}</strong></p>
              <p>Thank you for your business!</p>
              <br/>
              <p>Regards,<br/>NE Parking Management System</p>
            </body>
          </html>
        `,
    });

    return {
      message: "Parking Slot Confirmation Email Has Been Sent.",
      status: true,
    };
  } catch (error) {
    return { message: "parking slot confirmation email wasn't sent", status: false };
  }
};  

export { sendAccountVerificationEmail, sendPaswordResetEmail, sendRejectionEmail, sendParkingSlotConfirmationEmail };