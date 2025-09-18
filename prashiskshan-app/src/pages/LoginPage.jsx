import React, { useState } from 'react';
import { User, Mail, Lock, Building, GraduationCap, Factory } from 'lucide-react';

function LoginPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
        name: '',
        college: '',
        company: '',
        aadhaar: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }

        if (!isLogin && !formData.name) {
            setError('Name is required for registration');
            return;
        }

        // Simulate authentication
        const userData = {
            id: Date.now(),
            email: formData.email,
            name: formData.name || formData.email.split('@')[0],
            role: formData.role,
            college: formData.college,
            company: formData.company,
            aadhaar: formData.aadhaar
        };

        onLogin(userData);
    };

    const roleIcons = {
        student: GraduationCap,
        college: Building,
        industry: Factory
    };

    const RoleIcon = roleIcons[formData.role];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4a90e2, #357abd)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', width: '100%', maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#4a90e2', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                        PRASHISKSHAN
                    </h1>
                    <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                        {isLogin ? 'Welcome back!' : 'Join the platform'}
                    </p>
                </div>

                {error && (
                    <div className="error" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">
                                <User size={16} style={{ marginRight: '8px' }} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter your full name"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={16} style={{ marginRight: '8px' }} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ marginRight: '8px' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <RoleIcon size={16} style={{ marginRight: '8px' }} />
                            I am a...
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="form-input"
                        >
                            <option value="student">Student</option>
                            <option value="college">College/University</option>
                            <option value="industry">Industry/Company</option>
                        </select>
                    </div>

                    {!isLogin && formData.role === 'student' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">College/University</label>
                                <input
                                    type="text"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter your college name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Aadhaar Number (Optional)</label>
                                <input
                                    type="text"
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter your Aadhaar number"
                                />
                            </div>
                        </>
                    )}

                    {!isLogin && formData.role === 'industry' && (
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter your company name"
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: '#4a90e2', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;