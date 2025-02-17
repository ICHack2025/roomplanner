import { useRef } from "react";
import "./../style/home.scss";

const Home = () => {

  const handleFileChange = (event) => {
    window.location.href = "/create_points";
  };
  return (
    <>
      <div className="home-styling">
        <section className="hero is-fullheight-with-navbar">
          <div className="hero-body">
            <div className="container is-flex is-align-items-center is-justify-content-center">
              <div className="columns">
                <div className="column is-flex is-align-items-center is-justify-content-center">
                  <div
                    id="skibidi"
                    className="content pl-3 is-flex  is-align-items-center is-justify-content-center is-flex-direction-column"
                    style={{
                      maxWidth: "50%",
                      margin: "auto",
                      padding: "2rem",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "10em",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      furn.it
                    </h1>
                    <p className="is-size-3">
                      Your <strong>personalized</strong> interior designing
                      assistant.
                    </p>
                    {/* upload button */}
                    <button onClick={() => document.getElementById("fileInput").click()}>
        Scan my Room
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <img
        src="./wavebg.png"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default Home;
