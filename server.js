// ============================================================
// Portfolio Backend Server
// Express server with contact form API, rate limiting, and static file serving.
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');
const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const rateLimit = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
  const now = Date.now();

  if (!rateLimit[ip]) {
    rateLimit[ip] = [];
  }

  rateLimit[ip] = rateLimit[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (rateLimit[ip].length >= RATE_LIMIT_MAX) {
    return false;
  }

  rateLimit[ip].push(now);
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimit) {
    rateLimit[ip] = rateLimit[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    if (rateLimit[ip].length === 0) {
      delete rateLimit[ip];
    }
  }
}, RATE_LIMIT_WINDOW);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/contact', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  const name = normalizeText(req.body.name, 80);
  const email = normalizeText(req.body.email, 120);
  const message = normalizeText(req.body.message, 2000);

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required (name, email, message).'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a message with at least 10 characters.'
    });
  }

if (!process.env.RESEND_API_KEY) {
  return res.status(500).json({
    success: false,
    message: 'Resend API key missing'
  });
}



  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  const htmlEmail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background: linear-gradient(135deg, #7c3aed, #06d6a0); padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">New Portfolio Message</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Someone reached out via your portfolio contact form</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 36px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px 20px; background-color: #f8f7ff; border-radius: 8px; border-left: 4px solid #7c3aed;">
                        <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">From</p>
                        <p style="margin: 0; font-size: 18px; color: #1f2937; font-weight: 600;">${safeName}</p>
                        <a href="mailto:${safeEmail}" style="color: #7c3aed; font-size: 14px; text-decoration: none;">${safeEmail}</a>
                      </td>
                    </tr>
                  </table>
                  <div style="margin-bottom: 24px;">
                    <p style="margin: 0 0 10px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Message</p>
                    <div style="padding: 20px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${safeMessage}</p>
                    </div>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 8px 0;">
                        <a href="mailto:${safeEmail}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #7c3aed, #06d6a0); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">Reply to ${safeName}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">Received on ${timestamp} - Sent via Portfolio Contact Form</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

 

  try {
await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'ishwaribelhekar11@gmail.com',
  subject: `Portfolio Contact from ${name}`,
  html: htmlEmail,
  replyTo: email
});

    console.log(`Contact email sent from ${name} <${email}>`);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });
  } catch (error) {
    console.error('Failed to send email:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nPortfolio server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Resend configured: ${process.env.RESEND_API_KEY ? 'yes' : 'no'}\n`)
});
