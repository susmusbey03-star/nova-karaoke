import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { Report } from '@types/index';
import { v4 as uuidv4 } from 'uuid';

export const createReport = async (
  reportedBy: string,
  category: Report['category'],
  description: string,
  reportedUser?: string,
  recordId?: string,
  commentId?: string
): Promise<Report> => {
  try {
    const reportId = uuidv4();
    const report: Report = {
      id: reportId,
      reportedBy,
      reportedUser,
      recordId,
      commentId,
      category,
      description,
      status: 'pending',
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'reports', reportId), report);
    return report;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'reports'));
    return querySnapshot.docs.map((doc) => doc.data() as Report);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const updateReportStatus = async (
  reportId: string,
  status: Report['status'],
  reviewedBy?: string,
  action?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      reviewedAt: Date.now(),
      reviewedBy,
      action,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};
