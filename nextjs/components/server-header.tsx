'use server';

import { getAuthenticatedAppForUser } from '../lib/firebase/serverApp';

export default async function ServerHeader() {
	const { currentUser } = await getAuthenticatedAppForUser('SERVER HEADER');
	console.log('SERVER HEADER', currentUser?.uid);

	return <h2>SERVER HEADER: {currentUser?.uid || 'no SSR user'}</h2>;
}
