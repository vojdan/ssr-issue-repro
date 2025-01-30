'use server';

import { Suspense } from 'react';
import { getThingsOnTheServer } from '../server/pokemon';

async function ServerData() {
	console.log('SERVER RUNNING API CALL...');
	const bulbasaur = await getThingsOnTheServer();
	console.log('SERVER RESULT:', bulbasaur.name, bulbasaur.abilities?.length);

	return <h3>SERVER API: {bulbasaur.name}</h3>;
}

export default async function ServerHome() {
	return (
		<main>
			<Suspense fallback={'Loading SERVER API cache...'}>
				<ServerData />
			</Suspense>
		</main>
	);
}
