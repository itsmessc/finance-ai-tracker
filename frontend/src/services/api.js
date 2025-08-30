// simple fetch wrapper with automatic refresh on 401
export async function apiFetch(path, options = {}) {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
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

// Create an axios-like API object for easier use
const api = {
    get: (url, config = {}) => apiFetch(url, { method: 'GET', ...config }),
    post: (url, data, config = {}) => apiFetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', ...config.headers },
        body: JSON.stringify(data),
        ...config 
    }),
    put: (url, data, config = {}) => apiFetch(url, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', ...config.headers },
        body: JSON.stringify(data),
        ...config 
    }),
    delete: (url, config = {}) => apiFetch(url, { method: 'DELETE', ...config })
};

export default api;
