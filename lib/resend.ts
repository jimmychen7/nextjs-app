import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;

// Helper function to send emails
export async function sendEmail({
  to,
  from = 'onboarding@resend.dev', // Resend's default verified domain
  subject,
  text,
  html,
}: {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    console.log('Sending email with Resend:', { to, from, subject });
    
        const emailData = {
      from,
      to,
      subject,
      ...(text && { text }),
      ...(html && { html }),
    };
    
    const { data, error } = await resend.emails.send(emailData as any);

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Resend response:', data);
    return { success: true, response: data };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error };
  }
}

// Predefined email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Price Tracker!',
    text: `Hi ${name}, welcome to Price Tracker! Start tracking your favorite stocks and crypto.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Price Tracker!</h1>
        <p>Hi ${name},</p>
        <p>Welcome to Price Tracker! You can now start tracking your favorite stocks and crypto assets.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Get Started
        </a>
        <p>Happy tracking!</p>
      </div>
    `,
  }),
  
  priceAlert: (symbol: string, currentPrice: number, targetPrice: number) => ({
    subject: `Price Alert: ${symbol} has reached your target`,
    text: `${symbol} is currently at $${currentPrice}, which has reached your target price of $${targetPrice}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Price Alert</h1>
        <p><strong>${symbol}</strong> has reached your target price!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Current Price:</strong> $${currentPrice}</p>
          <p><strong>Target Price:</strong> $${targetPrice}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/chart?symbols=${symbol}" 
           style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Chart
        </a>
      </div>
    `,
  }),

  symbolTracked: (symbol: string, currentPrice: number, symbolName: string, sector: string, industry: string) => ({
    subject: `Symbol Tracked: ${symbol} - ${symbolName}`,
    text: `You're now tracking ${symbol} (${symbolName}). Current price: $${currentPrice}. Sector: ${sector}, Industry: ${industry}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Symbol Tracked Successfully!</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #007bff; margin-top: 0;">${symbol}</h2>
          <p><strong>Company:</strong> ${symbolName}</p>
          <p><strong>Current Price:</strong> $${currentPrice}</p>
          <p><strong>Sector:</strong> ${sector}</p>
          <p><strong>Industry:</strong> ${industry}</p>
        </div>
        <p>You'll receive notifications about price changes and market updates for this symbol.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/chart?symbols=${symbol}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Chart
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          You can manage your tracked symbols anytime in your dashboard.
        </p>
      </div>
    `,
  }),
}; 