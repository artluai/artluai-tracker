# artluai — built with ai tracker

Track everything you build with AI. Terminal-style project tracker with Firebase backend.

## Setup

1. Clone this repo
2. `npm install`
3. `npm run dev` to run locally
4. Push to GitHub → connect to Netlify for deploy

## Routes

- `/` — public homepage (anyone can see)
- `/admin` — dashboard (sign in with Google, admin only)

## Stack

- React + Vite
- Firebase (Firestore + Auth + Analytics)
- Netlify (hosting)

## Firestore Security Rules

Go to Firebase Console → Firestore → Rules, and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      // Anyone can read public projects
      allow read: if resource.data.visibility == "public";
      // Admin can read/write everything
      allow read, write: if request.auth != null
        && request.auth.token.email == "bitbrandsagency@gmail.com";
    }
  }
}
```

## Firestore Index

You need a composite index for the public projects query.
Go to Firebase Console → Firestore → Indexes → Add Index:
- Collection: `projects`
- Fields: `visibility` (Ascending), `createdAt` (Descending)
- Query scope: Collection

Or just visit your site and check the browser console — Firebase will give you a direct link to create the needed index.