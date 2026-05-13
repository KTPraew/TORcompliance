export type ProjectStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  score: number;
  checklistCount: number;
  passedCount: number;
  failedCount?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;
  torFileName?: string;
  uiFileName?: string;
  imageUrl?: string;
  category?: string;
}

export type ChecklistStatus = "pass" | "fail" | "review" | "pending";
export type ChecklistCategory = "Accessibility" | "Policy" | "Technical" | "Content";

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  standard: string;
  title: string;
  description: string;
  required: boolean;
  status: ChecklistStatus;
  suggestion?: string;
  severity?: "critical" | "major" | "minor" | "info";
  wcagLevel?: "A" | "AA" | "AAA";
}

export interface ComplianceIssue {
  id: string;
  checklistItemId: string;
  title: string;
  description: string;
  severity: "critical" | "major" | "minor" | "info";
  suggestion: string;
  category: ChecklistCategory;
  standard: string;
  screenshot?: string;
  element?: string;
}

export interface CategoryScore {
  category: ChecklistCategory;
  score: number;
  passed: number;
  failed: number;
  review: number;
  total: number;
}

export interface ComplianceResult {
  projectId: string;
  overallScore: number;
  analyzedAt: string;
  categoryScores: CategoryScore[];
  issues: ComplianceIssue[];
  checklist: ChecklistItem[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    review: number;
  };
}

export interface TORAnalysisResult {
  projectId: string;
  checklist: ChecklistItem[];
  detectedStandards: string[];
  projectType: string;
  analysisNotes: string;
}

export interface UIAnalysisResult {
  projectId: string;
  complianceResult: ComplianceResult;
  analyzedImageUrl?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface DashboardStats {
  totalProjects: number;
  checklistsAnalyzed: number;
  avgComplianceScore: number;
  reportsGenerated: number;
}
