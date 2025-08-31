import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import ProtectedRoute from './routes/ProtectedRoute'
import TokenExpirationMonitor from './components/TokenExpirationMonitor'

export default function App() {
  return (
    <>
      <TokenExpirationMonitor />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-center"
        gutter={8}
        containerClassName=""
        containerStyle={{
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--tw-color-white)',
            color: 'var(--tw-color-gray-900)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            border: '1px solid var(--tw-color-gray-200)',
            borderRadius: '0.5rem',
            padding: '16px',
            maxWidth: '500px',
          },
          success: {
            duration: 3000,
            style: {
              background: 'var(--tw-color-green-50)',
              color: 'var(--tw-color-green-800)',
              border: '1px solid var(--tw-color-green-200)',
            },
            iconTheme: {
              primary: 'var(--tw-color-green-600)',
              secondary: 'var(--tw-color-green-50)',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'var(--tw-color-red-50)',
              color: 'var(--tw-color-red-800)',
              border: '1px solid var(--tw-color-red-200)',
            },
            iconTheme: {
              primary: 'var(--tw-color-red-600)',
              secondary: 'var(--tw-color-red-50)',
            },
          },
          loading: {
            style: {
              background: 'var(--tw-color-blue-50)',
              color: 'var(--tw-color-blue-800)',
              border: '1px solid var(--tw-color-blue-200)',
            },
          },
        }}
      />
    </>
  )
}
