function Upload() {

  const handleFileChange = (event) => {
    window.location.href = "/create_points";
  }

  return (
    <div>
      <h1>React Image Upload</h1>

      {/* upload button */}
      <input type="file" accept="image/" onChange={handleFileChange}/>
    </div>
  )
}

export default Upload
