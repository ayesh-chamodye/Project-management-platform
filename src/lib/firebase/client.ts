import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;
const firebaseDb = db!;

export async function signInWithGoogle() {
  await signInWithRedirect(firebaseAuth, googleProvider);
}

export async function completeRedirectSignIn() {
  return new Promise<void>((resolve) => {
    let resolved = false;
    let timeout: ReturnType<typeof setTimeout>;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (resolved) return;

      if (user) {
        resolved = true;
        clearTimeout(timeout);
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
            console.error("Failed to create session:", await res.text());
          }
        } catch (err) {
          console.error("Error completing redirect sign-in:", err);
        } finally {
          unsubscribe();
          resolve();
        }
      }
    });

    timeout = setTimeout(() => {
      resolved = true;
      unsubscribe();
      resolve();
    }, 5000);
  });
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { auth, db };
