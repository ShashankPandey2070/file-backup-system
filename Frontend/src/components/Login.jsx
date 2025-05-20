import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import MyContext from '../util/MyContext';

function Login({ setimageUrl }) {
    const navigate = useNavigate();
    const { email, setEmail } = useContext(MyContext); 
    const login = useGoogleLogin({
        onSuccess: async tokenResponse => {
            try {
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`,
                        },
                    }
                );
                // const response = await axios.post('http://localhost:3000/api/auth/google', {
                //     user: {
                //         email: userInfo.data.email,
                //     }
                // });
                setEmail(userInfo.data.email)
                // const data = response.data;
                console.log(userInfo)
                // setimageUrl(userInfo.data.picture)
                navigate(`/main`);
            } catch (error) {
                console.error("Error fetching user info", error);
            }
        },
    });

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f6fa'
        }}>
            <div style={{
                padding: '2rem 3rem',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                background: '#fff',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Welcome to Book Marker</h2>
                <button
                    onClick={login}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#4285F4',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(66,133,244,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT65WTmiisS-2uqMBJ8C-OwNvh02PWiwMLxxg&s"
                        alt="Google"
                        style={{ width: 24, height: 24 }}
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

export default Login;