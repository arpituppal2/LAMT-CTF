'use client'
import { useState } from 'react'

export default function Admin() {
  const [form, setForm] = useState({ title: '', desc: '', answer: 0, timeLimit: 300, prereqs: '' })

  const addProblem = async () => {
    await fetch('/admin/add-problem', {
      method: 'POST',
      body: JSON.stringify(form)
    })
  }

  return (
    <form onSubmit={addProblem}>
      <input placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} />
      <textarea placeholder="Description" onChange={e => setForm({...form, desc: e.target.value})} />
      <input type="number" placeholder="Answer (-999..999)" onChange={e => setForm({...form, answer: +e.target.value})} />
      <input type="number" placeholder="Time limit (s)" onChange={e => setForm({...form, timeLimit: +e.target.value})} />
      <input placeholder="Prereq IDs (comma sep)" onChange={e => setForm({...form, prereqs: e.target.value})} />
      <button type="submit">Add Problem</button>
    </form>
  )
}
