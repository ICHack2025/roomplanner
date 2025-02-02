import "./../style/home.scss";

const Home = () => {
  return (
    <>
      <div className="home-styling">
        <section className="hero is-fullheight-with-navbar">
          <div className="hero-body">
            <div className="container is-flex is-align-items-center is-justify-content-center">
              <div className="columns">
                <div className="column is-flex is-align-items-center is-justify-content-center">
                  <div className="content pl-3 is-flex  is-align-items-center is-justify-content-center is-flex-direction-column">
                    <h1
                      style={{
                        fontSize: "6em",
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
                    <a href="/form" className="button is-large">
                      <span className="icon">
                        {/* <FontAwesomeIcon icon={faRocket} /> */}
                      </span>
                      <span>Design your Interior</span>
                    </a>
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
          opacity: 0.2,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default Home;
