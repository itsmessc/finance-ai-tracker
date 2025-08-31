import { useSelector, useDispatch } from 'react-redux'
import Layout from '../components/Layout'

export default function Profile() {
    const user = useSelector((s) => s.auth.user)
    const dispatch = useDispatch()

    if (!user) {
        return (
            <Layout>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">No user</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You are not logged in.</p>
                </div>
            </Layout>
        )
    }

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(user.email || '')
            alert('Email copied to clipboard')
        } catch (e) {
            alert('Copy failed')
        }
    }

    const handleSignOut = () => {
        try {
            dispatch({ type: 'auth/clearAuth' })
        } catch (e) { }
        try {
            localStorage.removeItem('auth')
            localStorage.removeItem('persist:root')
        } catch (e) { }
        window.location.href = '/login'
    }

    const initials = (user.name || user.email || 'U')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')

    return (
        <Layout>
            <div className="max-w-4xl mx-auto mt-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-10">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        {user.picture ? (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-40 h-40 rounded-full ring-4 ring-indigo-200 dark:ring-indigo-700 object-cover"
                            />
                        ) : (
                            <div className="w-40 h-40 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{user.name || 'Unnamed user'}</h1>
                                <p className="text-gray-500 dark:text-slate-300 mt-1">{user.email}</p>
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={handleCopyEmail}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg text-sm"
                                >
                                    Copy Email
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>

                        {/* Extra Info */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-slate-300">Provider</div>
                                <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">Google</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-slate-300">Account created</div>
                                <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                                    {new Date(user.createdAt || Date.now()).toLocaleString()}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </Layout>
    )
}
