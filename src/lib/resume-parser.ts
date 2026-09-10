// src/lib/resume-parser.ts
// Abstracted Resume Parsing Service with Local Heuristic Fallback & Gemini AI Enrichment

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  education?: {
    degree?: string;
    institution?: string;
    graduationYear?: string;
    level?: string;
  };
  skills: Array<{
    name: string;
    category?: "Technical" | "Soft Skill" | "Domain";
    proficiencyLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }>;
  projects: Array<{
    title: string;
    description?: string;
    techStack?: string;
  }>;
  certifications: string[];
  careerGoal?: string;
  rawSummary?: string;
}

export interface IResumeParserProvider {
  parse(buffer: Buffer, fileName: string, mimeType: string): Promise<ParsedResumeData>;
}

// Master Skill Taxonomy reference for fast heuristic matching
const KNOWN_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "Python",
  "Django", "Flask", "Java", "Spring Boot", "C++", "C#", ".NET", "SQL", "PostgreSQL",
  "MySQL", "MongoDB", "Redis", "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Git",
  "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "REST APIs",
  "GraphQL", "Microservices", "CI/CD", "Machine Learning", "Data Analysis", "Pandas",
  "NumPy", "TensorFlow", "PyTorch", "Tableau", "Power BI", "Figma", "UI/UX",
  "Electrical Wiring", "Solar Inverter Maintenance", "Grid Safety Standards",
  "CNC Lathe Operation", "G-Code Programming", "Patient Care", "Workplace Communication",
  "Project Management", "Agile", "Scrum", "Problem Solving", "SEO & Content Marketing"
];

/**
 * Local Heuristic Parser: Fast, deterministic regex extraction
 */
export class LocalHeuristicResumeParser implements IResumeParserProvider {
  async parse(buffer: Buffer, fileName: string, mimeType: string): Promise<ParsedResumeData> {
    const text = buffer.toString("utf-8");
    return this.parseText(text, fileName);
  }

  parseText(text: string, fileName?: string): ParsedResumeData {
    // 1. Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    // 2. Phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    // 3. Name (first non-empty line or file name fallback)
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let name: string | undefined = undefined;
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes("@")) {
      name = lines[0].replace(/[^a-zA-Z\s]/g, "").trim();
    }
    if (!name && fileName) {
      name = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    }

    // 4. Skills matching against master skill list
    const foundSkills: ParsedResumeData["skills"] = [];
    const lowerText = text.toLowerCase();
    for (const skill of KNOWN_SKILLS) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(lowerText)) {
        foundSkills.push({
          name: skill,
          proficiencyLevel: "INTERMEDIATE",
          category: ["Workplace Communication", "Project Management", "Agile", "Problem Solving"].includes(skill)
            ? "Soft Skill"
            : "Technical",
        });
      }
    }

    // 5. Education heuristics
    let degree: string | undefined;
    let level = "Bachelor's Degree";
    if (/b\.?\s?tech|bachelor of technology/i.test(text)) {
      degree = "Bachelor of Technology (B.Tech)";
    } else if (/b\.?\s?sc|bachelor of science/i.test(text)) {
      degree = "Bachelor of Science (B.Sc)";
    } else if (/bca|bachelor of computer applications/i.test(text)) {
      degree = "Bachelor of Computer Applications (BCA)";
    } else if (/m\.?\s?tech|mca|master/i.test(text)) {
      degree = "Master's Degree (MCA / M.Tech)";
      level = "Master's Degree";
    } else if (/diploma|polytechnic/i.test(text)) {
      degree = "Polytechnic / Vocational Diploma";
      level = "Diploma / Higher Secondary";
    }

    // 6. Experience & Projects heuristics
    const projects: ParsedResumeData["projects"] = [];
    const experience: ParsedResumeData["experience"] = [];

    const projectMatches = text.match(/(?:Project|Application|System):\s*([^\n]+)/gi);
    if (projectMatches) {
      projectMatches.slice(0, 3).forEach((p) => {
        const title = p.replace(/^(?:Project|Application|System):\s*/i, "").trim();
        if (title) projects.push({ title });
      });
    }

    const expMatches = text.match(/(?:Intern|Developer|Engineer|Technician|Associate|Analyst)\s+at\s+([^\n,]+)/gi);
    if (expMatches) {
      expMatches.slice(0, 2).forEach((e) => {
        const parts = e.split(/\s+at\s+/i);
        if (parts.length === 2) {
          experience.push({ title: parts[0].trim(), company: parts[1].trim() });
        }
      });
    }

    return {
      name,
      email,
      phone,
      education: degree ? { degree, level } : undefined,
      skills: foundSkills,
      projects,
      experience,
      certifications: [],
    };
  }
}

/**
 * Gemini AI Enhanced Resume Parser (calls Gemini API if configured, falls back seamlessly to LocalHeuristic)
 */
export class GeminiResumeParser implements IResumeParserProvider {
  private fallbackParser = new LocalHeuristicResumeParser();

  async parse(buffer: Buffer, fileName: string, mimeType: string): Promise<ParsedResumeData> {
    const text = buffer.toString("utf-8");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return this.fallbackParser.parseText(text, fileName);
    }

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a specialized HR and Technical Resume Parser for CareerLoop AI.
Extract structured profile details from the resume below. Return ONLY valid JSON with no markdown backticks or commentary:
{
  "name": "Candidate Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "age": null,
  "gender": null,
  "education": {
    "degree": "Degree Title",
    "institution": "University / College",
    "graduationYear": "Year",
    "level": "Degree level"
  },
  "skills": [
    { "name": "Skill Name", "category": "Technical" | "Soft Skill" | "Domain", "proficiencyLevel": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" }
  ],
  "experience": [
    { "title": "Job Title", "company": "Company Name", "duration": "Duration", "description": "Short summary" }
  ],
  "projects": [
    { "title": "Project Title", "description": "Brief description", "techStack": "Tools used" }
  ],
  "certifications": ["Certification names"],
  "careerGoal": "Inferred target role"
}

Resume Text:
${text.slice(0, 5000)}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        ...this.fallbackParser.parseText(text, fileName),
        ...parsed,
      };
    } catch (err) {
      console.warn("Gemini resume parser fallback activated:", err);
      return this.fallbackParser.parseText(text, fileName);
    }
  }
}

/**
 * Service Factory
 */
export class ResumeParserService {
  private static instance: IResumeParserProvider;

  static getInstance(): IResumeParserProvider {
    if (!this.instance) {
      this.instance = new GeminiResumeParser();
    }
    return this.instance;
  }
}
