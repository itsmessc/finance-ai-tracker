import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Clock, RefreshCw, LogOut, AlertTriangle, Shield } from 'lucide-react';
import { isTokenExpiring, isTokenExpired, formatTimeUntilExpiry } from '../utils/jwt';
import { refreshAccessToken } from '../services/auth';
import { logout, updateToken } from '../store/slices/authSlice';

const TokenExpirationMonitor = () => {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector(state => state.auth);
    const checkIntervalRef = useRef(null);
    const warningShownRef = useRef(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
            warningShownRef.current = false;
            return;
        }

        // Check token expiration every 30 seconds
        checkIntervalRef.current = setInterval(() => {
            checkTokenExpiration();
        }, 30000);

        // Initial check
        checkTokenExpiration();

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [token, isAuthenticated]);

    const checkTokenExpiration = () => {
        if (!token) return;

        // If token is completely expired, logout immediately
        if (isTokenExpired(token)) {
            handleTokenExpired();
            return;
        }

        // If token is expiring soon and warning not shown yet
        if (isTokenExpiring(token, 2) && !warningShownRef.current) {
            showExpirationWarning();
            warningShownRef.current = true;
        }
    };

    const showExpirationWarning = () => {
        const timeLeft = formatTimeUntilExpiry(token);

        toast.custom(
            (t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-xl rounded-xl pointer-events-auto flex ring-1 ring-orange-200 dark:ring-orange-700 border-l-4 border-orange-400`}
                    style={{
                        animation: t.visible 
                            ? 'toast-enter 0.35s cubic-bezier(.21,1.02,.73,1) forwards' 
                            : 'toast-exit 0.4s cubic-bezier(.06,.71,.55,1) forwards'
                    }}
                >
                    <div className="flex-1 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Shield className="h-4 w-4 text-orange-500" />
                                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                        Session Expiring Soon
                                    </p>
                                </div>
                                <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                                    Your session will expire in <span className="font-bold">{timeLeft}</span>
                                </p>
                                <p className="text-xs text-orange-700 dark:text-orange-300">
                                    Choose an action to continue working securely
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    handleRefreshToken();
                                }}
                                disabled={isRefreshing}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                {isRefreshing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                        Extending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Extend Session
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    handleLogout();
                                }}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout Now
                            </button>
                        </div>
                    </div>
                </div>
            ),
            {
                duration: Infinity, // Don't auto-dismiss
                position: 'top-center',
                id: 'token-expiration-warning'
            }
        );
    };

    const handleRefreshToken = async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        
        try {
            const newAccessToken = await refreshAccessToken();
            
            // Update Redux store with new token
            dispatch(updateToken({ accessToken: newAccessToken }));
            
            warningShownRef.current = false; // Reset warning flag
            
            // Dismiss any existing token warning
            toast.dismiss('token-expiration-warning');
            
            toast.success(
                (t) => (
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <Shield className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-900">Session Extended!</p>
                            <p className="text-xs text-green-700">You can continue working securely</p>
                        </div>
                    </div>
                ),
                {
                    duration: 3000,
                    id: 'session-extended'
                }
            );
        } catch (error) {
            console.error('Failed to refresh token:', error);
            toast.error(
                (t) => (
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-900">Session Extension Failed</p>
                            <p className="text-xs text-red-700">Please log in again to continue</p>
                        </div>
                    </div>
                ),
                {
                    duration: 5000
                }
            );
            handleLogout();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        toast.success(
            (t) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <LogOut className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900">Logged Out Successfully</p>
                        <p className="text-xs text-blue-700">You have been securely signed out</p>
                    </div>
                </div>
            ),
            {
                duration: 3000
            }
        );
    };

    const handleTokenExpired = () => {
        toast.error(
            (t) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                            <Clock className="h-4 w-4 text-red-600" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-red-900">Session Expired</p>
                        <p className="text-xs text-red-700">Please log in again to continue</p>
                    </div>
                </div>
            ),
            {
                duration: 5000
            }
        );
        dispatch(logout());
    };

    return null; // This component doesn't render anything visible
};

export default TokenExpirationMonitor;
