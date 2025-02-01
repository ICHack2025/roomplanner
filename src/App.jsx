import { useState } from 'react'
import './App.css'
import ThreeScene from './ThreeScene'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <ThreeScene />
    </div>
  )
}

export default App
