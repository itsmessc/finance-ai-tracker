import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Home,
    CreditCard,
    BarChart3,
    User,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    TrendingUp
} from 'lucide-react'
import { clearAuth } from '../store/slices/authSlice'
import { logout as doLogout } from '../services/auth'

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

export default function Layout({ children }) {
    const user = useSelector((s) => s.auth.user)
    const dispatch = useDispatch()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [theme, setTheme] = useState(getInitialTheme)

    // Apply theme to DOM
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Transactions', href: '/transactions', icon: CreditCard },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    const handleLogout = () => {
        doLogout()
        dispatch(clearAuth())
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation Header */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    Finance AI
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {user && navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center space-x-4">

                            {/* User Menu */}
                            {user && (
                                <div className="hidden md:flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff`}
                                            alt={user.name}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {user.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            {user && (
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {user && mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}

                            {/* Mobile User Info & Logout */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <div className="flex items-center px-3 py-2">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff`}
                                        alt={user.name}
                                    />
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
