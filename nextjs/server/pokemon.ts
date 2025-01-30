import 'server-only';

export async function getThingsOnTheServer() {
	// wait 2 sec to be more obvious that this is a server component
	// await new Promise(resolve => setTimeout(resolve, 2000));

	const res = await fetch('https://pokeapi.co/api/v2/pokemon/bulbasaur', {
		cache: 'default',
	});
	// const res = {
	// 	json: async () => ({
	// 		name: 'bulbasaur mock',
	// 	}),
	// };
	const bulbasaur = await res.json();

	return bulbasaur;
}
