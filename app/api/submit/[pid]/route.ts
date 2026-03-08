import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTeamIdFromCookie } from '@/lib/auth' // Implement simple cookie check

export async function POST(req: NextRequest, { params }: { params: { pid: string } }) {
  const { answer } = await req.json()
  const teamId = getTeamIdFromCookie(req) // Your auth logic
  if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const problem = await prisma.problem.findUnique({ where: { id: params.pid } })
  if (!problem || answer !== problem.answer || await prisma.solve.findUnique({ where: { teamId_problemId: { teamId, problemId: params.pid } } })) {
    return NextResponse.json({ error: 'Wrong or already solved' })
  }

  // Check prereqs (user solved all?)
  const userSolves = await prisma.solve.findMany({ where: { teamId }, select: { problemId: true } })
  const solvedPrereqs = userSolves.map(s => s.problemId)
  if (!problem.prereqIds.every(id => solvedPrereqs.includes(id))) {
    return NextResponse.json({ error: 'Prerequisites not met' })
  }

  // Record solve
  await prisma.solve.create({ data: { teamId, problemId: params.pid } })
  await prisma.problem.update({ where: { id: params.pid }, data: { solvesCount: { increment: 1 } } })

  // Calc dynamic score
  const solves = problem.solvesCount + 1 // Now
  let score = ((problem.minScore - problem.initial) / (problem.decaySolves ** 2)) * (solves ** 2) + problem.initial
  score = Math.max(problem.minScore, Math.round(score))
  
  // Award points, update team score
  await prisma.award.create({ data: { teamId, problemId: params.pid, points: score } })
  await prisma.team.update({ where: { id: teamId }, data: { score: { increment: score } } })

  return NextResponse.json({ success: true, score })
}
