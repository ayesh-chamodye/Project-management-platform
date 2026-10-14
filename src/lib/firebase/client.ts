import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;

// Redirect flow: no window.open, so popup blockers cannot interfere.
export async function signInWithGoogle() {
  await signInWithRedirect(firebaseAuth, googleProvider);
}

// Per the Firebase redirect best practices, resolve the result on page load so
// redirect failures are surfaced here instead of as unhandled rejections.
export async function checkRedirectResult() {
  try {
    await getRedirectResult(firebaseAuth);
  } catch (err) {
    console.error("Google redirect sign-in failed:", err);
  }
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { auth };
