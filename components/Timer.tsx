'use client'
import { useState, useEffect } from 'react'

export default function Timer({ limit }: { limit: number }) {
  const [time, setTime] = useState(limit)
  useEffect(() => {
    if (time > 0) {
      const t = setTimeout(() => setTime(time - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [time])
  return <div>Time: {time}s</div>
}
