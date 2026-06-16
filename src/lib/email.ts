import { Resend } from "resend";

const FROM = "onboarding@resend.dev";

export async function sendVerificationEmail(email: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your DevClustr email",
    html: `
      <p>Thanks for signing up for DevClustr!</p>
      <p>Click the link below to verify your email address. The link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
  });
}
