'use client';

import { useEffect } from 'react';

export default function ClientPage() {
	useEffect(() => {
		console.log('CLIENT PAGE RENDER!');
	}, []);

	return <h3>CLIENT PAGE</h3>;
}
