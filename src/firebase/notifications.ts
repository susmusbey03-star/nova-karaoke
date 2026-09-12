import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { Notification } from '@types/index';
import { v4 as uuidv4 } from 'uuid';

export const createNotification = async (
  userId: string,
  type: Notification['type'],
  fromUser: any,
  message: string,
  recordId?: string
): Promise<Notification> => {
  try {
    const notificationId = uuidv4();
    const notification: Notification = {
      id: notificationId,
      userId,
      type,
      fromUser,
      recordId,
      message,
      read: false,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'notifications', notificationId), notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string, pageSize: number = 20): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Notification);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
