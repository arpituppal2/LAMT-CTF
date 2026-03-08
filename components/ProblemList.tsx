'use client'
import { useEffect, useState } from 'react'
import Timer from './Timer'

interface Problem { id: string; title: string; description: string; score: number; timeLimit: number; unlocked: boolean; solvesCount: number }

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([])

  useEffect(() => {
    fetch('/api/problems').then(res => res.json()).then(setProblems)
  }, [])

  const submitAnswer = async (pid: string, answer: number) => {
    const res = await fetch(`/api/submit/${pid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    })
    if (res.ok) alert('Solved!')
  }

  return (
    <div>
      {problems.map(p => (
        <div key={p.id} className="border p-4 mb-4 rounded">
          <h2>{p.title} ({p.score} pts, {p.solvesCount} solves)</h2>
          <p>{p.description}</p>
          {p.unlocked && <Timer limit={p.timeLimit} />}
          {p.unlocked && <input type="number" min="-999" max="999" onKeyDown={e => e.key === 'Enter' && submitAnswer(p.id, +e.target.value)} />}
        </div>
      ))}
    </div>
  )
}
