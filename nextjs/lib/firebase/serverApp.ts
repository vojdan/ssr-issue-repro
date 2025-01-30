// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import 'server-only';
import { initializeServerApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { headers } from 'next/headers';
import { firebaseConfig } from './config';

export async function getAuthenticatedAppForUser(source: string) {
	const authIdToken = (await headers()).get('Authorization')?.split('Bearer ')[1];
	console.log(`getAuthenticatedAppForUser (${source}): authIdToken`, authIdToken);

	// print referer headers (this seems to be the correct one and not the "referrer" spelling)
	const referer = (await headers()).get('referer');
	console.log(`getAuthenticatedAppForUser (${source}): referer`, referer);

	console.log(`getAuthenticatedAppForUser INITIALIZING SERVER APP with`, firebaseConfig, authIdToken ? { authIdToken } : {});
	const firebaseServerApp = initializeServerApp(firebaseConfig, authIdToken ? { authIdToken } : {});

	const serverAuth = getAuth(firebaseServerApp);

	await serverAuth.authStateReady();
	console.log('IS READY!');
	if (serverAuth.currentUser === null) {
		console.log('NO USER DETECTED ON THE SERVER!!!');
		// authIdToken was missing or invalid.
		// return redirect("/unauthorized");
	}

	console.log(`getAuthenticatedAppForUser (${source}): auth`, serverAuth.currentUser?.uid);

	return { firebaseServerApp, currentUser: serverAuth.currentUser };
}
