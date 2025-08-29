// simple fetch wrapper with automatic refresh on 401
export async function apiFetch(path, options = {}) {
    const base = import.meta.env.VITE_API_BASE || ''
    const url = base + path
    const headers = options.headers || {}
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
    try {
        const res = await fetch(url, { ...options, headers })
        if (res.status === 401) {
            // try refresh
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) throw new Error('Unauthorized')
            const r = await fetch(base + '/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            })
            if (!r.ok) throw new Error('Refresh failed')
            const { accessToken } = await r.json()
            localStorage.setItem('accessToken', accessToken)
            headers['Authorization'] = `Bearer ${accessToken}`
            return fetch(url, { ...options, headers })
        }
        return res
    } catch (err) {
        throw err
    }
}
