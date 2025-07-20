import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, emailTemplates } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email
    const userEmail = user.email;
    console.log('Sending tracking email to:', userEmail);
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Fetch current price and symbol details using yahoo-finance2
    let currentPrice = 0;
    let symbolName = symbol;
    let sector = 'N/A';
    let industry = 'N/A';
    
    try {
      const yahooFinance = (await import('yahoo-finance2')).default;
      
      // Get current price and basic info
      const quote = await yahooFinance.quote(symbol);
      currentPrice = (quote as { regularMarketPrice?: number }).regularMarketPrice || 0;
      symbolName = (quote as { longName?: string; shortName?: string }).longName || 
                   (quote as { longName?: string; shortName?: string }).shortName || symbol;
      
      // Get detailed information including sector and industry
      const quoteSummary = await yahooFinance.quoteSummary(symbol, { 
        modules: ["assetProfile"] 
      });
      
      sector = quoteSummary.assetProfile?.sector || 'N/A';
      industry = quoteSummary.assetProfile?.industry || 'N/A';
      
    } catch (yahooError) {
      console.error('Yahoo Finance fetch error:', yahooError);
      // Use fallback values if Yahoo Finance fails
      currentPrice = 0;
      symbolName = symbol;
      sector = 'N/A';
      industry = 'N/A';
    }

    // Send tracking notification email
    const emailTemplate = emailTemplates.symbolTracked(symbol, currentPrice, symbolName, sector, industry);
    
    const result = await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    console.log('SendGrid result:', result);

    if (!result.success) {
      console.error('Failed to send tracking email:', result.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Tracking notification sent' });

  } catch (error) {
    console.error('Error sending tracking email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 