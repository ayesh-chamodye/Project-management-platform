import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;

export async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}

export function googleSignInErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;

  if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
    return "Your ad blocker or popup blocker stopped the Google sign-in window. Turn it off for this site, then try again.";
  }

  return (err as { message?: string })?.message?.replace("Firebase: ", "") || "Google sign-in failed. Please try again.";
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { auth };
