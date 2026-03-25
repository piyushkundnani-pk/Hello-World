// ────────────────────────────────────────────────────────────────────────────
// PM SkillForge — Core TypeScript Types
// ────────────────────────────────────────────────────────────────────────────

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director';
export type Domain = 'B2B SaaS' | 'B2C' | 'Marketplace' | 'FinTech' | 'HealthTech' | 'EdTech' | 'HR Tech' | 'E-commerce' | 'AI/ML' | 'Other';
export type SkillStatus = 'advantage' | 'on_track' | 'needs_work' | 'critical_gap';
export type TaskType = 'reading' | 'practice' | 'project' | 'reflection';
export type ResourceType = 'book' | 'course' | 'article' | 'video' | 'podcast' | 'template';
export type AssessmentType = 'quick' | 'deep' | 'interview' | 'targeted';

export interface SkillScores {
  product_discovery: number;
  execution_delivery: number;
  metrics_analytics: number;
  technical_acumen: number;
  stakeholder_leadership: number;
  domain_expertise: number;
}

// ── Resume Types ──────────────────────────────────────────────────────────────
export interface ParsedResume {
  candidate_name: string;
  current_role: string;
  years_of_experience: {
    total: number;
    in_product_management: number;
    in_engineering: number;
    in_related_roles: number;
  };
  seniority_level: SeniorityLevel;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    relevance: string;
  }>;
  certifications: string[];
  domains_worked_in: string[];
  companies_worked_at: Array<{
    name: string;
    type: 'startup' | 'mid' | 'enterprise';
    industry: string;
  }>;
  pm_skills_demonstrated: {
    product_discovery: { evidence: string[]; estimated_level: number };
    execution_delivery: { evidence: string[]; estimated_level: number };
    metrics_analytics: { evidence: string[]; estimated_level: number };
    technical_acumen: { evidence: string[]; estimated_level: number };
    stakeholder_leadership: { evidence: string[]; estimated_level: number };
    domain_expertise: { evidence: string[]; estimated_level: number };
  };
  key_projects: Array<{
    name: string;
    description: string;
    skills_demonstrated: string[];
    impact_metrics: string[];
    role_clarity: 'owned' | 'contributed' | 'supported';
  }>;
  tools_mentioned: string[];
  frameworks_mentioned: string[];
  transition_indicator: {
    is_transitioning: boolean;
    from_role: string;
    transition_strengths: string[];
    transition_gaps: string[];
  };
  resume_quality_score: number;
  recruiter_notes: string;
}

// ── Job Posting Types ─────────────────────────────────────────────────────────
export interface ParsedJobPosting {
  job_title: string;
  company: string;
  seniority_level: SeniorityLevel;
  location: string;
  compensation_range: string;
  domain: string;
  platform_type: string;
  required_skills: Array<{
    skill_id: string;
    skill_name: string;
    importance: 'must_have' | 'strong_preference' | 'nice_to_have';
    evidence_from_jd: string;
    minimum_level_needed: number;
    weight_in_evaluation: number;
  }>;
  implicit_skills: Array<{
    skill_id: string;
    skill_name: string;
    reason: string;
  }>;
  technical_requirements: {
    languages_tools: string[];
    ai_ml_needed: boolean;
    system_design_depth: 'basic' | 'moderate' | 'deep';
    data_skills: 'basic' | 'intermediate' | 'advanced';
  };
  culture_signals: {
    pace: string;
    autonomy_level: string;
    collaboration_style: string;
    key_phrases: string[];
  };
  interview_likely_topics: Array<{
    topic: string;
    probability: 'high' | 'medium' | 'low';
    format: string;
  }>;
  red_flags_for_candidate: string[];
  opportunity_signals: string[];
  evaluation_weights: SkillScores;
}

// ── Assessment Types ──────────────────────────────────────────────────────────
export interface MCQOption {
  label: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface MCQQuestion {
  id: string;
  type: 'mcq';
  difficulty: 1 | 2 | 3 | 4;
  skills_tested: string[];
  domain_relevance: 'high' | 'medium' | 'low';
  scenario: string;
  question: string;
  options: MCQOption[];
  overall_explanation: string;
  common_mistake: string;
  pro_tip: string;
}

export interface OpenEndedQuestion {
  id: string;
  type: 'open_ended';
  question_type: 'behavioral' | 'product_sense' | 'analytical' | 'strategic';
  difficulty: 1 | 2 | 3 | 4;
  skills_tested: string[];
  question: string;
  context?: string;
  what_great_looks_like: string;
  evaluation_criteria: {
    structure: string;
    depth: string;
    specificity: string;
    trade_off_awareness: string;
    user_centricity: string;
    feasibility: string;
  };
  time_suggested_minutes: number;
  follow_up_probes: string[];
}

export type AssessmentQuestion = MCQQuestion | OpenEndedQuestion;

export interface MCQEvaluation {
  is_correct: boolean;
  selected_explanation: string;
  correct_answer: string;
  correct_explanation: string;
  score: number;
  overall_explanation: string;
  common_mistake: string;
  pro_tip: string;
}

export interface OpenEndedEvaluation {
  scores: {
    structure: number;
    depth: number;
    specificity: number;
    trade_off_awareness: number;
    user_centricity: number;
    feasibility: number;
    weighted_total: number;
  };
  skills_demonstrated: string[];
  skills_missing: string[];
  proficiency_assessment: {
    demonstrated_level: number;
    target_level_for_role: number;
    gap: number;
  };
  detailed_feedback: {
    what_you_did_well: string;
    what_was_missing: string;
    what_a_great_answer_includes: string;
    example_of_excellent_response_snippet: string;
  };
  recruiter_signal: 'Yes' | 'Maybe' | 'No';
}

// ── Assessment Session ────────────────────────────────────────────────────────
export interface QuestionResponse {
  question_id: string;
  question: AssessmentQuestion;
  answer: string;
  evaluation?: MCQEvaluation | OpenEndedEvaluation;
  time_taken_seconds: number;
}

export interface AssessmentSession {
  session_id: string;
  type: AssessmentType;
  mcqs: MCQQuestion[];
  open_ended: OpenEndedQuestion[];
  responses: QuestionResponse[];
  total_questions: number;
  estimated_minutes: number;
  started_at: string;
  completed_at?: string;
}

// ── Gap Analysis ──────────────────────────────────────────────────────────────
export interface SkillBreakdown {
  skill_category: string;
  skill_key: string;
  candidate_level: number;
  required_level: number;
  gap: number;
  status: SkillStatus;
  evidence_from_assessment: string;
  evidence_from_resume: string;
  sub_skills: Array<{
    name: string;
    candidate_level: number;
    required_level: number;
    gap: number;
    specific_feedback: string;
  }>;
}

export interface GapAnalysis {
  overall_match_score: number;
  overall_match_label: string;
  skill_breakdown: SkillBreakdown[];
  advantages: Array<{
    skill: string;
    why_its_an_advantage: string;
    how_to_leverage_in_interview: string;
  }>;
  critical_gaps: Array<{
    skill: string;
    current_level: number;
    needed_level: number;
    gap_severity: 'critical' | 'moderate' | 'minor';
    why_it_matters_for_this_role: string;
    can_be_closed_quickly: boolean;
    estimated_time_to_close: string;
  }>;
  interview_readiness: {
    ready_in: string;
    biggest_risk_in_interview: string;
    strongest_card_to_play: string;
    recommended_narrative: string;
  };
}

// ── Study Plan ────────────────────────────────────────────────────────────────
export interface StudyTask {
  day: number;
  task: string;
  time_minutes: number;
  skill_targeted: string;
  task_type: TaskType;
}

export interface StudyPhase {
  phase_name: string;
  duration: string;
  focus_skills: string[];
  daily_tasks: StudyTask[];
}

export interface StudyResource {
  skill_gap: string;
  resource_type: ResourceType;
  title: string;
  author_source: string;
  why_recommended: string;
  time_commitment: string;
  priority: 'essential' | 'recommended' | 'bonus';
}

export interface StudyPlan {
  title: string;
  total_duration: string;
  weekly_commitment: string;
  focus_areas: string[];
  phases: StudyPhase[];
  resources: StudyResource[];
  practice_exercises: Array<{
    skill: string;
    exercise: string;
    evaluation_criteria: string;
    time_limit: string;
    difficulty: string;
  }>;
  milestone_checks: Array<{
    after: string;
    self_assessment: string;
    expected_improvement: string;
  }>;
}

// ── App-level State ───────────────────────────────────────────────────────────
export interface AppState {
  // Candidate
  resumeText: string;
  parsedResume: ParsedResume | null;

  // Job
  jobText: string;
  parsedJob: ParsedJobPosting | null;

  // Assessment
  currentSession: AssessmentSession | null;
  sessionHistory: AssessmentSession[];

  // Results
  gapAnalysis: GapAnalysis | null;
  studyPlan: StudyPlan | null;

  // UI
  isLoading: boolean;
  error: string | null;
}
