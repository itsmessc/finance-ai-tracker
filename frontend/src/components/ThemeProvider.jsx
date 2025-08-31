import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { initializeTheme, setTheme } from '../store/slices/themeSlice'

const ThemeProvider = ({ children }) => {
    const dispatch = useDispatch()
    const currentTheme = useSelector((state) => state.theme.mode)

    useEffect(() => {
        // Initialize theme on component mount
        dispatch(initializeTheme())
    }, [dispatch])

    useEffect(() => {
        // Listen for system theme changes when no user preference is saved
        const savedTheme = localStorage.getItem('theme')
        if (!savedTheme) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e) => {
                const newTheme = e.matches ? 'dark' : 'light'
                dispatch(setTheme(newTheme))
            }

            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }
    }, [dispatch])

    return children
}

export default ThemeProvider
