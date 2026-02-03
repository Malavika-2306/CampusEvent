import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import EventsListPage from './pages/EventsListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyEventsPage from './pages/MyEventsPage';
import AdminDashboardPage from "./pages/AdminDashboardPage";


const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<EventsListPage />} />
                    <Route path="/events/:id" element={<EventDetailsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/my-events" element={
                        <PrivateRoute>
                            <MyEventsPage />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboardPage />
                        </AdminRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
