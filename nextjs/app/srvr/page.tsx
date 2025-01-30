'use server';

import { Suspense } from 'react';

async function ServerComponent() {
	console.log('SERVER START');

	// wait 2 sec to be more obvious that this is a server component
	await new Promise(resolve => setTimeout(resolve, 2000));

	console.log('SERVER END');

	return <h3>SERVER PAGE</h3>;
}

export default async function ServerPage() {
	return (
		<div>
			<Suspense fallback={<p>Loading RSC...</p>}>
				<ServerComponent />
			</Suspense>
		</div>
	);
}
