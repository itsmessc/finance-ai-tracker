import { createSlice } from '@reduxjs/toolkit'

// initialize from localStorage if present
function loadState() {
    try {
        const raw = localStorage.getItem('auth')
        if (!raw) return { user: null, accessToken: null, refreshToken: null }
        return JSON.parse(raw)
    } catch (err) {
        return { user: null, accessToken: null, refreshToken: null }
    }
}

const initialState = loadState()

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action) {
            const { user, accessToken, refreshToken } = action.payload
            state.user = user
            state.accessToken = accessToken
            state.refreshToken = refreshToken
            try {
                localStorage.setItem('auth', JSON.stringify(state))
            } catch (e) { }
        },
        clearAuth(state) {
            state.user = null
            state.accessToken = null
            state.refreshToken = null
            try {
                localStorage.removeItem('auth')
            } catch (e) { }
        },
    },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
