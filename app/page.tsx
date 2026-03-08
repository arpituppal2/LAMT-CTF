'use client'
import { useState } from 'react'
import ProblemList from '@/components/ProblemList'

export default function Home() {
  const [view, setView] = useState<'login' | 'register' | 'problems'>('problems')
  // Add login/register forms here - POST to /api/login, /api/register
  // Set cookie with JWT or session token on success
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">LAMT-CTF: High School Math Tournament</h1>
      {view === 'problems' && <ProblemList />}
      {/* Forms toggle here */}
    </main>
  )
}
