export const ROLES = {
  MASTER_ADMIN: 'Master Admin',
  SUPERVISOR: 'Supervisor'
};

export const REQUISITION_STATUS = {
  PENDING: 'Pending',
  IN_PROCESS: 'In Process',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected'
};

export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  PUBLIC_DEPARTMENTS: '/auth/departments',
  REQUISITIONS: '/requisitions',
  ASSETS: '/assets',
  DEPARTMENTS: '/departments',
  USERS: '/users',
  EMAIL_LOGS: '/requisitions/email-logs'
};
