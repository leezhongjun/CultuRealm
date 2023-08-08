import { useEffect,useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import ParticlesBg from "particles-bg";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
import { useAuthHeader } from "react-auth-kit";

// let config = {
  //   num: [1, 2],
  //   rps: 0.1,
  //   radius: [5, 40],
  //   life: [1.5, 3],
  //   v: [2, 3],
  //   tha: [-40, 40],
  //   // body: "./img/icon.png", // Whether to render pictures
  //   // rotate: [0, 20],
  //   alpha: [0.6, 0],
  //   scale: [1, 0.1],
  //   position: "center", // all or center or {x:1,y:1,width:100,height:100}
  //   color: ["random", "#ff0000"],
  //   cross: "dead", // cross or bround
  //   random: 15,  // or null,
  //   g: 5,    // gravity
  //   // f: [2, -1], // force
  //   onParticleUpdate: (ctx, particle) => {
  //       ctx.beginPath();
  //       ctx.rect(particle.p.x, particle.p.y, particle.radius * 2, particle.radius * 2);
  //       ctx.fillStyle = particle.color;
  //       ctx.fill();
  //       ctx.closePath();
  //   }
  // };

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [data, setData] = useState({'checked':null});

  const handleFormSubmit = async (event) => {
    event.preventDefault(); //Don't refresh page

    setCurrentPage('game');

    const checkbox = document.getElementById("default-checkbox") as HTMLInputElement;
    const checkboxValue = checkbox.checked

    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/handle_gameplay",
        { checked: checkboxValue },
        {}
      );
      setData(response.data);
      console.log(response.data)
    } catch (error) {
      console.error(error);
    }
  };

  function LandingPage() {
    return (
      <>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero content */}
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            {/* Section header */}
            <div className="text-center pb-12 md:pb-16">
              <h1
                className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4"
                data-aos="zoom-y-out"
              >
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
                  Begin your journey!
                </p>
                <div
                  className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay="300"
                >
                  <div>
                  <form onSubmit={handleFormSubmit}>
                  <button type="submit" className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Enter Story
                    </span>
                  </button>
                  <div>
                    <input id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                    <label>Suggested Answer</label>
                  </div>
                  </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ParticlesBg num={100} type="square" bg={true} />
          {/* <ParticlesBg type="custom" config={config} bg={true} /> */}
        </div>
      </>
      );
    };

  function Gameplay() {
    return (
    <div className="grid grid-rows-3 gap-3 h-screen">

    {/* Row 1 */}
    <div className="grid row-span-2 grid-cols-2 gap-3">
      {/* Row 1 Grid 1 */}
      <div className="bg-green-100">
        <h1>Row 1 Grid 1: For story texts -- and probably User response at bottom</h1>
        Test: checkbox value: {String(data.checked)}
      </div>
      {/* Row 1 Grid 2 */}
      <div className="bg-blue-100">
        <h1>Row 1 Grid 2: For image</h1>
      </div>
    </div>
    {/* Row 2 */}
    <div className="grid row-span-1 grid-rows-1 gap-3">
      {/* With Suggested Responses */}
      {data.checked === true &&
      <div className='grid grid-cols-4 gap-3'>
        <div className="grid bg-red-100">
          <h1>Row 2: For suggested response</h1>
        </div>
        <div className="grid bg-red-100">

        </div>
        <div className="grid bg-red-100">

        </div>
        <div className="grid bg-red-100">
          Button here
        </div>
      </div>}
      {/* Without Suggested Responses */}
      {data.checked === false &&
      <div className='grid grid-cols-4 gap-3'>
        <div className="grid col-span-3 bg-red-100">
          <h1>Row 2:</h1>
        </div>
        <div className="grid col-span-1 bg-red-100">
          Button here
        </div>
      </div>}

    </div>
    </div>
    
    );
  }
  
  return (
    <div>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'game' && <Gameplay />}
    </div>

  );
}

export default App;
