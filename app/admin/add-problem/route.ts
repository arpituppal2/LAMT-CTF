import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const prereqIds = body.prereqs ? body.prereqs.split(',').map(s => s.trim()) : []
  const problem = await prisma.problem.create({
    data: {
      title: body.title,
      description: body.desc,
      answer: body.answer,
      timeLimit: body.timeLimit,
      prereqIds
    }
  })
  return NextResponse.json(problem)
}
