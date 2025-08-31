import { createSlice } from '@reduxjs/toolkit'

// Get initial theme from localStorage or system preference
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
            return savedTheme
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
}

// Apply theme to DOM
const applyTheme = (theme) => {
    if (typeof window !== 'undefined') {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }
}

const initialTheme = getInitialTheme()

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        mode: initialTheme
    },
    reducers: {
        toggleTheme: (state) => {
            const newTheme = state.mode === 'light' ? 'dark' : 'light'
            state.mode = newTheme
            applyTheme(newTheme)
        },
        setTheme: (state, action) => {
            state.mode = action.payload
            applyTheme(action.payload)
        },
        initializeTheme: (state) => {
            // This action ensures the theme is properly applied on app start
            applyTheme(state.mode)
        }
    }
})

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions
export default themeSlice.reducer
