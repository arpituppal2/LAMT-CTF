import { cookies } from 'next/headers'

export function getTeamIdFromCookie(reqOrNothing?: Request): string | null {
  try {
    const cookieStore = cookies()
    const val = cookieStore.get('team-id')?.value
    return val ?? null
  } catch {
    return null
  }
}
