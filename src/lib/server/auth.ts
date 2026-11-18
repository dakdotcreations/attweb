import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$app/env/private';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './db';
import { sendLoginOtp } from './email';

const OTP_EXPIRES_IN_SECONDS = 10 * 60;

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	database: prismaAdapter(db, { provider: 'postgresql' }),
	// Email OTP is the only login method: no passwords, no social providers.
	emailAndPassword: { enabled: false },
	user: {
		additionalFields: {
			role: {
				type: ['ADMIN', 'EDITOR'],
				required: true,
				defaultValue: 'EDITOR',
				// never settable from client input; only ADMINs change it server-side
				input: false
			}
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // refresh expiry at most once a day
	},
	plugins: [
		emailOTP({
			// Only pre-created users can sign in. For unknown emails better-auth
			// returns success without sending anything (no account enumeration).
			disableSignUp: true,
			otpLength: 6,
			expiresIn: OTP_EXPIRES_IN_SECONDS,
			allowedAttempts: 5,
			storeOTP: 'hashed',
			async sendVerificationOTP({ email, otp, type }) {
				if (type !== 'sign-in') return;
				await sendLoginOtp(email, otp, OTP_EXPIRES_IN_SECONDS / 60);
			}
		}),
		// must be last: lets auth.api calls in form actions set session cookies
		sveltekitCookies(getRequestEvent)
	]
});

export type Session = typeof auth.$Infer.Session;
