import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: { username: true },
      },
      comments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description, body } = await request.json()

  const post = await prisma.post.create({
    data: {
      title,
      description,
      body,
      authorId: session.user.id,
    },
  })

  return NextResponse.json({ message: 'Blog Post posted successfully!', post })
}

