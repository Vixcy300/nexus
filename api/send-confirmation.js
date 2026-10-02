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
  <title>Your NEXUS Pioneer Pass is Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Top Accent Stripe -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #10b981, #059669, #e8ff47);"></td>
          </tr>

          <!-- Header & Brand -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                      NEXUS <span style="color: #10b981;">STUDIO</span>
                    </div>
                    <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #059669; font-weight: 700; margin-top: 4px;">
                      Early Pioneer Pass • Confirmed
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px;">
                      $0 Free Lifetime
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Greeting -->
              <h1 style="margin: 24px 0 8px 0; font-size: 24px; line-height: 1.3; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                Thank you for registering, ${userName}!
              </h1>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Your Pioneer Access Pass has been successfully verified and reserved. You are officially verified as Pioneer Member <strong style="color: #0f172a; font-family: 'SF Mono', Consolas, monospace;">#${userNumber}</strong>.
              </p>
            </td>
          </tr>

          <!-- Launch Availability Notice Box -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">
                      🔔 We will notify you when services & downloads go live!
                    </div>
                    <div style="font-size: 13px; line-height: 1.6; color: #15803d;">
                      Our team is putting the final touches on our CAD blocks, Revit smart families, and AI prompt synthesizer. As a verified Early Pioneer, you will receive an exclusive priority email with direct access the moment our service goes live.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pass Details Table -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 10px;">
                Verified Pass Credentials
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px;">
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Member ID:</td>
                  <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', Consolas, monospace; font-weight: 700;">#${userNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email:</td>
                  <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Professional Role:</td>
                  <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${userRole}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Country:</td>
                  <td style="padding: 12px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${userCountry}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Invitation Pass Code:</td>
                  <td style="padding: 12px 16px; color: #059669; border-bottom: 1px solid #e2e8f0; font-family: 'SF Mono', Consolas, monospace; font-weight: 700;">${userCode}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b;">Allocation Status:</td>
                  <td style="padding: 12px 16px; color: #15803d; font-weight: 700;">✓ 100% Free Lifetime Reserved</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reserved Architectural Library -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 12px;">
                Reserved Assets For Your Pass
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> <strong>AutoCAD Dynamic Blocks (.DWG)</strong> — AIA-compliant stretch & visibility states
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> <strong>Parametric Revit Families (.RFA)</strong> — LOD 350+ smart BIM families with shared parameters
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> <strong>Calibrated AI Prompt Engine</strong> — Production Midjourney & SDXL architectural workflows
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #334155;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span> <strong>Commercial Practice License</strong> — Perpetual, royalty-free usage across client projects
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Platform Link Button -->
          <tr>
            <td style="padding: 0 36px 36px 36px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://nexus-ashy-nu-13.vercel.app" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 30px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                      Visit NEXUS Studio →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                Questions or studio inquiries? Contact us directly at <a href="mailto:${smtpUser}" style="color: #059669; text-decoration: none; font-weight: 600;">${smtpUser}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                NEXUS Studio © 2026. Reserved for verified early pioneer pass holders.
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
      from: `"NEXUS Platform" <${smtpUser}>`,
      to: email,
      subject: `[Pass #${userNumber}] Thank You! Your Free NEXUS Pioneer Pass is Confirmed`,
      text: `Thank you, ${userName}! Your NEXUS Pioneer Pass #${userNumber} has been verified and reserved. Country: ${userCountry}. Referral Code: ${userCode}. We will notify you directly at this email address as soon as our platform and services go live at https://nexus-ashy-nu-13.vercel.app`,
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
