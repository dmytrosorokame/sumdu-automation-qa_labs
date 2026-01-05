import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, message } = await request.json()

  const comment = await prisma.comment.create({
    data: {
      name,
      message,
      postId: params.id,
      authorId: session.user.id,
    },
  })

  return NextResponse.json({ 
    message: 'Comment added to the Post successfully!', 
    comment 
  })
}

