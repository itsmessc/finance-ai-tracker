import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { clearAuth } from '../store/slices/authSlice'
import { logout as doLogout } from '../services/auth'

export default function Layout({ children }) {
    const user = useSelector((s) => s.auth.user)
    const dispatch = useDispatch()

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <header className="w-full max-w-4xl p-4 flex justify-between items-center">
                <div className="font-semibold">Finance AI Tracker</div>
                <nav className="flex items-center gap-4">
                    {user && <Link to="/" className="text-sm text-slate-700 dark:text-slate-200 hover:underline">Dashboard</Link>}
                    {user && <Link to="/transactions" className="text-sm text-slate-700 dark:text-slate-200 hover:underline">Transactions</Link>}
                    {user && <Link to="/analytics" className="text-sm text-slate-700 dark:text-slate-200 hover:underline">Analytics</Link>}
                    {user && <Link to="/profile" className="text-sm text-slate-700 dark:text-slate-200 hover:underline">Profile</Link>}
                    {user ? (
                        <button
                            className="px-3 py-1 bg-red-100 text-red-700 rounded dark:bg-red-700 dark:text-white"
                            onClick={() => { doLogout(); dispatch(clearAuth()) }}
                        >Sign out</button>
                    ) : null}
                </nav>
            </header>

            <main className="w-full max-w-4xl p-6">{children}</main>
        </div>
    )
}
