import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface EmailRequest {
  officiant: {
    firstName: string;
    lastName: string;
    affiliation: string;
  };
  couple: {
    name1: string;
    name2: string;
    weddingDate: string;
    venue: string;
    story: string;
    style: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();

    // Validate required fields
    if (!body.officiant || !body.couple) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { officiant, couple } = body;

    const prompt = `You are helping a couple write a personalized inquiry email to a wedding officiant. Write a warm, genuine, and concise email that:

1. Introduces the couple naturally
2. Mentions their wedding date and venue
3. Briefly shares their story if provided
4. Explains what kind of ceremony style they're looking for
5. Asks about availability and next steps
6. Keeps a friendly but professional tone

Details:
- Officiant: ${officiant.firstName} ${officiant.lastName} (${officiant.affiliation})
- Couple: ${couple.name1} and ${couple.name2}
- Wedding Date: ${couple.weddingDate}
- Venue: ${couple.venue}
- Their Story: ${couple.story || "Not provided"}
- Ceremony Style Preference: ${couple.style || "Open to suggestions"}

Write ONLY the email body (no subject line, no "Dear..." - start directly with the greeting). Keep it under 200 words. Be genuine, not generic.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const emailContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Generate a subject line
    const subjectPrompt = `Write a brief, warm email subject line for a couple (${couple.name1} & ${couple.name2}) inquiring about wedding officiant services for their ${couple.weddingDate} wedding. Just the subject line, nothing else.`;

    const subjectMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: subjectPrompt,
        },
      ],
    });

    const subject =
      subjectMessage.content[0].type === "text"
        ? subjectMessage.content[0].text.trim()
        : `Wedding Inquiry - ${couple.name1} & ${couple.name2}`;

    return NextResponse.json({
      success: true,
      email: {
        subject,
        body: emailContent,
      },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate email",
      },
      { status: 500 }
    );
  }
}
