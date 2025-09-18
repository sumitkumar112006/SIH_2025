import React, { useState } from 'react';
import { Users, UserCheck, BarChart3, FileText, Settings, Plus, Eye, CheckCircle } from 'lucide-react';

function CollegeDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Mock data
    const [students] = useState([
        { id: 1, name: 'Rahul Sharma', email: 'rahul@student.ac.in', course: 'B.Tech CSE', year: '3rd', internshipStatus: 'Active', mentor: 'Dr. Smith' },
        { id: 2, name: 'Priya Patel', email: 'priya@student.ac.in', course: 'B.Tech ECE', year: '4th', internshipStatus: 'Completed', mentor: 'Prof. Johnson' },
        { id: 3, name: 'Arjun Kumar', email: 'arjun@student.ac.in', course: 'B.Tech ME', year: '3rd', internshipStatus: 'Applied', mentor: 'Dr. Brown' }
    ]);

    const [mentors] = useState([
        { id: 1, name: 'Dr. Smith', department: 'Computer Science', students: 8, specialization: 'Software Development' },
        { id: 2, name: 'Prof. Johnson', department: 'Electronics', students: 6, specialization: 'IoT & Embedded Systems' },
        { id: 3, name: 'Dr. Brown', department: 'Mechanical', students: 5, specialization: 'Manufacturing & Design' }
    ]);

    const [reports] = useState([
        { id: 1, student: 'Rahul Sharma', title: 'Week 2 Progress Report', submittedDate: '2024-01-20', status: 'Reviewed', mentor: 'Dr. Smith' },
        { id: 2, student: 'Priya Patel', title: 'Final Project Report', submittedDate: '2024-01-18', status: 'Pending Review', mentor: 'Prof. Johnson' },
        { id: 3, student: 'Arjun Kumar', title: 'Monthly Evaluation', submittedDate: '2024-01-15', status: 'Approved', mentor: 'Dr. Brown' }
    ]);

    const [analytics] = useState({
        totalStudents: 150,
        activeInternships: 45,
        completedInternships: 32,
        averageRating: 4.2,
        placementRate: 85
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': case 'completed': case 'approved': case 'reviewed': return '#28a745';
            case 'pending review': case 'applied': return '#ffc107';
            case 'rejected': return '#dc3545';
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
                        <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>Analytics Overview</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div className="card" style={{ textAlign: 'center', background: '#e3f2fd' }}>
                                <h3 style={{ color: '#1976d2', fontSize: '2rem', marginBottom: '8px' }}>{analytics.totalStudents}</h3>
                                <p style={{ color: '#666' }}>Total Students</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#e8f5e8' }}>
                                <h3 style={{ color: '#2e7d32', fontSize: '2rem', marginBottom: '8px' }}>{analytics.activeInternships}</h3>
                                <p style={{ color: '#666' }}>Active Internships</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#fff3e0' }}>
                                <h3 style={{ color: '#f57c00', fontSize: '2rem', marginBottom: '8px' }}>{analytics.completedInternships}</h3>
                                <p style={{ color: '#666' }}>Completed</p>
                            </div>

                            <div className="card" style={{ textAlign: 'center', background: '#f3e5f5' }}>
                                <h3 style={{ color: '#7b1fa2', fontSize: '2rem', marginBottom: '8px' }}>{analytics.placementRate}%</h3>
                                <p style={{ color: '#666' }}>Placement Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Cards */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>College Dashboard</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            {/* Student Management */}
                            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('students')}>
                                <Users size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Student Management</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>{students.length} Students</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Manage Students
                                </button>
                            </div>

                            {/* Mentor Assignment */}
                            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('mentors')}>
                                <UserCheck size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Mentor Assignment</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>{mentors.length} Active Mentors</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    Assign Mentors
                                </button>
                            </div>

                            {/* Progress Monitoring */}
                            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>
                                <BarChart3 size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>Progress Monitoring</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>{reports.length} Reports</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    View Progress
                                </button>
                            </div>

                            {/* NEP 2020 Compliance */}
                            <div className="card" style={{ textAlign: 'center' }}>
                                <FileText size={48} style={{ color: '#4a90e2', margin: '0 auto 16px' }} />
                                <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '8px' }}>NEP 2020 Compliance</h3>
                                <p style={{ color: '#666', marginBottom: '16px' }}>Credit Mapping</p>
                                <button className="btn btn-primary" style={{ width: '100%' }}>
                                    View Reports
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Student Management */}
            {activeTab === 'students' && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Student Management</h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary">
                                <Plus size={16} style={{ marginRight: '8px' }} />
                                Add Student
                            </button>
                            <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {students.map(student => (
                            <div key={student.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#333', marginBottom: '8px' }}>{student.name}</h4>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>{student.email}</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>{student.course} - {student.year} Year</p>
                                        <p style={{ color: '#666' }}>Mentor: {student.mentor}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            background: getStatusColor(student.internshipStatus),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {student.internshipStatus}
                                        </span>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                            <Eye size={16} style={{ marginRight: '4px' }} />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mentor Management */}
            {activeTab === 'mentors' && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Mentor Assignment</h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary">
                                <Plus size={16} style={{ marginRight: '8px' }} />
                                Add Mentor
                            </button>
                            <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {mentors.map(mentor => (
                            <div key={mentor.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#333', marginBottom: '8px' }}>{mentor.name}</h4>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>{mentor.department} Department</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Specialization: {mentor.specialization}</p>
                                        <p style={{ color: '#666' }}>Students Assigned: {mentor.students}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                            Assign Students
                                        </button>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                            <Eye size={16} style={{ marginRight: '4px' }} />
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Reports */}
            {activeTab === 'reports' && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Progress Monitoring</h2>
                        <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">
                            Back to Dashboard
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {reports.map(report => (
                            <div key={report.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#333', marginBottom: '8px' }}>{report.title}</h4>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Student: {report.student}</p>
                                        <p style={{ color: '#666', marginBottom: '4px' }}>Mentor: {report.mentor}</p>
                                        <p style={{ color: '#666' }}>Submitted: {report.submittedDate}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            background: getStatusColor(report.status),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {report.status}
                                        </span>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                            <Eye size={16} style={{ marginRight: '4px' }} />
                                            Review
                                        </button>
                                        {report.status === 'Pending Review' && (
                                            <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
                                                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                                                Approve
                                            </button>
                                        )}
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

export default CollegeDashboard;