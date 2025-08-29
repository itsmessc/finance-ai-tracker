export function decodeJwt(token) {
    try {
        const [, payload] = token.split('.')
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decodeURIComponent(escape(json)))
    } catch (e) {
        return null
    }
}
