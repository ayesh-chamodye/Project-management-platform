import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult, User } from "firebase/auth";
import { auth } from "./config";
import { ensureUserProfile } from "./users";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;

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
    await ensureUserProfile(user);

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

export { auth };
