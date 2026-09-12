import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '@types/index';

export const registerUser = async (
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase profile
    await updateProfile(firebaseUser, {
      displayName,
      photoURL: null,
    });

    // Create Firestore user document
    const userData: User = {
      uid: firebaseUser.uid,
      email,
      username: username.toLowerCase(),
      displayName,
      bio: '',
      profilePhoto: null,
      followers: 0,
      following: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isVerified: false,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
  } catch (error) {
    throw error;
  }
};
