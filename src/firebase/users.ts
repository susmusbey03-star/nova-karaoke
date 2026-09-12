import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import { User } from '@types/index';

export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as User);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    const followRef = doc(db, 'follows', `${currentUserId}_${targetUserId}`);
    await setDoc(followRef, {
      followerId: currentUserId,
      followingId: targetUserId,
      createdAt: Date.now(),
    });

    // Update follower/following counts
    const currentUser = await getUserById(currentUserId);
    const targetUser = await getUserById(targetUserId);

    if (currentUser && targetUser) {
      await updateUserProfile(currentUserId, {
        following: (currentUser.following || 0) + 1,
      });
      await updateUserProfile(targetUserId, {
        followers: (targetUser.followers || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    const followRef = doc(db, 'follows', `${currentUserId}_${targetUserId}`);
    const followSnap = await getDoc(followRef);
    
    if (followSnap.exists()) {
      await setDoc(followRef, { deleted: true }, { merge: true });

      // Update follower/following counts
      const currentUser = await getUserById(currentUserId);
      const targetUser = await getUserById(targetUserId);

      if (currentUser && targetUser) {
        await updateUserProfile(currentUserId, {
          following: Math.max(0, (currentUser.following || 1) - 1),
        });
        await updateUserProfile(targetUserId, {
          followers: Math.max(0, (targetUser.followers || 1) - 1),
        });
      }
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const followRef = doc(db, 'follows', `${currentUserId}_${targetUserId}`);
    const followSnap = await getDoc(followRef);
    return followSnap.exists() && !followSnap.data().deleted;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};
