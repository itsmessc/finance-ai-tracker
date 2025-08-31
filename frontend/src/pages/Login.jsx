import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import GoogleSignIn from '../components/GoogleSignIn'

export default function Login() {
    const user = useSelector((s) => s.auth.user)
    if (user) return <Navigate to="/" replace />
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
                <h1 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Finance AI Tracker (demo)</h1>
                <div className="flex flex-col items-center gap-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sign in</h2>
                    <GoogleSignIn />
                </div>
            </div>
        </div>
    )
}
