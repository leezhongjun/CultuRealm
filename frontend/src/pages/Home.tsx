import ParticlesBg from "particles-bg";
import { Link } from "react-router-dom";

function App() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="text-center pb-12 md:pb-16">
            <h1
              className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4"
              data-aos="zoom-y-out"
            >
              Welcome to{" "}
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                CultuRealm
              </span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p
                className="text-xl text-gray-800 mb-8"
                data-aos="zoom-y-out"
                data-aos-delay="150"
              >
                The future of Cultural Education
              </p>
              <div
                className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center"
                data-aos="zoom-y-out"
                data-aos-delay="300"
              >
                <div className="flex items-center space-x-4 mb-4 justify-center">
                  <Link
                    to="/story"
                    className="px-4 py-2 text-base font-medium tracking-wide text-white transition-colors duration-200 transform bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-blue-600"
                  >
                    Play Stories
                  </Link>

                  <Link
                    to="/challenge"
                    className="px-4 py-2 text-base font-medium tracking-wide text-white transition-colors duration-200 transform bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:bg-blue-600"
                  >
                    Play Challenges
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <ParticlesBg num={10} type="square" bg={true} />
      </div>
    </>
  );
}

export default App;
