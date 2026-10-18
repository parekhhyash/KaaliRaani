import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  return NextResponse.json({
    status: 'ok',
    game: 'Kaali Raani (Black Queen)',
    roomCode: code || null,
    timestamp: Date.now(),
  });
}
