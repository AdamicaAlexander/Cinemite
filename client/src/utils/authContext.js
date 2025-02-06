import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let token = localStorage.getItem('token');
        let storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            token = sessionStorage.getItem('token');
            storedUser = sessionStorage.getItem('user');
        }

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = (userData, token, rememberMe) => {
        setUser(userData);

        if (rememberMe) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);

        const lsToken = localStorage.getItem('token');
        if (lsToken) {
            localStorage.setItem('user', JSON.stringify(newUserData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(newUserData));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
