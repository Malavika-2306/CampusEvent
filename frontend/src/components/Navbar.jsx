import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Fixed import: useNavigate is better for logout redirect if needed, but Link is enough for nav
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="navbar">
            <div className="logo">Campus Events</div>
            <div className="nav-right">
                <Link to="/">Events</Link>
                {user ? (
                    <>
                        {user.role === 'admin' ? (
                            <Link to="/admin">Admin Dashboard</Link>
                        ) : (
                            <Link to="/my-events">My Events</Link>
                        )}
                        <span className="user-name">Hello, {user.name}</span>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
