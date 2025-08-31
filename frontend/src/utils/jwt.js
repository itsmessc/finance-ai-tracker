export function decodeJwt(token) {
    try {
        const [, payload] = token.split('.')
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decodeURIComponent(escape(json)))
    } catch (e) {
        return null
    }
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpiring(token, warningMinutes = 2) {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return false;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const warningTime = warningMinutes * 60 * 1000; // Convert minutes to milliseconds
    
    return (expirationTime - currentTime) <= warningTime;
}

/**
 * Check if token is completely expired
 */
export function isTokenExpired(token) {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTimeUntilExpiry(token) {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return 0;
    
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    return Math.max(0, expirationTime - currentTime);
}

/**
 * Format time until expiry in human readable format
 */
export function formatTimeUntilExpiry(token) {
    const timeLeft = getTimeUntilExpiry(token);
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
