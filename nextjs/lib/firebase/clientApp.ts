'use client';

import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

console.log('1. initializing firebaseApp with:', firebaseConfig);
const apps = getApps();
console.log('2.1. apps.length:', apps.length);
console.log('2.2. apps:', apps);

export const firebaseApp = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
console.log('3. firebaseApp:', firebaseApp);
const auth = getAuth(firebaseApp);

const isBrowser = () => typeof window !== 'undefined';
const shouldConnectEmulator = process.env.NEXT_PUBLIC_EMULATOR === 'true' && isBrowser();

// ! NOTE: THIS CAN SOMETIMES BE IMPORTED IN SERVER COMPONENTS IF THE IMPORTS BELOW ARE USED
if (shouldConnectEmulator) {
	connectAuthEmulator(auth, 'http://127.0.0.1:9099');
	console.log('emulators connected.');
}

export { auth };
