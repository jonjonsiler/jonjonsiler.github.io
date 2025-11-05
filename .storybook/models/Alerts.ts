import { AlertType, AlertUrgency, AlertContentType } from '@enums';

export interface AlertTypeInfo {
  name: AlertType;
  notificationTypeDescription: string;
}

export interface Product {
  name: string;
}

export interface LeaId {
  contentType: string;
  attentionLevel: string;
  classroomId: number;
  districtId: number;
  studentId?: number;
  alertVO: string;
}

interface BaseAlert {
  title?: string;
  message?: string;
  id: string;
  createdDate: string;
  productId: string;
  userId: string;
}
export interface AlertResponse extends BaseAlert {
  title: string; // Required for the response
  message: string; // Required for the response
  notificationTypeId: string;
  notificationTypes: AlertTypeInfo;
  product: Product;
  leaId: string;
}

export interface Alert extends BaseAlert {
  contentType: string;
  attentionLevel: string;
  classroomId: number;
  districtId: number;
  studentId?: number[];
  alertVO?: string,
  productName: string;
  type: string;
  description: string;
  groupedAlertIds: string[];
}

export interface AmiraMessageAlert {
  id: string;
  title: string;
  callToAction?: string;
  urgency: AlertUrgency;
  type: AlertType;
  contentType: AlertContentType;
  alertIds: string[];
  studentIds: number[];
  modalContent?: React.ReactNode;
}