# JamFlo App


JamFlo is a cross platform guitar practice routine management and sharing platform built to help musicians:
- structure goal-focused practice sessions
- track their progress
- stay motivated through gamification and interactive practice tools

## Features

- User registration and login
- Create and manage custom practice routines
- Track practice streaks, achievements, and statistics
- Explore and share community routines
- Built-in tools such as a countdown timer and metronome
- Optional profile image upload via a custom backend and Amazon S3

## Tech Stack

- React Native
- Expo
- Firebase Authentication
- Cloud Firestore
- Node.js / Express
- Amazon S3

## Recommended Setup

JamFlo is best run using Expo on a physical device with live Firebase services enabled. This is the recommended setup for the most accurate experience, particularly for timing-sensitive functionality such as the metronome.

## Project Structure

- `src/` – main mobile application source code
- `backend/` – optional Node.js backend for profile image uploads
- `assets/` – static assets including images and sounds
- `__tests__/` – Jest test files

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js v22
- npm
- Expo Go on a physical device, or an emulator if needed
- A configured Firebase project

## Frontend Setup

1. Navigate to the `jamflo-app` folder:

```bash
cd jamflo-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the **`jamflo-app` directory** and add the following variables:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_USE_EMULATORS=0
EXPO_PUBLIC_API_BASE_URL=
```
## Firebase Prerequisites

To run the application, you must configure a Firebase project with:

- Firebase Authentication enabled
- Cloud Firestore database created
- appropriate Firestore security rules
- required composite indexes for routine queries

The application connects to Firebase using the environment variables defined in the frontend `.env` file.

## Firestore Configuration

Firestore rules were designed to ensure that private user content remains restricted to its owner, while public community routines can still be viewed and interacted with appropriately by other authenticated users.

Some Firestore queries also require composite indexes, particularly for filtering and ordering routines. For example, indexes may be needed for:

- `routines` by `userId` and `updatedAt`
- `routines` by `isPrivate` and `updatedAt`

## Running the App
Start the Expo development server:
```bash
npx expo start -c   
```
Then open the app using Expo Go on a physical device for the best experience (emulators will have issues with metronome functionality).

- Users can create an account through the app's registration flow when running the application.

## Optional Backend Setup
The backend is only required for profile image upload functionality. The core application can still be used without it, but profile image uploads will not function and may produce a network error.

1. Navigate to the `backend` folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `jamflo-app/backend` directory and add the following variables:

```bash
PORT=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

4. Start the backend server:

```bash
npm run dev
```

## Testing

1. Navigate to the `jamflo-app` folder:

```bash
cd jamflo-app
```

2. Run tests with:
```bash
npm test
```

## Notes
- The recommended setup uses live Firebase services rather than Firebase emulators.
- A physical device is strongly recommended for timing-sensitive features such as the metronome.
- Firebase emulators were used during development in some restricted network environments, but they are not the preferred setup for normal use.
- If the backend is not configured, profile image upload will be unavailable, but the rest of the app will still function.