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
    const userCity = location?.city ? `${location.city}, ${location.country || ''}` : 'Global Network';

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NEXUS — Access Pass Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f3f7; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #08090c; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #0e1117; border: 1px solid #232936; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #22c55e, #16a34a, #4ade80);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #22c55e; font-weight: 700;">
                      NEXUS // PIONEER ACCESS PASS
                    </span>
                    <h1 style="margin: 12px 0 6px 0; font-size: 26px; line-height: 1.25; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Welcome, ${userName}.
                    </h1>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #8a94a6;">
                      Your lifetime membership has been officially registered and verified.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pass ID Badge Box -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #141822; border: 1px solid #2d3545; border-radius: 12px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #22c55e; margin-bottom: 4px;">
                      Pass ID & Status
                    </div>
                    <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">
                      #${userNumber}
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.35); color: #22c55e; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                      100% Free Lifetime
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Member Details Table -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #8a94a6; margin-bottom: 12px;">
                Registered Credentials
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #08090c; border: 1px solid #1f2533; border-radius: 12px; font-size: 13px; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #161a24; width: 35%;">Email:</td>
                  <td style="padding: 12px 16px; color: #f1f3f7; border-bottom: 1px solid #161a24; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #161a24;">Role:</td>
                  <td style="padding: 12px 16px; color: #f1f3f7; border-bottom: 1px solid #161a24;">${userRole}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #161a24;">Referral Code:</td>
                  <td style="padding: 12px 16px; color: #22c55e; border-bottom: 1px solid #161a24; font-weight: 700;">${userCode}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #161a24;">Region:</td>
                  <td style="padding: 12px 16px; color: #f1f3f7; border-bottom: 1px solid #161a24;">${userCity}</td>
                </tr>
                ${location?.latitude && location?.longitude ? `
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; border-bottom: 1px solid #161a24;">GPS Coordinates:</td>
                  <td style="padding: 12px 16px; color: #22c55e; border-bottom: 1px solid #161a24; font-weight: 600;">
                    ${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}
                    <span style="color: #94a3b8; font-size: 11px; font-weight: 400;">(±${Math.round(location.accuracy || 15)}m)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b;">Google Maps:</td>
                  <td style="padding: 12px 16px;">
                    <a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: 600;">
                      View Location on Google Maps ↗
                    </a>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- What is Unlocked -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #8a94a6; margin-bottom: 12px;">
                Unlocked Architectural Assets
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #141822; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0;">
                    <span style="color: #22c55e; margin-right: 8px;">✓</span> <strong>AutoCAD Dynamic Blocks (.DWG)</strong> — AIA-compliant stretch & visibility states
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0;">
                    <span style="color: #22c55e; margin-right: 8px;">✓</span> <strong>Parametric Revit Families (.RFA)</strong> — LOD 350+ with clean shared parameters
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0;">
                    <span style="color: #22c55e; margin-right: 8px;">✓</span> <strong>AI Architectural Prompt Engine</strong> — Calibrated Midjourney v6 & SDXL CAD workflows
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #e2e8f0;">
                    <span style="color: #22c55e; margin-right: 8px;">✓</span> <strong>Commercial Licensing Rights</strong> — Perpetual, royalty-free usage across client projects
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 36px 36px 36px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://nexus-ashy-nu-13.vercel.app" target="_blank" style="display: inline-block; background-color: #22c55e; color: #08090c; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 30px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">
                      Open NEXUS Platform →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <hr style="border: 0; border-top: 1px solid #1f2533; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                Questions or studio support? Contact us directly at <a href="mailto:${smtpUser}" style="color: #22c55e; text-decoration: none;">${smtpUser}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569; font-family: 'SF Mono', Consolas, Monaco, monospace;">
                NEXUS Architectural Intelligence © 2026. Strictly reserved for verified pioneers.
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
      subject: `[Pass #${userNumber}] Your 100% Free NEXUS Pioneer Pass is Confirmed`,
      text: `Welcome, ${userName}! Your NEXUS Pioneer Pass #${userNumber} has been verified for ${email}. Referral Code used: ${userCode}. Access the full CAD, Revit & AI prompt vault at https://nexus-ashy-nu-13.vercel.app`,
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
