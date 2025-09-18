import React, { useState } from 'react';
import { Briefcase, Users, UserPlus, Star, Plus, Eye, CheckCircle, X } from 'lucide-react';

function IndustryDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Mock data
    const [internships] = useState([
        { id: 1, title: 'Software Development Intern', department: 'Engineering', duration: '3 months', stipend: '₹15,000', applicants: 25, status: 'Active' },
        { id: 2, title: 'Data Science Intern', department: 'Analytics', duration: '6 months', stipend: '₹20,000', applicants: 18, status: 'Active' },
        { id: 3, title: 'Marketing Intern', department: 'Marketing', duration: '4 months', stipend: '₹12,000', applicants: 12, status: 'Closed' }
    ]);

    const [applications] = useState([
        { id: 1, studentName: 'Rahul Sharma', position: 'Software Development Intern', college: 'IIT Delhi', cgpa: 8.5, skills: ['React', 'Node.js', 'Python'], status: 'Under Review' },
        { id: 2, studentName: 'Priya Patel', position: 'Data Science Intern', college: 'NIT Bangalore', cgpa: 9.2, skills: ['Python', 'Machine Learning', 'SQL'], status: 'Shortlisted' },
        { id: 3, studentName: 'Arjun Kumar', position: 'Software Development Intern', college: 'BITS Pilani', cgpa: 8.8, skills: ['Java', 'Spring Boot', 'AWS'], status: 'Applied' }
    ]);

    const [selectedInterns] = useState([
        { id: 1, name: 'Neha Singh', position: 'Software Development Intern', startDate: '2024-01-15', mentor: 'John Doe', progress: 75 },
        { id: 2, name: 'Vikash Gupta', position: 'Data Science Intern', startDate: '2024-01-01', mentor: 'Jane Smith', progress: 60 }
    ]);

    const [analytics] = useState({
        totalInternships: 15,
        activeInternships: 8,
        totalApplications: 145,
        selectedInterns: 12,
        completionRate: 92
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': case 'shortlisted': case 'selected': return '#28a745';
            case 'under review': case 'applied': return '#ffc107';
            case 'closed': case 'rejected': return '#dc3545';
            default: return '#6c757d';
        }
    };

    return (
        <div className="container" style={{ padding: '20px' }}>
            {/* Main Dashboard */}
            {activeTab === 'dashboard' && (
                <>
                    {/* Analytics Overview */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>Company Analytics</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div className="card" style={{ textAlign: 'center', background: '#e3f2fd' }}>
                                <h3 style={{ color: '#1976d2', fontSize: '2rem', marginBottom: '8px' }}>{analytics.totalInternships}</h3>
                                <p style={{ color: '#666' }}>Total Internships</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#e8f5e8' }}>
                                <h3 style={{ color: '#2e7d32', fontSize: '2rem', marginBottom: '8px' }}>{analytics.activeInternships}</h3>
                                <p style={{ color: '#666' }}>Active Postings</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#fff3e0' }}>
                                <h3 style={{ color: '#f57c00', fontSize: '2rem', marginBottom: '8px' }}>{analytics.totalApplications}</h3>
                                <p style={{ color: '#666' }}>Total Applications</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#f3e5f5' }}>
                                <h3 style={{ color: '#7b1fa2', fontSize: '2rem', marginBottom: '8px' }}>{analytics.selectedInterns}</h3>
                                <p style={{ color: '#666' }}>Selected Interns</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#e0f2f1' }}>
                                <h3 style={{ color: '#00695c', fontSize: '2rem', marginBottom: '8px' }}>{analytics.completionRate}%</h3>
                                <p style={{ color: '#666' }}>Completion Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Cards */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>Industry Dashboard</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            {/* Post Internships */}
                            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('internships')}>
                                <Briefcase size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Internship Postings</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>{internships.length} Active Posts</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Manage Postings
                                </button>
                            </div>

                            {/* View Applications */}
                            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('applications')}>
                                <Users size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Applications</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>{applications.length} Pending Review</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Review Applications
                                </button>
                            </div>

                            {/* Selected Candidates */}
                            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('selected')}>
                                <UserPlus size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Selected Interns</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>{selectedInterns.length} Current Interns</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Monitor Progress
                                </button>
                            </div>

                            {/* Feedback & Rating */}
                            <div className="card" style={{ textAlign: 'center' }}>
                                <Star size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Feedback & Rating</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>4.5/5 Average Rating</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    View Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Internship Postings */}
            {activeTab === 'internships' && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Internship Postings</h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary">
                                <Plus size={16} style={{ marginRight: '8px' }} />
                                Post New Internship
                            </button>
                            <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {internships.map(internship => (
                            <div key={internship.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#333', marginBottom: '8px' }}>{internship.title}</h4>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Department: {internship.department}</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Duration: {internship.duration}</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Stipend: {internship.stipend}</p>
                                        <p style={{ color: '#666' }}>Applicants: {internship.applicants}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            background: getStatusColor(internship.status),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {internship.status}
                                        </span>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                            <Eye size={16} style={{ marginRight: '4px' }} />
                                            View Details
                                        </button>
                                        <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Applications */}
            {activeTab === 'applications' && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Student Applications</h2>
                        <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">
                            Back to Dashboard
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {applications.map(application => (
                            <div key={application.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ color: '#333', marginBottom: '8px' }}>{application.studentName}</h4>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Position: {application.position}</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>College: {application.college}</p>
                                        <p style={{ color: '#666', marginBottom: '8px' }}>CGPA: {application.cgpa}</p>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {application.skills.map((skill, index) => (
                                                <span key={index} style={{
                                                    background: '#e3f2fd',
                                                    color: '#1976d2',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            background: getStatusColor(application.status),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {application.status}
                                        </span>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                            <Eye size={16} style={{ marginRight: '4px' }} />
                                            View Profile
                                        </button>
                                        {application.status === 'Applied' && (
                                            <>
                                                <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                                    <CheckCircle size={16} style={{ marginRight: '4px' }} />
                                                    Accept
                                                </button>
                                                <button style={{
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <X size={16} style={{ marginRight: '4px' }} />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Interns */}
            {activeTab === 'selected' && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Selected Interns</h2>
                        <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">
                            Back to Dashboard
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {selectedInterns.map(intern => (
                            <div key={intern.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#333', marginBottom: '8px' }}>{intern.name}</h4>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Position: {intern.position}</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Start Date: {intern.startDate}</p>
                                        <p style={{ color: '#666', marginBottom: '8px' }}>Mentor: {intern.mentor}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Progress:</span>
                                            <div style={{
                                                background: '#e9ecef',
                                                borderRadius: '10px',
                                                width: '200px',
                                                height: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    background: '#28a745',
                                                    height: '100%',
                                                    width: `${intern.progress}%`,
                                                    transition: 'width 0.3s ease'
                                                }}></div>
                                            </div>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>{intern.progress}%</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                            <Eye size={16} style={{ marginRight: '4px' }} />
                                            View Progress
                                        </button>
                                        <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                            Send Feedback
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default IndustryDashboard;