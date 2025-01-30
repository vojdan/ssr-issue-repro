import {
	onAuthStateChanged as _onAuthStateChanged,
	signInAnonymously as _signInAnonymously,
	signOut as _signOut,
	signInWithEmailAndPassword as _signInWithEmailAndPassword,
	type User,
} from 'firebase/auth';
import { auth } from './clientApp';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
	'auth/admin-restricted-operation': 'This operation is restricted to administrators only.',
	'auth/argument-error': 'An invalid argument was provided. Please check your input.',
	'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication with the provided API key.',
	'auth/app-not-installed': 'The requested app is not installed on this device.',
	'auth/captcha-check-failed': 'The CAPTCHA verification failed. Please try again.',
	'auth/code-expired': 'The verification code has expired. Please request a new code.',
	'auth/cordova-not-ready': 'Cordova framework is not ready. Please ensure it is properly configured.',
	'auth/cors-unsupported': 'This browser does not support cross-origin requests.',
	'auth/credential-already-in-use': 'This credential is already associated with a different user account.',
	'auth/custom-token-mismatch': 'The custom token corresponds to a different audience.',
	'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',
	'auth/dependent-sdk-initialized-before-auth': 'Another Firebase SDK was initialized before Firebase Authentication.',
	'auth/dynamic-link-not-activated': 'Dynamic links are not activated for the current project.',
	'auth/email-change-needs-verification': 'Email change requires verification. Please check your new email for a verification link.',
	'auth/email-already-in-use': 'The email address is already in use by another account.',
	'auth/emulator-config-failed': 'Failed to configure the Firebase Emulator. Please check your configuration.',
	'auth/expired-action-code': 'The action code has expired. Please try again.',
	'auth/cancelled-popup-request': 'The popup request was cancelled. Please try again.',
	'auth/internal-error': 'An internal error occurred. Please try again later.',
	'auth/invalid-api-key': 'The provided API key is invalid. Please check your configuration.',
	'auth/invalid-app-credential': 'The app credential is invalid or has expired.',
	'auth/invalid-app-id': 'The provided app ID is invalid. Please check your configuration.',
	'auth/invalid-user-token': "The user's credential is no longer valid. The user must sign in again.",
	'auth/invalid-auth-event': 'An internal error occurred. Please try again.',
	'auth/invalid-cert-hash': 'The provided certificate hash is invalid.',
	'auth/invalid-verification-code': 'The verification code is invalid. Please check the code and try again.',
	'auth/invalid-continue-uri': 'The continue URL provided is invalid.',
	'auth/invalid-cordova-configuration': 'The Cordova configuration is invalid. Please check your setup.',
	'auth/invalid-custom-token': 'The custom token format is incorrect. Please check the documentation.',
	'auth/invalid-dynamic-link-domain': 'The provided dynamic link domain is not authorized.',
	'auth/invalid-email': 'The email address is not valid.',
	'auth/invalid-emulator-scheme': 'The emulator scheme provided is invalid.',
	'auth/invalid-credential': 'The authentication credential is invalid or has expired.',
	'auth/invalid-message-payload': 'The message payload is invalid. Please check your input.',
	'auth/invalid-multi-factor-session': 'The multi-factor session is invalid or has expired.',
	'auth/invalid-oauth-client-id': 'The OAuth client ID provided is invalid.',
	'auth/invalid-oauth-provider': 'The OAuth provider is invalid. Please check your configuration.',
	'auth/invalid-action-code': 'The action code is invalid. This can happen if the code is malformed or has already been used.',
	'auth/unauthorized-domain': 'The domain of the continue URL is not whitelisted. Please add it to the authorized domains list.',
	'auth/wrong-password': 'The password is invalid or the user does not have a password.',
	'auth/invalid-persistence-type': 'The specified persistence type is invalid. Please choose "local", "session", or "none".',
	'auth/invalid-phone-number': 'The phone number is not in a valid format.',
	'auth/invalid-provider-id': 'The provider ID is not supported.',
	'auth/invalid-recipient-email': 'The recipient email is invalid.',
	'auth/invalid-sender': 'The sender email is invalid or not configured.',
	'auth/invalid-verification-id': 'The verification ID is invalid.',
	'auth/invalid-tenant-id': 'The tenant ID is invalid.',
	'auth/multi-factor-info-not-found': 'The specified multi-factor information was not found.',
	'auth/multi-factor-auth-required': 'Multi-factor authentication is required for this operation.',
	'auth/missing-android-pkg-name': 'An Android package name must be provided if the Android app is required to be installed.',
	'auth/missing-app-credential': 'The phone verification request is missing an app credential.',
	'auth/auth-domain-config-required': 'The authentication domain configuration is required.',
	'auth/missing-verification-code': 'The phone verification code is missing.',
	'auth/missing-continue-uri': 'A continue URL must be provided in the request.',
	'auth/missing-iframe-start': 'An internal error occurred. Please try again.',
	'auth/missing-ios-bundle-id': 'An iOS bundle ID must be provided if an App Store ID is provided.',
	'auth/missing-or-invalid-nonce': 'The request does not contain a valid nonce.',
	'auth/missing-multi-factor-info': 'The multi-factor information is missing.',
	'auth/missing-multi-factor-session': 'The multi-factor session is missing.',
	'auth/missing-phone-number': 'The phone number is missing.',
	'auth/missing-verification-id': 'The verification ID is missing.',
	'auth/app-deleted': 'The Firebase app has been deleted.',
	'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
	'auth/network-request-failed': 'A network error occurred. Please try again.',
	'auth/null-user': 'No user is currently signed in.',
	'auth/no-auth-event': 'An internal error occurred. Please try again.',
	'auth/no-such-provider': 'The user does not have a linked account with the given provider.',
	'auth/operation-not-allowed': 'The requested authentication provider is disabled for this Firebase project.',
	'auth/operation-not-supported-in-this-environment': 'This operation is not supported in the current environment.',
	'auth/popup-blocked': 'The popup was blocked by the browser. Please allow popups and try again.',
	'auth/popup-closed-by-user': 'The popup was closed by the user before completing the sign-in.',
	'auth/provider-already-linked': 'The user is already linked to the given provider.',
	'auth/quota-exceeded': 'The quota for this operation has been exceeded. Please try again later.',
	'auth/redirect-cancelled-by-user': 'The redirect was cancelled by the user. Please try again.',
	'auth/redirect-operation-pending': 'A redirect operation is already pending. Please wait for it to complete.',
	'auth/rejected-credential': 'The credential has been rejected. Please try again.',
	'auth/second-factor-already-in-use': 'The second factor is already enrolled for this account.',
	'auth/maximum-second-factor-count-exceeded': 'You have reached the maximum number of second factors allowed.',
	'auth/tenant-id-mismatch': "The provided tenant ID does not match the authenticated user's tenant ID.",
	'auth/timeout': 'The operation timed out. Please try again.',
	'auth/user-token-expired': "The user's credential has expired. Please sign in again.",
	'auth/too-many-requests': 'Too many requests have been made from this device. Please try again later.',
	'auth/unauthorized-continue-uri': 'The domain of the continue URL is not authorized.',
	'auth/unsupported-first-factor': 'The first factor is not supported.',
	'auth/unsupported-persistence-type': 'The specified persistence type is not supported.',
	'auth/unsupported-tenant-operation': 'This operation is not supported for the given tenant.',
	'auth/unverified-email': 'The email address has not been verified. Please verify your email and try again.',
	'auth/user-cancelled': 'The user cancelled the operation.',
	'auth/user-not-found': 'No user record found for the provided identifier.',
	'auth/user-disabled': 'The user account has been disabled by an administrator.',
	'auth/user-mismatch': 'The credentials do not match the previously signed-in user.',
	'auth/user-signed-out': 'The user has signed out. Please sign in again.',
	'auth/weak-password': 'The password is too weak. Please choose a stronger password.',
	'auth/web-storage-unsupported': 'Web storage is not supported on this device or browser.',
	'auth/already-initialized': 'The Firebase app has already been initialized.',
	'auth/recaptcha-not-enabled': 'ReCAPTCHA verification is not enabled. Please enable ReCAPTCHA to proceed.',
	'auth/missing-recaptcha-token': 'The reCAPTCHA token is missing. Please complete the reCAPTCHA verification.',
	'auth/invalid-recaptcha-token': 'The reCAPTCHA token is invalid. Please try the verification again.',
	'auth/invalid-recaptcha-action': 'The reCAPTCHA action is invalid. Please check your configuration.',
	'auth/missing-client-type': 'The client type is missing. Please specify the client type.',
	'auth/missing-recaptcha-version': 'The reCAPTCHA version is missing. Please specify the version.',
	'auth/invalid-recaptcha-version': 'The provided reCAPTCHA version is invalid.',
	'auth/invalid-req-type': 'The request type is invalid. Please check your request and try again.',
};

export const getAuthErrorMessage = (errorCode: string) => AUTH_ERROR_MESSAGES[errorCode];

export function onAuthStateChanged(cb: (user: User | null) => void) {
	return _onAuthStateChanged(auth, cb);
}

export const signInAnonymously = async () => {
	return _signInAnonymously(auth);
};

export async function signOut() {
	try {
		return _signOut(auth);
	} catch (error) {
		console.error('Error signing out', error);
	}
}

export async function signInWithEmailAndPassword(email: string, password: string) {
	return _signInWithEmailAndPassword(auth, email, password).then(userCredential => {
		// The link was successfully sent. Inform the user.
		const user = userCredential.user;
		return user;
	});
}
