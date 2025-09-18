import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import Header from './components/Header';

function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (from localStorage)
        const savedUser = localStorage.getItem('prashiskshan_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('prashiskshan_user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('prashiskshan_user');
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="app">
            <Router>
                {user && <Header user={user} onLogout={handleLogout} />}
                <Routes>
                    <Route
                        path="/login"
                        element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            user ? (
                                user.role === 'student' ? <StudentDashboard user={user} /> :
                                    user.role === 'college' ? <CollegeDashboard user={user} /> :
                                        user.role === 'industry' ? <IndustryDashboard user={user} /> :
                                            <Navigate to="/login" />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to={user ? "/dashboard" : "/login"} />}
                    />
                </Routes>
            </Router>
        </div>
    );
}

export default App;