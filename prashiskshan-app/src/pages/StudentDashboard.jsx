import React, { useState } from 'react';
import { FileText, Upload, Award, BookOpen, Plus, Eye, Download } from 'lucide-react';

function StudentDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Mock data
    const [internships] = useState([
        { id: 1, company: 'TechCorp', title: 'Software Development Intern', location: 'Bangalore', duration: '3 months', credits: 4, status: 'Open' },
        { id: 2, company: 'DataSoft', title: 'Data Science Intern', location: 'Mumbai', duration: '6 months', credits: 6, status: 'Open' },
        { id: 3, company: 'WebTech', title: 'Full Stack Developer', location: 'Pune', duration: '4 months', credits: 5, status: 'Open' }
    ]);

    const [applications] = useState([
        { id: 1, company: 'TechCorp', position: 'Software Development Intern', appliedDate: '2024-01-15', status: 'Under Review' },
        { id: 2, company: 'InnovateLab', position: 'UI/UX Intern', appliedDate: '2024-01-10', status: 'Accepted' },
        { id: 3, company: 'StartupXYZ', position: 'Marketing Intern', appliedDate: '2024-01-05', status: 'Rejected' }
    ]);

    const [submissions] = useState([
        { id: 1, title: 'Week 1 Progress Report', dueDate: '2024-02-01', status: 'Submitted', mentor: 'Dr. Smith' },
        { id: 2, title: 'Mid-term Evaluation', dueDate: '2024-02-15', status: 'Pending', mentor: 'Prof. Johnson' }
    ]);

    const [certificates] = useState([
        { id: 1, title: 'React Development Internship', company: 'TechCorp', issueDate: '2023-12-15', credits: 4, verified: true },
        { id: 2, title: 'Digital Marketing Certificate', company: 'MarketPro', issueDate: '2023-11-20', credits: 3, verified: true }
    ]);

    const skillPathways = [
        'Frontend Development',
        'Backend Development',
        'Data Science',
        'Digital Marketing',
        'Cybersecurity',
        'UI/UX Design'
    ];

    const learningResources = [
        { title: 'React Fundamentals', category: 'Frontend', duration: '4 hours' },
        { title: 'Python for Data Science', category: 'Data Science', duration: '8 hours' },
        { title: 'Digital Marketing Basics', category: 'Marketing', duration: '6 hours' }
    ];

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted': case 'submitted': case 'verified': return '#28a745';
            case 'pending': case 'under review': return '#ffc107';
            case 'rejected': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (activeTab === 'pathways') {
        return (
            <div className="container" style={{ padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Skill Readiness Pathways</h2>
                        <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">Back to Dashboard</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {skillPathways.map((pathway, index) => (
                            <div key={index} className="card" style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <BookOpen size={24} style={{ color: '#4a90e2', marginRight: '12px' }} />
                                    <h3 style={{ fontSize: '1.1rem', color: '#333' }}>{pathway}</h3>
                                </div>
                                <p style={{ color: '#666', marginBottom: '16px' }}>
                                    Complete this pathway to become industry-ready in {pathway.toLowerCase()}.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>6-8 weeks</span>
                                    <button className="btn btn-primary" style={{ padding: '8px 16px' }}>Start Learning</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'resources') {
        return (
            <div className="container" style={{ padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Learning Resource Hub</h2>
                        <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">Back to Dashboard</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                        {learningResources.map((resource, index) => (
                            <div key={index} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: '#333' }}>{resource.title}</h3>
                                    <span style={{
                                        background: '#e3f2fd',
                                        color: '#1976d2',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {resource.category}
                                    </span>
                                </div>
                                <p style={{ color: '#666', marginBottom: '16px' }}>Duration: {resource.duration}</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>Start Course</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '20px' }}>
            {/* Skill Readiness & Learning Resources Section */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>Skill Readiness & Learning Resources</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setActiveTab('pathways')}
                        style={{
                            background: '#f8f9fa',
                            border: '2px solid #dee2e6',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.borderColor = '#4a90e2';
                            e.target.style.background = '#f0f8ff';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.borderColor = '#dee2e6';
                            e.target.style.background = '#f8f9fa';
                        }}
                    >
                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Skill Readiness Pathways</h3>
                    </button>

                    <button
                        onClick={() => setActiveTab('resources')}
                        style={{
                            background: '#f8f9fa',
                            border: '2px solid #dee2e6',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.borderColor = '#4a90e2';
                            e.target.style.background = '#f0f8ff';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.borderColor = '#dee2e6';
                            e.target.style.background = '#f8f9fa';
                        }}
                    >
                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Learning Resource Hub</h3>
                    </button>
                </div>
            </div>

            {/* Dashboard Section */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>Dashboard</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {/* Internship Listings */}
                    <div className="card" style={{ textAlign: 'center' }}>
                        <FileText size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Internship Listings</h3>
                        <p style={{ color: '#666', marginBottom: '16px' }}>{internships.length} Available</p>
                        <button
                            onClick={() => setActiveTab('internships')}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            View All
                        </button>
                    </div>

                    {/* Applications */}
                    <div className="card" style={{ textAlign: 'center' }}>
                        <Upload size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Applications</h3>
                        <p style={{ color: '#666', marginBottom: '16px' }}>{applications.length} Total</p>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Track Status
                        </button>
                    </div>

                    {/* Report Submission */}
                    <div className="card" style={{ textAlign: 'center' }}>
                        <Download size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Report Submission</h3>
                        <p style={{ color: '#666', marginBottom: '16px' }}>{submissions.length} Tasks</p>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Submit Work
                        </button>
                    </div>

                    {/* Certificates */}
                    <div className="card" style={{ textAlign: 'center' }}>
                        <Award size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Certificates</h3>
                        <p style={{ color: '#666', marginBottom: '16px' }}>{certificates.length} Earned</p>
                        <button
                            onClick={() => setActiveTab('certificates')}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            View All
                        </button>
                    </div>
                </div>

                {/* Detailed Views */}
                {activeTab === 'internships' && (
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ color: '#333', marginBottom: '16px' }}>Available Internships</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {internships.map(internship => (
                                <div key={internship.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ color: '#333', marginBottom: '8px' }}>{internship.title}</h4>
                                            <p style={{ color: '#666', marginBottom: '4px' }}>{internship.company} • {internship.location}</p>
                                            <p style={{ color: '#666', marginBottom: '4px' }}>Duration: {internship.duration}</p>
                                            <p style={{ color: '#666' }}>Credits: {internship.credits}</p>
                                        </div>
                                        <button className="btn btn-primary">Apply Now</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ color: '#333', marginBottom: '16px' }}>My Applications</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {applications.map(application => (
                                <div key={application.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ color: '#333', marginBottom: '8px' }}>{application.position}</h4>
                                            <p style={{ color: '#666', marginBottom: '4px' }}>{application.company}</p>
                                            <p style={{ color: '#666' }}>Applied: {application.appliedDate}</p>
                                        </div>
                                        <span style={{
                                            background: getStatusColor(application.status),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {application.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ color: '#333', marginBottom: '16px' }}>Report Submissions</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {submissions.map(submission => (
                                <div key={submission.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ color: '#333', marginBottom: '8px' }}>{submission.title}</h4>
                                            <p style={{ color: '#666', marginBottom: '4px' }}>Mentor: {submission.mentor}</p>
                                            <p style={{ color: '#666' }}>Due: {submission.dueDate}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                background: getStatusColor(submission.status),
                                                color: 'white',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem'
                                            }}>
                                                {submission.status}
                                            </span>
                                            {submission.status === 'Pending' && (
                                                <button className="btn btn-primary" style={{ padding: '8px 16px' }}>Upload</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ color: '#333', marginBottom: '16px' }}>My Certificates</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {certificates.map(certificate => (
                                <div key={certificate.id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ color: '#333', marginBottom: '8px' }}>{certificate.title}</h4>
                                            <p style={{ color: '#666', marginBottom: '4px' }}>{certificate.company}</p>
                                            <p style={{ color: '#666', marginBottom: '4px' }}>Issued: {certificate.issueDate}</p>
                                            <p style={{ color: '#666' }}>Credits: {certificate.credits}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {certificate.verified && (
                                                <span style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    Verified
                                                </span>
                                            )}
                                            <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                                <Download size={16} style={{ marginRight: '4px' }} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;