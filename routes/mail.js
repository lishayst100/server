import { Router } from 'express';
import {createTransport} from 'nodemailer'

const router = Router()


router.post('/sendEmail', async (req, res) => {
    const { name, email, message } = req.body;
  
    // Create a transporter using Gmail SMTP
    let transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_APP_PASSWORD
      },
    });
  
    // Email data
    let mailOptions = {
      from: email, // Sender email
      to: 'lishayst1000@gmail.com', // Receiver email
      subject: 'פנייה חדשה מהאתר',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };
  
    try {
      // Send email
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error('Error sending email: ', error);
      res.status(500).send('Error sending email');
    }
  });


  export {router as mailRouter}