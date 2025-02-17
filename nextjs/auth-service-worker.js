import { initializeApp } from 'firebase/app';
import { getAuth, getIdToken, onAuthStateChanged } from 'firebase/auth';

// this is set during install
let firebaseConfig;

self.addEventListener('install', event => {
	// extract firebase config from query string
	const serializedFirebaseConfig = new URL(location).searchParams.get('firebaseConfig');

	if (!serializedFirebaseConfig) {
		throw new Error('Firebase Config object not found in service worker query string.');
	}

	firebaseConfig = JSON.parse(serializedFirebaseConfig);
	console.log('Service worker installed for', firebaseConfig);
});

self.addEventListener('activate', event => {
	console.log('Service worker activated');
	event.waitUntil(clients.claim());
});

const getOriginFromUrl = url => {
	// https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
	const pathArray = url.split('/');
	const protocol = pathArray[0];
	const host = pathArray[2];
	return protocol + '//' + host;
};

// Get underlying body if available. Works for text and json bodies.
const getBodyContent = req => {
	return Promise.resolve()
		.then(() => {
			if (req.method !== 'GET') {
				if (req.headers.get('Content-Type').indexOf('json') !== -1) {
					return req.json().then(json => {
						return JSON.stringify(json);
					});
				} else {
					return req.text();
				}
			}
		})
		.catch(error => {
			// Ignore error.
		});
};

const getIdTokenPromise = () => {
	return new Promise((resolve, reject) => {
		console.log('2. initializing app with', firebaseConfig);
		const app = initializeApp(firebaseConfig);
		console.log('3. initialized app', app);
		const auth = getAuth(app);
		console.log('4. initialized auth', auth);

		const unsubscribe = onAuthStateChanged(auth, user => {
			console.log('5. Auth state changed.');
			unsubscribe();

			if (user) {
				console.log('6. user detected:', user);
				getIdToken(user).then(
					idToken => {
						console.log("7. this is the token we'll send to the server:", idToken);
						resolve(idToken);
					},
					error => {
						resolve(null);
					},
				);
			} else {
				console.log('XXX. NO USER DETECTED!!!');
				resolve(null);
			}
		});
	});
};

self.addEventListener('fetch', event => {
	/** @type {FetchEvent} */
	const evt = event;

	console.log('1. fetch event');

	const requestProcessor = idToken => {
		console.log('8.1. request processor', idToken);
		let req = evt.request;
		let processRequestPromise = Promise.resolve();
		// For same origin https requests, append idToken to header.
		if (
			self.location.origin == getOriginFromUrl(evt.request.url) &&
			(self.location.protocol == 'https:' || self.location.hostname == 'localhost') &&
			idToken
		) {
			// Clone headers as request headers are immutable.
			const headers = new Headers();
			req.headers.forEach((val, key) => {
				headers.append(key, val);
			});

			console.log('9. adding id token to header', idToken);
			// Add ID token to header.
			headers.append('Authorization', 'Bearer ' + idToken);

			processRequestPromise = getBodyContent(req).then(body => {
				try {
					req = new Request(req.url, {
						method: req.method,
						headers,
						mode: 'same-origin',
						credentials: req.credentials,
						cache: req.cache,
						redirect: req.redirect,
						referrer: req.referrer,
						body,
						// bodyUsed: req.bodyUsed,
						// context: req.context
					});
				} catch (e) {
					// This will fail for CORS requests. We just continue with the
					// fetch caching logic below and do not pass the ID token.
				}
			});
		}

		return processRequestPromise.then(() => {
			console.log('10. processing request', req);
			return fetch(req);
		});
	};
	// Fetch the resource after checking for the ID token.
	// This can also be integrated with existing logic to serve cached files
	// in offline mode.
	evt.respondWith(
		getIdTokenPromise().then(
			successParam => {
				console.log('8.0. YAAAAAY!!!', successParam);
				return requestProcessor(successParam);
			},
			errorParam => {
				console.error('8.0 XXXX DED. error param', errorParam);
				return requestProcessor(errorParam);
			},
		),
	);
});
