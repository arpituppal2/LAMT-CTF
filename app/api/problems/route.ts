import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTeamIdFromCookie } from '@/lib/auth'

export async function GET(req: Request) {
  const teamId = getTeamIdFromCookie(req)

  const problems = await prisma.problem.findMany()

  let solvesByTeam: { [pid: string]: boolean } = {}
  let teamSolveIds: string[] = []

  if (teamId) {
    const solves = await prisma.solve.findMany({
      where: { teamId },
      select: { problemId: true },
    })
    teamSolveIds = solves.map(s => s.problemId)
    for (const s of solves) {
      solvesByTeam[s.problemId] = true
    }
  }

  const data = problems.map(p => {
    const solvesCount = p.solvesCount
    const solves = solvesCount
    const valueRaw =
      ((p.minScore - p.initial) / (p.decaySolves ** 2)) * (solves ** 2) + p.initial
    const score = Math.max(p.minScore, Math.round(valueRaw))

    const unlocked = p.prereqIds.length === 0 || p.prereqIds.every(id => teamSolveIds.includes(id))

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      timeLimit: p.timeLimit,
      solvesCount,
      score,
      unlocked,
    }
  })

  return NextResponse.json(data)
}
