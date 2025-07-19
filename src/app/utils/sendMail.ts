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

export const sendProspectDutyEmailToSalesPerson = async (
  salesEmail: string,
  prospectId: string,
  prospectStoreName: string
) => {
  const subject = "📌 New Prospect Assigned to You";

  const prospectLink = `https://your-frontend-domain.com/prospects/${prospectId}`;

  const text = `You have been assigned a new prospect: ${prospectStoreName}. Please log in to your dashboard to view and follow up with this prospect.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.postimg.cc/QMdNcbrC/Arbora-Logo.jpg" alt="Arbora Logo" width="120"/>
      </div>
      <h2 style="color: #4CAF50; text-align: center;">New Prospect Assigned 🎯</h2>
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #333;">
        You have been assigned to follow up with a new prospect:
      </p>
      <p style="font-size: 18px; font-weight: bold; color: #000;">
        ${prospectStoreName}
      </p>
      <p style="font-size: 16px; color: #333;">
        Please log in to your Arbora Sales Dashboard to review the details and take the necessary next steps.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${prospectLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
          View Prospect
        </a>
      </div>
      <p style="font-size: 14px; color: #777; text-align: center;">
        Thank you for staying proactive in growing our customer relationships.
      </p>
      <p style="font-size: 14px; color: #777; text-align: center;">
        - Arbora Team
      </p>
    </div>
  `;

  await sendMail({ to: salesEmail, subject, text, html });
};



export const sendOpenBalanceEmail = async ({ storePersonEmail, unpaidOrders }: { storePersonEmail: string; unpaidOrders: any[] }) => {
  const subject = "Friendly Reminder: Outstanding Balance on Your Orders";
  const totalOpenBalance = unpaidOrders.reduce((sum, order) => sum + order.openBalance, 0).toFixed(2);

  const orderDetails = unpaidOrders
    .map(order => `
      <li>
        Invoice #${order.invoiceNumber} - Open Balance: $${order.openBalance.toFixed(2)} (Due: ${order.paymentDueDate})
      </li>
    `)
    .join("");

  const text = `Dear ${storePersonEmail.split("@")[0]},

We kindly remind you of an outstanding balance of $${totalOpenBalance} on your orders. Please find details below:

${unpaidOrders.map(order => `Invoice #${order.invoiceNumber}: $${order.openBalance.toFixed(2)} (Due: ${order.paymentDueDate})`).join("\n")}

Please settle the balance at your earliest convenience. Feel free to contact us at accounts@arbora.com for assistance.

Best regards,
Arbora Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.postimg.cc/QMdNcbrC/Arbora-Logo.jpg" alt="Arbora Logo" width="120"/>
      </div>
      <h2 style="color: #4CAF50; text-align: center;">Friendly Reminder 📩</h2>
      <p style="font-size: 16px; color: #333;">
        Dear ${storePersonEmail.split("@")[0]},
      </p>
      <p style="font-size: 16px; color: #333;">
        We hope this message finds you well. We would like to kindly remind you of an outstanding balance of <b>$${totalOpenBalance}</b> on your orders with Arbora.
      </p>
      <p style="font-size: 16px; color: #333;">
        Please review the details below:
      </p>
      <ul style="font-size: 16px; color: #333; padding-left: 20px;">
        ${orderDetails}
      </ul>
      <p style="font-size: 16px; color: #333;">
        We kindly request you to settle this balance at your earliest convenience. Should you have any questions or need assistance, please don’t hesitate to reach out to us at <a href="mailto:accounts@arbora.com">accounts@arbora.com</a>.
      </p>
      <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
        Thank you for your prompt attention to this matter.
      </p>
      <p style="font-size: 14px; color: #777; text-align: center;">
        - Arbora Team
      </p>
    </div>
  `;

  await sendMail({ to: storePersonEmail, subject, text, html });
};