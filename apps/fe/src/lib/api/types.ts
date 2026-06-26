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
export type Gender = "pria" | "wanita";
export type EmploymentType = "tni" | "pns" | "p3k";
export type Religion = "islam" | "kristen_protestan" | "katolik" | "hindu" | "buddha" | "konghucu";
export type OrderType = "posting" | "engagement" | "blasting" | "counter" | "report_akun";
export type OrderStatus = "draft" | "aktif" | "selesai" | "expired" | "dibatalkan";
export type AssignmentStatus = "belum_dikerjakan" | "selesai" | "terlambat";
export type SocialPlatform = "instagram" | "twitter_x" | "facebook" | "tiktok" | "youtube" | "other";
export type OrderTargetAudience = "all_members" | "unit_leaders" | "direct_user";

export type OrderSocialTarget = {
  id?: string;
  platform: SocialPlatform;
  url: string;
  baselineMetrics?: SubmissionMetrics;
  finalMetrics?: SubmissionMetrics;
  baselineScrapedAt?: string | null;
  finalScrapedAt?: string | null;
};

export type MetricScrapeStatus = "pending" | "running" | "succeeded" | "failed";

export type ApifyActorsConfig = {
  instagram?: string;
  twitter_x?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  other?: string;
};

export type SystemSettings = {
  apifyApiToken: string | null;
  apifyWebhookSecret: string | null;
  hasApifyApiToken: boolean;
  hasApifyWebhookSecret: boolean;
  encryptionKeyConfigured: boolean;
  secretsDecryptable: boolean;
  apifyActors: ApifyActorsConfig;
  updatedAt: string;
};

export type BlastingMetricsDashboardTarget = {
  targetId: string;
  platform: SocialPlatform;
  url: string;
  baselineMetrics: SubmissionMetrics;
  personnelMetrics: SubmissionMetrics;
  accumulatedMetrics: SubmissionMetrics;
  finalMetrics: SubmissionMetrics;
  baselineScrapedAt: string | null;
  finalScrapedAt: string | null;
  deltaMetrics: SubmissionMetrics;
  growthPercent: SubmissionMetrics;
  scrapeRuns: Array<{
    phase: "baseline" | "deadline";
    status: MetricScrapeStatus;
    errorMessage: string | null;
    completedAt: string | null;
  }>;
};

export type BlastingMetricsDashboard = {
  orderId: string;
  status: OrderStatus;
  deadline: string;
  scrapeStatus: {
    baseline: MetricScrapeStatus;
    deadline: MetricScrapeStatus;
  };
  targets: BlastingMetricsDashboardTarget[];
  totals: {
    baseline: SubmissionMetrics;
    personnel: SubmissionMetrics;
    accumulated: SubmissionMetrics;
    final: SubmissionMetrics;
    delta: SubmissionMetrics;
    growthPercent: SubmissionMetrics;
  };
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
  identityNumber: string | null;
  gender: Gender | null;
  employmentType: EmploymentType | null;
  rank: string | null;
  grade: string | null;
  religion: Religion | null;
  phoneNumber: string | null;
  role: Role;
  isCommander: boolean;
  unit: (UnitSummary & { depthLevel: number }) | null;
  commandingUnits?: UnitSummary[];
  socialAccountCount: number;
  lastLoginAt: string | null;
  createdAt: string;
};

export type SubmissionMetrics = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
};

export type TargetMetricEntry = {
  targetId: string;
  platform: SocialPlatform;
  url: string;
  baselineMetrics?: SubmissionMetrics;
  /** Input inkremental personel (per submission atau agregat). */
  metrics: SubmissionMetrics;
  accumulatedMetrics?: SubmissionMetrics;
  deltaMetrics?: SubmissionMetrics;
};

export type TargetMetricTotal = TargetMetricEntry & {
  accumulatedMetrics: SubmissionMetrics;
};

export type ProgressSummary = {
  totalAssigned: number;
  totalSubmitted: number;
  totalOnTime: number;
  totalLate: number;
  totalPending: number;
  percentageComplete: number;
  metricTotals: SubmissionMetrics;
  baselineMetricTotals?: SubmissionMetrics;
  deltaMetricTotals?: SubmissionMetrics;
  accumulatedMetricTotals?: SubmissionMetrics;
  targetMetricTotals?: TargetMetricTotal[];
};

export type Order = {
  id: string;
  title: string;
  orderType: OrderType;
  description: string;
  targetUrls: OrderSocialTarget[];
  narration: string | null;
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
  identityNumber?: string | null;
  gender?: Gender | null;
  employmentType?: EmploymentType | null;
  rank?: string | null;
  grade?: string | null;
  religion?: Religion | null;
  phoneNumber?: string | null;
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
    targetAudience: OrderTargetAudience;
    resolvedMemberCount: number;
    unit: UnitSummary | null;
    user: Pick<UserListItem, "id" | "fullName" | "username"> | null;
  }>;
};

export type OrderProgressByUnit = {
  summary: ProgressSummary;
  units: Array<{
    unit: UnitSummary & {
      depthLevel: number;
      commander: Pick<UserListItem, "id" | "fullName" | "username"> | null;
    };
    progress: ProgressSummary;
    members: Assignment[];
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
  targetMetrics?: TargetMetricEntry[] | null;
  metrics: SubmissionMetrics;
  submissionSource?: "self" | "pimpinan" | "represented" | string;
  submittedBy?: Pick<UserListItem, "id" | "fullName" | "username"> | null;
  isRepresented?: boolean;
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
    engagementActions?: string[] | null;
    reportReason?: string | null;
    postingSourceUrl?: string | null;
    postingTargetPlatforms?: SocialPlatform[] | null;
    status?: OrderStatus;
    deadline: string;
  };
  latestSubmission: Submission | null;
  canSubmitForMember?: boolean;
};

export type BulkSubmissionAssignment = {
  id: string;
  userId: string;
  status: AssignmentStatus;
  user: Pick<UserListItem, "id" | "fullName" | "username">;
  canSubmitForMember: boolean;
  latestSubmission: Submission | null;
};

export type BulkSubmissionList = {
  order: {
    id: string;
    title: string;
    status: OrderStatus;
    deadline: string;
    postingTargetPlatforms: SocialPlatform[] | null;
  };
  isLocked: boolean;
  assignments: BulkSubmissionAssignment[];
};

export type BulkSubmissionRequest = {
  submissions: Array<{
    assignmentId: string;
    userId: string;
    rawLinks: string;
    notes?: string;
  }>;
};

export type BulkSubmissionResultItem = {
  assignmentId: string;
  userId: string;
  status: "submitted" | "skipped" | "error";
  reason?: string;
  parsedLinks?: PlatformProofLink[];
};

export type BulkSubmissionResponse = {
  success: boolean;
  totalSubmitted: number;
  totalSkipped: number;
  results: BulkSubmissionResultItem[];
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
  leaderOnlyAssignments: boolean;
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
  leaderOnlyAssignments: boolean;
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
  user: Pick<
    UserListItem,
    | "id"
    | "fullName"
    | "username"
    | "identityNumber"
    | "gender"
    | "employmentType"
    | "rank"
    | "grade"
    | "religion"
    | "phoneNumber"
    | "unit"
  >;
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

export type DashboardCommanderFilters = {
  period: "7d" | "30d" | "90d" | "all" | null;
  dateFrom: string | null;
  dateTo: string | null;
  status: OrderStatus | null;
  orderType: OrderType | null;
  deadlineFrom: string | null;
  deadlineTo: string | null;
};

export type DashboardCommanderCharts = {
  overallProgress: {
    totalAssigned: number;
    totalSubmitted: number;
    totalPending: number;
    totalLate: number;
    percentageComplete: number;
  };
  assignmentStatus: {
    submitted: number;
    pending: number;
    late: number;
  };
  orderStatus: {
    draft: number;
    aktif: number;
    selesai: number;
    expired: number;
    dibatalkan: number;
  };
  taskStatus: {
    running: number;
    completed: number;
  };
  orderType: {
    posting: number;
    blasting: number;
    counter: number;
    report_akun: number;
  };
  progressDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  weeklyOrders: Array<{
    label: string;
    posting: number;
    blasting: number;
    counter: number;
    report_akun: number;
    total: number;
  }>;
};

export type DashboardCommander = {
  filters: DashboardCommanderFilters;
  stats: {
    totalOrders: number;
    totalSubordinateMembers: number;
    totalExecutedOrders: number;
    totalRunningOrders: number;
    needsAttentionCount: number;
    totalCompletedOrders: number;
  };
  charts: DashboardCommanderCharts;
  activeOrders: Order[];
};

export type CommandTaskChartsData = {
  taskStatus: {
    running: number;
    completed: number;
  };
  orderType: {
    posting: number;
    blasting: number;
    counter: number;
    report_akun: number;
  };
  progressDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  weeklyOrders: Array<{
    label: string;
    posting: number;
    blasting: number;
    counter: number;
    report_akun: number;
    total: number;
  }>;
};

export type OrdersSummary = {
  stats: {
    total: number;
    aktif: number;
    draft: number;
    selesai: number;
    expired: number;
  };
  charts: CommandTaskChartsData;
};

export type DashboardMember = {
  stats: {
    pendingAssignments: number;
    socialAccountCount: number;
  };
  recentAssignments: Assignment[];
};
