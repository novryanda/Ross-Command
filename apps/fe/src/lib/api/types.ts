export type ApiMeta = {
  pagination?: PaginationMeta;
  [key: string]: unknown;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: ApiMeta;
  timestamp: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  timestamp?: string;
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: ApiError["error"]["details"];

  constructor(message: string, status: number, code?: string, details?: ApiError["error"]["details"]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type Role = "super_admin" | "member";
export type OrderType = "posting" | "engagement" | "komentar" | "report_akun";
export type OrderStatus = "draft" | "aktif" | "selesai" | "expired" | "dibatalkan";
export type AssignmentStatus = "belum_dikerjakan" | "selesai" | "terlambat";
export type SocialPlatform = "instagram" | "twitter_x" | "facebook" | "tiktok" | "youtube" | "other";

export type OrderSocialTarget = {
  id?: string;
  platform: SocialPlatform;
  url: string;
};
export type NotificationCategory =
  | "assignment"
  | "deadline"
  | "submission"
  | "order"
  | "organization"
  | "account"
  | "system";
export type NotificationSeverity = "info" | "success" | "warning" | "danger";
export type ActivityCategory = "auth" | "order" | "submission";
export type ActivityType =
  | "login_success"
  | "login_failed"
  | "order_created"
  | "order_sent"
  | "submission_sent";

export type UnitSummary = {
  id: string;
  name: string;
  path?: string;
  depthLevel?: number;
};

export type Me = {
  id: string;
  username: string;
  fullName: string;
  nip: string | null;
  role: Role;
  isCommander: boolean;
  unit: (UnitSummary & { depthLevel: number }) | null;
  commandingUnits?: UnitSummary[];
  socialAccountCount: number;
  lastLoginAt: string | null;
  createdAt: string;
};

export type ProgressSummary = {
  totalAssigned: number;
  totalSubmitted: number;
  totalOnTime: number;
  totalLate: number;
  totalPending: number;
  percentageComplete: number;
};

export type Order = {
  id: string;
  title: string;
  orderType: OrderType;
  description: string;
  targetUrls: OrderSocialTarget[];
  narration: string | null;
  sentiment: "positive" | "negative" | null;
  engagementActions: string[] | null;
  reportReason: string | null;
  postingSourceUrl?: string | null;
  postingTargetPlatforms?: SocialPlatform[] | null;
  status: OrderStatus;
  deadline: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  hoursUntilDeadline: number | null;
  isNearDeadline: boolean;
  progress: ProgressSummary;
};

export type UserListItem = {
  id: string;
  fullName: string;
  username: string;
  nip?: string | null;
  role?: Role;
  isCommander?: boolean;
  isLocked?: boolean;
  socialAccountCount?: number;
  unit: (UnitSummary & { joinedAt?: string }) | null;
  lastLoginAt?: string | null;
  createdAt?: string;
};

export type OrderDetail = Order & {
  targets: Array<{
    id: string;
    targetType: "unit" | "individual";
    resolvedMemberCount: number;
    unit: UnitSummary | null;
    user: Pick<UserListItem, "id" | "fullName" | "username"> | null;
  }>;
};

export type PlatformProofLink = {
  platform: SocialPlatform;
  url: string;
};

export type PostingCompleteness = "lengkap" | "sebagian";

export type Submission = {
  id?: string;
  driveLink?: string | null;
  platformLinks?: PlatformProofLink[] | null;
  postingCompleteness?: PostingCompleteness | null;
  missingPlatforms?: SocialPlatform[];
  notes: string | null;
  submittedAt: string;
  isLate?: boolean;
};

export type Assignment = {
  id: string;
  status: AssignmentStatus;
  assignedAt: string;
  completedAt: string | null;
  deadline?: string;
  user?: Pick<UserListItem, "id" | "fullName" | "username">;
  unit?: UnitSummary | null;
  order: {
    id: string;
    title: string;
    orderType: OrderType;
    description?: string;
    targetUrls?: OrderSocialTarget[];
    narration?: string | null;
    sentiment?: "positive" | "negative" | null;
    engagementActions?: string[] | null;
    reportReason?: string | null;
    postingSourceUrl?: string | null;
    postingTargetPlatforms?: SocialPlatform[] | null;
    status?: OrderStatus;
    deadline: string;
  };
  latestSubmission: Submission | null;
};

export type SocialAccount = {
  id: string;
  platform: SocialPlatform;
  username: string;
  profileUrl: string | null;
  notes: string | null;
  createdAt?: string;
};

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string | null;
  createdAt: string;
  readAt: string | null;
};

export type ActivityItem = {
  id: string;
  category: ActivityCategory;
  type: ActivityType;
  actor: {
    id: string | null;
    name: string;
    username: string | null;
  };
  title: string;
  description: string;
  href: string | null;
  occurredAt: string;
};

export type UserDetail = UserListItem & {
  socialAccounts: SocialAccount[];
  updatedAt?: string;
};

export type UnitNode = {
  id: string;
  name: string;
  description?: string | null;
  path: string;
  depthLevel: number;
  commander?: Pick<UserListItem, "id" | "fullName" | "username"> | null;
  directMembers?: Array<Pick<UserListItem, "id" | "fullName" | "username"> & { joinedAt?: string }>;
  children: UnitNode[];
};

export type UnitDetail = {
  id: string;
  name: string;
  description?: string | null;
  path: string;
  depthLevel: number;
  commander?: Pick<UserListItem, "id" | "fullName" | "username"> | null;
  parent?: { id: string; name: string } | null;
  members: Array<{
    id: string;
    fullName: string;
    username: string;
    role?: string;
    joinedAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type CommanderMemberDetail = {
  user: Pick<UserListItem, "id" | "fullName" | "username" | "nip" | "unit">;
  socialAccounts: SocialAccount[];
  assignmentSummary: {
    total: number;
    totalDone: number;
    totalLate: number;
    totalPending: number;
  };
  assignments: Assignment[];
};

export type DashboardAdmin = {
  stats: {
    totalUsers: number;
    totalUnits: number;
    totalOrders: number;
    totalSocialAccounts: number;
    lockedUsers: number;
  };
};

export type DashboardCommander = {
  stats: {
    totalActiveOrders: number;
    totalSubordinateMembers: number;
    totalPendingAssignments: number;
    totalCompletedAssignments: number;
  };
  activeOrders: Order[];
};

export type DashboardMember = {
  stats: {
    pendingAssignments: number;
    socialAccountCount: number;
  };
  recentAssignments: Assignment[];
};
