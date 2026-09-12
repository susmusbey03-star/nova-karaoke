import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Comment } from '@types/index';
import { v4 as uuidv4 } from 'uuid';

export const addComment = async (
  recordId: string,
  userId: string,
  text: string,
  user: any
): Promise<Comment> => {
  try {
    const commentId = uuidv4();
    const comment: Comment = {
      id: commentId,
      recordId,
      userId,
      user,
      text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'comments', commentId), comment);

    // Update comment count on record
    const recordRef = doc(db, 'records', recordId);
    const recordDoc = await getDocs(
      query(collection(db, 'records'), where('id', '==', recordId))
    );
    if (!recordDoc.empty) {
      const record = recordDoc.docs[0].data();
      await updateDoc(recordRef, {
        comments: (record.comments || 0) + 1,
      });
    }

    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getRecordComments = async (recordId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('recordId', '==', recordId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Comment);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const deleteComment = async (commentId: string, userId: string, recordId: string): Promise<void> => {
  try {
    const commentDoc = await getDocs(
      query(collection(db, 'comments'), where('id', '==', commentId))
    );

    if (!commentDoc.empty) {
      const comment = commentDoc.docs[0].data();
      if (comment.userId === userId) {
        await deleteDoc(doc(db, 'comments', commentId));

        // Update comment count on record
        const recordRef = doc(db, 'records', recordId);
        const recordSnap = await getDocs(
          query(collection(db, 'records'), where('id', '==', recordId))
        );
        if (!recordSnap.empty) {
          const record = recordSnap.docs[0].data();
          await updateDoc(recordRef, {
            comments: Math.max(0, (record.comments || 1) - 1),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
