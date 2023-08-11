import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import loadingIcon from "../assets/loading-balls.svg";
import ParticlesBg from "particles-bg";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import { styles } from "./Settings";
import ProcessAchievements from "../components/Achievements";
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
  const [flagged, setFlagged] = useState(false);
  const [flaggedText, setFlaggedText] = useState("");
  const [achievements, setAchievements] = useState("");
  const [showFinal, setShowFinal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [rating, setRating] = useState(0);
  const [ratingDiff, setRatingDiff] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const authHeader = useAuthHeader();

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
    setShowFinal(false);
    setShowResponseSubmit(true);
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
      console.log(response.data);
      if (!response.data.story_starting) {
        setNeedSuggestions(response.data.has_suggestions);
        if (
          response.data.has_suggestions &&
          page === latestPage &&
          !response.data.is_final
        ) {
          setSuggestion1(response.data.suggestion_1);
          setSuggestion2(response.data.suggestion_2);
        }
        setStoryText(response.data.story_text);
        setPhrases(response.data.keywords);
        setStyle(response.data.image_style);
        setFeedback(response.data.feedback);
        setAchievements(response.data.achievements);
        setShowResponseSubmit(response.data.feedback === "");
        if (response.data.user_response !== "") {
          const strs = response.data.user_response.split(": ");
          setAction(strs[0].toLowerCase());
          setResp(strs[1]);
        } else {
          setResp("");
        }
        if (response.data.is_final) {
          setShowFinal(true);
          setFinalScore(response.data.final_score);
          setRating(response.data.new_rating);
          setRatingDiff(
            (response.data.new_rating >= response.data.old_rating ? "+" : "") +
              (response.data.new_rating - response.data.old_rating).toString()
          );
          setNeedSuggestions(false);
        } else {
          setShowFinal(false);
        }
        if (response.data.image_url === "") {
          handleImageRegen(page);
        } else {
          setImgSrc(response.data.image_url);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  function handleSuggestionClick(suggestion: String) {
    const strs = suggestion.split(": ");
    setAction(strs[0].toLowerCase());
    setResp(strs[1]);
  }

  async function handleImageRegen(page: number = currentPage) {
    setImgSrc(loadingIcon);
    const response = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/regen_img",
      { image_style: style, story_index: page },
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

  const submitUserResponse = async (event) => {
    event.preventDefault();
    setLoadingSubmit(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/story_index",
        { story_index: currentPage + 1, user_response: action + ": " + resp },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      console.log(response);
      if (response.data.flagged) {
        setFlagged(true);
        setFlaggedText(response.data.flagged_text);
      } else {
        setShowResponseSubmit(false);
        setFeedback(response.data.feedback);
        setAchievements(response.data.achievements);
        setLatestIndex(currentPage + 1);
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingSubmit(false);
  };

  return (
    <>
      {/* Story Landing Page */}
      {currentPage === -1 && (
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
      )}

      {/* Story Index Page */}
      {currentPage !== -1 && (
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
              {!showFinal && (
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
                      <div className="flex-grow ml-2">
                        <textarea
                          className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${
                            flagged ? "border-red-300" : ""
                          }`}
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
                        <p
                          className={
                            flagged ? "text-pink-600 text-sm" : "hidden"
                          }
                        >
                          {flaggedText}
                        </p>
                      </div>
                    </div>
                    {showResponseSubmit && (
                      <div className="space-y-2">
                        <button
                          className="h-fit text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                          type="button"
                          onClick={submitUserResponse}
                          disabled={loadingSubmit}
                        >
                          {loadingSubmit ? (
                            <>
                              <svg
                                aria-hidden="true"
                                role="status"
                                className="inline w-4 h-4 mr-3 text-white animate-spin"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                  fill="#E5E7EB"
                                />
                                <path
                                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                  fill="currentColor"
                                />
                              </svg>
                              Loading...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
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
                  <p>{feedback}</p>
                </div>
              )}
              {achievements !== "" && (
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  <h3 className="mb-4 text-xl font-semibold dark:text-white">
                    Achievements
                  </h3>
                  <div>{ProcessAchievements(achievements)}</div>
                </div>
              )}
              {showFinal && (
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  <h3 className="mb-4 text-xl font-semibold dark:text-white">
                    Results
                  </h3>
                  <div className="font-bold">
                    Score:{" "}
                    <span className="font-bold text-green-700">
                      {finalScore}/100
                    </span>
                    <br></br>
                    Rating:{" "}
                    <span className="font-bold text-green-700">
                      {rating}
                    </span>{" "}
                    <span className="font-semibold text-green-700">
                      {ratingDiff}
                    </span>
                  </div>
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
                <form
                  id="form-img"
                  onSubmit={(e) => handleSubmit("settings", e)}
                >
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
      )}
    </>
  );
}

export default App;
