import { z } from 'zod';

// User validation schema
export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .optional(), // Optional for updates
  role: z.enum(['Student', 'Teacher', 'Admin'], {
    errorMap: () => ({ message: 'Role must be Student, Teacher, or Admin' })
  }),
  department: z.string()
    .min(1, 'Department is required')
    .max(100, 'Department must not exceed 100 characters'),
  avatarUrl: z.string()
    .url('Invalid avatar URL format')
    .optional()
    .or(z.literal(''))
});

// User creation schema (password required)
export const userCreateSchema = userSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// User update schema (all fields optional except id)
export const userUpdateSchema = userSchema.partial().extend({
  id: z.string().min(1, 'User ID is required')
});

// Recurrence pattern validation schema
export const recurrencePatternSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'Recurrence type must be daily, weekly, monthly, or yearly' })
  }),
  interval: z.number()
    .int('Interval must be an integer')
    .min(1, 'Interval must be at least 1')
    .max(365, 'Interval must not exceed 365'),
  daysOfWeek: z.array(z.number().int().min(0).max(6))
    .optional()
    .refine((days) => {
      if (!days) return true;
      return days.length > 0 && days.length <= 7;
    }, 'Days of week must contain 1-7 unique values'),
  dayOfMonth: z.number()
    .int('Day of month must be an integer')
    .min(1, 'Day of month must be at least 1')
    .max(31, 'Day of month must not exceed 31')
    .optional(),
  monthOfYear: z.number()
    .int('Month of year must be an integer')
    .min(1, 'Month of year must be at least 1')
    .max(12, 'Month of year must not exceed 12')
    .optional(),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid end date')
    .optional(),
  endAfterOccurrences: z.number()
    .int('End after occurrences must be an integer')
    .min(1, 'End after occurrences must be at least 1')
    .max(1000, 'End after occurrences must not exceed 1000')
    .optional()
}).refine((pattern) => {
  // Ensure end condition is specified
  return pattern.endDate || pattern.endAfterOccurrences;
}, 'Either endDate or endAfterOccurrences must be specified')
.refine((pattern) => {
  // Validate weekly recurrence has daysOfWeek
  if (pattern.type === 'weekly') {
    return pattern.daysOfWeek && pattern.daysOfWeek.length > 0;
  }
  return true;
}, 'Weekly recurrence must specify daysOfWeek')
.refine((pattern) => {
  // Validate monthly recurrence has dayOfMonth
  if (pattern.type === 'monthly') {
    return pattern.dayOfMonth !== undefined;
  }
  return true;
}, 'Monthly recurrence must specify dayOfMonth')
.refine((pattern) => {
  // Validate yearly recurrence has monthOfYear and dayOfMonth
  if (pattern.type === 'yearly') {
    return pattern.monthOfYear !== undefined && pattern.dayOfMonth !== undefined;
  }
  return true;
}, 'Yearly recurrence must specify monthOfYear and dayOfMonth');

// Calendar event validation schema
export const calendarEventSchema = z.object({
  id: z.string().optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  time: z.string()
    .regex(/^\d{1,2}:\d{2}\s?(AM|PM)\s?-\s?\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Time must be in format "10:00 AM - 11:00 AM"')
    .optional()
    .or(z.literal('')),
  type: z.enum(['meeting', 'exam', 'holiday', 'task', 'reminder'], {
    errorMap: () => ({ message: 'Type must be meeting, exam, holiday, task, or reminder' })
  }),
  // Recurring event fields
  recurrencePattern: recurrencePatternSchema.optional(),
  recurrenceId: z.string().optional(),
  isException: z.boolean().optional()
}).refine((event) => {
  // If recurrencePattern is provided, validate end date is after start date
  if (event.recurrencePattern?.endDate) {
    const startDate = new Date(event.date);
    const endDate = new Date(event.recurrencePattern.endDate);
    return endDate > startDate;
  }
  return true;
}, 'Recurrence end date must be after event start date');

// Calendar event creation schema
export const calendarEventCreateSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  time: z.string()
    .regex(/^\d{1,2}:\d{2}\s?(AM|PM)\s?-\s?\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Time must be in format "10:00 AM - 11:00 AM"')
    .optional()
    .or(z.literal('')),
  type: z.enum(['meeting', 'exam', 'holiday', 'task', 'reminder'], {
    errorMap: () => ({ message: 'Type must be meeting, exam, holiday, task, or reminder' })
  }),
  // Recurring event fields
  recurrencePattern: recurrencePatternSchema.optional(),
  recurrenceId: z.string().optional(),
  isException: z.boolean().optional()
}).refine((event) => {
  // If recurrencePattern is provided, validate end date is after start date
  if (event.recurrencePattern?.endDate) {
    const startDate = new Date(event.date);
    const endDate = new Date(event.recurrencePattern.endDate);
    return endDate > startDate;
  }
  return true;
}, 'Recurrence end date must be after event start date');

// Calendar event update schema
export const calendarEventUpdateSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date')
    .optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  time: z.string()
    .regex(/^\d{1,2}:\d{2}\s?(AM|PM)\s?-\s?\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Time must be in format "10:00 AM - 11:00 AM"')
    .optional()
    .or(z.literal('')),
  type: z.enum(['meeting', 'exam', 'holiday', 'task', 'reminder'], {
    errorMap: () => ({ message: 'Type must be meeting, exam, holiday, task, or reminder' })
  }).optional(),
  // Recurring event fields
  recurrencePattern: recurrencePatternSchema.optional(),
  recurrenceId: z.string().optional(),
  isException: z.boolean().optional()
});

// Message validation schema
export const messageSchema = z.object({
  id: z.number().optional(),
  sender: z.string()
    .min(1, 'Sender is required')
    .max(255, 'Sender must not exceed 255 characters'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(300, 'Subject must not exceed 300 characters'),
  snippet: z.string()
    .max(500, 'Snippet must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  body: z.string()
    .min(1, 'Message body is required')
    .max(10000, 'Message body must not exceed 10000 characters'),
  time: z.string()
    .min(1, 'Time is required'),
  unread: z.boolean().default(true),
  folder: z.enum(['Inbox', 'Sent', 'Drafts', 'Archive', 'Spam', 'Trash'], {
    errorMap: () => ({ message: 'Folder must be Inbox, Sent, Drafts, Archive, Spam, or Trash' })
  }).default('Inbox')
});

// Message creation schema
export const messageCreateSchema = messageSchema.omit({ id: true });

// Message update schema
export const messageUpdateSchema = messageSchema.partial().extend({
  id: z.number().min(1, 'Message ID is required')
});

// Knowledge article validation schema
export const knowledgeArticleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(300, 'Title must not exceed 300 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50000 characters')
});

// Article validation schema
export const articleSchema = z.object({
  id: z.string().optional(),
  currentVersionId: z.string()
    .min(1, 'Current version ID is required'),
  latestVersion: z.number()
    .int('Latest version must be an integer')
    .min(1, 'Latest version must be at least 1'),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Article version validation schema
export const articleVersionSchema = z.object({
  id: z.string().optional(),
  articleId: z.string()
    .min(1, 'Article ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(300, 'Title must not exceed 300 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must not exceed 50000 characters'),
  author: z.string()
    .min(1, 'Author is required'),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  version: z.number()
    .int('Version must be an integer')
    .min(1, 'Version must be at least 1'),
  isPublished: z.boolean(),
  changeDescription: z.string()
    .max(500, 'Change description must not exceed 500 characters')
    .optional()
});

// Article version creation schema
export const articleVersionCreateSchema = articleVersionSchema.omit({ id: true });

// Article version update schema
export const articleVersionUpdateSchema = articleVersionSchema.partial().extend({
  id: z.string().min(1, 'Article version ID is required')
});

// Marketplace product validation schema
export const marketplaceProductSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must not exceed 200 characters'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters'),
  price: z.number()
    .min(0, 'Price must be non-negative')
    .max(999999.99, 'Price must not exceed 999999.99'),
  imageUrl: z.string()
    .url('Invalid image URL format')
    .optional()
    .or(z.literal('')),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock must be non-negative')
});

// Game validation schema
export const gameSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  imageUrl: z.string()
    .url('Invalid image URL format')
    .optional()
    .or(z.literal(''))
});

// Media content validation schema
export const mediaContentSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  type: z.enum(['Movies', 'Series'], {
    errorMap: () => ({ message: 'Type must be Movies or Series' })
  }),
  imageUrl: z.string()
    .url('Invalid image URL format')
    .optional()
    .or(z.literal(''))
});

// Message thread validation schemas
export const messageThreadSchema = z.object({
  id: z.string().optional(),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(300, 'Subject must not exceed 300 characters'),
  participants: z.array(z.string())
    .min(1, 'At least one participant is required'),
  lastMessageTimestamp: z.string()
    .datetime('Invalid timestamp format'),
  messageCount: z.number()
    .int('Message count must be an integer')
    .min(0, 'Message count cannot be negative'),
  unreadCount: z.number()
    .int('Unread count must be an integer')
    .min(0, 'Unread count cannot be negative')
});

export const threadMessageSchema = z.object({
  id: z.string().optional(),
  threadId: z.string()
    .min(1, 'Thread ID is required'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(300, 'Subject must not exceed 300 characters'),
  body: z.string()
    .min(1, 'Message body is required')
    .max(10000, 'Message body must not exceed 10000 characters'),
  sender: z.string()
    .min(1, 'Sender is required'),
  recipients: z.array(z.string())
    .min(1, 'At least one recipient is required'),
  timestamp: z.string()
    .datetime('Invalid timestamp format'),
  parentId: z.string().optional(),
  isRead: z.boolean().default(false),
  attachments: z.array(z.string()).optional()
});

// Thread message creation schema
export const threadMessageCreateSchema = threadMessageSchema.omit({ id: true });

// Thread message update schema
export const threadMessageUpdateSchema = threadMessageSchema.partial().extend({
  id: z.string().min(1, 'Message ID is required')
});

// Enrollment status validation schema
export const enrollmentStatusSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Status name is required')
    .max(100, 'Status name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Status description is required')
    .max(500, 'Status description must not exceed 500 characters'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code')
});

// Enrollment step validation schema
export const enrollmentStepSchema = z.object({
  id: z.string()
    .min(1, 'Step ID is required'),
  name: z.string()
    .min(1, 'Step name is required')
    .max(200, 'Step name must not exceed 200 characters'),
  description: z.string()
    .min(1, 'Step description is required')
    .max(1000, 'Step description must not exceed 1000 characters'),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1'),
  isRequired: z.boolean(),
  isCompleted: z.boolean().default(false),
  formData: z.any().optional()
});

// Class validation schema
export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Class name is required')
    .max(200, 'Class name must not exceed 200 characters'),
  description: z.string()
    .max(1000, 'Class description must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  capacity: z.number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must not exceed 1000'),
  currentEnrollment: z.number()
    .int('Current enrollment must be an integer')
    .min(0, 'Current enrollment cannot be negative')
    .default(0),
  teacherId: z.string()
    .min(1, 'Teacher ID is required'),
  department: z.string()
    .min(1, 'Department is required')
    .max(100, 'Department must not exceed 100 characters')
});

// Enrollment validation schema
export const enrollmentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string()
    .min(1, 'Student ID is required'),
  classId: z.string()
    .min(1, 'Class ID is required'),
  status: z.string()
    .min(1, 'Status is required'),
  enrollmentDate: z.string()
    .datetime('Invalid enrollment date format'),
  steps: z.array(enrollmentStepSchema)
    .min(1, 'At least one enrollment step is required')
});

// Enrollment creation schema
export const enrollmentCreateSchema = enrollmentSchema.omit({ id: true });

// Enrollment update schema
export const enrollmentUpdateSchema = enrollmentSchema.partial().extend({
  id: z.string().min(1, 'Enrollment ID is required')
});

// Student information validation schema for enrollment
export const studentInformationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  phone: z.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (555) 123-4567')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
  address: z.string()
    .min(1, 'Street address is required')
    .max(200, 'Address must not exceed 200 characters'),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must not exceed 100 characters'),
  state: z.string()
    .min(1, 'State is required')
    .max(50, 'State must not exceed 50 characters'),
  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),
  emergencyContactName: z.string()
    .min(1, 'Emergency contact name is required')
    .max(100, 'Emergency contact name must not exceed 100 characters'),
  emergencyContactPhone: z.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (555) 123-4567'),
  emergencyContactRelation: z.enum(['parent', 'guardian', 'grandparent', 'sibling', 'other'], {
    errorMap: () => ({ message: 'Please select a valid relationship' })
  }),
  medicalConditions: z.string()
    .max(1000, 'Medical conditions must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  allergies: z.string()
    .max(1000, 'Allergies must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  previousSchool: z.string()
    .max(200, 'Previous school must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  gradeLevel: z.enum(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], {
    errorMap: () => ({ message: 'Please select a valid grade level' })
  })
});

// Class selection validation schema for enrollment
export const classSelectionSchema = z.object({
  selectedClassId: z.string()
    .min(1, 'Please select a class'),
  preferredSchedule: z.enum(['morning', 'afternoon', 'evening', 'flexible'], {
    errorMap: () => ({ message: 'Please select a preferred schedule' })
  }).optional(),
  specialRequests: z.string()
    .max(500, 'Special requests must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// Document upload validation schema for enrollment
export const documentUploadSchema = z.object({
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    uploadedAt: z.string(),
    status: z.enum(['uploading', 'uploaded', 'error']),
    url: z.string().optional(),
    error: z.string().optional()
  })).min(1, 'At least one document must be uploaded'),
  requiredDocuments: z.object({
    birthCertificate: z.boolean(),
    immunizationRecords: z.boolean(),
    previousTranscripts: z.boolean(),
    proofOfResidence: z.boolean()
  }).refine((docs) => {
    return docs.birthCertificate && docs.immunizationRecords && docs.proofOfResidence;
  }, 'All required documents must be confirmed')
});

// Complete enrollment form validation schema
export const enrollmentFormSchema = z.object({
  studentInformation: studentInformationSchema,
  classSelection: classSelectionSchema,
  documentUpload: documentUploadSchema
});

// Token Economy Validation Schemas

// Token transaction validation schema
export const tokenTransactionSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  amount: z.number()
    .int('Amount must be an integer')
    .refine((val) => val !== 0, 'Amount cannot be zero'),
  type: z.enum(['earned', 'spent', 'bonus', 'penalty'], {
    errorMap: () => ({ message: 'Type must be earned, spent, bonus, or penalty' })
  }),
  reason: z.string()
    .min(1, 'Reason is required')
    .max(200, 'Reason must not exceed 200 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.enum(['achievement', 'goal', 'purchase', 'activity'], {
    errorMap: () => ({ message: 'Related entity type must be achievement, goal, purchase, or activity' })
  }).optional(),
  timestamp: z.string()
    .datetime('Invalid timestamp format'),
  metadata: z.record(z.any()).optional()
});

// Token balance validation schema
export const tokenBalanceSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required'),
  currentBalance: z.number()
    .int('Current balance must be an integer')
    .min(0, 'Current balance cannot be negative'),
  totalEarned: z.number()
    .int('Total earned must be an integer')
    .min(0, 'Total earned cannot be negative'),
  totalSpent: z.number()
    .int('Total spent must be an integer')
    .min(0, 'Total spent cannot be negative'),
  lastUpdated: z.string()
    .datetime('Invalid last updated format')
});

// Token earning rule validation schema
export const tokenEarningRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  amount: z.number()
    .int('Amount must be an integer')
    .min(1, 'Amount must be at least 1'),
  triggerType: z.enum(['achievement_unlock', 'goal_complete', 'activity_complete', 'daily_login', 'streak', 'manual'], {
    errorMap: () => ({ message: 'Invalid trigger type' })
  }),
  triggerConditions: z.record(z.any()).optional(),
  isActive: z.boolean(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Token spending option validation schema
export const tokenSpendingOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  cost: z.number()
    .int('Cost must be an integer')
    .min(1, 'Cost must be at least 1'),
  category: z.enum(['avatar', 'theme', 'privilege', 'reward', 'boost'], {
    errorMap: () => ({ message: 'Category must be avatar, theme, privilege, reward, or boost' })
  }),
  imageUrl: z.string()
    .url('Invalid image URL format')
    .optional(),
  isAvailable: z.boolean(),
  requiresApproval: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Achievement requirement validation schema
export const achievementRequirementSchema = z.object({
  type: z.enum(['count', 'streak', 'score', 'time', 'completion', 'social'], {
    errorMap: () => ({ message: 'Type must be count, streak, score, time, completion, or social' })
  }),
  target: z.number()
    .min(1, 'Target must be at least 1'),
  metric: z.string()
    .min(1, 'Metric is required')
    .max(100, 'Metric must not exceed 100 characters'),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time'], {
    errorMap: () => ({ message: 'Timeframe must be daily, weekly, monthly, or all_time' })
  }).optional(),
  conditions: z.record(z.any()).optional()
});

// Achievement validation schema
export const achievementSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(50, 'Icon must not exceed 50 characters'),
  category: z.enum(['academic', 'social', 'creative', 'leadership', 'participation', 'milestone'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  difficulty: z.enum(['bronze', 'silver', 'gold', 'platinum'], {
    errorMap: () => ({ message: 'Difficulty must be bronze, silver, gold, or platinum' })
  }),
  points: z.number()
    .int('Points must be an integer')
    .min(1, 'Points must be at least 1'),
  tokenReward: z.number()
    .int('Token reward must be an integer')
    .min(0, 'Token reward cannot be negative'),
  requirements: z.array(achievementRequirementSchema)
    .min(1, 'At least one requirement is needed'),
  isSecret: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// User achievement validation schema
export const userAchievementSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  achievementId: z.string()
    .min(1, 'Achievement ID is required'),
  unlockedAt: z.string()
    .datetime('Invalid unlocked date format'),
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100'),
  isCompleted: z.boolean(),
  currentValues: z.record(z.number()),
  metadata: z.record(z.any()).optional()
});

// Goal milestone validation schema
export const goalMilestoneSchema = z.object({
  id: z.string()
    .min(1, 'Milestone ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  targetDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid target date')
    .optional(),
  completedAt: z.string()
    .datetime('Invalid completed date format')
    .optional(),
  isCompleted: z.boolean(),
  tokenReward: z.number()
    .int('Token reward must be an integer')
    .min(0, 'Token reward cannot be negative'),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1')
});

// Goal activity validation schema
export const goalActivitySchema = z.object({
  id: z.string()
    .min(1, 'Activity ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  type: z.enum(['task', 'habit', 'event', 'measurement'], {
    errorMap: () => ({ message: 'Type must be task, habit, event, or measurement' })
  }),
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped'], {
    errorMap: () => ({ message: 'Status must be pending, in_progress, completed, or skipped' })
  }),
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid due date')
    .optional(),
  completedAt: z.string()
    .datetime('Invalid completed date format')
    .optional(),
  estimatedMinutes: z.number()
    .int('Estimated minutes must be an integer')
    .min(1, 'Estimated minutes must be at least 1')
    .optional(),
  actualMinutes: z.number()
    .int('Actual minutes must be an integer')
    .min(0, 'Actual minutes cannot be negative')
    .optional(),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1')
});

// Goal validation schema
export const goalSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  category: z.enum(['academic', 'personal', 'social', 'creative', 'health', 'career'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Priority must be low, medium, high, or critical' })
  }),
  status: z.enum(['not_started', 'in_progress', 'completed', 'paused', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100'),
  parentGoalId: z.string().optional(),
  childGoalIds: z.array(z.string()),
  level: z.number()
    .int('Level must be an integer')
    .min(0, 'Level cannot be negative'),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid start date')
    .optional(),
  targetDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid target date')
    .optional(),
  completedAt: z.string()
    .datetime('Invalid completed date format')
    .optional(),
  tokenReward: z.number()
    .int('Token reward must be an integer')
    .min(0, 'Token reward cannot be negative'),
  achievementRewards: z.array(z.string()),
  dependsOnGoalIds: z.array(z.string()),
  blocksGoalIds: z.array(z.string()),
  milestones: z.array(goalMilestoneSchema),
  activities: z.array(goalActivitySchema),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert'], {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, hard, or expert' })
  }),
  estimatedHours: z.number()
    .min(0, 'Estimated hours cannot be negative')
    .optional(),
  actualHours: z.number()
    .min(0, 'Actual hours cannot be negative')
    .optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Skills-Based Credentialing & Portfolio Validation Schemas

// Skill validation schema
export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Skill name is required')
    .max(100, 'Skill name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Level must be beginner, intermediate, advanced, or expert' })
  }),
  isVerified: z.boolean(),
  verificationDate: z.string()
    .datetime('Invalid verification date format')
    .optional(),
  verifiedBy: z.string().optional(),
  evidence: z.array(z.string()),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Badge criteria validation schema
export const badgeCriteriaSchema = z.object({
  id: z.string()
    .min(1, 'Criteria ID is required'),
  description: z.string()
    .min(1, 'Description is required')
    .max(300, 'Description must not exceed 300 characters'),
  type: z.enum(['skill_level', 'project_completion', 'peer_review', 'time_based', 'assessment', 'portfolio_items'], {
    errorMap: () => ({ message: 'Invalid criteria type' })
  }),
  requirements: z.record(z.any()),
  isRequired: z.boolean()
});

// Badge validation schema
export const badgeSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Badge name is required')
    .max(100, 'Badge name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(50, 'Icon must not exceed 50 characters'),
  type: z.enum(['skill', 'achievement', 'completion', 'participation', 'leadership', 'creativity'], {
    errorMap: () => ({ message: 'Invalid badge type' })
  }),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  criteria: z.array(badgeCriteriaSchema)
    .min(1, 'At least one criteria is required'),
  points: z.number()
    .int('Points must be an integer')
    .min(1, 'Points must be at least 1'),
  tokenReward: z.number()
    .int('Token reward must be an integer')
    .min(0, 'Token reward cannot be negative'),
  isActive: z.boolean(),
  createdBy: z.string()
    .min(1, 'Created by is required'),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// User badge validation schema
export const userBadgeSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  badgeId: z.string()
    .min(1, 'Badge ID is required'),
  earnedAt: z.string()
    .datetime('Invalid earned date format'),
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'expired'], {
    errorMap: () => ({ message: 'Invalid verification status' })
  }),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string()
    .datetime('Invalid verified date format')
    .optional(),
  evidence: z.array(z.string()),
  metadata: z.record(z.any()).optional()
});

// Portfolio content validation schema
export const portfolioContentSchema = z.object({
  projectUrl: z.string().url('Invalid project URL').optional(),
  repositoryUrl: z.string().url('Invalid repository URL').optional(),
  demoUrl: z.string().url('Invalid demo URL').optional(),
  documentUrl: z.string().url('Invalid document URL').optional(),
  documentType: z.string().optional(),
  mediaUrl: z.string().url('Invalid media URL').optional(),
  mediaType: z.string().optional(),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  linkUrl: z.string().url('Invalid link URL').optional(),
  linkTitle: z.string().max(200, 'Link title must not exceed 200 characters').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  fileSize: z.number().min(0, 'File size cannot be negative').optional(),
  fileName: z.string().max(255, 'File name must not exceed 255 characters').optional(),
  textContent: z.string().max(10000, 'Text content must not exceed 10000 characters').optional()
});

// Portfolio item validation schema
export const portfolioItemSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  type: z.enum(['project', 'document', 'image', 'video', 'audio', 'link', 'badge', 'certificate'], {
    errorMap: () => ({ message: 'Invalid portfolio item type' })
  }),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  tags: z.array(z.string().max(30, 'Tag must not exceed 30 characters')),
  content: portfolioContentSchema,
  skills: z.array(z.string()),
  sharingLevel: z.enum(['private', 'school', 'public'], {
    errorMap: () => ({ message: 'Sharing level must be private, school, or public' })
  }),
  isPublished: z.boolean(),
  publishedAt: z.string()
    .datetime('Invalid published date format')
    .optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format'),
  metadata: z.record(z.any()).optional()
});

// Portfolio section validation schema
export const portfolioSectionSchema = z.object({
  id: z.string()
    .min(1, 'Section ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .max(300, 'Description must not exceed 300 characters')
    .optional(),
  type: z.enum(['projects', 'skills', 'badges', 'about', 'contact', 'custom'], {
    errorMap: () => ({ message: 'Invalid section type' })
  }),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1'),
  isVisible: z.boolean(),
  items: z.array(z.string()),
  layout: z.enum(['grid', 'list', 'carousel', 'timeline'], {
    errorMap: () => ({ message: 'Layout must be grid, list, carousel, or timeline' })
  }),
  settings: z.record(z.any())
});

// Portfolio SEO validation schema
export const portfolioSEOSchema = z.object({
  title: z.string()
    .max(60, 'SEO title must not exceed 60 characters')
    .optional(),
  description: z.string()
    .max(160, 'SEO description must not exceed 160 characters')
    .optional(),
  keywords: z.array(z.string().max(50, 'Keyword must not exceed 50 characters')),
  ogImage: z.string().url('Invalid OG image URL').optional(),
  customMeta: z.record(z.string()).optional()
});

// Portfolio analytics validation schema
export const portfolioAnalyticsSchema = z.object({
  views: z.number()
    .int('Views must be an integer')
    .min(0, 'Views cannot be negative'),
  uniqueVisitors: z.number()
    .int('Unique visitors must be an integer')
    .min(0, 'Unique visitors cannot be negative'),
  lastViewed: z.string()
    .datetime('Invalid last viewed date format')
    .optional(),
  popularItems: z.array(z.object({
    itemId: z.string(),
    views: z.number().int().min(0)
  })),
  referrers: z.array(z.object({
    source: z.string(),
    count: z.number().int().min(0)
  })),
  monthlyStats: z.array(z.object({
    month: z.string(),
    views: z.number().int().min(0),
    visitors: z.number().int().min(0)
  }))
});

// Portfolio validation schema
export const portfolioSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  theme: z.string()
    .min(1, 'Theme is required')
    .max(50, 'Theme must not exceed 50 characters'),
  layout: z.string()
    .min(1, 'Layout is required')
    .max(50, 'Layout must not exceed 50 characters'),
  sections: z.array(portfolioSectionSchema),
  skills: z.array(skillSchema),
  badges: z.array(userBadgeSchema),
  sharingLevel: z.enum(['private', 'school', 'public'], {
    errorMap: () => ({ message: 'Sharing level must be private, school, or public' })
  }),
  isPublished: z.boolean(),
  publishedAt: z.string()
    .datetime('Invalid published date format')
    .optional(),
  customDomain: z.string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Invalid domain format')
    .optional(),
  seoSettings: portfolioSEOSchema,
  analytics: portfolioAnalyticsSchema,
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Portfolio template validation schema
export const portfolioTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  thumbnailUrl: z.string()
    .url('Invalid thumbnail URL'),
  previewUrl: z.string()
    .url('Invalid preview URL')
    .optional(),
  theme: z.string()
    .min(1, 'Theme is required')
    .max(50, 'Theme must not exceed 50 characters'),
  layout: z.string()
    .min(1, 'Layout is required')
    .max(50, 'Layout must not exceed 50 characters'),
  sections: z.array(portfolioSectionSchema.omit({ id: true, items: true })),
  isPublic: z.boolean(),
  isPremium: z.boolean(),
  createdBy: z.string()
    .min(1, 'Created by is required'),
  usageCount: z.number()
    .int('Usage count must be an integer')
    .min(0, 'Usage count cannot be negative'),
  rating: z.number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5'),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Skill verification request validation schema
export const skillVerificationRequestSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  skillId: z.string()
    .min(1, 'Skill ID is required'),
  requestedLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Level must be beginner, intermediate, advanced, or expert' })
  }),
  evidence: z.array(z.string())
    .min(1, 'At least one evidence item is required'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  requestedAt: z.string()
    .datetime('Invalid requested date format'),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string()
    .datetime('Invalid reviewed date format')
    .optional(),
  status: z.enum(['pending', 'verified', 'rejected', 'expired'], {
    errorMap: () => ({ message: 'Invalid verification status' })
  }),
  feedback: z.string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional(),
  metadata: z.record(z.any()).optional()
});

// Credential certificate validation schema
export const credentialCertificateSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  type: z.enum(['skill', 'badge', 'completion', 'custom'], {
    errorMap: () => ({ message: 'Type must be skill, badge, completion, or custom' })
  }),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  issuer: z.string()
    .min(1, 'Issuer is required')
    .max(100, 'Issuer must not exceed 100 characters'),
  issuedAt: z.string()
    .datetime('Invalid issued date format'),
  expiresAt: z.string()
    .datetime('Invalid expiration date format')
    .optional(),
  certificateUrl: z.string()
    .url('Invalid certificate URL'),
  verificationCode: z.string()
    .min(1, 'Verification code is required')
    .max(50, 'Verification code must not exceed 50 characters'),
  skills: z.array(z.string()),
  badges: z.array(z.string()),
  metadata: z.record(z.any()).optional()
});
    .max(1000, 'Description must not exceed 1000 characters'),
  category: z.enum(['academic', 'personal', 'social', 'creative', 'health', 'career'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Priority must be low, medium, high, or critical' })
  }),
  status: z.enum(['not_started', 'in_progress', 'completed', 'paused', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100'),
  parentGoalId: z.string().optional(),
  childGoalIds: z.array(z.string()),
  level: z.number()
    .int('Level must be an integer')
    .min(0, 'Level cannot be negative'),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid start date')
    .optional(),
  targetDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid target date')
    .optional(),
  completedAt: z.string()
    .datetime('Invalid completed date format')
    .optional(),
  tokenReward: z.number()
    .int('Token reward must be an integer')
    .min(0, 'Token reward cannot be negative'),
  achievementRewards: z.array(z.string()),
  dependsOnGoalIds: z.array(z.string()),
  blocksGoalIds: z.array(z.string()),
  milestones: z.array(goalMilestoneSchema),
  activities: z.array(goalActivitySchema),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert'], {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, hard, or expert' })
  }),
  estimatedHours: z.number()
    .min(0, 'Estimated hours cannot be negative')
    .optional(),
  actualHours: z.number()
    .min(0, 'Actual hours cannot be negative')
    .optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Goal creation schema
export const goalCreateSchema = goalSchema.omit({ id: true });

// Goal update schema
export const goalUpdateSchema = goalSchema.partial().extend({
  id: z.string().min(1, 'Goal ID is required')
});

// Milestone validation schema
export const milestoneSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  type: z.enum(['level', 'points', 'achievements', 'streak', 'custom'], {
    errorMap: () => ({ message: 'Type must be level, points, achievements, streak, or custom' })
  }),
  threshold: z.number()
    .min(1, 'Threshold must be at least 1'),
  reward: z.object({
    tokens: z.number()
      .int('Token reward must be an integer')
      .min(0, 'Token reward cannot be negative'),
    achievements: z.array(z.string()).optional(),
    unlocks: z.array(z.string()).optional()
  }),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(50, 'Icon must not exceed 50 characters'),
  isUnlocked: z.boolean(),
  unlockedAt: z.string()
    .datetime('Invalid unlocked date format')
    .optional()
});

// Progress visualization validation schema
export const progressVisualizationSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required'),
  totalPoints: z.number()
    .int('Total points must be an integer')
    .min(0, 'Total points cannot be negative'),
  currentLevel: z.number()
    .int('Current level must be an integer')
    .min(1, 'Current level must be at least 1'),
  pointsToNextLevel: z.number()
    .int('Points to next level must be an integer')
    .min(0, 'Points to next level cannot be negative'),
  totalPointsForNextLevel: z.number()
    .int('Total points for next level must be an integer')
    .min(1, 'Total points for next level must be at least 1'),
  achievements: z.object({
    total: z.number()
      .int('Total achievements must be an integer')
      .min(0, 'Total achievements cannot be negative'),
    byCategory: z.record(z.number().int().min(0)),
    byDifficulty: z.record(z.number().int().min(0)),
    recent: z.array(userAchievementSchema)
  }),
  streaks: z.object({
    current: z.number()
      .int('Current streak must be an integer')
      .min(0, 'Current streak cannot be negative'),
    longest: z.number()
      .int('Longest streak must be an integer')
      .min(0, 'Longest streak cannot be negative'),
    type: z.string()
      .min(1, 'Streak type is required')
  }),
  milestones: z.array(milestoneSchema)
});

// Goal validation schema (complete definition)
export const goalSchemaComplete = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  category: z.enum(['academic', 'personal', 'social', 'creative', 'health', 'career'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Priority must be low, medium, high, or critical' })
  }),
  status: z.enum(['not_started', 'in_progress', 'completed', 'paused', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  progress: z.number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100'),
  parentGoalId: z.string().optional(),
  childGoalIds: z.array(z.string()),
  level: z.number()
    .int('Level must be an integer')
    .min(0, 'Level cannot be negative'),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid start date')
    .optional(),
  targetDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid target date')
    .optional(),
  completedAt: z.string()
    .datetime('Invalid completed date format')
    .optional(),
  tokenReward: z.number()
    .int('Token reward must be an integer')
    .min(0, 'Token reward cannot be negative'),
  achievementRewards: z.array(z.string()),
  dependsOnGoalIds: z.array(z.string()),
  blocksGoalIds: z.array(z.string()),
  milestones: z.array(goalMilestoneSchema),
  activities: z.array(goalActivitySchema),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert'], {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, hard, or expert' })
  }),
  estimatedHours: z.number()
    .min(0.1, 'Estimated hours must be at least 0.1')
    .optional(),
  actualHours: z.number()
    .min(0, 'Actual hours cannot be negative')
    .optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
}).refine((goal) => {
  // Validate that target date is after start date
  if (goal.startDate && goal.targetDate) {
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);
    return targetDate >= startDate;
  }
  return true;
}, 'Target date must be after start date');

// Export type definitions for the schemas
export type UserValidation = z.infer<typeof userSchema>;
export type UserCreateValidation = z.infer<typeof userCreateSchema>;
export type UserUpdateValidation = z.infer<typeof userUpdateSchema>;
export type RecurrencePatternValidation = z.infer<typeof recurrencePatternSchema>;
export type CalendarEventValidation = z.infer<typeof calendarEventSchema>;
export type CalendarEventCreateValidation = z.infer<typeof calendarEventCreateSchema>;
export type CalendarEventUpdateValidation = z.infer<typeof calendarEventUpdateSchema>;
export type MessageValidation = z.infer<typeof messageSchema>;
export type MessageCreateValidation = z.infer<typeof messageCreateSchema>;
export type MessageUpdateValidation = z.infer<typeof messageUpdateSchema>;
export type MessageThreadValidation = z.infer<typeof messageThreadSchema>;
export type ThreadMessageValidation = z.infer<typeof threadMessageSchema>;
export type ThreadMessageCreateValidation = z.infer<typeof threadMessageCreateSchema>;
export type ThreadMessageUpdateValidation = z.infer<typeof threadMessageUpdateSchema>;
export type KnowledgeArticleValidation = z.infer<typeof knowledgeArticleSchema>;
export type ArticleValidation = z.infer<typeof articleSchema>;
export type ArticleVersionValidation = z.infer<typeof articleVersionSchema>;
export type ArticleVersionCreateValidation = z.infer<typeof articleVersionCreateSchema>;
export type ArticleVersionUpdateValidation = z.infer<typeof articleVersionUpdateSchema>;
export type MarketplaceProductValidation = z.infer<typeof marketplaceProductSchema>;
export type GameValidation = z.infer<typeof gameSchema>;
export type MediaContentValidation = z.infer<typeof mediaContentSchema>;
export type EnrollmentStatusValidation = z.infer<typeof enrollmentStatusSchema>;
export type EnrollmentStepValidation = z.infer<typeof enrollmentStepSchema>;
export type ClassValidation = z.infer<typeof classSchema>;
export type EnrollmentValidation = z.infer<typeof enrollmentSchema>;
export type EnrollmentCreateValidation = z.infer<typeof enrollmentCreateSchema>;
export type EnrollmentUpdateValidation = z.infer<typeof enrollmentUpdateSchema>;
export type StudentInformationValidation = z.infer<typeof studentInformationSchema>;
export type ClassSelectionValidation = z.infer<typeof classSelectionSchema>;
export type DocumentUploadValidation = z.infer<typeof documentUploadSchema>;
export type EnrollmentFormValidation = z.infer<typeof enrollmentFormSchema>;

// Token Economy validation types
export type TokenTransactionValidation = z.infer<typeof tokenTransactionSchema>;
export type TokenBalanceValidation = z.infer<typeof tokenBalanceSchema>;
export type TokenEarningRuleValidation = z.infer<typeof tokenEarningRuleSchema>;
export type TokenSpendingOptionValidation = z.infer<typeof tokenSpendingOptionSchema>;
export type AchievementRequirementValidation = z.infer<typeof achievementRequirementSchema>;
export type AchievementValidation = z.infer<typeof achievementSchema>;
export type UserAchievementValidation = z.infer<typeof userAchievementSchema>;
export type GoalMilestoneValidation = z.infer<typeof goalMilestoneSchema>;
export type GoalActivityValidation = z.infer<typeof goalActivitySchema>;
export type GoalValidation = z.infer<typeof goalSchemaComplete>;
export type GoalCreateValidation = z.infer<typeof goalCreateSchema>;
export type GoalUpdateValidation = z.infer<typeof goalUpdateSchema>;
export type MilestoneValidation = z.infer<typeof milestoneSchema>;

// Personal Growth Journal Validation Schemas

// Mood entry validation schema
export const moodEntrySchema = z.object({
  mood: z.number().int().min(1).max(5),
  focus: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  notes: z.string()
    .max(500, 'Mood notes must not exceed 500 characters')
    .optional()
});

// Progress entry validation schema
export const progressEntrySchema = z.object({
  academicProgress: z.number()
    .min(0, 'Academic progress cannot be negative')
    .max(100, 'Academic progress cannot exceed 100'),
  personalGrowth: z.number()
    .min(0, 'Personal growth cannot be negative')
    .max(100, 'Personal growth cannot exceed 100'),
  socialConnections: z.number()
    .min(0, 'Social connections cannot be negative')
    .max(100, 'Social connections cannot exceed 100'),
  healthWellness: z.number()
    .min(0, 'Health wellness cannot be negative')
    .max(100, 'Health wellness cannot exceed 100'),
  skillDevelopment: z.number()
    .min(0, 'Skill development cannot be negative')
    .max(100, 'Skill development cannot exceed 100'),
  notes: z.string()
    .max(500, 'Progress notes must not exceed 500 characters')
    .optional()
});

// Reflection prompt validation schema
export const reflectionPromptSchema = z.object({
  id: z.string().optional(),
  category: z.enum(['daily', 'weekly', 'monthly', 'custom'], {
    errorMap: () => ({ message: 'Category must be daily, weekly, monthly, or custom' })
  }),
  question: z.string()
    .min(1, 'Question is required')
    .max(500, 'Question must not exceed 500 characters'),
  isActive: z.boolean()
});

// Journal entry validation schema
export const journalEntrySchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
  title: z.string()
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content must not exceed 10000 characters'),
  mood: moodEntrySchema,
  progress: progressEntrySchema,
  reflectionPrompts: z.array(z.object({
    promptId: z.string(),
    question: z.string(),
    response: z.string().max(2000, 'Response must not exceed 2000 characters')
  })).default([]),
  tags: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(true),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Journal entry creation schema
export const journalEntryCreateSchema = journalEntrySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Journal entry update schema
export const journalEntryUpdateSchema = journalEntrySchema.partial().extend({
  id: z.string().min(1, 'Journal entry ID is required')
});

// Journal template validation schema
export const journalTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  prompts: z.array(z.string())
    .min(1, 'At least one prompt is required'),
  defaultTags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  createdBy: z.string()
    .min(1, 'Creator ID is required'),
  createdAt: z.string()
    .datetime('Invalid created date format')
});

// Journal goal validation schema
export const journalGoalSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  targetMetric: z.enum(['entries_per_week', 'mood_improvement', 'stress_reduction', 'focus_improvement', 'custom'], {
    errorMap: () => ({ message: 'Invalid target metric' })
  }),
  targetValue: z.number()
    .min(1, 'Target value must be at least 1'),
  currentValue: z.number()
    .min(0, 'Current value cannot be negative')
    .default(0),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid start date'),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid end date'),
  isActive: z.boolean().default(true),
  isCompleted: z.boolean().default(false),
  completedAt: z.string()
    .datetime('Invalid completed date format')
    .optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
}).refine((goal) => {
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  return endDate > startDate;
}, 'End date must be after start date');

// Journal goal creation schema
export const journalGoalCreateSchema = journalGoalSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Journal goal update schema
export const journalGoalUpdateSchema = journalGoalSchema.partial().extend({
  id: z.string().min(1, 'Journal goal ID is required')
});

// Mood + Focus Check-In Validation Schemas

// Mood focus check-in validation schema
export const moodFocusCheckInSchema = z.object({
  id: z.string().optional(),
  userId: z.string()
    .min(1, 'User ID is required'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
  mood: z.number().int().min(1).max(5),
  focus: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
  tags: z.array(z.string())
    .optional(),
  createdAt: z.string()
    .datetime('Invalid created date format'),
  updatedAt: z.string()
    .datetime('Invalid updated date format')
});

// Mood focus check-in creation schema
export const moodFocusCheckInCreateSchema = moodFocusCheckInSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Mood focus check-in update schema
export const moodFocusCheckInUpdateSchema = moodFocusCheckInSchema.partial().extend({
  id: z.string().min(1, 'Check-in ID is required')
});

// Export validation types for Personal Growth Journal
export type MoodEntryValidation = z.infer<typeof moodEntrySchema>;
export type ProgressEntryValidation = z.infer<typeof progressEntrySchema>;
export type ReflectionPromptValidation = z.infer<typeof reflectionPromptSchema>;
export type JournalEntryValidation = z.infer<typeof journalEntrySchema>;
export type JournalEntryCreateValidation = z.infer<typeof journalEntryCreateSchema>;
export type JournalEntryUpdateValidation = z.infer<typeof journalEntryUpdateSchema>;
export type JournalTemplateValidation = z.infer<typeof journalTemplateSchema>;
export type JournalGoalValidation = z.infer<typeof journalGoalSchema>;
export type JournalGoalCreateValidation = z.infer<typeof journalGoalCreateSchema>;
export type JournalGoalUpdateValidation = z.infer<typeof journalGoalUpdateSchema>;

// Export validation types for Mood + Focus Check-In
export type MoodFocusCheckInValidation = z.infer<typeof moodFocusCheckInSchema>;
export type MoodFocusCheckInCreateValidation = z.infer<typeof moodFocusCheckInCreateSchema>;
export type MoodFocusCheckInUpdateValidation = z.infer<typeof moodFocusCheckInUpdateSchema>;