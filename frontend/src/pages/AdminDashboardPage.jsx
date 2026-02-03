import React, { useEffect, useState } from 'react';
import api from '../api';

const AdminDashboardPage = () => {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', date: '', venue: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/events/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/events', formData);
            }
            setFormData({ title: '', description: '', date: '', venue: '' });
            fetchEvents();
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        }
    };

    const handleEdit = (event) => {
        setFormData({ 
            title: event.title, 
            description: event.description, 
            date: event.date.split('T')[0], // Simple date format for input
            venue: event.venue 
        });
        setEditingId(event._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            {/* ADMIN TITLE */}
            <h2 className="admin-title">Admin Dashboard</h2>
            
            {/* CREATE EVENT */}
            <div className="card">
                <h3>{editingId ? 'Edit Event' : 'Create New Event'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Event title" required />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Venue</label>
                        <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Event venue" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                    </div>
                    <button type="submit" className="primary-btn">{editingId ? 'Update Event' : 'Create Event'}</button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', date: '', venue: '' }); }} style={{ marginLeft: '1rem', background: '#64748b' }}>Cancel</button>}
                </form>
            </div>

            {/* MANAGE EVENTS */}
            <h3 className="section-title">Manage Events</h3>
            
            {events.map(event => (
                <div key={event._id} className="card">
                    <h4>{event.title}</h4>
                    <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                    <p>Registered Students: {event.registeredStudents?.length || 0}</p>

                    <button onClick={() => handleEdit(event)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(event._id)} className="delete-btn">Delete</button>
                </div>
            ))}
        </div>
    );
};

export default AdminDashboardPage;
