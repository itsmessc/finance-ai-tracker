import { createSlice } from '@reduxjs/toolkit'

// initialize from localStorage if present
function loadState() {
    try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userStr = localStorage.getItem('user')
        
        if (!accessToken || !refreshToken) {
            return { 
                user: null, 
                token: null, 
                refreshToken: null, 
                isAuthenticated: false 
            }
        }
        
        const user = userStr ? JSON.parse(userStr) : null
        return { 
            user, 
            token: accessToken, 
            refreshToken, 
            isAuthenticated: true 
        }
    } catch (err) {
        return { 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false 
        }
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
            state.token = accessToken
            state.refreshToken = refreshToken
            state.isAuthenticated = true
            
            // Store in localStorage
            try {
                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', refreshToken)
                localStorage.setItem('user', JSON.stringify(user))
            } catch (e) { 
                console.error('Failed to store auth data:', e)
            }
        },
        updateToken(state, action) {
            const { accessToken } = action.payload
            state.token = accessToken
            
            try {
                localStorage.setItem('accessToken', accessToken)
            } catch (e) {
                console.error('Failed to store access token:', e)
            }
        },
        logout(state) {
            state.user = null
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            
            try {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
            } catch (e) { 
                console.error('Failed to clear auth data:', e)
            }
        },
        // Legacy action for backward compatibility
        clearAuth(state) {
            state.user = null
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            
            try {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
            } catch (e) { }
        },
    },
})

export const { setAuth, updateToken, logout, clearAuth } = authSlice.actions
export default authSlice.reducer
