import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  Query,
} from 'firebase/firestore';
import { db } from './config';
import { Song } from '@types/index';

export const getSongById = async (songId: string): Promise<Song | null> => {
  try {
    const docRef = doc(db, 'songs', songId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Song) : null;
  } catch (error) {
    console.error('Error fetching song:', error);
    return null;
  }
};

export const getSongsByCategory = async (
  categoryId: string,
  pageSize: number = 20
): Promise<Song[]> => {
  try {
    const q = query(
      collection(db, 'songs'),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Song);
  } catch (error) {
    console.error('Error fetching songs by category:', error);
    return [];
  }
};

export const searchSongs = async (searchTerm: string): Promise<Song[]> => {
  try {
    const q = query(
      collection(db, 'songs'),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Song);
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};

export const getTrendingSongs = async (pageSize: number = 20): Promise<Song[]> => {
  try {
    const q = query(
      collection(db, 'songs'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Song);
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return [];
  }
};

export const getAllCategories = async () => {
  try {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
