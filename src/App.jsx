import { useState } from 'react'
import './App.css'
import ThreeScene from './ThreeScene'

function App() {
  const [count, setCount] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
    }
  }

  return (
    <div>
      <h1>React Image Upload</h1>

      {/* upload button */}
      <input type="file" accept="image/" onChange={handleFileChange}/>

      {/* Preview */}
      {selectedFile && <img src={selectedFile} alt="Overlay" style={{ 
        position:"fixed",
        top:0,
        left:0,
        width:"100vw", 
        height:"100vh",
        objectFit:"cover",
        opacity: 0.5,
        zIndex: 10,
        pointerEvents: "none"}}/>}
      <ThreeScene />
    </div>
  )
}

export default App
