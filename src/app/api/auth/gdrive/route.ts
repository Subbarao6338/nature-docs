import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    return NextResponse.redirect(`${baseUrl || ''}/?error=env_not_configured&provider=gdrive`);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${baseUrl}/api/auth/gdrive/callback`
  );

  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  return NextResponse.redirect(url);
}
