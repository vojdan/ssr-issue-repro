'use client';

import { useEffect } from 'react';
import { firebaseConfig } from '../lib/firebase/config';

export default function RegisterSW() {
	useEffect(() => {
		console.log('registering SW... from Vojdans component');

		if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
			const serializedFirebaseConfig = encodeURIComponent(JSON.stringify(firebaseConfig));
			const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`;

			navigator.serviceWorker
				.register(serviceWorkerUrl)
				.then(registration => console.log('Service Worker registration successful with scope: ', registration.scope))
				.catch(err => console.log('Service Worker registration failed: ', err));
		}
	}, []);

	return null;
}
