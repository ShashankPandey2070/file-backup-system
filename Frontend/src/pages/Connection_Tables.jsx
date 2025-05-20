import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'


const Connection_Tables = () => {
  const navigate = useNavigate()
  const { user, dbId } = useParams()
  const [serverDB, setserverDB] = useState([])
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [tables, setTables] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectTable, setselectTable] = useState([])
  const [selectDatabases, setselectDatabases] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:3000/api/connection/databases?dbId=${dbId}`)
      const data = await response.json()
      setserverDB(data)
    }
    fetchData()
  }, [user, dbId])

  const handleViewClick = async (index, dbName) => {
    setselectTable([])
    if (expandedIndex === index) {
      setExpandedIndex(null)
      return
    }
    setExpandedIndex(index)
    if (!tables[dbName]) {
      setLoading(true)
      const data = serverDB[index].tables // Mock data for demonstration
      // console.log(data)
      setTables(prev => ({ ...prev, [dbName]: data }))
      setLoading(false)
    }
  }

  const handleTableCheckBox = (tableName) => {
    let isPresent = false;
    let i = 0;
    for (; i < selectTable.length; ++i) {
      if (selectTable[i] === tableName) {
        isPresent = true;
        break;
      }
    }
    if (isPresent) {

      const dummy = selectTable.filter((item) => item !== tableName)
      setselectTable(prev => ([...dummy]))
    }
    else {
      const dummy = [...selectTable, tableName]
      setselectTable(prev => ([...dummy]))
    }
  }
  const handleDBCheckBox = (DBName) => {
    console.log(DBName)
    let isPresent = false;
    let i = 0;
    for (; i < selectDatabases.length; ++i) {
      if (selectDatabases[i] === DBName) {
        isPresent = true;
        break;
      }
    }
    if (isPresent) {

      const dummy = selectDatabases.filter((item) => item !== DBName)
      setselectDatabases(prev => ([...dummy]))
    }
    else {
      const dummy = [...selectDatabases, DBName]
      setselectDatabases(prev => ([...dummy]))
    }
    console.log(selectDatabases)
  }

  const handleTableBackup = async(dbName, idx) => {
    const response = await fetch('http://localhost:3000/export/database',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dbId: dbId,
          dbName: dbName,
          tables: (selectTable.length > 0) ? selectTable : serverDB[idx].tables
        })

      }
    )
    const data = await response.json()
    console.log(data)

  }

  const handleDbBackUp = async() => {
    const response = await fetch('http://localhost:3000/export/databases',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dbId: dbId,
          databases: selectDatabases
        })

      }
    )

    const data = await response.json()
    console.log(data)

  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        margin: '20px',
        borderRadius: '5px',
        backgroundColor: '#f0f0f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {(selectDatabases.length > 0 && expandedIndex === null) && (<div
        style={{
          display: 'flex',
          justifyContent: 'right',
          alignItems: 'center'
        }}
      ><button
        style={{
          color: 'black',
          padding: '3px 0',
          border: '1px solid #bdbdbd',
          background: '#f9f9f9',
          borderRadius: '6px',
          cursor: 'pointer',
          width: '80px',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'background 0.2s'
        }}
        onClick={() => handleDbBackUp()}
      >
          Back Up
        </button></div>)}
      <ul style={{
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>

        {serverDB.map((tab, index) => (
          <li
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              transition: 'box-shadow 0.2s',
              boxShadow: expandedIndex === index ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
            }}
          >

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', width: '90%', marginLeft: '10px' }}>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                {expandedIndex === null && (<input
                  onClick={() => handleDBCheckBox(tab.database)}
                  style={{
                    width: '15px',
                    height: '15px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                  }}
                  type="checkbox" name="" id="" />)}
                <p><strong>Name:</strong> {tab.database}</p>
                <p><strong>Type:</strong> {"MySQL"}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>

                <button
                  style={{
                    color: 'black',
                    padding: '3px 0',
                    border: '1px solid #bdbdbd',
                    background: '#f9f9f9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '80px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => handleViewClick(index, tab.database)}
                >
                  {expandedIndex === index ? 'Close' : 'View'}
                </button>
                {selectTable.length > 1 && expandedIndex === index && (<button
                  style={{
                    color: 'black',
                    padding: '3px 0',
                    border: '1px solid #bdbdbd',
                    background: '#f9f9f9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '80px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => handleTableBackup(tab.database, index)}
                >
                  Back Up
                </button>)}
              </div>
            </div>
            <div
              style={{
                maxHeight: expandedIndex === index ? '300px' : '0px',
                overflowY: 'scroll',
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#fff',
                marginTop: expandedIndex === index ? '10px' : '0px',
                borderRadius: '4px',
                boxShadow: expandedIndex === index ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                padding: expandedIndex === index ? '20px' : '0 10px',
              }}
            >
              {expandedIndex === index && (
                loading ? (
                  <div>Loading tables...</div>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {(tables[tab.database] || []).map((table, i) => (
                      <li key={i} style={{
                        padding: '4px 0',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '20px',
                        alignItems: 'center',
                      }}

                      >
                        <div style={{
                          display: 'flex',
                          gap: '20px',
                          alignItems: 'center',
                        }}>

                          <input
                            onClick={() => handleTableCheckBox(table)}
                            type="checkbox" name="" id="" />
                          <p>{table}</p>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '20px',
                          alignItems: 'center',
                          width: '20%'
                        }}>
                          <button
                            style={{
                              color: 'black',

                              // padding: 'px 0',
                              border: '1px solid #bdbdbd',
                              background: '#f9f9f9',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              width: '70px',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              transition: 'background 0.2s',
                              display: 'none'
                            }}
                            disabled={true}
                            onClick={() => {
                              // Handle table click here
                              navigate(`/main/${user}/${dbId}/${tab.database}/${table}`)
                              console.log(`Clicked on table: ${table}`)
                            }}
                          >View</button>
                          <button
                            style={{
                              color: 'black',

                              // padding: 'px 0',
                              border: '1px solid #bdbdbd',
                              background: '#f9f9f9',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              width: '70px',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              transition: 'background 0.2s',
                            }}
                          ><a href={`http://localhost:3000/export/table/?dbId=${dbId}&dbName=${tab.database}&table=${table}&csv=${false}`}>Back Up</a></button>
                        </div>
                      </li>
                    ))}
                    {(tables[tab.database] || []).length === 0 && <li>No tables found.</li>}
                  </ul>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Connection_Tables