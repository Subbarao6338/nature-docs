import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');

  if (!source) {
    return NextResponse.json({ error: 'Missing source' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const tokenName = `${source}_access_token`;
  const token = cookieStore.get(tokenName)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const response = NextResponse.json({ accessToken: token });

  // Optional: clear cookie after retrieval if you want to ensure it's only used once
  // response.cookies.delete(tokenName);

  return response;
}
