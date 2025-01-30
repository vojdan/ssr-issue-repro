const config = {
	apiKey: 'AIzaSyCkn62ElgMih1-RC24FVeOodJf6K1sgsWA', // process.env.NEXT_PUBLIC_FIREBASE_API_KEY
	authDomain: 'ssr-issue-repro.firebaseapp.com', // process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
	projectId: 'ssr-issue-repro', // process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
	storageBucket: 'ssr-issue-repro.firebasestorage.app', // process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
	messagingSenderId: '433433520478', // process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
	appId: '1:433433520478:web:aaf7a9afc8049e18fb87cf', // process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// When deployed, there are quotes that need to be stripped
Object.keys(config).forEach(key => {
	const configValue = config[key as keyof typeof config] + '';
	if (configValue.charAt(0) === '"') {
		config[key as keyof typeof config] = configValue.substring(1, configValue.length - 1);
	}
});

export const firebaseConfig = config;
