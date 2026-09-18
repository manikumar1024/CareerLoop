import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, prompt, userText, framework } = body;

    if (!userText || userText.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide a more detailed response to receive meaningful evaluation." },
        { status: 400 }
      );
    }

    // If Gemini is available, use it
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let systemPrompt = "";
        if (type === "WRITING") {
          systemPrompt = `You are an executive business communication coach and editor.
Evaluate the following workplace communication response written by a professional.
Prompt Scenario: "${prompt}"
User's Response:
"""
${userText}
"""

Evaluate on:
1. Tone & Professionalism (0-25)
2. Clarity & Conciseness (0-25)
3. Grammar, Structure & Vocabulary (0-25)
4. Goal Alignment & Actionability (0-25)

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "totalScore": 85,
  "scores": {
    "tone": 22,
    "clarity": 21,
    "grammar": 23,
    "alignment": 19
  },
  "verdict": "Well-crafted workplace communication",
  "strengths": ["Strong polite opening", "Clear action items"],
  "improvements": ["Could be slightly more concise in the middle paragraph"],
  "polishedVersion": "An improved, professional rewrite of their text"
}`;
        } else {
          // INTERVIEW evaluation
          systemPrompt = `You are an expert HR Interviewer and STAR method evaluator.
Interview Question: "${prompt}"
Candidate's Response:
"""
${userText}
"""

Evaluate using the STAR Framework (Situation, Task, Action, Result):
1. Situation Context (0-25)
2. Task Definition (0-25)
3. Action Specificity & Ownership (0-25)
4. Quantified Result & Impact (0-25)

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "totalScore": 88,
  "scores": {
    "situation": 22,
    "task": 20,
    "action": 24,
    "result": 22
  },
  "starBreakdown": {
    "situationFeedback": "Clear setup of the project context.",
    "taskFeedback": "Defined role well.",
    "actionFeedback": "Detailed technical steps taken.",
    "resultFeedback": "Good mention of positive outcome, could add more metrics."
  },
  "strengths": ["Clear narrative arc", "Highlighted collaborative problem solving"],
  "improvements": ["Quantify percentage latency or revenue improvements"],
  "polishedVersion": "A top-tier STAR formatted response rewrite"
}`;
        }

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({
          success: true,
          evaluation: parsed,
        });
      } catch (aiError) {
        console.warn("Gemini evaluation error, using heuristic fallback:", aiError);
      }
    }

    // Heuristic Fallback Evaluator (when Gemini API is not set or times out)
    const wordCount = userText.trim().split(/\s+/).length;
    let baseScore = 70;
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (wordCount > 60) {
      baseScore += 12;
      strengths.push("Good depth and detail in your response.");
    } else if (wordCount < 30) {
      baseScore -= 15;
      improvements.push("Elaborate further with specific examples and details.");
    }

    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(userText) || /sincerely|regards|dear|hi /i.test(userText)) {
      baseScore += 8;
      strengths.push("Proper professional greetings and formatting.");
    }

    if (type === "INTERVIEW") {
      const hasNumbers = /\d+%|\d+ days|\$\d+|\d+ users/i.test(userText);
      if (hasNumbers) {
        baseScore += 10;
        strengths.push("Excellent use of metrics to quantify your results.");
      } else {
        improvements.push("Include specific numbers, timeframes, or metrics in your results.");
      }

      const finalScore = Math.min(95, Math.max(55, baseScore));
      return NextResponse.json({
        success: true,
        evaluation: {
          totalScore: finalScore,
          scores: {
            situation: Math.round(finalScore * 0.25),
            task: Math.round(finalScore * 0.24),
            action: Math.round(finalScore * 0.26),
            result: Math.round(finalScore * 0.25),
          },
          starBreakdown: {
            situationFeedback: "Context is adequately introduced.",
            taskFeedback: "Responsibilities are outlined.",
            actionFeedback: "Demonstrates personal initiative.",
            resultFeedback: hasNumbers ? "Clear quantified outcome provided." : "Consider adding specific numbers or metrics.",
          },
          strengths,
          improvements,
          polishedVersion: `In this situation, I took direct ownership by analyzing the root causes, collaborating with key stakeholders, and implementing a measurable solution that delivered successful outcomes on schedule.`
        }
      });
    } else {
      const finalScore = Math.min(95, Math.max(60, baseScore));
      return NextResponse.json({
        success: true,
        evaluation: {
          totalScore: finalScore,
          scores: {
            tone: Math.round(finalScore * 0.26),
            clarity: Math.round(finalScore * 0.24),
            grammar: Math.round(finalScore * 0.25),
            alignment: Math.round(finalScore * 0.25),
          },
          verdict: finalScore >= 80 ? "Polished and professional communication." : "Solid start with room for added clarity.",
          strengths,
          improvements,
          polishedVersion: userText
        }
      });
    }
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate text", message: error.message },
      { status: 500 }
    );
  }
}
