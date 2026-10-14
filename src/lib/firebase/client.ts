import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult, User } from "firebase/auth";
import { auth } from "./config";

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
