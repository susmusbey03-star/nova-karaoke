import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db, storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { KaraokRecord } from '@types/index';
import { v4 as uuidv4 } from 'uuid';

export const createRecord = async (
  userId: string,
  songId: string,
  audioBlob: Blob,
  duration: number,
  caption: string,
  description: string,
  hashtags: string[],
  effectType: string,
  songData: any
): Promise<KaraokRecord> => {
  try {
    const recordId = uuidv4();
    const audioFileName = `records/${userId}/${recordId}.mp3`;
    const audioRef = ref(storage, audioFileName);

    // Upload audio file
    await uploadBytes(audioRef, audioBlob);
    const audioUrl = await getDownloadURL(audioRef);

    // Create record document
    const record: KaraokRecord = {
      id: recordId,
      userId,
      songId,
      song: songData,
      user: {} as any, // Will be populated on retrieval
      audioUrl,
      duration,
      description,
      caption,
      hashtags: hashtags.filter((tag) => tag.trim()),
      effectType: effectType as any,
      likes: 0,
      comments: 0,
      shares: 0,
      likedBy: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'records', recordId), record);
    return record;
  } catch (error) {
    console.error('Error creating record:', error);
    throw error;
  }
};

export const getRecordById = async (recordId: string): Promise<KaraokRecord | null> => {
  try {
    const docRef = doc(db, 'records', recordId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as KaraokRecord) : null;
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
};

export const getUserRecords = async (userId: string, pageSize: number = 20): Promise<KaraokRecord[]> => {
  try {
    const q = query(
      collection(db, 'records'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as KaraokRecord);
  } catch (error) {
    console.error('Error fetching user records:', error);
    return [];
  }
};

export const getFeedRecords = async (pageSize: number = 20): Promise<KaraokRecord[]> => {
  try {
    const q = query(
      collection(db, 'records'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as KaraokRecord);
  } catch (error) {
    console.error('Error fetching feed records:', error);
    return [];
  }
};

export const likeRecord = async (recordId: string, userId: string): Promise<void> => {
  try {
    const recordRef = doc(db, 'records', recordId);
    const record = await getRecordById(recordId);

    if (record && !record.likedBy.includes(userId)) {
      await updateDoc(recordRef, {
        likes: (record.likes || 0) + 1,
        likedBy: [...record.likedBy, userId],
      });
    }
  } catch (error) {
    console.error('Error liking record:', error);
    throw error;
  }
};

export const unlikeRecord = async (recordId: string, userId: string): Promise<void> => {
  try {
    const recordRef = doc(db, 'records', recordId);
    const record = await getRecordById(recordId);

    if (record && record.likedBy.includes(userId)) {
      await updateDoc(recordRef, {
        likes: Math.max(0, (record.likes || 1) - 1),
        likedBy: record.likedBy.filter((id) => id !== userId),
      });
    }
  } catch (error) {
    console.error('Error unliking record:', error);
    throw error;
  }
};

export const deleteRecord = async (recordId: string, userId: string): Promise<void> => {
  try {
    const record = await getRecordById(recordId);

    if (record && record.userId === userId) {
      // Delete from storage
      const audioRef = ref(storage, record.audioUrl);
      await deleteObject(audioRef).catch(() => {
        // File might not exist, continue
      });

      // Delete from Firestore
      await deleteDoc(doc(db, 'records', recordId));
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};
