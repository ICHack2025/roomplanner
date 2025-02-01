import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ThreeScene from './ThreeScene'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Poop</h1>
      <ThreeScene />
    </div>
  )
}

export default App
