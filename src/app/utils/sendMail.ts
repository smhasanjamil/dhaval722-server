import nodemailer from "nodemailer";
import config from "../config";

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmail_user,
      pass: config.gmail_app_password,
    },
  });

  const mailOptions = {
    from: `"Dhaval722" <${config.gmail_user}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordOTP = async (email: string, otp: string) => {
  const subject = "Your Password Reset OTP";
  const text = `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Reset</h2>
      <p>Your OTP is:</p>
      <h3>${otp}</h3>
      <p>This OTP will expire in <b>10 minutes</b>.</p>
    </div>
  `;

  await sendMail({ to: email, subject, text, html });
};
