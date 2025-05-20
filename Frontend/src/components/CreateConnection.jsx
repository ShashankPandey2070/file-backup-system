import React, { useState } from 'react';

const CreateConnection = ({ isCreate, setisCreate }) => {
    const [formData, setFormData] = useState({
        host: '',
        password: '',
        username: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const { host, username, password } = formData;
        if (!host || !username || !password) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/save-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, user: username, password }),
            });
            const data = await response.json();
            setSuccess('Connection created successfully!');
            setFormData({ host: '', password: '', username: '' });
            setTimeout(() => {
                setisCreate(false);
                setError('');
                setSuccess('');
            }, 1200);
        } catch (err) {
            setError('Error creating connection');
        }
    };

    const handleTestCredentials = async () => {
        setError('');
        setSuccess('');
        const { host, username, password } = formData;



        if (!host || !username || !password) {
            setError('Please fill in all fields');
            return;
        }

        

        try {
            const response = await fetch('http://localhost:3000/api/check-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, user: username, password }),
            });
            const data = await response.json();
            if (data.success) setSuccess('Credentials are valid');
            else setError('Invalid credentials');
        } catch {
            setError('Error testing credentials');
        }
    };

    const handleClose = () => {
        setisCreate(false);
        setFormData({ host: '', password: '', username: '' });
        setError('');
        setSuccess('');
    };

    if (!isCreate) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '90vw',
                height: '90px',
                marginLeft: '5vw',
            }}>
                <h2>All Jobs</h2>
                <button
                    onClick={() => setisCreate(true)}
                    style={{
                        background: 'linear-gradient(90deg, #4CAF50 60%, #43e97b 100%)',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem'
                    }}
                >Create New Job</button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'white',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s',
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '18px',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
                padding: '1rem 1rem 1rem 1rem',
                minWidth: '340px',
                maxWidth: '95vw',
                position: 'relative',
                animation: 'fadeIn 0.4s',
                display: 'flex',
                flexDirection: 'column',
                // alignItems: 'center',
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '18px',
                        background: 'none',
                        color: '#333',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'color 0.2s',
                    }}
                    aria-label="Close"
                >×</button>
                <h2 style={{
                    marginBottom: '1.5rem',
                    color: '#222',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                }}>Create Connection</h2>
                <form style={{ width: '100%' }} onSubmit={handleFormSubmit} autoComplete="off">
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="host" style={{ fontWeight: 700 }}>Host</label>
                        <input
                            type="text"
                            id="host"
                            name="host"
                            value={formData.host}
                            onChange={handleFormChange}
                            required
                            style={{
                                marginTop: '2px',
                                padding: '6px',
                                borderRadius: '7px',
                                border: '1px solid #bdbdbd',
                                width: '90%',
                                fontSize: '1rem',
                                outline: 'none',
                                background: '#f9f9f9'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="username" style={{ fontWeight: 700 }}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleFormChange}
                            required
                            style={{
                                marginTop: '2px',
                                padding: '6px',
                                borderRadius: '7px',
                                border: '1px solid #bdbdbd',
                                width: '90%',
                                fontSize: '1rem',
                                outline: 'none',
                                background: '#f9f9f9'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="password" style={{ fontWeight: 700 }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleFormChange}
                            required
                            style={{
                                marginTop: '2px',
                                padding: '6px',
                                borderRadius: '7px',
                                border: '1px solid #bdbdbd',
                                width: '90%',
                                fontSize: '1rem',
                                outline: 'none',
                                background: '#f9f9f9'
                            }}
                        />
                    </div>
                    {error && (
                        <div style={{
                            // background: '#ff5252',
                            color: 'red',
                            // padding: '7px',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            width: '100%',
                            textAlign: 'left',
                            fontWeight: 500,
                            letterSpacing: '0.2px'
                        }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            color: 'rgb(5, 156, 51)',
                            // padding: '7px',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            width: '100%',
                            textAlign: 'left',
                            fontWeight: 500,
                            letterSpacing: '0.2px'
                        }}>
                            {success}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleTestCredentials}
                        style={{
                            // background: 'linear-gradient(90deg,rgb(5, 156, 51) 60%,rgb(255, 255, 255) 100%)',
                            color: 'black',
                            padding: '5px 0',
                            // border: 'none',
                            border: '1px solid #bdbdbd',
                            background: '#f9f9f9',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '30%',
                            marginBottom: '12px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            transition: 'background 0.2s'
                        }}
                    >Test</button>
                    <button
                        type="submit"
                        style={{
                            // background: 'linear-gradient(90deg,rgb(0, 0, 0) 60%,rgb(255, 255, 255) 100%)',
                            color: 'black',
                            padding: '5px 0',
                            border: '1px solid #bdbdbd',
                            background: '#f9f9f9',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '60%',
                            marginBottom: '12px',
                            marginLeft: '10px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            transition: 'background 0.2s'
                        }}
                    >Create Connection</button>
                </form>
            </div>
            {/* Fade-in animation */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.97);}
                    to { opacity: 1; transform: scale(1);}
                }
            `}</style>
        </div>
    );
};

export default CreateConnection;