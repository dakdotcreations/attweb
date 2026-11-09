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

const escapeHtml = (value: string) =>
	value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function sendInviteEmail(to: string, name: string, loginUrl: string, invitedBy: string) {
	const greeting = name ? `Hi ${name},` : 'Hi,';
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		subject: 'You have been added to the Altura dashboard',
		text: [
			greeting,
			'',
			`${invitedBy} has given you access to the Altura Tours & Travel dashboard.`,
			`Sign in at ${loginUrl} with this email address. We'll email you a one-time code; there is no password.`
		].join('\n'),
		html: `
			<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px">
				<p>${escapeHtml(greeting)}</p>
				<p>${escapeHtml(invitedBy)} has given you access to the Altura Tours &amp; Travel dashboard.</p>
				<p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#111827;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Sign in</a></p>
				<p style="color:#6b7280;font-size:14px">Use this email address. We'll send you a one-time code; there is no password.</p>
			</div>`
	});
}

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
