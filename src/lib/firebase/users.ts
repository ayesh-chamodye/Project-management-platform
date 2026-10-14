import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { db } from "./config";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  lastLoginAt?: Timestamp | null;
}

const firestore = db!;

function userRef(uid: string) {
  return doc(firestore, "users", uid);
}

export async function createUserProfile(user: FirebaseUser, extra: Record<string, unknown> = {}) {
  await setDoc(userRef(user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    ...extra,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

export async function ensureUserProfile(user: FirebaseUser) {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await setDoc(
      ref,
      {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  await createUserProfile(user);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(userRef(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
