import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

/**
 * Begenarxiv Email Dispatch Service
 * Handles:
 * 1. Contributor submission approval certificates
 * 2. Contributor submission rejection feedback
 * 3. Mezmur decode request confirmation & admin notification
 * 4. Mezmur decode request completion notification
 */

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nebiyoutahoa@gmail.com';

export function getClientUrl(): string {
  const url = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';
  return url.replace(/\/+$/, '');
}

export interface ContributorApprovalData {
  contributorName: string;
  contributorEmail: string;
  mezmurId: number;
  mezmurTitle: string;
  tuneName: string;
  approvedDate?: string;
}

export interface ContributorRejectionData {
  contributorName: string;
  contributorEmail: string;
  mezmurTitle: string;
  reason?: string;
}

export interface DecodeRequestEmailData {
  requestId: number;
  title: string;
  artist?: string | null;
  youtubeUrl?: string | null;
  notes?: string | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
}

export interface DecodeCompletedData {
  title: string;
  mezmurId: number;
  requesterName?: string | null;
  requesterEmail: string;
}

interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
  bcc?: string;
}

/**
 * Records dispatched emails to a persistent local outbox log for auditing and offline verification.
 */
function logToOutbox(payload: MailPayload & { delivered: boolean; error?: string; messageId?: string }) {
  try {
    const logsDir = path.resolve(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logFile = path.join(logsDir, 'email_outbox.log');
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] TO: ${payload.to} | DELIVERED: ${payload.delivered}${payload.messageId ? ` | ID: ${payload.messageId}` : ''}${payload.error ? ` | ERR: ${payload.error}` : ''}\nSUBJECT: ${payload.subject}\n${payload.text}\n------------------------------------------------------------\n`;
    fs.appendFileSync(logFile, entry, 'utf-8');
  } catch (e) {
    console.warn('[Email Service] Failed to write outbox log:', e);
  }
}

/**
 * Creates a configured Nodemailer transporter using SMTP credentials or Gmail App Password.
 */
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || ADMIN_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: pass ? { user, pass } : undefined,
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: pass ? { user, pass } : undefined,
  });
}

/**
 * Core dispatch function.
 * Attempts live delivery if SMTP credentials are configured.
 * Logs cleanly and records to outbox without crashing if credentials are not yet set.
 */
async function sendMail(payload: MailPayload): Promise<{ success: boolean; delivered: boolean; messageId?: string }> {
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  const fromAddress = `Begenarxiv <${ADMIN_EMAIL}>`;

  console.log(`[Email Service] ✉️  Dispatching: "${payload.subject}" -> ${payload.to}`);

  if (!pass) {
    console.log(`[Email Service] Notice: No SMTP password configured in .env. Logged to server/logs/email_outbox.log.`);
    logToOutbox({ ...payload, delivered: false, error: 'No SMTP credentials in .env (offline mode)' });
    return { success: true, delivered: false };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: fromAddress,
      to: payload.to,
      bcc: payload.bcc,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    console.log(`[Email Service] ✓ Delivered successfully (Message ID: ${info.messageId})`);
    logToOutbox({ ...payload, delivered: true, messageId: info.messageId });
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[Email Service] ⚠️ SMTP transport error: ${errMsg}`);
    logToOutbox({ ...payload, delivered: false, error: errMsg });
    // Still return success to prevent crashing calling business logic
    return { success: true, delivered: false };
  }
}

/**
 * 1. Contributor Approval Email with Certificate
 */
export async function sendContributorApprovalEmail(
  data: ContributorApprovalData
): Promise<{ success: boolean; certificateId: string }> {
  const certificateId = `BGX-CONTRIBUTOR-${String(data.mezmurId).padStart(4, '0')}`;
  const hymnUrl = `${getClientUrl()}/mezmur/${data.mezmurId}`;
  const dateStr = data.approvedDate || new Date().toLocaleDateString();

  const textBody = `
Greetings ${data.contributorName},

Congratulations! Your decoded Begena transcription of "${data.mezmurTitle}" (${data.tuneName}) has been verified and approved by Begenarxiv.

It is now officially live in the Begenarxiv repertoire, permanently tagged with your name as a recognized contributor.

OFFICIAL CONTRIBUTOR CERTIFICATE:
- Certificate ID: ${certificateId}
- Mezmur: ${data.mezmurTitle}
- Tuning Mode: ${data.tuneName}
- Contributor: ${data.contributorName}
- Status: Verified & Published to Catalogue
- Date: ${dateStr}

You can view and play your published mezmur here:
${hymnUrl}

Thank you for your dedicated contribution to preserving Ethiopia's sacred 10-string Begena tradition.

Warm regards,
The Begenarxiv Team
${ADMIN_EMAIL}
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #fafafa; color: #18181b; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #000000; color: #ffffff; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #000000; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px 0; }
    .cert-box { background: #fafafa; border: 1px solid #d4d4d8; border-radius: 8px; padding: 18px; margin: 20px 0; font-family: monospace; font-size: 13px; line-height: 1.8; }
    .btn { display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px; margin: 12px 0; }
    .footer { font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; margin-top: 24px; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Contributor Recognition Certificate</div>
    <h1>Your Mezmur is Live!</h1>
    <p>Greetings <strong>${data.contributorName}</strong>,</p>
    <p>Congratulations! Your decoded Begena transcription of <strong>"${data.mezmurTitle}"</strong> has been reviewed, verified, and officially green-lighted for publication.</p>
    
    <div class="cert-box">
      <div><strong>CERTIFICATE ID:</strong> ${certificateId}</div>
      <div><strong>HYMN:</strong> ${data.mezmurTitle}</div>
      <div><strong>MODE:</strong> ${data.tuneName}</div>
      <div><strong>CONTRIBUTOR:</strong> ${data.contributorName}</div>
      <div><strong>STATUS:</strong> Verified &amp; Published</div>
      <div><strong>DATE:</strong> ${dateStr}</div>
    </div>

    <p>Your name is now permanently attributed on this hymn's repertoire page with the official Contributor badge.</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${hymnUrl}" class="btn">View Your Mezmur in Catalogue</a>
    </div>

    <p>Thank you for contributing to the preservation and teaching of Ethiopia's sacred 10-string Begena heritage.</p>

    <div class="footer">
      Begenarxiv Archive · <a href="${getClientUrl()}" style="color:#71717a;">begenarxiv.org</a><br>
      Admin contact: ${ADMIN_EMAIL}
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendMail({
    to: data.contributorEmail,
    bcc: ADMIN_EMAIL,
    subject: `[Begenarxiv] Your Mezmur is Live! — Contributor Recognition Certificate`,
    text: textBody,
    html: htmlBody,
  });

  return { success: true, certificateId };
}

/**
 * 2. Contributor Rejection Notification Email
 */
export async function sendContributorRejectionEmail(
  data: ContributorRejectionData
): Promise<{ success: boolean }> {
  const reasonText = data.reason
    ? data.reason.trim()
    : 'The notation sequence, timing, or rhythm groupings could not be verified against the traditional Begena repertoire.';

  const contributeUrl = `${getClientUrl()}/contribute`;

  const textBody = `
Greetings ${data.contributorName},

Thank you for taking the time to transcribe and submit "${data.mezmurTitle}" to Begenarxiv.

Our curation team has reviewed your submission. Unfortunately, we are unable to publish it to the repertoire in its current format.

Curator Feedback:
${reasonText}

You are warmly encouraged to refine your transcription and resubmit. Remember:
- Active strings must be digits 1 through 5.
- Single digits play a standard pluck (e.g. 1 3 2 4).
- Fast two-string ornament rolls should be grouped together (e.g. 42 or 13).
- Hyphens represent beat rests (e.g. -), and "|" denotes phrase breathing pauses.
- Section repeats can be tagged with brackets, e.g. [1 3 2](x2).

You can review and submit an updated transcription anytime here:
${contributeUrl}

Thank you for your dedication to learning and sharing Begena hymns.

Warm regards,
The Begenarxiv Curation Team
${ADMIN_EMAIL}
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #fafafa; color: #18181b; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #27272a; color: #ffffff; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #000000; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px 0; }
    .feedback-box { background: #fafafa; border-left: 3px solid #000000; border-radius: 4px; padding: 14px 18px; margin: 18px 0; font-size: 13px; line-height: 1.6; color: #27272a; }
    .btn { display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px; margin: 12px 0; }
    .footer { font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; margin-top: 24px; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Submission Status Update</div>
    <h1>Update on "${data.mezmurTitle}"</h1>
    <p>Greetings <strong>${data.contributorName}</strong>,</p>
    <p>Thank you for your effort in transcribing and submitting <strong>"${data.mezmurTitle}"</strong> to the Begenarxiv archive.</p>
    <p>Our curation team has carefully reviewed your submission. We are unable to approve it for the catalogue at this time.</p>
    
    <div class="feedback-box">
      <strong>Curator Notes:</strong><br>
      ${reasonText}
    </div>

    <p>We welcome and encourage you to adjust the numbers notation or lyrics and submit an updated version. The community relies on careful, authentic transcriptions.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${contributeUrl}" class="btn">Revise &amp; Submit Again</a>
    </div>

    <div class="footer">
      Begenarxiv Archive · <a href="${getClientUrl()}" style="color:#71717a;">begenarxiv.org</a><br>
      Questions? Reach out to ${ADMIN_EMAIL}
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendMail({
    to: data.contributorEmail,
    bcc: ADMIN_EMAIL,
    subject: `[Begenarxiv] Update Regarding Your Mezmur Submission: "${data.mezmurTitle}"`,
    text: textBody,
    html: htmlBody,
  });

  return { success: true };
}

/**
 * 3. Mezmur Decode Request Received Email
 * Dispatches:
 * - Admin notification to nebiyoutahoa@gmail.com
 * - Confirmation receipt to Requester (if email provided)
 */
export async function sendDecodeRequestReceivedEmail(
  data: DecodeRequestEmailData
): Promise<{ success: boolean }> {
  const portalUrl = `${getClientUrl()}/portal`;

  // A) Notification to Admin
  const adminText = `
New Mezmur Decode Request on Begenarxiv!

Request ID: #${data.requestId}
Hymn Title: ${data.title}
Artist: ${data.artist || 'Not specified'}
Reference Link: ${data.youtubeUrl || 'None'}
Requester: ${data.requesterName || 'Anonymous'} (${data.requesterEmail || 'No email provided'})
Notes: ${data.notes || 'None'}

Review and decode this hymn in the Admin Portal:
${portalUrl}
  `.trim();

  const adminHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: monospace; padding: 20px; background: #fafafa;">
  <div style="max-width: 540px; margin: 0 auto; background: #fff; padding: 24px; border: 1px solid #e4e4e7; border-radius: 8px;">
    <h2 style="margin-top:0; font-size: 16px;">[Begenarxiv] New Decode Request #${data.requestId}</h2>
    <p><strong>Title:</strong> ${data.title}</p>
    <p><strong>Artist:</strong> ${data.artist || 'Traditional / Not specified'}</p>
    <p><strong>Reference URL:</strong> <a href="${data.youtubeUrl || '#'}">${data.youtubeUrl || 'None'}</a></p>
    <p><strong>Requester:</strong> ${data.requesterName || 'Anonymous'} (${data.requesterEmail || 'No email'})</p>
    <p><strong>Notes:</strong> ${data.notes || 'None'}</p>
    <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 20px 0;">
    <a href="${portalUrl}" style="display: inline-block; background: #000; color: #fff; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: bold;">Open Admin Portal</a>
  </div>
</body>
</html>
  `.trim();

  await sendMail({
    to: ADMIN_EMAIL,
    subject: `[Begenarxiv Admin] New Decode Request: "${data.title}"`,
    text: adminText,
    html: adminHtml,
  });

  // B) Confirmation Receipt to Requester (if requester provided an email)
  if (data.requesterEmail && data.requesterEmail.trim()) {
    const requesterText = `
Greetings ${data.requesterName || 'Learner'},

Thank you for your request to decode "${data.title}"${data.artist ? ` by ${data.artist}` : ''}.

We have received your submission (Request #${data.requestId}) and added it to our transcription queue. Our curation team will analyze the melody, transcribe the authentic numbers notation, and publish it to the repertoire.

You will receive an email as soon as the interactive mezmur page is ready.

You can browse the current repertoire anytime:
${getClientUrl()}/catalogue

Warm regards,
The Begenarxiv Team
${ADMIN_EMAIL}
    `.trim();

    const requesterHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #fafafa; color: #18181b; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #000000; color: #ffffff; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #000000; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px 0; }
    .info-box { background: #fafafa; border: 1px solid #d4d4d8; border-radius: 8px; padding: 16px; margin: 18px 0; font-family: monospace; font-size: 13px; line-height: 1.7; }
    .footer { font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; margin-top: 24px; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Decode Request Queued</div>
    <h1>We Received Your Request</h1>
    <p>Greetings <strong>${data.requesterName || 'Learner'}</strong>,</p>
    <p>Thank you for submitting a decode request for <strong>"${data.title}"</strong>${data.artist ? ` by <strong>${data.artist}</strong>` : ''}.</p>
    
    <div class="info-box">
      <div><strong>REQUEST ID:</strong> #${data.requestId}</div>
      <div><strong>HYMN TITLE:</strong> ${data.title}</div>
      <div><strong>STATUS:</strong> In Transcription Queue</div>
    </div>

    <p>Our curation team will decode the numbers notation and lyrics. Once published, you'll receive a direct link so you can practice string-by-string with the interactive player.</p>

    <div class="footer">
      Begenarxiv Archive · <a href="${getClientUrl()}" style="color:#71717a;">begenarxiv.org</a><br>
      Admin contact: ${ADMIN_EMAIL}
    </div>
  </div>
</body>
</html>
    `.trim();

    await sendMail({
      to: data.requesterEmail.trim(),
      subject: `[Begenarxiv] Decode Request Received: "${data.title}"`,
      text: requesterText,
      html: requesterHtml,
    });
  }

  return { success: true };
}

/**
 * 4. Mezmur Decode Request Completed Email
 */
export async function sendDecodeRequestCompletedEmail(
  data: DecodeCompletedData
): Promise<{ success: boolean }> {
  const hymnUrl = `${getClientUrl()}/mezmur/${data.mezmurId}`;

  const textBody = `
Greetings ${data.requesterName || 'Learner'},

Great news! The hymn you requested, "${data.title}", has been decoded and is now live in the Begenarxiv archive.

You can now view the full lyrics, study the verified numbers notation, and listen to each string plucking with the interactive Tap-to-Hear player:
${hymnUrl}

Thank you for helping us grow the Begena archive repertoire!

Warm regards,
The Begenarxiv Team
${ADMIN_EMAIL}
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #fafafa; color: #18181b; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #000000; color: #ffffff; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #000000; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px 0; }
    .btn { display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px; margin: 16px 0; }
    .footer { font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; margin-top: 24px; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Request Completed</div>
    <h1>"${data.title}" is Now Live!</h1>
    <p>Greetings <strong>${data.requesterName || 'Learner'}</strong>,</p>
    <p>Great news! The hymn you requested, <strong>"${data.title}"</strong>, has been decoded by our curation team and is now available in the public archive.</p>
    <p>You can listen to each string plucking, follow along with verified numbers notation, and practice at your own pace.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${hymnUrl}" class="btn">Play &amp; Learn "${data.title}"</a>
    </div>

    <div class="footer">
      Begenarxiv Archive · <a href="${getClientUrl()}" style="color:#71717a;">begenarxiv.org</a><br>
      Admin contact: ${ADMIN_EMAIL}
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendMail({
    to: data.requesterEmail,
    bcc: ADMIN_EMAIL,
    subject: `[Begenarxiv] Request Completed: "${data.title}" is now available!`,
    text: textBody,
    html: htmlBody,
  });

  return { success: true };
}
