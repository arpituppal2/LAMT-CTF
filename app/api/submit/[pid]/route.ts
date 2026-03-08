import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTeamIdFromCookie } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { pid: string } }
) {
  const teamId = getTeamIdFromCookie()
  if (!teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { answer } = await req.json() as { answer: number }

  const problem = await prisma.problem.findUnique({
    where: { id: params.pid },
  })
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  if (!Number.isInteger(answer) || answer < -999 || answer > 999) {
    return NextResponse.json({ error: 'Answer must be integer -999..999' }, { status: 400 })
  }

  const existing = await prisma.solve.findUnique({
    where: { teamId_problemId: { teamId, problemId: params.pid } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already solved' }, { status: 400 })
  }

  // Check unlock prereqs
  const teamSolves = await prisma.solve.findMany({
    where: { teamId },
    select: { problemId: true },
  })
  const teamSolveIds = teamSolves.map(s => s.problemId)
  if (!problem.prereqIds.every(id => teamSolveIds.includes(id))) {
    return NextResponse.json({ error: 'Prereqs not met' }, { status: 400 })
  }

  if (answer !== problem.answer) {
    return NextResponse.json({ error: 'Incorrect answer' }, { status: 200 })
  }

  // Record solve and increment count
  await prisma.solve.create({
    data: { teamId, problemId: params.pid },
  })
  const updated = await prisma.problem.update({
    where: { id: params.pid },
    data: { solvesCount: { increment: 1 } },
  })

  const solves = updated.solvesCount
  const valueRaw =
    ((updated.minScore - updated.initial) / (updated.decaySolves ** 2)) * (solves ** 2) +
    updated.initial
  const score = Math.max(updated.minScore, Math.round(valueRaw))

  await prisma.team.update({
    where: { id: teamId },
    data: { score: { increment: score } },
  })

  return NextResponse.json({ success: true, score })
}
