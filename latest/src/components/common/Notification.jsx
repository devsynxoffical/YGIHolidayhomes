import React from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', onClose }) => {
    return (
        <div className={`notification-overlay`}>
            <div className={`notification-box ${type}`}>
                <div className="notification-icon">
                    {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div className="notification-content">
                    {typeof message === 'string' ? (
                        message.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))
                    ) : (
                        message
                    )}
                </div>
                <button className="notification-close" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default Notification;
