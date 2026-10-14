import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;
const firebaseDb = db!;

export async function signInWithGoogle() {
  console.log("Starting Google redirect sign-in...");
  await signInWithRedirect(firebaseAuth, googleProvider);
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

// Keeps the server session cookie in sync so existing API routes
// (which verify the cookie) keep working after a plain Firebase sign-in.
export async function syncServerSession(user: User) {
  try {
    const userRef = doc(firebaseDb, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      console.error("Server session sync failed:", res.status);
    }
  } catch (err) {
    console.error("Failed to sync server session:", err);
  }
}

// getRedirectResult is the only API that surfaces redirect failures; calling it
// here prevents an unhandled promise rejection on the page the user returns to.
export async function drainRedirectError() {
  try {
    await getRedirectResult(firebaseAuth);
  } catch (err) {
    console.error("Redirect sign-in failed:", err);
  }
}

export { auth, db };
