export interface User {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  profilePhoto: string | null;
  followers: number;
  following: number;
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  categoryId: string;
  category: string;
  audioUrl?: string;
  lyrics?: LyricLine[];
  createdAt: number;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface KaraokRecord {
  id: string;
  userId: string;
  songId: string;
  song: Song;
  user: User;
  audioUrl: string;
  duration: number;
  description: string;
  caption: string;
  hashtags: string[];
  effectType: EffectType;
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  recordId: string;
  userId: string;
  user: User;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'share';
  fromUser: User;
  recordId?: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedUser?: string;
  recordId?: string;
  commentId?: string;
  category: 'spam' | 'harassment' | 'hate_speech' | 'inappropriate' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  action?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  songCount: number;
}

export type EffectType = 'normal' | 'reverb' | 'echo' | 'studio' | 'hall' | 'warm' | 'deep';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
