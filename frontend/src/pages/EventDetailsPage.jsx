import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const EventDetailsPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');

    const [regForm, setRegForm] = useState({ name: '', email: '', department: '', phoneNumber: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data);
                if (user) {
                    setRegForm(prev => ({ 
                        ...prev, 
                        name: user.name,
                        email: user.email || '' // Pre-fill email if available in user object
                    }));
                }
            } catch (err) {
                console.error(err);
                setMsg(err.response?.data?.msg || 'Failed to load event. Please try again.');
            }
        };
        fetchEvent();
    }, [id, user]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/events/${id}/register`, regForm);
            setMsg('Successfully registered!');
            setShowForm(false);
            // Re-fetch or update state to reflect registration
             setEvent(prev => ({
                ...prev,
                registeredStudents: [...(prev.registeredStudents || []), user.id]
            }));
        } catch (err) {
            setMsg(err.response?.data?.msg || 'Registration failed');
        }
    };

    if (msg && !event) return (
         <div className="container">
            <div className="card" style={{ borderColor: 'var(--error)' }}>
                <h3>Error</h3>
                <p>{msg}</p>
                <button onClick={() => navigate('/')}>Back to Events</button>
            </div>
        </div>
    );

    if (!event) return <div className="container">Loading event details...</div>;

    const isRegistered = user && event.registeredStudents && event.registeredStudents.includes(user.id);

    return (
        <div className="container">
            <div className="card">
                <h2>{event.title}</h2>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p style={{ margin: '1rem 0' }}>{event.description}</p>
                
                {msg && <p style={{ color: msg.includes('Success') ? 'var(--success)' : 'var(--error)' }}>{msg}</p>}

                {/* Action Buttons */}
                {/* Action Buttons - Always Visible Registration Form */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    
                    {user?.role === 'admin' ? (
                        <div style={{ textAlign: 'center' }}>
                            <button disabled className="primary-btn" style={{ background: '#64748b', cursor: 'not-allowed' }}>Registration Disabled</button>
                            <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Administrators cannot register for events.</p>
                        </div>
                    ) : isRegistered ? (
                        <div style={{ textAlign: 'center' }}>
                            <button disabled className="primary-btn" style={{ background: '#22c55e', cursor: 'default', opacity: 1 }}>✓ Registered</button>
                            <p style={{ marginTop: '0.5rem', color: '#4ade80', fontSize: '0.9rem' }}>You are attending this event.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Register for this Event</h3>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={regForm.name} 
                                    onChange={(e) => setRegForm({...regForm, name: e.target.value})} 
                                    placeholder="Enter your full name"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={regForm.email} 
                                    onChange={(e) => setRegForm({...regForm, email: e.target.value})} 
                                    placeholder="yourname@example.com"
                                    required 
                                    readOnly={!!user} // Only read-only if logged in
                                    style={user ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input 
                                    type="text" 
                                    value={regForm.department} 
                                    onChange={(e) => setRegForm({...regForm, department: e.target.value})} 
                                    placeholder="e.g. Computer Science" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="text" 
                                    value={regForm.phoneNumber || ''} 
                                    onChange={(e) => setRegForm({...regForm, phoneNumber: e.target.value})} 
                                    placeholder="e.g. 1234567890" 
                                    required 
                                />
                            </div>
                            <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '1rem' }}>Confirm Registration</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;
