import { NextRequest, NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, template, data } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 },
      );
    }

    let emailContent;

    // Use predefined templates or custom content
    if (template === "welcome" && data?.name) {
      emailContent = emailTemplates.welcome(data.name);
    } else if (
      template === "priceAlert" &&
      data?.symbol &&
      data?.currentPrice &&
      data?.targetPrice
    ) {
      emailContent = emailTemplates.priceAlert(
        data.symbol,
        data.currentPrice,
        data.targetPrice,
      );
    } else {
      return NextResponse.json(
        { error: "Invalid template or missing data" },
        { status: 400 },
      );
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
