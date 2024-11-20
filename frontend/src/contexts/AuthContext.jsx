import {createContext, useContext, useEffect, useState} from "react";
import {Navigate} from "react-router-dom";

export const AuthContext = createContext(null)

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/verify-token", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                }
            } catch {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, [])

    const login = (newToken) => {
        console.log(`Setting token to ${newToken}`);
        localStorage.setItem("token", newToken);
        setIsAuthenticated(true);
    }

    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
};

export const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useContext(AuthContext);

    console.log(`Protected Route: ${isAuthenticated}`);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }
    return children;
};

