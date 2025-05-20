import React, { useContext } from 'react'

import { useState, useEffect } from 'react'
import CreateConnection from '../components/CreateConnection'
import { useNavigate } from 'react-router-dom'
// import MyContext from '../util/MyContext'
import axios from 'axios'

const ConnectionAll = () => {
    const navigate = useNavigate()
    const [isCreate, setisCreate] = useState(false)
    const [allConn, setallConn] = useState([])
    // const [email, setEmail] = useContext(MyContext)

    const [isDelete, setisDelete] = useState(false)


    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('http://localhost:3000/api/connection/all?user=');
            setallConn(response.data)
        }
        fetchData()
    }, [isCreate, isDelete]);


    const handleServerBackUp = async (conn) => {
        const databases = []
        const response = await fetch(`http://localhost:3000/api/connection/databases?dbId=${conn.id}`)
        const data = await response.json()
        for (let i = 0; i < data.length; ++i) {
            databases.push(data[i].database);
        }
        const res = await fetch('http://localhost:3000/export/databases',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dbId: conn.id,
                    databases
                })

            }
        )
        const dt = await res.json();
        console.log(dt)
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
            minHeight: '40%',
        }}>
            {/* create new connection here */}
            <div>
                <CreateConnection isCreate={isCreate} setisCreate={setisCreate} />
            </div>

            {/* Show all the connections in rows */}
            <div style={{
                width: '80%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {allConn.length === 0 ? (
                    <div>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontStyle: 'italic',
                        }}>No connections found.</h3>
                    </div>
                ) : (
                    <div>
                        <ul style={{
                            listStyleType: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            {allConn.map((conn) => (
                                <li
                                    key={conn.id}
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: '5px',
                                        padding: '20px',
                                        marginBottom: '10px',
                                        backgroundColor: '#f9f9f9',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                    }}

                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <p><strong>Name:</strong> {conn.user}</p>
                                        <p><strong>Type:</strong> {"MySQL"}</p>
                                        <p><strong>Host:</strong> {conn.host}</p>
                                        <p><strong>Port:</strong> {"3034"}</p>
                                        <button
                                            style={{
                                                color: 'black',
                                                padding: '3px 0',
                                                border: '1px solid #bdbdbd',
                                                background: '#f9f9f9',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                width: '100px',
                                                marginBottom: '12px',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onClick={() => {
                                                navigate(`/main/root/${conn.id}`);
                                            }}
                                        >
                                            Connect
                                        </button>
                                        {/* for delete */}
                                        <button
                                            style={{
                                                color: 'black',
                                                padding: '3px 0',
                                                border: '1px solid #bdbdbd',
                                                background: '#f9f9f9',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                width: '100px',
                                                marginBottom: '12px',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const response = await fetch(`http://localhost:3000/api/connection/?connId=${conn.id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    }
                                                })
                                                const data = await response.json()
                                                console.log(data)
                                                setisDelete(!isDelete)
                                            }}
                                        >
                                            Delete
                                        </button>
                                        {/* For backend */}
                                        <button
                                            onClick={() => handleServerBackUp(conn)}
                                            style={{
                                                color: 'black',
                                                padding: '3px 0',
                                                border: '1px solid #bdbdbd',
                                                background: '#f9f9f9',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                width: '100px',
                                                marginBottom: '12px',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            Back up
                                        </button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div>
        </div>
        </div >
    );
}

export default ConnectionAll