'use client';

import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(firebaseApp);

const isBrowser = () => typeof window !== 'undefined';
const shouldConnectEmulator = process.env.NEXT_PUBLIC_EMULATOR === 'true' && isBrowser();

// ! NOTE: THIS CAN SOMETIMES BE IMPORTED IN SERVER COMPONENTS IF THE IMPORTS BELOW ARE USED
if (shouldConnectEmulator) {
	connectAuthEmulator(auth, 'http://127.0.0.1:9099');
	console.log('emulators connected.');
}

export { auth };
