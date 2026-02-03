import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const MyEventsPage = () => {
    const [events, setEvents] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const res = await api.get('/events/myevents');
                setEvents(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchMyEvents();
    }, [user]);

    return (
        <div className="container">
            <h2>My Registered Events</h2>
            <div className="event-grid">
                {events.map(event => (
                    <div key={event._id} className="card">
                        <h3>{event.title}</h3>
                        <p>{new Date(event.date).toLocaleDateString()}</p>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                            <strong>Registered as:</strong> {event.registrationDetails?.name} <br/>
                            <strong>Email:</strong> {event.registrationDetails?.email} <br/>
                            <strong>Dept:</strong> {event.registrationDetails?.department} <br/>
                            <strong>Phone:</strong> {event.registrationDetails?.phoneNumber}
                        </p>
                        <p>{event.description.substring(0, 100)}...</p>
                        <Link to={`/events/${event._id}`} className="primary-btn" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
            {events.length === 0 && <p>You haven't registered for any events yet.</p>}
        </div>
    );
};

export default MyEventsPage;
