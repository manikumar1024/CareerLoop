// Curated, structured Communication Skills content for daily learning

export interface GrammarExercise {
  id: string;
  category: "tenses" | "prepositions" | "subject_verb" | "workplace_phrasing" | "active_passive";
  sentence: string; // The prompt or sentence with error / blank
  options: string[];
  correctIndex: number;
  explanation: string;
  rule: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  definition: string;
  workplaceExample: string;
  synonyms: string[];
  antonyms: string[];
  quizQuestion: string;
  quizOptions: string[];
  quizCorrectIndex: number;
}

export interface ReadingComprehension {
  id: string;
  title: string;
  topic: string;
  readTime: string;
  passage: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface WritingPrompt {
  id: string;
  scenario: string;
  prompt: string;
  targetRole: string;
  tone: "Professional Formal" | "Polite Request" | "Concise Update" | "Conflict Resolution";
  guidelines: string[];
  sampleGoodResponse: string;
}

export interface InterviewPrompt {
  id: string;
  category: "behavioral" | "situational" | "introduction" | "technical_communication";
  question: string;
  starFrameworkGuide: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  sampleAnswer: string;
}

// ─── GRAMMAR EXERCISES ───────────────────────────────────────────────
export const GRAMMAR_EXERCISES: GrammarExercise[] = [
  {
    id: "g1",
    category: "workplace_phrasing",
    sentence: "Choose the most professional way to follow up on an unanswered email sent last week:",
    options: [
      "Why didn't you reply to my email yet?",
      "I am following up on my previous email regarding the project timeline.",
      "Just reminding you to do your job and reply.",
      "Any update? Hello?"
    ],
    correctIndex: 1,
    explanation: "'I am following up on my previous email...' is polite, assertive, and standard business etiquette.",
    rule: "Use diplomatic and courteous framing when seeking status updates from colleagues or clients."
  },
  {
    id: "g2",
    category: "subject_verb",
    sentence: "Neither the team lead nor the developers ______ available for the sprint retrospective today.",
    options: ["is", "are", "was", "has been"],
    correctIndex: 1,
    explanation: "With 'neither... nor', the verb agrees with the closer subject ('the developers' is plural, so use 'are').",
    rule: "Proximity Rule: The verb agrees with the subject closest to it when connected by 'either... or' or 'neither... nor'."
  },
  {
    id: "g3",
    category: "prepositions",
    sentence: "The client requested that all deliverables be submitted ______ Friday, 5:00 PM EST.",
    options: ["until", "by", "in", "at"],
    correctIndex: 1,
    explanation: "'By' indicates a deadline (no later than the specified time), whereas 'until' would mean continuing up to that point.",
    rule: "Use 'by' for deadlines and 'until' for continuous duration up to a specific moment."
  },
  {
    id: "g4",
    category: "tenses",
    sentence: "Our engineering department ______ on microservice migration for over six months before the initial release.",
    options: ["had been working", "has been working", "is working", "worked"],
    correctIndex: 0,
    explanation: "Past Perfect Continuous ('had been working') expresses an action ongoing in the past before another past milestone ('before the release').",
    rule: "Use Past Perfect Continuous for continuous actions completed prior to another past event."
  },
  {
    id: "g5",
    category: "workplace_phrasing",
    sentence: "How should you politely express disagreement in an architecture review meeting?",
    options: [
      "That architecture is completely wrong and won't scale.",
      "I have a different perspective; perhaps we could evaluate the latency implications of that approach?",
      "You clearly didn't read the documentation.",
      "I don't like this idea at all."
    ],
    correctIndex: 1,
    explanation: "Phrasing disagreements as questions or alternative perspectives fosters productive collaboration without personal confrontation.",
    rule: "Constructive Disagreement: Critique the proposal with objective questions rather than making subjective or confrontational remarks."
  },
  {
    id: "g6",
    category: "active_passive",
    sentence: "Which sentence uses strong, concise active voice suitable for an executive summary?",
    options: [
      "The new pipeline was deployed by our team to reduce processing latency by 40%.",
      "Our team deployed the new pipeline, reducing processing latency by 40%.",
      "Latency of 40% was achieved when the pipeline was deployed by us.",
      "Deployment of the pipeline by the team resulted in latency reduction."
    ],
    correctIndex: 1,
    explanation: "Active voice puts the actor ('Our team') first and uses the direct action verb ('deployed'), making the sentence punchy and clear.",
    rule: "Active voice emphasizes the subject performing the action, increasing clarity and impact in executive reporting."
  }
];

// ─── VOCABULARY WORDS ────────────────────────────────────────────────
export const VOCABULARY_WORDS: VocabularyWord[] = [
  {
    id: "v1",
    word: "Leverage",
    partOfSpeech: "verb",
    phonetic: "/ˈlev.ər.ɪdʒ/",
    definition: "To utilize something to maximum advantage or strategic benefit.",
    workplaceExample: "We can leverage our cloud infrastructure to process batch analytics in near real-time.",
    synonyms: ["Utilize", "Harness", "Capitalize on", "Maximize"],
    antonyms: ["Ignore", "Squander", "Disregard"],
    quizQuestion: "Which sentence correctly uses the word 'leverage' in a business context?",
    quizOptions: [
      "We leveraged our strong customer relationships to launch the new beta program.",
      "She leverage the coffee before the meeting.",
      "The server leveraged down during maintenance.",
      "They had no leverage to type on the keyboard."
    ],
    quizCorrectIndex: 0
  },
  {
    id: "v2",
    word: "Mitigate",
    partOfSpeech: "verb",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    definition: "To make something less severe, serious, or painful; to minimize risk.",
    workplaceExample: "Implementing multi-factor authentication will mitigate the risk of unauthorized access.",
    synonyms: ["Alleviate", "Diminish", "Lessen", "Attenuate"],
    antonyms: ["Aggravate", "Exacerbate", "Intensify"],
    quizQuestion: "What is the best definition of 'mitigate' in a project risk log?",
    quizOptions: [
      "To escalate the issue to the executive team immediately.",
      "To take proactive actions that lessen the probability or impact of a potential risk.",
      "To ignore minor bugs until after launch.",
      "To increase project velocity at all costs."
    ],
    quizCorrectIndex: 1
  },
  {
    id: "v3",
    word: "Facilitate",
    partOfSpeech: "verb",
    phonetic: "/fəˈsɪl.ɪ.teɪt/",
    definition: "To make an action or process easy or easier; to guide a collaborative session.",
    workplaceExample: "The agile coach will facilitate the quarterly planning workshop across all squads.",
    synonyms: ["Enable", "Expedite", "Coordinate", "Streamline"],
    antonyms: ["Hinder", "Obstruct", "Impede"],
    quizQuestion: "Choose the synonym of 'facilitate':",
    quizOptions: ["Block", "Enable", "Complicate", "Postpone"],
    quizCorrectIndex: 1
  },
  {
    id: "v4",
    word: "Cohesive",
    partOfSpeech: "adjective",
    phonetic: "/koʊˈhiː.sɪv/",
    definition: "Characterized by being united, logical, and consistent as a unified whole.",
    workplaceExample: "The design system ensures all our customer-facing web apps have a cohesive visual identity.",
    synonyms: ["Unified", "Consistent", "Integrated", "Harmonious"],
    antonyms: ["Fragmented", "Disjointed", "Incoherent"],
    quizQuestion: "A 'cohesive team' is one that:",
    quizOptions: [
      "Works in complete silos with zero communication.",
      "Collaborates seamlessly with clear shared objectives and mutual trust.",
      "Disagrees on fundamental project goals constantly.",
      "Has members working in different timezones without overlap."
    ],
    quizCorrectIndex: 1
  },
  {
    id: "v5",
    word: "Paramount",
    partOfSpeech: "adjective",
    phonetic: "/ˈpær.ə.maʊnt/",
    definition: "More important than anything else; supreme in rank or significance.",
    workplaceExample: "User data privacy and encryption compliance are paramount to our security architecture.",
    synonyms: ["Crucial", "Foremost", "Essential", "Primary"],
    antonyms: ["Trivial", "Secondary", "Negligible"],
    quizQuestion: "Which of the following is synonymous with 'paramount'?",
    quizOptions: ["Superficial", "Primary", "Optional", "Temporary"],
    quizCorrectIndex: 1
  }
];

// ─── READING COMPREHENSION ──────────────────────────────────────────
export const READING_PASSAGES: ReadingComprehension[] = [
  {
    id: "r1",
    title: "Asynchronous Communication in Remote Engineering Teams",
    topic: "Modern Workplace Culture",
    readTime: "3 min read",
    passage: `As organizations shift toward distributed and global workforces, asynchronous communication has evolved from an occasional convenience into a foundational operational principle. Unlike synchronous communication—which demands simultaneous presence in real-time meetings or instant messaging channels—asynchronous collaboration empowers individuals to digest information, reflect deeply, and formulate thoughtful responses across differing timezones.

When implemented effectively, asynchronous communication eliminates the 'always-on' urgency that contributes significantly to cognitive fatigue and employee burnout. Team members can schedule dedicated deep-work blocks without the perpetual interruption of notification pings. Furthermore, written asynchronous updates naturally establish an auditable, transparent repository of project decisions and institutional knowledge.

However, asynchronous workflows require exceptional clarity in written communication. Ambiguous task descriptions or poorly phrased status reports result in multi-day clarification cycles. Successful remote teams cultivate explicit documentation standards: defining clear deadlines, stating expected response timeframes, and providing full context upfront to minimize back-and-forth friction.`,
    questions: [
      {
        question: "According to the passage, what is a primary cognitive benefit of asynchronous communication?",
        options: [
          "It forces team members to attend more sprint reviews.",
          "It eliminates the perpetual urgency of instant replies and protects dedicated deep-work time.",
          "It guarantees 100% bug-free software releases.",
          "It replaces all technical documentation with video meetings."
        ],
        correctIndex: 1,
        explanation: "The passage notes that asynchronous communication eliminates 'always-on' urgency and lets workers schedule uninterrupted deep-work blocks."
      },
      {
        question: "What is highlighted as a critical prerequisite for successful asynchronous collaboration?",
        options: [
          "Mandatory 24/7 online availability.",
          "High precision and explicit context in written documentation to prevent clarification delays.",
          "Elimination of all deadlines and delivery milestones.",
          "Using voice calls for every code change."
        ],
        correctIndex: 1,
        explanation: "The text emphasizes that ambiguous descriptions cause multi-day delays, making explicit written standards and clear context essential."
      },
      {
        question: "What secondary advantage does written asynchronous communication create for an organization?",
        options: [
          "Higher server hosting costs.",
          "A searchable, transparent repository of institutional knowledge and project decisions.",
          "Fewer software deployments per sprint.",
          "Slower overall company growth."
        ],
        correctIndex: 1,
        explanation: "The author explicitly states that written updates establish an auditable, transparent repository of project decisions."
      }
    ]
  }
];

// ─── WRITING PROMPTS ─────────────────────────────────────────────────
export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "w1",
    scenario: "Delivering a Project Delay Notice to Stakeholders",
    targetRole: "Project Lead / Engineer",
    tone: "Professional Formal",
    prompt: "Write an email to your client/manager informing them that the quarterly feature release will be delayed by 4 business days due to an unexpected third-party API deprecation. Maintain trust, explain the root cause concisely, share your mitigation plan, and provide the revised delivery date.",
    guidelines: [
      "Open with a direct, professional summary of the situation.",
      "Explain the technical or logistical reason without blaming external parties aggressively.",
      "Outline the specific actions your team is taking to resolve the issue.",
      "State the revised timeline and offer a follow-up briefing if desired."
    ],
    sampleGoodResponse: `Subject: Update: Revised Delivery Timeline for Q3 Feature Release

Dear Stakeholders,

I am writing to provide a transparent update regarding our Q3 feature release. 

During our final integration testing this week, we identified that our third-party payment gateway deprecated a legacy authentication endpoint earlier than scheduled. To ensure uninterrupted transaction security and complete regulatory compliance, our engineering team is actively upgrading to their v3 webhook specification.

To complete comprehensive regression testing, we have adjusted the target deployment date from October 15 to Friday, October 19, 2026.

Current Action Items:
1. Complete v3 endpoint migration (Target: Oct 17)
2. Security audit & end-to-end sandbox validation (Target: Oct 18)
3. Production cutover and release sign-off (Target: Oct 19, 10:00 AM EST)

We appreciate your understanding as we prioritize platform stability and security. Please let me know if you would like a brief 10-minute sync to review the revised testing artifacts.

Warm regards,
Alex Mercer | Lead Solutions Engineer`
  },
  {
    id: "w2",
    scenario: "Requesting Mentorship or Code Review from a Senior Colleague",
    targetRole: "Associate Developer / Trainee",
    tone: "Polite Request",
    prompt: "Write a Slack/Teams message to a Senior Principal Engineer requesting 15 minutes of their time to review an architectural blocker on your task. You have already tried two different approaches that failed.",
    guidelines: [
      "Respect their time and keep the message succinct.",
      "State what you are trying to accomplish.",
      "Summarize the 2 approaches you already tried and why they didn't work.",
      "Suggest flexible time slots or an asynchronous review option."
    ],
    sampleGoodResponse: `Hi Sarah! Hope you're having a productive week.

I'm currently working on the distributed cache invalidation task (JIRA-402) and have hit a concurrency blocker with cache stampedes. 

I've already tested:
1. Mutex locking at the application level (caused unacceptable thread contention).
2. Probabilistic early expiration (reduced load by 30%, but edge cases still breached SLA).

When you have a moment, could I get 15 minutes of your guidance, or would you prefer if I shared the PR branch for quick async feedback? I'm available anytime between 2:00 PM and 4:30 PM today that fits your schedule.

Thank you!
Priya`
  }
];

// ─── INTERVIEW PROMPTS ───────────────────────────────────────────────
export const INTERVIEW_PROMPTS: InterviewPrompt[] = [
  {
    id: "i1",
    category: "behavioral",
    question: "Tell me about a time you encountered a tight deadline or high-pressure situation. How did you prioritize and ensure delivery?",
    starFrameworkGuide: {
      situation: "Set the context: company, project stakes, and the specific constraint (e.g., critical launch in 48 hours).",
      task: "Identify your exact responsibility and what success looked like.",
      action: "Detail 2-3 specific steps you took (e.g., scoping MVP, delegating, aligning stakeholders, automated testing).",
      result: "Quantify the outcome (e.g., delivered on time, 0 high-severity bugs, earned client commendation)."
    },
    sampleAnswer: `Situation: During the Black Friday release at my previous company, a core payment integration failed 36 hours before launch during load testing.

Task: As the lead on checkout services, my responsibility was to diagnose the bottleneck and deliver a stable hotfix without delaying the commercial campaign.

Action: First, I led a rapid root-cause analysis identifying an unindexed database query during high-concurrency cart checks. Second, I scoped an immediate emergency optimization: creating a compound index and adding Redis read-replicas. Third, I organized a pair-programming review and automated 50,000 synthetic requests to validate latency stayed below 120ms.

Result: We successfully deployed the patch 12 hours ahead of the sale. The checkout engine handled a record 4.2M transactions over the weekend with 99.99% uptime and zero dropped orders.`
  },
  {
    id: "i2",
    category: "situational",
    question: "How do you handle receiving critical or negative feedback on your work from a peer or supervisor?",
    starFrameworkGuide: {
      situation: "Describe a real instance where someone gave you constructive criticism on a project or code review.",
      task: "Explain your initial reaction and your goal to turn the feedback into a growth opportunity.",
      action: "Explain how you listened actively, asked clarifying questions, and implemented their recommendations.",
      result: "Share the long-term impact on your skill level and your professional relationship with that colleague."
    },
    sampleAnswer: `Situation: Early in my career, a senior peer gave extensive feedback on my pull request, noting that my error-handling was too broad and lacked structured logging for production debugging.

Task: My goal was to objectively understand the operational standards expected by the team rather than feeling defensive.

Action: I scheduled a 15-minute pairing session with the reviewer to walk through our Sentry monitoring dashboards and see firsthand how structured logging helps on-call engineers. I refactored the module with custom domain error classes and standard JSON telemetry.

Result: Not only did the PR get approved with praise, but I also created a reusable error-handling template that our team adopted across three other microservices.`
  }
];
