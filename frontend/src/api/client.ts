const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function request<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (BASE_URL) {
    url.href = `${BASE_URL}${path}`
  }
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.status}`)
  }
  return response.json()
}
