import React from 'react';
import { User, LogOut } from 'lucide-react';

function Header({ user, onLogout }) {
    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>PRASHISKSHAN</h1>
                    <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '4px' }}>
                        {user.role === 'student' && 'Student Portal'}
                        {user.role === 'college' && 'College Dashboard'}
                        {user.role === 'industry' && 'Industry Portal'}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} />
                        <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;