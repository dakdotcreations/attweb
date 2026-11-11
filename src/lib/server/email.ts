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

type InquiryEmailData = {
	number: number;
	name: string;
	email: string | null;
	phone: string | null;
	country: string | null;
	interest: string | null;
	travelDate: Date | null;
	groupSize: number | null;
	preferredContact: string | null;
	message: string;
};

const row = (label: string, value: string | number | null | undefined) =>
	value == null || value === ''
		? ''
		: `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(String(value))}</td></tr>`;

/** Tells the team about a new website inquiry. Reply-To is the customer, so replying just works. */
export async function sendInquiryNotification(to: string, inquiry: InquiryEmailData, dashboardUrl: string) {
	const travel = inquiry.travelDate ? inquiry.travelDate.toISOString().slice(0, 10) : null;
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		replyTo: inquiry.email ?? undefined,
		subject: `New inquiry #${inquiry.number}: ${inquiry.name}${inquiry.interest ? ` – ${inquiry.interest}` : ''}`,
		text: [
			`New website inquiry #${inquiry.number}`,
			'',
			`Name: ${inquiry.name}`,
			inquiry.email && `Email: ${inquiry.email}`,
			inquiry.phone && `Phone/WhatsApp: ${inquiry.phone}`,
			inquiry.country && `Country: ${inquiry.country}`,
			inquiry.interest && `Interested in: ${inquiry.interest}`,
			travel && `Travel date: ${travel}`,
			inquiry.groupSize && `Group size: ${inquiry.groupSize}`,
			inquiry.preferredContact && `Prefers: ${inquiry.preferredContact}`,
			'',
			inquiry.message,
			'',
			`Open in dashboard: ${dashboardUrl}`
		]
			.filter((line): line is string => typeof line === 'string')
			.join('\n'),
		html: `
			<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111827">
				<h2 style="margin:0 0 16px;color:#0b4d2c">New inquiry #${inquiry.number}</h2>
				<table style="font-size:14px;border-collapse:collapse">
					${row('Name', inquiry.name)}${row('Email', inquiry.email)}${row('Phone / WhatsApp', inquiry.phone)}
					${row('Country', inquiry.country)}${row('Interested in', inquiry.interest)}${row('Travel date', travel)}
					${row('Group size', inquiry.groupSize)}${row('Prefers', inquiry.preferredContact)}
				</table>
				<p style="white-space:pre-line;background:#f9fafb;border-radius:8px;padding:12px;font-size:14px">${escapeHtml(inquiry.message)}</p>
				<p><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#0b4d2c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open in dashboard</a></p>
			</div>`
	});
}

/** Confirmation to the customer (only when they gave an email). */
export async function sendInquiryConfirmation(
	to: string,
	data: { name: string; number: number; interest: string | null; companyName: string; whatsappUrl: string | null }
) {
	const first = data.name.split(' ')[0] || data.name;
	const about = data.interest ? ` about ${data.interest}` : '';
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		subject: `We've received your inquiry (#${data.number})`,
		text: [
			`Hi ${first},`,
			'',
			`Thank you for contacting ${data.companyName}${about}. Your reference is #${data.number}.`,
			'A member of our team will get back to you with options and prices.',
			data.whatsappUrl ? `Need us sooner? Chat with us on WhatsApp: ${data.whatsappUrl}` : '',
			'',
			'Your journey, our passion.',
			data.companyName
		].join('\n'),
		html: `
			<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;color:#111827">
				<p>Hi ${escapeHtml(first)},</p>
				<p>Thank you for contacting ${escapeHtml(data.companyName)}${escapeHtml(about)}. Your reference is <strong>#${data.number}</strong>.</p>
				<p>A member of our team will get back to you with options and prices.</p>
				${data.whatsappUrl ? `<p><a href="${escapeHtml(data.whatsappUrl)}" style="display:inline-block;background:#22c55e;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Chat with us on WhatsApp</a></p>` : ''}
				<p style="color:#0b4d2c;font-style:italic">Your journey, our passion.</p>
				<p style="color:#6b7280;font-size:13px">${escapeHtml(data.companyName)}</p>
			</div>`
	});
}

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
