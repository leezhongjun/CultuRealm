import { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import loadingIcon from "../assets/loading-balls.svg";
import ParticlesBg from "particles-bg";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
import { useAuthHeader } from "react-auth-kit";
import { styles } from "./Settings";
import HighlightedParagraph from "../components/HighlightedPara";

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
  const [currentPage, setCurrentPage] = useState(-1);
  const [needSuggestions, setNeedSuggestions] = useState(false);
  const [style, setStyle] = useState("Photorealistic");
  const [resp, setResp] = useState("");
  const [action, setAction] = useState("do");
  const [suggestion1, setSuggestion1] = useState("Loading...");
  const [suggestion2, setSuggestion2] = useState("Loading...");
  const [imgSrc, setImgSrc] = useState(loadingIcon);
  const [storyText, setStoryText] = useState("Loading...");
  const [phrases, setPhrases] = useState([]);
  const [feedback, setFeedback] = useState("Loading...");
  const [latestIndex, setLatestIndex] = useState(-1);
  const [showResponseSubmit, setShowResponseSubmit] = useState(true);

  const startStoryForm = async (event) => {
    event.preventDefault(); //Don't refresh page

    setCurrentPage(0);
    const checkbox = document.getElementById(
      "default-checkbox"
    ) as HTMLInputElement;
    setNeedSuggestions(checkbox.checked);
    setLatestIndex(0);
    setSuggestion1("Loading...");
    setSuggestion2("Loading...");
    setStoryText("Loading...");
    setImgSrc(loadingIcon);
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/start_story",
        { suggestions: checkbox.checked },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      const data = response.data;
      console.log(data);
      setSuggestion1(data.suggestion_1);
      setSuggestion2(data.suggestion_2);
      setStoryText(data.story_text);
      setPhrases(data.keywords);
      setStyle(data.image_style);
      setFeedback("");
      setResp("");
      const response_img = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/regen_img",
        { image_style: data.image_style, story_index: 0 },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      setImgSrc(response_img.data.image_url);
    } catch (error) {
      console.error(error);
    }
  };

  // call state api, set page to corect page

  const getStoryData = async (
    page: number,
    latestPage: number = latestIndex
  ) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/story_index",
        { story_index: page },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      console.log(response);
      if (!response.data.story_starting) {
        setNeedSuggestions(response.data.has_suggestions);
        if (response.data.has_suggestions && page === latestPage) {
          setSuggestion1(response.data.suggestion_1);
          setSuggestion2(response.data.suggestion_2);
        }
        setStoryText(response.data.story_text);
        setPhrases(response.data.keywords);
        setStyle(response.data.image_style);
        setFeedback(response.data.feedback);
        setResp(response.data.user_response);
        setImgSrc(response.data.image_url);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const authHeader = useAuthHeader();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_state",
          {},
          {
            headers: {
              Authorization: authHeader(),
            },
          }
        );
        // console.log(response);
        setCurrentPage(response.data.story_index);
        setLatestIndex(response.data.story_index);
        getStoryData(response.data.story_index, response.data.story_index);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

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
                </span>{" "}
                Stories
              </h1>
              <div className="max-w-3xl mx-auto">
                <p
                  className="text-xl text-gray-800 mb-6"
                  data-aos="zoom-y-out"
                  data-aos-delay="150"
                >
                  Experience cultures with unique and interactive stories
                </p>
                <div
                  className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay="300"
                >
                  <div>
                    <form onSubmit={startStoryForm} className="py-0">
                      <button
                        type="submit"
                        className="px-4 py-2 text-base font-medium tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                      >
                        Begin Your Story
                      </button>
                      <div className="py-4 flex items-center">
                        <input
                          id="default-checkbox"
                          type="checkbox"
                          value=""
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="default-checkbox"
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Enable Suggested Responses (30% point penalty)
                        </label>
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
  }

  function Gameplay() {
    function handleSuggestionClick(suggestion: String) {
      const strs = suggestion.split(": ");
      setAction(strs[0].toLowerCase());
      setResp(strs[1]);
    }

    async function handleImageRegen() {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/regen_img",
        { image_style: style, story_index: currentPage },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      setImgSrc(response.data.image_url);
    }

    async function handleSuggestionsRegen() {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/regen_suggestions",
        { story_index: currentPage },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      setSuggestion1(response.data.suggestion_1);
      setSuggestion2(response.data.suggestion_2);
    }

    return (
      <>
        <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
          <div className="px-2 mb-4 col-span-full xl:mb-2">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              Story
            </h1>
          </div>
          <div className="col-span-2">
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold dark:text-white ">
                Text
              </h3>
              <HighlightedParagraph paragraph={storyText} phrases={phrases} />
            </div>
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold dark:text-white">
                Response
              </h3>

              <form
                id="form-resp"
                onSubmit={(e) => handleSubmit("settings", e)}
              >
                <div className="flex mb-4">
                  <select
                    name="resp"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setAction(e.target.value);
                    }}
                    value={action}
                  >
                    <option key="do" value="do">
                      Do:
                    </option>
                    <option key="say" value="say">
                      Say:
                    </option>
                  </select>
                  <textarea
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={resp}
                    placeholder={
                      action === "do"
                        ? "Enter something to do"
                        : "Enter something to say"
                    }
                    onChange={(e) => {
                      setResp(e.target.value);
                    }}
                    onBlur={(e) => {
                      setResp(e.target.value);
                    }}
                    onInput={(e) => {
                      setResp(e.target.value);
                    }}
                    onFocus={(e) => {
                      setResp(e.target.value);
                    }}
                    required
                    disabled={!showResponseSubmit}
                  />
                </div>
                {showResponseSubmit && (
                  <div className="space-y-2">
                    <button
                      className="h-fit text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </form>
            </div>
            {needSuggestions && showResponseSubmit && (
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white">
                  Suggestions
                </h3>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                  <button
                    className=" mb-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    onClick={() => {
                      handleSuggestionClick(suggestion1);
                    }}
                  >
                    {suggestion1}
                  </button>
                  <button
                    className=" mb-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    onClick={() => {
                      handleSuggestionClick(suggestion2);
                    }}
                  >
                    {suggestion2}
                  </button>
                </div>
                <button
                  className="  mb-4 text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                  type="button"
                  onClick={() => {
                    setSuggestion1("Loading...");
                    setSuggestion2("Loading...");
                    handleSuggestionsRegen();
                  }}
                >
                  Regenerate
                </button>
              </div>
            )}
            {!showResponseSubmit && (
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white">
                  Feedback
                </h3>
                <p dangerouslySetInnerHTML={{ __html: feedback }}></p>
              </div>
            )}
          </div>

          <div className="col-span-1">
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold dark:text-white">
                Image
              </h3>
              <div className="py-2">
                <img
                  className="mb-4 rounded-lg w-1024 h-1024 sm:mb-0 xl:mb-4 2xl:mb-0"
                  src={imgSrc}
                  alt="Loading icon"
                />
              </div>
              <form id="form-img" onSubmit={(e) => handleSubmit("settings", e)}>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Image style
                  </label>
                  <select
                    name="action"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setStyle(e.target.value);
                    }}
                    value={style}
                  >
                    {styles.map((style) => {
                      return (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="space-y-2">
                  <button
                    className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    type="button"
                    onClick={() => {
                      setImgSrc(loadingIcon);
                      handleImageRegen();
                    }}
                  >
                    Regenerate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="absolute top-20 right-5 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 flex items-center space-x-4 mb-4 p-1 dark:bg-gray-800">
          {currentPage !== 0 && (
            <button
              className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => {
                setCurrentPage(currentPage - 1);
                getStoryData(currentPage - 1);
              }}
            >
              Previous
            </button>
          )}
          {!(currentPage === latestIndex) && (
            <button
              className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => {
                setCurrentPage(currentPage + 1);
                getStoryData(currentPage + 1);
              }}
            >
              Next
            </button>
          )}
          <button
            className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
            onClick={() => {
              setCurrentPage(-1);
              axios.post(
                import.meta.env.VITE_BACKEND_ENDPOINT + "/reset_story_index",
                {},
                {
                  headers: {
                    Authorization: authHeader(),
                  },
                }
              );
            }}
          >
            New Story
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      {currentPage === -1 && <LandingPage />}
      {currentPage !== -1 && <Gameplay />}
    </div>
  );
}

export default App;
