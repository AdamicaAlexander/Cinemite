import React from 'react';

export const LoadingView = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p className="text-cyan" style={{ fontSize: '1.8rem' }}>Loading...</p>
        </div>
    );
};

export const ErrorView = ({ message }) => {
    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'red', fontSize: '1.8rem' }}>{message}</p>
        </div>
    );
};
