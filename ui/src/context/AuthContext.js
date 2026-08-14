import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const REFRESH_INTERVAL_MS = 60 * 1000;

const parseJwt = (token) => {
    try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(window.atob(normalized));
    } catch (error) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => {
        const stored = localStorage.getItem("authToken");
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            localStorage.removeItem("authToken");
            return null;
        }
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const clearSession = useCallback(() => {
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
    }, []);

    const refreshAccessToken = useCallback(async (refreshToken) => {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Refresh token rejected");
        }

        const data = await response.json();
        setAuthToken(data);
        localStorage.setItem("authToken", JSON.stringify(data));
        return data;
    }, []);

    const fetchCurrentUser = useCallback(async (token) => {
        const response = await fetch(`${API_URL}/me/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Access token rejected");
        }

        return response.json();
    }, []);

    const validateSession = useCallback(async () => {
        if (!authToken?.access || !authToken?.refresh) {
            clearSession();
            setLoading(false);
            return;
        }

        try {
            let currentToken = authToken.access;
            let currentUser;

            try {
                currentUser = await fetchCurrentUser(currentToken);
            } catch (error) {
                const payload = parseJwt(currentToken);
                if (payload?.exp && payload.exp * 1000 > Date.now()) {
                    throw error;
                }

                const refreshed = await refreshAccessToken(authToken.refresh);
                currentToken = refreshed.access;
                currentUser = await fetchCurrentUser(currentToken);
            }

            setUser(currentUser);
        } catch (error) {
            clearSession();
        } finally {
            setLoading(false);
        }
    }, [authToken, clearSession, fetchCurrentUser, refreshAccessToken]);

    const loginUser = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${API_URL}/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: event.target.username.value,
                    password: event.target.password.value,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Unable to log in");
            }

            const currentUser = await fetchCurrentUser(data.access);
            setAuthToken(data);
            localStorage.setItem("authToken", JSON.stringify(data));
            setUser(currentUser);
            navigate("/");
        } catch (error) {
            clearSession();
            throw error;
        }
    };

    const logoutUser = useCallback(async () => {
        try {
            if (authToken?.refresh) {
                await fetch(`${API_URL}/token/logout/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: authToken.refresh }),
                });
            }
        } finally {
            clearSession();
            navigate("/login");
        }
    }, [authToken, clearSession, navigate]);

    useEffect(() => {
        validateSession();
    }, [validateSession]);

    useEffect(() => {
        if (!authToken?.access || !authToken?.refresh) {
            return undefined;
        }

        const interval = setInterval(async () => {
            const payload = parseJwt(authToken.access);
            const expiresSoon = !payload?.exp || payload.exp * 1000 <= Date.now() + 60 * 1000;

            if (!expiresSoon) {
                return;
            }

            try {
                const refreshed = await refreshAccessToken(authToken.refresh);
                setUser(await fetchCurrentUser(refreshed.access));
            } catch (error) {
                await logoutUser();
            }
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [authToken, fetchCurrentUser, logoutUser, refreshAccessToken]);

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
