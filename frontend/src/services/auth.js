import { apiFetch } from './api'

export async function fetchProfile() {
    const res = await apiFetch('/auth/profile')
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json()
}

export function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    if (refreshToken) {
        fetch((import.meta.env.VITE_API_BASE || '') + '/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        }).catch(() => { /* ignore */ })
    }
}

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')
    const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    localStorage.setItem('accessToken', data.accessToken)
    // also update auth store via dispatch in caller
    return data.accessToken
}
