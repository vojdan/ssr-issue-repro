# ssr-issue-repro

## Issues

### Website Firebase API key restriction breaks SSR Auth

#### Works

Using a default project setup fetches user info on the server using the `auth-service-worker` (to send the idToken to the server) and `initializeServerApp` (to get the user info).

#### Screenshots

#### Working without API key restriction:

#### Vercel working:

<img src="https://github.com/vojdan/ssr-issue-repro/blob/main/vercel-success-before.png" width="400">

#### Firebase App Hosting working:

<img src="https://github.com/vojdan/ssr-issue-repro/blob/main/app-hosting-success-before.png" width="400">

#### Adding the API key restriction:

#### GCP Firebase API key Website restrictions:

<img src="https://github.com/vojdan/ssr-issue-repro/blob/main/firebase-api-key-restrictions.png" width="400">

#### Firebase Auth Authorized domains:

<img src="https://github.com/vojdan/ssr-issue-repro/blob/main/firebase-auth-allowed-domains.png" width="400">

#### Does not work

Adding the API key restriction to the project breaks the SSR Auth with the error: `auth/requests-from-referer-<empty>-are-blocked`, even though the referer is allowed in the API key restrictions (`referer https://ssr-issue-repro.vercel.app/auth-service-worker.js`) and the idToken is received on the server.

Error logs:

```
FirebaseServerApp could not login user with provided authIdToken:  Error [FirebaseError]: Firebase: Error (auth/requests-from-referer-<empty>-are-blocked.).
    at m (.next/server/chunks/977.js:16:141895)
    at f (.next/server/chunks/977.js:16:141425)
    at T (.next/server/chunks/977.js:16:147152)
    at async eu.initializeCurrentUserFromIdToken (.next/server/chunks/977.js:16:168130)
    at async (.next/server/chunks/977.js:16:167600) {
  code: 'auth/requests-from-referer-<empty>-are-blocked.',
  customData: {}
}
```

#### Not working with API key restriction:

#### Vercel fail (even after page reload):

<img src="https://github.com/vojdan/ssr-issue-repro/blob/main/vercel-fail-after.png" width="400">

#### Firebase App Hosting fail (even after page reload):

<img src="https://github.com/vojdan/ssr-issue-repro/blob/main/firebase-app-hosting-fail-after.png" width="400">

## Steps to reproduce

Note: The service worker does not automatically update/reload the SSR data. A page reload is needed to get the Authorization header in the request (needed for SSR Auth).

1. Visit one of the hosted URLs (Vercel or Firebase App Hosting)
2. When the page load it will register a service worker
3. Click the "Sign in" button. This will sign in a demo user with a username and password and update the "Client Header", but not the "Server Header" and the "Layout". Alternatively, "Sign in Anon" will sign in an anonymous user and update the "Client Header", but not the "Server Header" and the "Layout".
4. Verify SSR works as expected by reloading the page (CMD + R) so the Service Worker can include the Authorization header in the request (needed for SSR Auth).
5. Add the correct Website API key restriction to the project (the domain where the app is hosted) from the GCP console.
6. Wait some time (up to 5 minutes) for GCP to propagate the restrictions.
7. Success (no API key restriction) vs fail (with API key restriction)
    - SUCCESS: The "Server Header", "Layout" and "Client Header" will have the UID. The "Server Header" and "Layout" will render with the UID already set, but the "Client Header" will update after Firebase establishes a client connection.
    - FAIL: Only the "Client Header" will have the UID. The backend logs an error `auth/requests-from-referer-<empty>-are-blocked`.
8. Removing the API key Website restriction fixes the issue without code changes. (Note: might need to reinstall the Service Worker or open an incognito window. "Chrome > Application > Service Workers > Update on reload" seems to work as well.)

## Rebuild the Service Worker

If you make any changes to the Service Worker, you need to run `npm run build-service-worker` to rebuild the service worker. This will create a new `auth-service-worker.js` file in the `public` directory.

## Trying in your own project

1. Create a Firebase project
2. Update the `.firebaserc` file with the new project ID
3. Update the `firebaseConfig` in `nextjs/lib/firebase/config.ts` with the Firebase API keys
4. Enable Firebase Auth and App Hosting
5. Deploy to Vercel or Firebase App Hosting
6. Test the SSR Auth works as expected
7. Add the correct API key restriction to the project (the domain where the app is hosted)
8. Test the SSR Auth fails
9. Remove the API key restriction and test the SSR Auth works again (Note: might need to reinstall the Service Worker or open an incognito window. "Chrome > Application > Service Workers > Update on reload" seems to work as well.)

## Deploying

### Vercel

The project is automatically deployed to Vercel through Github integration.

Vercel URL: https://ssr-issue-repro.vercel.app/

### Firebase App Hosting

The project is automatically deployed to Firebase through Github integration.

Firebase App Hosting URL: https://demo--ssr-issue-repro.us-central1.hosted.app/

## Running locally

```
npm run dev
```
