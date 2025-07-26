import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { prisma } from '../index.js';

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
    console.error('Error sending email:', error);
  }
};

// Check for expiring contracts and send reminders
export const checkExpiringContracts = async () => {
  try {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">AMC Renewal Reminder</h2>
            <p>Dear ${contract.owner.name},</p>
            <p>This is a reminder that your AMC contract is expiring soon:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Asset Details:</h3>
              <p><strong>Asset Number:</strong> ${contract.assetNumber}</p>
              <p><strong>Make & Model:</strong> ${contract.make} ${contract.model}</p>
              <p><strong>Location:</strong> ${contract.location}</p>
              <p><strong>AMC End Date:</strong> ${contract.amcEnd.toLocaleDateString()}</p>
              <p><strong>Vendor:</strong> ${contract.vendor}</p>
            </div>
            <p>Please take necessary action to renew the AMC contract before it expires.</p>
            <p>Best regards,<br>IGL AMC Management System</p>
          </div>
        `;
        
        await sendEmail(contract.owner.email, subject, html);
      }
    }

    console.log(`Processed ${expiringContracts.length} expiring contracts`);
  } catch (error) {
    console.error('Error checking expiring contracts:', error);
  }
};

// Start email scheduler (runs every Monday at 9 AM)
export const startEmailScheduler = () => {
  cron.schedule('0 9 * * 1', () => {
    console.log('Running weekly AMC reminder check...');
    checkExpiringContracts();
  });
  
  console.log('Email scheduler started - runs every Monday at 9 AM');
};