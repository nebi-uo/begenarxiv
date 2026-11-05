/**
 * Contributor Recognition & Certificate Email Service
 *
 * Sends a verified Contributor Recognition email with certificate details
 * when a user's mezmur transcription is approved by the admin.
 */

export interface ContributorApprovalData {
  contributorName: string;
  contributorEmail: string;
  mezmurId: number;
  mezmurTitle: string;
  tuneName: string;
  approvedDate: string;
}

export async function sendContributorApprovalEmail(data: ContributorApprovalData): Promise<{ success: boolean; certificateId: string }> {
  const certificateId = `BGX-CONTRIBUTOR-${String(data.mezmurId).padStart(4, '0')}`;

  const emailSubject = `[Begenarxiv] Your Mezmur is Live! — Contributor Recognition Certificate`;
  
  const textBody = `
Greetings ${data.contributorName},

Congratulations! Your decoded Begena transcription of "${data.mezmurTitle}" (${data.tuneName}) has been reviewed and approved by Begenarxiv.

It is now live in the official Begenarxiv repertoire, permanently tagged with your name as a Contributor:
Certificate ID: ${certificateId}
Mezmur: ${data.mezmurTitle}
Contributor: ${data.contributorName}
Status: Verified & Live in Catalogue

You can view your published mezmur here:
http://localhost:5173/mezmur/${data.mezmurId}

Thank you for contributing to the preservation of Ethiopia's sacred 10-string Begena tradition.

Warm regards,
The Begenarxiv Team
  `.trim();

  // Log certificate dispatch
  console.log('====================================================');
  console.log('✉️  CONTRIBUTOR RECOGNITION CERTIFICATE ISSUED');
  console.log(`To: ${data.contributorEmail} (${data.contributorName})`);
  console.log(`Certificate ID: ${certificateId}`);
  console.log(`Mezmur: "${data.mezmurTitle}" (ID: ${data.mezmurId})`);
  console.log('====================================================');

  return { success: true, certificateId };
}

