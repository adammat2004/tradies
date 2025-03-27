import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Invalid token format' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });
    if (!user) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
