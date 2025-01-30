'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from '../lib/firebase/auth';
import { User } from 'firebase/auth';

export default function ClientHeader() {
	const [user, setUser] = useState<User | null>(null);

	console.log('CLIENT HEADER');

	useEffect(() => {
		const unsubscribe = onAuthStateChanged((authUser: User | null) => {
			console.log('ON AUTH STATE CHANGED:', authUser?.uid);

			setUser(authUser);
		});

		return () => unsubscribe();
	}, []);

	return (
		<div>
			<h2>CLIENT HEADER: {user?.uid}</h2>
			<button onClick={() => signOut()}>Sign out</button>
			<button onClick={() => signInAnonymously()}>Sign in anon</button>
			<button onClick={() => signInWithEmailAndPassword('test@test.com', 'test123')}>Sign in</button>
		</div>
	);
}
