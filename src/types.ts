export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  timezone: string;
  avatarUrl: string;
}

export interface CredentialItem {
  id: string;
  type: string;
  licenseId: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRING SOON' | 'EXPIRED';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface VoiceNote {
  id: string;
  audioUrl?: string; // Data URL or Object URL of recorded audio
  transcript: string;
  createdAt: string;
  duration?: number; // duration in seconds
}

export interface InspectionItem {
  id: string;
  propertyName: string;
  address: string;
  date: string;
  inspectorName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  score?: number;
  type: string;
  clientName?: string;
  findings?: string;
  photos?: string[];
  subtasks?: SubTask[];
  voiceNotes?: VoiceNote[];
  isOfflineDraft?: boolean;
}

export interface OnboardingState {
  profileCompleted: boolean;
  brandingConfigured: boolean;
  propertyImported: boolean;
  testInspectionPerformed: boolean;
  brandColor: string;
  brandLogo: string | null;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Message {
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'inspection_created' | 'inspection_completed' | 'credential_added' | 'profile_updated' | 'system_alert' | 'offline_sync';
  category: 'activity' | 'notification';
  title: string;
  description: string;
  timestamp: string; // user-friendly relative string, e.g. "Just now"
  date: string; // ISO date or simple string
  isRead: boolean;
  metadata?: string;
  status?: 'Completed' | 'In-Progress' | 'Flagged';
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: 'Urgent' | 'Observation' | 'Reminder' | 'Draft';
  color: string;
  isPinned?: boolean;
}

