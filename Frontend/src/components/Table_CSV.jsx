import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Table_CSV = () => {
  const { user, dbId, dbname, table } = useParams()
  const [Data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:3000/export/table/?dbId=${dbId}&dbName=${dbname}&table=${table}&csv=`)
      const data = await response.json()
      // console.log(data)
      setData(data)
      console.log(data)
    }
    fetchData()
  }, [dbId, dbname, table])

  // Get column names from the first row
  const columns = Data.length > 0 ? Object.keys(Data[0]) : []

  return (
    <div 
      style={{
        display: 'flex',
        padding: '10px',
        margin: '20px',
        borderRadius: '5px',
        backgroundColor: '#f0f0f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
    <div
      style={{
        width: '100%',
        overflowX: 'scroll',
      }}
    >
      <table border="1" cellPadding="5" cellSpacing="0"
        style={{
          width: '80%',
          // border: '1px solid red',
          borderCollapse: 'collapse',
          margin: '20px 0',
          fontSize: '1.2em',
          fontFamily: 'Arial, sans-serif',
          
        }}
      >
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Data.length > 0 && Data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}

export default Table_CSV