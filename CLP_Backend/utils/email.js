const nodemailer = require("nodemailer");
const UserVerification = require("../models/UserVerification.js");
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require("uuid");

require("dotenv").config();
const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: "OAuth2",
        user: process.env.AUTH_EMAIL,
        clientId: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET,
        refreshToken: process.env.AUTH_REFRESH_TOKEN
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

exports.sendVerificationEmail = async (_id, email, res) => {
  const currentUrl = process.env.CURRENT_URL;
  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + "/auth/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`,
  };

  try{
    const hashedUniqueString = await bcrypt.hash(uniqueString, bcryptSalt);
    const newVerification = new UserVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000
    });

    await newVerification.save();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("An error occurred while sending the verification email: ", error);
  }
};