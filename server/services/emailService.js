import nodemailer from "nodemailer";
import cron from "node-cron";
import { prisma } from "../index.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Check for expiring contracts and send reminders
export const checkExpiringContracts = async () => {
  try {
    const now = new Date();
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );

    const expiringContracts = await prisma.amcContract.findMany({
      where: {
        amcEnd: {
          gte: now,
          lte: nextMonth,
        },
      },
      include: {
        owner: true,
      },
    });

    for (const contract of expiringContracts) {
      if (contract.owner.emailPreference) {
        const subject = `AMC Renewal Reminder - ${contract.assetNumber}`;
        const html = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
  <h2 style="color: #1d4ed8; font-size: 24px; margin-bottom: 16px;">🔔 AMC Renewal Reminder</h2>

  <p style="font-size: 16px; color: #374151; margin: 0 0 12px 0;">Dear <strong>${
    contract.owner.name
  }</strong>,</p>

  <p style="font-size: 15px; color: #4b5563; margin: 0 0 16px 0;">This is a friendly reminder that your AMC contract is nearing its expiration:</p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">📋 Asset Details:</h3>
    <p style="margin: 6px 0;"><strong>Asset Number:</strong> ${
      contract.assetNumber
    }</p>
    <p style="margin: 6px 0;"><strong>Make & Model:</strong> ${contract.make} ${
          contract.model
        }</p>
    <p style="margin: 6px 0;"><strong>Location:</strong> ${
      contract.location
    }</p>
    <p style="margin: 6px 0;"><strong>AMC End Date:</strong> ${contract.amcEnd.toLocaleDateString()}</p>
    <p style="margin: 6px 0;"><strong>Vendor:</strong> ${contract.vendor}</p>
  </div>

  <p style="font-size: 15px; color: #374151; margin-bottom: 20px;">
    Please take the necessary steps to renew your AMC contract before the expiration date.
  </p>

  <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Best regards,</p>
  <p style="font-size: 14px; font-weight: bold; color: #1f2937;">IGL AMC Management System</p>

  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    &copy; ${new Date().getFullYear()} IGL AMC System. All rights reserved.
  </p>
</div>

        `;

        await sendEmail(contract.owner.email, subject, html);
      }
    }

    console.log(`Processed ${expiringContracts.length} expiring contracts`);
  } catch (error) {
    console.error("Error checking expiring contracts:", error);
  }
};

// Start email scheduler (runs every Monday at 9 AM)
export const startEmailScheduler = () => {
  cron.schedule("0 9 * * 1", () => {
    console.log("Running weekly AMC reminder check...");
    checkExpiringContracts();
  });

  console.log("Email scheduler started - runs every Monday at 9 AM");
};
