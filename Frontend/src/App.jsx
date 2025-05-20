import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ConnectionAll from './pages/ConnectionAll'
import Connection_Table from './pages/Connection_Tables'
import Table_CSV from './components/Table_CSV'
import Login from './components/Login'
import MyContext from './util/MyContext'
import { useState } from 'react'

const App = () => {
  const [email, setEmail] = useState('');
  return (
    <>
     <MyContext.Provider value={{ email, setEmail }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<ConnectionAll />} />
        
        <Route path="/main/:user/:dbId" element={<Connection_Table />} />
        <Route path="/main/:user/:dbId/:dbname/:table" element={<Table_CSV />} />
        
      </Routes>
      </MyContext.Provider>
    </>
  )
}

export default App
