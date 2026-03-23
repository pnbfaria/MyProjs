export interface Feedback {
  feedbackId: number;
  feedbackNumber: string;
  description: string;
  receivedDate: string;
  categoryId?: number;
  channelId?: number;
  clientId?: number;
  typeId: number;
  statusId: number;
  severityId?: number;
  frequencyId?: number;
  placeId?: number;
  subjectId?: number;
  isLitigation: boolean;
  clientMoodScore?: number;
  createdByUserId?: number;
  updatedAt?: string;
  
  // Related entities
  status?: RefStatus;
  type?: RefType;
  severity?: RefSeverity;
  client?: Client;
  category?: RefCategory;
  channel?: RefChannel;
  subject?: RefSubject;
  orgUnits?: OrgUnit[];
  visibilities?: RefVisibility[];
  tasks?: Task[];
  comments?: Comment[];
  documents?: Document[];
}

export interface Comment {
  commentId: number;
  feedbackId: number;
  content: string;
  authorUserId?: number;
  createdAt?: string;
  updatedAt?: string;
  authorUser?: User;
}

export interface Interaction {
  interactionId: number;
  feedbackId: number;
  interactionType?: string;
  description?: string;
  interactionDate?: string;
  createdByUserId?: number;
  createdByUser?: User;
}

export interface Document {
  documentId: number;
  feedbackId: number;
  fileName: string;
  docType?: string;
  createdAt?: string;
}

export interface Task {
  taskId: number;
  feedbackId: number;
  taskName: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  statusId: number;
  assignedToUserId?: number;
  createdByUserId?: number;
  isHighPriority: boolean;
  updatedAt?: string;
  
  status?: RefStatus;
  assignedToUser?: User;
  createdByUser?: User;
}

export interface Client {
  clientId: number;
  firstName: string;
  lastName: string;
  isRequerant: boolean;
  terminationThreatCount: number;
  createdAt: string;
  updatedAt: string;
  feedbacks?: Feedback[];
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  role?: string;
  orgUnitId?: number;
  orgUnit?: OrgUnit;
}

export interface OrgUnit {
  orgUnitId: number;
  name: string;
}

export interface RefStatus { statusId: number; label: string; appliesTo?: string; }
export interface RefType { typeId: number; label: string; }
export interface RefSeverity { severityLevel: number; label: string; description?: string; }
export interface RefCategory { categoryId: number; label: string; parentCategoryId?: number; }
export interface RefChannel { channelId: number; label: string; }
export interface RefFrequency { frequencyLevel: number; label: string; description?: string; }
export interface RefPlace { placeId: number; label: string; }
export interface RefSubject { subjectId: number; label: string; }
export interface RefVisibility { visibilityId: number; label: string; }
