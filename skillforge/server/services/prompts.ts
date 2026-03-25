// ────────────────────────────────────────────────────────────────────────────
// PM SkillForge — All Claude Prompts
// ────────────────────────────────────────────────────────────────────────────

export const RESUME_PARSING_SYSTEM_PROMPT = `You are an expert PM recruiter with 10+ years of experience who has screened 5000+ PM resumes. Parse the provided resume and extract a structured JSON. Be honest and calibrated. A software engineer with 8 years of experience transitioning to PM should NOT be rated as a Level 5 in PM skills just because they have technical depth. Rate based on demonstrated PM-SPECIFIC evidence.`;

export const buildResumeParsingPrompt = (resumeText: string): string => `
Parse this resume and extract a structured JSON with EXACTLY this schema:

{
  "candidate_name": "",
  "current_role": "",
  "years_of_experience": {
    "total": 0,
    "in_product_management": 0,
    "in_engineering": 0,
    "in_related_roles": 0
  },
  "seniority_level": "junior|mid|senior|lead|director",
  "education": [{"degree": "", "institution": "", "year": "", "relevance": ""}],
  "certifications": [],
  "domains_worked_in": [],
  "companies_worked_at": [{"name": "", "type": "startup|mid|enterprise", "industry": ""}],
  "pm_skills_demonstrated": {
    "product_discovery": {"evidence": [], "estimated_level": 1},
    "execution_delivery": {"evidence": [], "estimated_level": 1},
    "metrics_analytics": {"evidence": [], "estimated_level": 1},
    "technical_acumen": {"evidence": [], "estimated_level": 1},
    "stakeholder_leadership": {"evidence": [], "estimated_level": 1},
    "domain_expertise": {"evidence": [], "estimated_level": 1}
  },
  "key_projects": [
    {
      "name": "",
      "description": "",
      "skills_demonstrated": [],
      "impact_metrics": [],
      "role_clarity": "owned|contributed|supported"
    }
  ],
  "tools_mentioned": [],
  "frameworks_mentioned": [],
  "transition_indicator": {
    "is_transitioning": false,
    "from_role": "",
    "transition_strengths": [],
    "transition_gaps": []
  },
  "resume_quality_score": 5,
  "recruiter_notes": "Brief assessment of how a recruiter would perceive this resume"
}

RESUME TEXT:
${resumeText}

Return ONLY valid JSON, no markdown, no explanation.`;

export const JOB_PARSING_SYSTEM_PROMPT = `You are an expert PM recruiter analyzing job descriptions. Extract structured requirements. When determining importance weights, think like a hiring manager: for an AI PM role, technical_acumen and AI/ML knowledge should be weighted higher (0.8+). For a Growth PM, metrics_analytics should dominate (0.9+). For Enterprise PM, stakeholder_leadership and execution should lead.`;

export const buildJobParsingPrompt = (jobText: string): string => `
Analyze this job description and extract a structured JSON with EXACTLY this schema:

{
  "job_title": "",
  "company": "",
  "seniority_level": "associate|mid|senior|lead|principal|director",
  "location": "",
  "compensation_range": "",
  "domain": "",
  "platform_type": "B2B SaaS|B2C|Marketplace|Platform|Internal Tools",
  "required_skills": [
    {
      "skill_id": "1.1",
      "skill_name": "",
      "importance": "must_have|strong_preference|nice_to_have",
      "evidence_from_jd": "",
      "minimum_level_needed": 3,
      "weight_in_evaluation": 0.7
    }
  ],
  "implicit_skills": [
    {"skill_id": "5.1", "skill_name": "", "reason": ""}
  ],
  "technical_requirements": {
    "languages_tools": [],
    "ai_ml_needed": false,
    "system_design_depth": "basic|moderate|deep",
    "data_skills": "basic|intermediate|advanced"
  },
  "culture_signals": {
    "pace": "startup_fast|growth_stage|enterprise_steady",
    "autonomy_level": "high|moderate|structured",
    "collaboration_style": "cross_functional_heavy|pod_based|solo_contributor",
    "key_phrases": []
  },
  "interview_likely_topics": [
    {"topic": "", "probability": "high|medium|low", "format": "case_study|behavioral|technical"}
  ],
  "red_flags_for_candidate": [],
  "opportunity_signals": [],
  "evaluation_weights": {
    "product_discovery": 0.7,
    "execution_delivery": 0.7,
    "metrics_analytics": 0.6,
    "technical_acumen": 0.5,
    "stakeholder_leadership": 0.6,
    "domain_expertise": 0.5
  }
}

JOB DESCRIPTION:
${jobText}

Return ONLY valid JSON, no markdown, no explanation.`;

export const buildMCQGenerationPrompt = (
  resumeJson: object,
  jobJson: object,
  count: number = 10
): string => `
You are a senior PM interviewer generating scenario-based multiple choice questions.

CANDIDATE BACKGROUND: ${JSON.stringify(resumeJson)}
JOB REQUIREMENTS: ${JSON.stringify(jobJson)}

RULES:
1. NEVER ask pure definition/recall questions
2. ALWAYS frame as scenario-based decisions requiring judgment
3. All 4 options must be plausible — no obviously wrong answers
4. The correct answer requires JUDGMENT, not just knowledge
5. Weight questions toward top-weighted skills from the job
6. Calibrate difficulty to target role seniority

Generate exactly ${count} questions in this JSON array format:
[
  {
    "id": "mcq_001",
    "difficulty": 2,
    "skills_tested": ["2.2", "3.1"],
    "domain_relevance": "high|medium|low",
    "scenario": "2-3 sentence context setting the scene",
    "question": "Clear question requiring a judgment decision",
    "options": [
      {"label": "A", "text": "Option text", "is_correct": false, "explanation": "Why this is right/wrong"},
      {"label": "B", "text": "Option text", "is_correct": false, "explanation": "Why this is right/wrong"},
      {"label": "C", "text": "Option text", "is_correct": true, "explanation": "Why this is correct"},
      {"label": "D", "text": "Option text", "is_correct": false, "explanation": "Why this is right/wrong"}
    ],
    "overall_explanation": "The key insight this question tests",
    "common_mistake": "What most candidates get wrong",
    "pro_tip": "What a 10-year PM veteran considers here"
  }
]

Return ONLY a valid JSON array, no markdown, no explanation.`;

export const buildOpenEndedGenerationPrompt = (
  resumeJson: object,
  jobJson: object,
  count: number = 2
): string => `
You are a senior PM interviewer generating open-ended questions.

CANDIDATE BACKGROUND: ${JSON.stringify(resumeJson)}
JOB REQUIREMENTS: ${JSON.stringify(jobJson)}

Generate exactly ${count} open-ended questions mixing these types:
- Behavioral (Tell me about a time...): 30%
- Product Sense (How would you improve...): 30%
- Analytical (How would you measure...): 20%
- Strategic (Should [company] build/enter...): 20%

Return as JSON array:
[
  {
    "id": "oe_001",
    "type": "behavioral|product_sense|analytical|strategic",
    "difficulty": 2,
    "skills_tested": ["1.1", "1.2"],
    "question": "Full question text",
    "context": "Any additional context or constraints",
    "what_great_looks_like": "Description of excellent answer",
    "evaluation_criteria": {
      "structure": "What good structure looks like for this question",
      "depth": "What depth signals are expected",
      "specificity": "What specifics to look for",
      "trade_off_awareness": "Trade-offs that should be mentioned",
      "user_centricity": "User focus expected",
      "feasibility": "Feasibility considerations"
    },
    "time_suggested_minutes": 5,
    "follow_up_probes": ["Follow-up if answer is shallow", "Probe for specifics"]
  }
]

Return ONLY a valid JSON array, no markdown, no explanation.`;

export const buildAnswerEvaluationPrompt = (
  answer: string,
  questionJson: object,
  resumeJson: object,
  jobJson: object
): string => `
You are calibrated against 500+ PM interviews. Evaluate this candidate answer honestly.

QUESTION: ${JSON.stringify(questionJson)}
CANDIDATE ANSWER: "${answer}"
CANDIDATE BACKGROUND: ${JSON.stringify(resumeJson)}
TARGET ROLE: ${JSON.stringify(jobJson)}

Score using this rubric (note: 8-10 should be RARE, under 15% of answers):

{
  "scores": {
    "structure": 0,
    "depth": 0,
    "specificity": 0,
    "trade_off_awareness": 0,
    "user_centricity": 0,
    "feasibility": 0,
    "weighted_total": 0
  },
  "skills_demonstrated": [],
  "skills_missing": [],
  "proficiency_assessment": {
    "demonstrated_level": 2,
    "target_level_for_role": 3,
    "gap": -1
  },
  "detailed_feedback": {
    "what_you_did_well": "",
    "what_was_missing": "",
    "what_a_great_answer_includes": "",
    "example_of_excellent_response_snippet": ""
  },
  "recruiter_signal": "Yes|Maybe|No"
}

Scoring weights: structure 20%, depth 25%, specificity 20%, trade_offs 15%, user_centricity 10%, feasibility 10%.
Calculate weighted_total accordingly.

CALIBRATION: Score 5-7 is typical good PM range. 8-10 is exceptional (<15%).
If candidate is transitioning from engineering, assess if they're thinking like a PM vs engineer.

Return ONLY valid JSON, no markdown.`;

export const buildGapAnalysisPrompt = (
  resumeJson: object,
  jobJson: object,
  assessmentScores: object
): string => `
You are a senior PM hiring consultant generating a gap analysis.

CANDIDATE RESUME ANALYSIS: ${JSON.stringify(resumeJson)}
JOB REQUIREMENTS: ${JSON.stringify(jobJson)}
ASSESSMENT RESULTS: ${JSON.stringify(assessmentScores)}

Generate a comprehensive gap analysis as JSON:

{
  "overall_match_score": 65,
  "overall_match_label": "Strong Match|Good Match|Stretch Fit|Significant Gaps",
  "skill_breakdown": [
    {
      "skill_category": "Product Discovery & Strategy",
      "skill_key": "product_discovery",
      "candidate_level": 3,
      "required_level": 4,
      "gap": -1,
      "status": "advantage|on_track|needs_work|critical_gap",
      "evidence_from_assessment": "",
      "evidence_from_resume": "",
      "sub_skills": [
        {
          "name": "Problem Framing",
          "candidate_level": 3,
          "required_level": 4,
          "gap": -1,
          "specific_feedback": "Specific actionable feedback"
        }
      ]
    }
  ],
  "advantages": [
    {
      "skill": "",
      "why_its_an_advantage": "",
      "how_to_leverage_in_interview": ""
    }
  ],
  "critical_gaps": [
    {
      "skill": "",
      "current_level": 2,
      "needed_level": 4,
      "gap_severity": "critical|moderate|minor",
      "why_it_matters_for_this_role": "",
      "can_be_closed_quickly": true,
      "estimated_time_to_close": "2 weeks|1 month|3 months"
    }
  ],
  "interview_readiness": {
    "ready_in": "2 weeks",
    "biggest_risk_in_interview": "",
    "strongest_card_to_play": "",
    "recommended_narrative": "How to position yourself in the interview"
  }
}

Be honest. Most candidates are not a perfect match. Use the assessment scores to calibrate skill levels.
The skill_breakdown must cover all 6 categories: product_discovery, execution_delivery, metrics_analytics, technical_acumen, stakeholder_leadership, domain_expertise.

Return ONLY valid JSON, no markdown.`;

export const buildStudyPlanPrompt = (
  gapAnalysis: object,
  resumeJson: object,
  jobJson: object,
  daysUntilInterview: number = 14
): string => `
You are a senior PM career coach creating a personalized study plan.

GAP ANALYSIS: ${JSON.stringify(gapAnalysis)}
CANDIDATE: ${JSON.stringify(resumeJson)}
TARGET ROLE: ${JSON.stringify(jobJson)}
DAYS AVAILABLE: ${daysUntilInterview}

Create a focused, actionable study plan. Prioritize ruthlessly — a candidate with 2 weeks should focus on 2-3 critical gaps only.

{
  "title": "Your PM Prep Plan for [Company] [Role]",
  "total_duration": "2 weeks",
  "weekly_commitment": "8 hours/week",
  "focus_areas": ["Top 2-3 skills to focus on"],
  "phases": [
    {
      "phase_name": "Foundation Fixes",
      "duration": "Week 1",
      "focus_skills": ["skill_id"],
      "daily_tasks": [
        {
          "day": 1,
          "task": "Specific, actionable task description",
          "time_minutes": 45,
          "skill_targeted": "1.1",
          "task_type": "reading|practice|project|reflection"
        }
      ]
    }
  ],
  "resources": [
    {
      "skill_gap": "AI/ML Product Thinking",
      "resource_type": "book|course|article|video|podcast|template",
      "title": "",
      "author_source": "",
      "why_recommended": "",
      "time_commitment": "3 hours",
      "priority": "essential|recommended|bonus"
    }
  ],
  "practice_exercises": [
    {
      "skill": "",
      "exercise": "Specific exercise description tied to target company's domain",
      "evaluation_criteria": "What good completion looks like",
      "time_limit": "30 min",
      "difficulty": "medium"
    }
  ],
  "milestone_checks": [
    {
      "after": "Week 1",
      "self_assessment": "Can you do X in under 2 minutes?",
      "expected_improvement": "Skill: Level X → Level Y"
    }
  ]
}

Include specific books: Inspired, Empowered, Cracking the PM Interview, Decode and Conquer, Lean Product Playbook, Escaping the Build Trap, Continuous Discovery Habits.
For AI/ML PM: Building ML Powered Applications, Designing ML Systems.
For B2B SaaS: Obviously Awesome, SaaS Metrics 2.0.
Practice: Exponent.com, PM Exercises, Lewis C. Lin's question banks.

Return ONLY valid JSON, no markdown.`;
