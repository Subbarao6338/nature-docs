import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !baseUrl) {
    return NextResponse.redirect(`${baseUrl || ''}/?error=env_not_configured&provider=notion`);
  }

  const redirectUri = `${baseUrl}/api/auth/notion/callback`;

  const url = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(url);
}
