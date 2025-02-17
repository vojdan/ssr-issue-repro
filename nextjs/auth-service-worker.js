import { initializeApp } from 'firebase/app';
import { getAuth, getIdToken, onAuthStateChanged } from 'firebase/auth';

/** ----------------------------
 *  IndexedDB HELPER FUNCTIONS
 *  ----------------------------
 */
const DB_NAME = 'bronid-sw-db';
const DB_VERSION = 1;
const STORE_NAME = 'firebaseConfig';

function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = event => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = event => {
			resolve(event.target.result);
		};
		request.onerror = event => {
			reject(event.target.error);
		};
	});
}

async function storeFirebaseConfigInIDB(config) {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		store.put(config, 'publicFirebaseConfig'); // "publicFirebaseConfig" is the key
		tx.oncomplete = () => resolve();
		tx.onerror = event => reject(event.target.error);
	});
}

async function readFirebaseConfigFromIDB() {
	const db = await openDatabase();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const request = store.get('publicFirebaseConfig');
		request.onsuccess = () => resolve(request.result);
		request.onerror = event => reject(event.target.error);
	});
}

/**
 * We'll keep a global in-memory cache. If the service worker
 * gets reloaded, we'll read from IndexedDB again.
 */
let firebaseConfigCache = null;

async function ensureFirebaseConfig() {
	if (!firebaseConfigCache) {
		firebaseConfigCache = await readFirebaseConfigFromIDB();
	}
	if (!firebaseConfigCache) {
		throw new Error('No firebaseConfig found in IndexedDB');
	}
	return firebaseConfigCache;
}

/** ----------------------------
 *  SERVICE WORKER EVENTS
 *  ----------------------------
 */

// this is set during install
let firebaseConfig;

/** INSTALL
 *  - Parse config from query string
 *  - Store in IndexedDB
 */
self.addEventListener('install', event => {
	// extract firebase config from query string
	const serializedFirebaseConfig = new URL(location).searchParams.get('firebaseConfig');
	if (!serializedFirebaseConfig) {
		throw new Error('Firebase Config object not found in service worker query string.');
	}

	const config = JSON.parse(serializedFirebaseConfig);
	console.log('Service worker installing. Got firebaseConfig:', config);

	event.waitUntil(
		(async () => {
			await storeFirebaseConfigInIDB(config);
			console.log('Firebase config stored in IDB');
		})(),
	);
});

/** ACTIVATE
 *  - Typical approach: claim clients
 */
self.addEventListener('activate', event => {
	console.log('Service worker activated');
	event.waitUntil(clients.claim());
});

function getOriginFromUrl(url) {
	// https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
	const pathArray = url.split('/');
	const protocol = pathArray[0];
	const host = pathArray[2];
	return protocol + '//' + host;
}

// Get underlying body if available. Works for text and json bodies.
function getBodyContent(req) {
	if (req.method === 'GET') {
		return Promise.resolve(undefined);
	}

	return Promise.resolve()
		.then(() => {
			const contentType = req.headers.get('Content-Type') || '';

			if (contentType.includes('json')) {
				return req.json().then(json => JSON.stringify(json));
			}

			return req.text();
		})
		.catch(() => {
			// If we can't read the body, just return undefined
		});
}

/** ----------------------------
 *  GET FIREBASE ID TOKEN
 *  ----------------------------
 *  - We initialise an app with the given config,
 *    wait for onAuthStateChanged, and get the token if user is logged in
 */
function getIdTokenPromise(firebaseConfig) {
	return new Promise((resolve, reject) => {
		console.log('Initialising Firebase App with config:', firebaseConfig);
		const app = initializeApp(firebaseConfig);
		const auth = getAuth(app);

		const unsubscribe = onAuthStateChanged(auth, user => {
			unsubscribe();

			if (user) {
				getIdToken(user).then(
					idToken => {
						console.log('Got an ID token from user:', idToken);
						resolve(idToken);
					},
					() => {
						resolve(null);
					},
				);
			} else {
				console.log('No user is signed in.');
				resolve(null);
			}
		});
	});
}

function requestProcessor(evt, idToken) {
	let req = evt.request;

	let processRequestPromise = Promise.resolve();

	// For same-origin HTTPS requests, append idToken to headers
	const isSameOrigin = self.location.origin === getOriginFromUrl(req.url);
	const isHttpsOrLocalhost = self.location.protocol === 'https:' || self.location.hostname === 'localhost';

	if (isSameOrigin && isHttpsOrLocalhost && idToken) {
		const headers = new Headers();
		req.headers.forEach((val, key) => {
			headers.append(key, val);
		});
		headers.append('Authorization', 'Bearer ' + idToken);

		processRequestPromise = getBodyContent(req).then(body => {
			try {
				req = new Request(req.url, {
					method: req.method,
					headers,
					mode: 'same-origin', // req.mode,
					credentials: req.credentials,
					cache: req.cache,
					redirect: req.redirect,
					referrer: req.referrer,
					body,
					// bodyUsed: req.bodyUsed,
					// context: req.context
				});
			} catch (e) {
				// For CORS requests, this can fail. We keep going with original.
			}
		});
	}

	return processRequestPromise.then(() => {
		return fetch(req);
	});
}

/** FETCH
 *  - On every fetch, we ensure config is loaded,
 *    then attach the ID token if a user is signed in.
 */
self.addEventListener('fetch', event => {
	/** @type {FetchEvent} */
	const evt = event;

	// 1) Read & ensure config from IDB
	const responsePromise = (async () => {
		const firebaseConfig = await ensureFirebaseConfig();
		const idToken = await getIdTokenPromise(firebaseConfig);
		return requestProcessor(evt, idToken);
	})();

	// 2) Respond with the fetch or some fallback
	event.respondWith(responsePromise);
});
