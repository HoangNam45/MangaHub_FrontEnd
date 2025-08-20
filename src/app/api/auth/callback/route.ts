import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  if (error) {
    // Redirect to login with error
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  }

  if (token) {
    // For OAuth flow, redirect to client-side callback to handle Redux state update
    const callbackUrl = new URL('/callback', request.url);
    callbackUrl.searchParams.set('token', token);

    return NextResponse.redirect(callbackUrl);
  }

  // Create response with redirect to home page
  const response = NextResponse.redirect(new URL('/', request.url));
  return response;
}
