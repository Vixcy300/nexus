import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { name, email, id, profession, referralCode, location } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email is required.' });
    }

    const smtpUser = process.env.SMTP_USER || 'contactigtyt@gmail.com';
    const rawPass = process.env.SMTP_PASS || 'utle mccy jajv elmg';
    const smtpPass = rawPass.replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const userNumber = id || 'PIONEER-PASS';
    const userName = name || 'Pioneer Member';
    const userRole = profession || 'Architectural Designer';
    const userCode = referralCode || 'VIP-MEMBER';
    // User country only (no city or coordinates in email as requested)
    const userCountry = location?.country || 'International';

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>NEXUS Studio — Pioneer Pass Confirmation</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0b0f17 !important; }
      .email-card { background-color: #111827 !important; border-color: #1f2937 !important; }
      .email-title { color: #f8fafc !important; }
      .email-text { color: #94a3b8 !important; }
      .info-box { background-color: #1e293b !important; border-color: #334155 !important; }
      .info-title { color: #38bdf8 !important; }
      .info-text { color: #cbd5e1 !important; }
      .table-box { background-color: #0f172a !important; border-color: #1e293b !important; }
      .table-label { color: #94a3b8 !important; border-color: #1e293b !important; }
      .table-val { color: #f8fafc !important; border-color: #1e293b !important; }
      .btn-primary { background-color: #ffffff !important; color: #0f172a !important; }
      .footer-text { color: #64748b !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-bg" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);">
          
          <!-- Corporate Brand Bar -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; text-decoration: none;">
                      NEXUS <span style="font-weight: 400; color: #64748b;">STUDIO</span>
                    </span>
                    <div style="font-size: 11px; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600; margin-top: 2px;">
                      Computational Architecture Suite
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.3px;">
                      PIONEER PASS • CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome & Registration Confirmation -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <h1 class="email-title" style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; line-height: 1.3;">
                Registration Confirmed, ${userName}
              </h1>
              <p class="email-text" style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Thank you for reserving your Free Early Pioneer Pass. Your lifetime license allocation has been officially verified and assigned to your account under Pioneer Member <strong style="color: #0f172a;">#${userNumber}</strong>.
              </p>
            </td>
          </tr>

          <!-- Launch Availability & Notification Status Box -->
          <tr>
            <td style="padding: 0 32px 22px 32px;">
              <div class="info-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f172a; border-radius: 8px; padding: 16px 18px;">
                <div class="info-title" style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 5px;">
                  Service &amp; Download Release Notification
                </div>
                <div class="info-text" style="font-size: 13px; line-height: 1.55; color: #475569;">
                  Our architecture team is completing final calibration on the production BIM families, dynamic AutoCAD library, and AI prompt workflows. As a confirmed Pioneer Member, you will receive an exclusive release email with direct download access the moment services go live.
                </div>
              </div>
            </td>
          </tr>

          <!-- Membership Credentials Summary -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 8px;">
                Membership Credentials
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="table-box" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px;">
                <tr>
                  <td class="table-label" style="padding: 10px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 38%;">Member ID:</td>
                  <td class="table-val" style="padding: 10px 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">#${userNumber}</td>
                </tr>
                <tr>
                  <td class="table-label" style="padding: 10px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Registered Email:</td>
                  <td class="table-val" style="padding: 10px 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${email}</td>
                </tr>
                <tr>
                  <td class="table-label" style="padding: 10px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Professional Discipline:</td>
                  <td class="table-val" style="padding: 10px 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${userRole}</td>
                </tr>
                <tr>
                  <td class="table-label" style="padding: 10px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Geographic Country:</td>
                  <td class="table-val" style="padding: 10px 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${userCountry}</td>
                </tr>
                <tr>
                  <td class="table-label" style="padding: 10px 14px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Invitation Pass Code:</td>
                  <td class="table-val" style="padding: 10px 14px; color: #0f172a; font-family: monospace; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${userCode}</td>
                </tr>
                <tr>
                  <td class="table-label" style="padding: 10px 14px; color: #64748b;">License Tier:</td>
                  <td class="table-val" style="padding: 10px 14px; color: #059669; font-weight: 700;">100% Free Lifetime ($0 / Perpetual)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Allocated Toolsets Overview -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 8px;">
                Allocated Resource Package
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="table-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #334155; line-height: 1.5;">
                    • <strong>Dynamic AutoCAD Blocks (.DWG)</strong> — Full architectural stretch, visibility, and layer standards
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #334155; line-height: 1.5;">
                    • <strong>Parametric Revit Families (.RFA)</strong> — LOD 350+ smart BIM components with shared parameters
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #334155; line-height: 1.5;">
                    • <strong>Calibrated AI Design Workflows</strong> — Production Midjourney &amp; SDXL architectural prompt schemas
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #334155; line-height: 1.5;">
                    • <strong>Commercial Studio License</strong> — Perpetual commercial rights across firm client deliverables
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call to Action Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="https://nexus-ashy-nu-13.vercel.app" target="_blank" class="btn-primary" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 13px 30px; border-radius: 6px; letter-spacing: 0.2px;">
                Access NEXUS Studio Portal →
              </a>
            </td>
          </tr>

          <!-- Corporate Footer -->
          <tr>
            <td style="padding: 22px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p class="footer-text" style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                For studio inquiries or technical support, contact our team directly at <a href="mailto:${smtpUser}" style="color: #0f172a; text-decoration: underline; font-weight: 500;">${smtpUser}</a>
              </p>
              <p class="footer-text" style="margin: 0; font-size: 11px; color: #94a3b8;">
                NEXUS Studio • Advanced Computational Architecture &amp; Technology<br>
                This official confirmation was sent to ${email} for Pioneer Pass reservation.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: `"NEXUS Studio" <${smtpUser}>`,
      to: email,
      subject: `NEXUS Studio — Your Early Pioneer Pass (#${userNumber}) is Confirmed`,
      text: `Dear ${userName},\n\nThank you for reserving your Free Early Pioneer Pass with NEXUS Studio. Your lifetime membership (#${userNumber}) has been verified and confirmed.\n\nCountry: ${userCountry}\nInvitation Pass Code: ${userCode}\nStatus: 100% Free Lifetime Reserved\n\nWe will notify you directly at this email address with your download links the moment platform services go live.\n\nVisit NEXUS Studio: https://nexus-ashy-nu-13.vercel.app\n\nNEXUS Studio Team`,
      html: emailHtml,
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error('SMTP Send Error:', err);
    return res.status(500).json({
      error: 'Failed to send confirmation email',
      details: err.message,
    });
  }
}
