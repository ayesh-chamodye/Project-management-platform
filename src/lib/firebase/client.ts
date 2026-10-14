import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;

export async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { auth };
