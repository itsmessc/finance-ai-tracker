import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '../store/slices/authSlice'

export default function GoogleSignIn() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        // Load Google Identity Services script
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.body.appendChild(script)

        script.onload = () => {
            /* global google */
            if (!window.google) return
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            })
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin'),
                { theme: 'outline', size: 'large' }
            )
        }

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    async function handleCredentialResponse(response) {
        const idToken = response.credential
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE + '/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            })
            const data = await res.json()
            if (res.ok) {
                // store tokens as needed (localStorage used here for demo)
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
                dispatch(setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }))
                navigate('/profile')
            } else {
                console.error('Auth error', data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    return <div id="google-signin" />
}
