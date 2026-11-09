import {
	SMTP_FROM,
	SMTP_HOST,
	SMTP_PASS,
	SMTP_PORT,
	SMTP_SECURE,
	SMTP_USER
} from '$app/env/private';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: SMTP_SECURE,
	auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export async function sendLoginOtp(to: string, otp: string, expiresInMinutes: number) {
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		subject: `${otp} is your Altura sign-in code`,
		text: [
			`Your Altura dashboard sign-in code is: ${otp}`,
			'',
			`It expires in ${expiresInMinutes} minutes.`,
			"If you didn't request this, you can ignore this email."
		].join('\n'),
		html: `
			<div style="font-family:system-ui,sans-serif;max-width:420px;margin:auto;padding:24px">
				<p>Your Altura dashboard sign-in code is:</p>
				<p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>
				<p style="color:#6b7280;font-size:14px">It expires in ${expiresInMinutes} minutes.
				If you didn't request this, you can ignore this email.</p>
			</div>`
	});
}
