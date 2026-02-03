import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const EventsListPage = () => {
    const [events, setEvents] = useState([]);
    const { user } = useContext(AuthContext);
    const [expandedEventId, setExpandedEventId] = useState(null);
    const [tempRegistrations, setTempRegistrations] = useState({}); // Store registration data for display
    
    // Form State
    const [regForm, setRegForm] = useState({ name: '', email: '', department: '', phoneNumber: '' });
    const [msg, setMsg] = useState({ text: '', type: '', eventId: null });

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchPersonalRegs = async () => {
            if (user) {
                try {
                    const res = await api.get('/events/myevents');
                    const regs = {};
                    res.data.forEach(ev => {
                        regs[ev._id] = ev.registrationDetails;
                    });
                    setTempRegistrations(prev => ({ ...prev, ...regs }));
                } catch (err) { console.error(err); }
            }
        };
        fetchEvents();
        fetchPersonalRegs();
    }, [user]);

    const toggleExpand = (eventId) => {
        if (expandedEventId === eventId) {
            setExpandedEventId(null);
        } else {
            setExpandedEventId(eventId);
            setMsg({ text: '', type: '', eventId: null });
            
            // Pre-fill form if user is logged in
            if (user) {
                setRegForm({
                    name: user.name || '',
                    email: user.email || '',
                    department: '',
                    phoneNumber: ''
                });
            } else {
                setRegForm({ name: '', email: '', department: '', phoneNumber: '' });
            }
        }
    };

    const handleRegister = async (e, eventId) => {
        e.preventDefault();
        try {
            const res = await api.post(`/events/${eventId}/register`, regForm);
            setMsg({ text: 'Successfully registered!', type: 'success', eventId });
            
            // Save submitted details to show them immediately
            setTempRegistrations(prev => ({
                ...prev,
                [eventId]: { ...regForm }
            }));

            // Update local state to show registered status
            setEvents(events.map(ev => 
                ev._id === eventId 
                ? { ...ev, registeredStudents: [...(ev.registeredStudents || []), (user?.id || 'guest')] } 
                : ev
            ));
        } catch (err) {
            setMsg({ text: err.response?.data?.msg || 'Registration failed', type: 'error', eventId });
        }
    };

    const handleUnregister = async (eventId) => {
        if (!window.confirm('Are you sure you want to cancel your registration?')) return;
        
        try {
            const email = tempRegistrations[eventId]?.email;
            await api.delete(`/events/${eventId}/unregister${!user ? `?email=${email}` : ''}`);
            setMsg({ text: 'Registration cancelled successfully', type: 'success', eventId });
            
            // Remove from local state
            const updatedRegs = { ...tempRegistrations };
            delete updatedRegs[eventId];
            setTempRegistrations(updatedRegs);

            setEvents(events.map(ev => 
                ev._id === eventId 
                ? { ...ev, registeredStudents: (ev.registeredStudents || []).filter(s => s !== (user?.id || 'guest')) } 
                : ev
            ));
        } catch (err) {
            setMsg({ text: err.response?.data?.msg || 'Cancellation failed', type: 'error', eventId });
        }
    };

    return (
        <div className="container">
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Available Events</h2>
            <div className="event-grid">
                {events.map(event => {
                    const isExpanded = expandedEventId === event._id;
                    const isRegistered = user && event.registeredStudents && event.registeredStudents.includes(user.id);
                    // Also check if we just registered as guest in this session
                    const hasLocalReg = tempRegistrations[event._id];
                    
                    return (
                        <div key={event._id} className={`card ${isExpanded ? 'active-expansion' : ''}`} style={{ transition: 'all 0.3s ease' }}>
                            <div className="event-header">
                                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{event.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{new Date(event.date).toLocaleDateString()}</p>
                            </div>
                            
                            <div style={{ margin: '1rem 0' }}>
                                <p><strong>Venue:</strong> {event.venue}</p>
                                <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>{event.description}</p>
                            </div>

                            {!isExpanded ? (
                                <button 
                                    onClick={() => toggleExpand(event._id)} 
                                    className="primary-btn" 
                                    style={{ width: '100%', marginTop: 'auto' }}
                                >
                                    {isRegistered || hasLocalReg ? 'View Registration' : 'View Details & Register'}
                                </button>
                            ) : (
                                <div className="inline-registration" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.4s ease' }}>
                                    
                                    {msg.eventId === event._id && (
                                        <p style={{ 
                                            padding: '0.75rem', 
                                            borderRadius: '6px', 
                                            marginBottom: '1rem',
                                            background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: msg.type === 'success' ? '#4ade80' : '#f87171',
                                            border: `1px solid ${msg.type === 'success' ? '#22c55e' : '#ef4444'}`
                                        }}>
                                            {msg.text}
                                        </p>
                                    )}

                                    {user?.role === 'admin' ? (
                                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                                            <p style={{ color: '#94a3b8' }}>Admins cannot register for events.</p>
                                            <button onClick={() => setExpandedEventId(null)} className="primary-btn" style={{ background: 'transparent', border: '1px solid #475569', marginTop: '1rem' }}>Close</button>
                                        </div>
                                    ) : (isRegistered || hasLocalReg) ? (
                                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                            <p style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>✓ You are registered</p>
                                            
                                            {hasLocalReg && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Details:</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                        <span style={{ color: '#64748b' }}>Name:</span> <span>{hasLocalReg.name}</span>
                                                        <span style={{ color: '#64748b' }}>Email:</span> <span>{hasLocalReg.email}</span>
                                                        <span style={{ color: '#64748b' }}>Dept:</span> <span>{hasLocalReg.department}</span>
                                                        <span style={{ color: '#64748b' }}>Phone:</span> <span>{hasLocalReg.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => handleUnregister(event._id)} className="delete-btn" style={{ flex: 1, padding: '0.75rem' }}>Cancel Registration</button>
                                                <button onClick={() => setExpandedEventId(null)} className="primary-btn" style={{ flex: 1, background: 'transparent', border: '1px solid #475569' }}>Close Details</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={(e) => handleRegister(e, event._id)}>
                                            <h4 style={{ marginBottom: '1rem' }}>Event Registration</h4>
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.name} 
                                                    onChange={(e) => setRegForm({...regForm, name: e.target.value})} 
                                                    placeholder="Enter your name"
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input 
                                                    type="email" 
                                                    value={regForm.email} 
                                                    onChange={(e) => setRegForm({...regForm, email: e.target.value})} 
                                                    placeholder="your@email.com"
                                                    required 
                                                    readOnly={!!user}
                                                    style={user ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Department</label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.department} 
                                                    onChange={(e) => setRegForm({...regForm, department: e.target.value})} 
                                                    placeholder="e.g. Science" 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number</label>
                                                <input 
                                                    type="text" 
                                                    value={regForm.phoneNumber} 
                                                    onChange={(e) => setRegForm({...regForm, phoneNumber: e.target.value})} 
                                                    placeholder="e.g. 9876543210" 
                                                    required 
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                <button type="submit" className="primary-btn" style={{ flex: 1 }}>Confirm</button>
                                                <button type="button" onClick={() => setExpandedEventId(null)} className="primary-btn" style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', flex: 1 }}>Close</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {events.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No upcoming events at the moment.</p>}
        </div>
    );
};

export default EventsListPage;
