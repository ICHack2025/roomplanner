import ThreeScene from "./ThreeScene";

const MainScene = () => {
  // Divide the screen into a 3/4 and 1/4 grid

  return (
    <div className="columns is-gapless">
      <div className="column is-three-quarters">
        <ThreeScene />
      </div>
      <div className="column is-one-quarter">
        <div className="container">
          <h1 className="title">Sidebar</h1>
          <p>Some content here</p>
        </div>
      </div>
    </div>
  );
};

export default MainScene;
