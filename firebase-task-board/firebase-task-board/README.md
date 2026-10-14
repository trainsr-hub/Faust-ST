# Firebase Task Board

A tiny Firebase playground using:

- Firebase Authentication (email/password)
- Cloud Firestore
- Vite + JavaScript
- Firestore Security Rules

## 1. Create the project

Create a Firebase project in the Firebase Console, then register a Web App.

Copy the web app config into `.env`.

## 2. Enable Authentication

Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

## 3. Create Firestore

Firebase Console → Firestore Database → Create database.

Start with a test/development environment, then use the included `firestore.rules`.

## 4. Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

## 5. What this project teaches

Authentication:
- create account
- log in
- log out
- react to auth state changes

Firestore:
- create documents
- query documents by `uid`
- listen for realtime changes
- update documents
- delete documents

Data shape:

tasks/{taskId}
  uid: string
  title: string
  completed: boolean
  createdAt: timestamp
