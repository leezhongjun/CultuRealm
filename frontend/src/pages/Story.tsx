import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import loadingIcon from "../assets/loading-balls.svg";
import ParticlesBg from "particles-bg";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaStop, FaPause, FaPlay } from "react-icons/fa";
import { useReward } from "react-rewards";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import { styles } from "./Settings";
import ProcessAchievements from "../components/Achievements";
import HighlightedParagraph from "../components/HighlightedPara";
import { countries } from "./Settings";

function App() {
  const [currentPage, setCurrentPage] = useState(-1);
  const [needSuggestions, setNeedSuggestions] = useState(true);
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCustomStory, setIsCustomStory] = useState(false);
  const [customStoryText, setCustomStoryText] = useState("");
  const [customStoryTitle, setCustomStoryTitle] = useState("");
  const [isShareStory, setIsShareStory] = useState(false);
  const [genStoryLoading, setGenStoryLoading] = useState(false);
  const [prevHighScore, setPrevHighScore] = useState(false);
  const [completedProfile, setCompletedProfile] = useState(true);
  const [globalUnlocked, setGlobalUnlocked] = useState(false); // when user has unlocked global mode
  const [showGlobal, setShowGlobal] = useState(false);
  const [country, setCountry] = useState("Singapore");
  const [unlockGlobal, setUnlockGlobal] = useState(false); // only the first time user unlocks global mode
  const [unlockRating, setUnlockRating] = useState(1800);
  const [report, setReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportAltText, setReportAltText] = useState("");

  const { reward, isAnimating: _isAnimating } = useReward(
    "rewardId",
    "confetti"
  );
  const { reward: customReward, isAnimating: _customRewardAnimating } =
    useReward("customRewardId", "balloons");
  const { reward: globalReward, isAnimating: _globalRewardAnimating } =
    useReward("globalRewardId", "balloons");

  const authHeader = useAuthHeader();
  const synth = window.speechSynthesis;

  const handleSpeak = () => {
    if (storyText && !isSpeaking) {
      setIsSpeaking(true);
      if (isPaused) {
        setIsPaused(false);
        synth.resume();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(storyText);
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    } else if (storyText && isSpeaking) {
      setIsSpeaking(false);
      if (synth.speaking) {
        synth.pause();
        setIsPaused(true);
      }
    }
  };

  const handleCancel = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  const submitNewStory = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/add_custom_story",
      { tags: [], story_text: customStoryText, title: customStoryTitle },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data);
    let text = res.data.flagged ? res.data.flagged_text : "";
    return [res.data.story_id, res.data.flagged, text];
  };

  const startStoryForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // don't refresh page

    setLoadingSubmit(true);
    setSuggestion1("Loading...");
    setSuggestion2("Loading...");
    setStoryText("Loading...");
    setResp("");
    setImgSrc(loadingIcon);
    setShowFinal(false);
    setShowResponseSubmit(true);
    try {
      let story_id = "";
      let flagged = false;
      if (isCustomStory && isShareStory) {
        let res = await submitNewStory();
        story_id = res[0];
        flagged = res[1];
        if (flagged) {
          setFlagged(true);
          setFlaggedText(res[2]);
          setLoadingSubmit(false);
          return;
        }
      } else if (isCustomStory) {
        story_id = "temp";
      }

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/start_story",
        {
          suggestions: needSuggestions,
          story_id: story_id,
          seed: customStoryText,
          country: country,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      setLoadingSubmit(false);
      if (isCustomStory) {
        if (response.data.flagged) {
          setFlagged(true);
          setFlaggedText(response.data.flagged_text);
          return;
        }
      }
      setCurrentPage(0);
      setLatestIndex(0);

      const data = response.data;
      console.log(data);
      setSuggestion1(data.suggestion_1);
      setSuggestion2(data.suggestion_2);
      setStoryText(data.story_text);
      setPhrases(data.keywords);
      setStyle(data.image_style);
      setFeedback("");
      setResp("");
      setCountry(data.country);
      handleImageRegen(0);
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
      synth.cancel();
      setIsPaused(false);
      setIsSpeaking(false);
      setSuggestion1("Loading...");
      setSuggestion2("Loading...");
      setStoryText("Loading...");
      setResp("");
      setImgSrc(loadingIcon);
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

      setIsCustomStory(response.data.is_custom);
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
        setCountry(response.data.country);
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
          if (response.data.is_custom) {
            setPrevHighScore(response.data.prev_high_score);
          } else {
            setRating(response.data.new_rating);
            setRatingDiff(
              (response.data.new_rating >= response.data.old_rating
                ? "+"
                : "") +
                (response.data.new_rating - response.data.old_rating).toString()
            );
            if (
              response.data.new_rating >= response.data.unlock_rating &&
              response.data.old_rating < response.data.unlock_rating
            ) {
              setUnlockGlobal(true);
            } else {
              setUnlockGlobal(false);
            }
          }
          setNeedSuggestions(false);
        } else {
          setShowFinal(false);
        }
        if (
          response.data.image_url === "" ||
          response.data.image_url === "loading"
        ) {
          handleImageRegen(page, true);
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
        setCurrentPage(response.data.story_index);
        setLatestIndex(response.data.story_index);
        getStoryData(response.data.story_index, response.data.story_index);
      } catch (error) {
        console.error(error);
      }
    };

    const completed_profile = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/completed_profile",
          {
            //
          },
          {
            headers: {
              Authorization: authHeader(),
            },
          }
        );
        console.log(response.data);
        setCompletedProfile(response.data.completed_profile);
        setGlobalUnlocked(response.data.global_unlocked);
        setRating(response.data.rating);
        setUnlockRating(response.data.unlock_rating);
      } catch (error) {
        console.error(error);
      }
    };

    completed_profile();
    fetchData();
  }, []);

  function handleSuggestionClick(suggestion: String) {
    const strs = suggestion.split(": ");
    setAction(strs[0].toLowerCase());
    setResp(strs[1]);
  }

  async function handleImageRegen(
    page: number = currentPage,
    showImg: boolean = false
  ) {
    if (page === currentPage) setImgSrc(loadingIcon);
    const response = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/regen_img",
      { image_style: style, story_index: page },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    if (page === currentPage || page === 0 || showImg)
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

  const submitUserResponse = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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
        setFlagged(false);
        setShowResponseSubmit(false);
        setFeedback(response.data.feedback);
        setAchievements(response.data.achievements);
        setLatestIndex(currentPage + 1);
      }
      setLoadingSubmit(false);
      if (!response.data.flagged) handleImageRegen(currentPage + 1);
    } catch (error) {
      console.error(error);
    }
  };

  async function suggestCustomStory() {
    setGenStoryLoading(true);
    const response = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/get_story_desc",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    setCustomStoryText(response.data.story_desc);
    setCustomStoryTitle(response.data.story_title);
    setGenStoryLoading(false);
  }

  const sendReport = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/report",
        { report_desc: reportText, story_index: currentPage },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      console.log(response);
      setReport(false);
      setReportAltText("Report submitted!");
    } catch (error) {
      console.error(error);
    }
  };

  const resetReportState = () => {
    setReport(false);
    setReportAltText("");
    setReportText("");
  };

  const handleButtonClick = async () => {
    const alertElement = document.getElementById("alert");
    if (alertElement) {
      alertElement.style.transition = "opacity 0.5s ease";
      alertElement.style.opacity = "0";

      setTimeout(() => {
        alertElement.style.display = "hidden";
      }, 500);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    async function animateReward() {
      await delay(600);
      reward();
    }
    animateReward();
  }, [currentPage, achievements]);

  useEffect(() => {
    async function animateReward() {
      await delay(500);
      customReward();
    }
    if (isCustomStory) animateReward();
  }, [isCustomStory]);

  useEffect(() => {
    async function animateReward() {
      await delay(500);
      globalReward();
    }
    if (showGlobal) animateReward();
  }, [showGlobal]);

  return (
    <>
      {/* Story Landing Page */}

      {/* Alert if profile not completed */}
      {completedProfile === false && (
        <div
          id="alert"
          className="relative bot-0 bot-0 w-full flex items-center p-4 mb-4 text-yellow-800 rounded-lg bg-yellow-50"
          role="alert"
        >
          <svg
            className="flex-shrink-0 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div className="ml-3 text-sm font-medium">
            Your profile is incomplete. Please go to{" "}
            <a
              href="/settings"
              className="font-semibold underline hover:no-underline"
            >
              settings
            </a>{" "}
            to complete your profile for more personalised stories.
          </div>
          <button
            onClick={handleButtonClick}
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex items-center justify-center h-8 w-8   "
            data-dismiss-target="#alert"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}

      {currentPage === -1 && (
        <>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              <div className="text-center pb-12 md:pb-16">
                <h1
                  className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4"
                  data-aos="zoom-y-out"
                >
                  <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                    CultuRealm
                  </span>{" "}
                  {isCustomStory && (
                    <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-yellow-400">
                      Cus
                      <span id="customRewardId" />
                      tom{" "}
                    </span>
                  )}
                  {showGlobal && (
                    <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-yellow-400">
                      Glo
                      <span id="globalRewardId" />
                      bal{" "}
                    </span>
                  )}
                  Stories
                </h1>
                <div className="max-w-3xl mx-auto">
                  <p
                    className="text-xl text-gray-800 mb-8"
                    data-aos="zoom-y-out"
                    data-aos-delay="150"
                  >
                    Experience cultures with unique and interactive stories
                  </p>

                  <p
                    className="text-base text-gray-800 mb-2"
                    data-aos="zoom-y-out"
                    data-aos-delay="150"
                  >
                    Current rating: <b className="text-blue-600">{rating}</b>
                  </p>
                  {!globalUnlocked && (
                    <>
                      <p
                        className="text-base text-gray-800 mb-8"
                        data-aos="zoom-y-out"
                        data-aos-delay="150"
                      >
                        Get <b className="text-green-600">{unlockRating}</b>{" "}
                        rating to unlock Global Mode
                      </p>
                    </>
                  )}
                  <div className="" data-aos="zoom-y-out" data-aos-delay="300">
                    <div>
                      <form onSubmit={startStoryForm} className="py-0">
                        <button
                          type="submit"
                          className="px-4 py-2 text-base font-medium tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
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
                                  fill="#71757E"
                                />
                                <path
                                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                  fill="currentColor"
                                />
                              </svg>
                              Loading...
                            </>
                          ) : (
                            "Begin your story"
                          )}
                        </button>
                        <div className="mt-5 flex justify-center">
                          <input
                            id="suggestion-checkbox"
                            type="checkbox"
                            defaultChecked={needSuggestions}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            onClick={() => setNeedSuggestions(!needSuggestions)}
                          />
                          <label
                            htmlFor="suggestion-checkbox"
                            className="ml-2 text-sm font-medium text-gray-900 "
                          >
                            Enable Suggested Responses
                          </label>
                        </div>
                        {globalUnlocked && (
                          <div className="flex justify-center mt-4">
                            <input
                              id="global-story-checkbox"
                              type="checkbox"
                              defaultChecked={showGlobal}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              onClick={() => setShowGlobal(!showGlobal)}
                            />
                            <label
                              htmlFor="global-story-checkbox"
                              className="ml-2 text-sm font-medium text-gray-900 "
                            >
                              Enable Global Mode
                            </label>
                          </div>
                        )}
                        {showGlobal && (
                          // show countries here as a dropdown
                          <div className="mt-2 justify-center bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                            <label className="block text-sm font-medium text-gray-700 ">
                              Country
                            </label>
                            <select
                              className="mt-1 dropdown-content w-full block py-2 text-base border-gray-300 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              onChange={(e) =>
                                setCountry(e.currentTarget.value)
                              }
                              value={country}
                              size={10}
                            >
                              {countries.map((country) => (
                                <option
                                  className=""
                                  key={country}
                                  value={country}
                                >
                                  {country}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="flex justify-center mt-4">
                          <input
                            id="custom-story-checkbox"
                            type="checkbox"
                            defaultChecked={isCustomStory}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded "
                            onClick={() => setIsCustomStory(!isCustomStory)}
                          />
                          <label
                            htmlFor="custom-story-checkbox"
                            className="ml-2 text-sm font-medium text-gray-900 "
                          >
                            Enable Custom Story
                          </label>
                        </div>
                        {isCustomStory && (
                          <div className="mt-2 justify-center bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                            <div className="flex flex-col">
                              <label className="block mb-2 text-sm font-medium text-gray-900  text-left">
                                Title
                              </label>
                              <input
                                type="text"
                                value={customStoryTitle}
                                placeholder="Custom Story Title"
                                className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5  ${
                                  flagged ? "border-red-300" : ""
                                }`}
                                onChange={(e) =>
                                  setCustomStoryTitle(e.currentTarget.value)
                                }
                                onBlur={(e) =>
                                  setCustomStoryTitle(e.currentTarget.value)
                                }
                                onInput={(e) =>
                                  setCustomStoryTitle(e.currentTarget.value)
                                }
                                onFocus={(e) =>
                                  setCustomStoryTitle(e.currentTarget.value)
                                }
                                required
                              />
                              <label className="mt-2 block mb-2 text-sm font-medium text-gray-900  text-left">
                                Description
                              </label>
                              <textarea
                                value={customStoryText}
                                placeholder="Custom Story Description"
                                className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5  ${
                                  flagged ? "border-red-300" : ""
                                }`}
                                onChange={(e) =>
                                  setCustomStoryText(e.currentTarget.value)
                                }
                                onBlur={(e) =>
                                  setCustomStoryText(e.currentTarget.value)
                                }
                                onInput={(e) =>
                                  setCustomStoryText(e.currentTarget.value)
                                }
                                onFocus={(e) =>
                                  setCustomStoryText(e.currentTarget.value)
                                }
                                required
                              />
                              <p
                                className={
                                  flagged
                                    ? "flex text-pink-600 text-sm"
                                    : "hidden"
                                }
                              >
                                {flaggedText}
                              </p>
                              <div className="mt-5 flex">
                                <input
                                  id="share-story-checkbox"
                                  type="checkbox"
                                  defaultChecked={isShareStory}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                  onClick={() => setIsShareStory(!isShareStory)}
                                />
                                <label
                                  htmlFor="share-story-checkbox"
                                  className="ml-2 text-sm font-medium text-gray-900 "
                                >
                                  Share on Community Stories
                                </label>
                              </div>
                              <button
                                className="mt-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700  "
                                type="button"
                                onClick={suggestCustomStory}
                                disabled={genStoryLoading}
                              >
                                {genStoryLoading ? (
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
                                        fill="#71757E"
                                      />
                                      <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                    Loading...
                                  </>
                                ) : (
                                  "Generate a Random Story"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ParticlesBg num={100} type="square" bg={true} />
          </div>
        </>
      )}

      {/* Story Index Page */}
      {currentPage !== -1 && (
        <>
          <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 ">
            <div className="px-2 mb-4 col-span-full xl:mb-2">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl ">
                Story
              </h1>
              {isCustomStory && (
                <p className="mt-2 text-gray-500 text-sm font-medium">
                  You're playing a custom story. View more custom stories{" "}
                  <a
                    href="/community-stories"
                    target="_blank"
                    className="font-medium text-blue-600 underline hover:no-underline"
                  >
                    here
                  </a>
                </p>
              )}
              {country !== "Singapore" && (
                <p className="mt-2 text-gray-500 text-sm font-medium">
                  You're playing in Global Mode. Current country:{" "}
                  <b>{country}</b>
                </p>
              )}
            </div>
            <div className="col-span-2">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                <h3 className="mb-4 text-xl font-semibold ">
                  Chapter {currentPage + 1}
                </h3>
                <div className="mb-4">
                  <HighlightedParagraph
                    paragraph={storyText}
                    phrases={phrases}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    className="font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    onClick={handleSpeak}
                  >
                    {isSpeaking ? (
                      <FaPause />
                    ) : isPaused ? (
                      <FaPlay />
                    ) : (
                      <HiSpeakerWave />
                    )}
                  </button>
                  {isSpeaking && (
                    <button
                      className="font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                      onClick={handleCancel}
                    >
                      <FaStop />
                    </button>
                  )}
                </div>
              </div>
              {!showFinal && (
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                  <h3 className="mb-4 text-xl font-semibold ">Response</h3>

                  <form id="form-resp" onSubmit={(e) => submitUserResponse(e)}>
                    <div className="flex mb-4">
                      <select
                        name="resp"
                        className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 "
                        onChange={(e) => {
                          setAction(e.currentTarget.value);
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
                          className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5  ${
                            flagged ? "border-red-300" : ""
                          }`}
                          value={resp}
                          placeholder={
                            action === "do"
                              ? "Enter something to do"
                              : "Enter something to say"
                          }
                          onChange={(e) => {
                            setResp(e.currentTarget.value);
                          }}
                          onBlur={(e) => {
                            setResp(e.currentTarget.value);
                          }}
                          onInput={(e) => {
                            setResp(e.currentTarget.value);
                          }}
                          onFocus={(e) => {
                            setResp(e.currentTarget.value);
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
                          type="submit"
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
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                  <h3 className="mb-4 text-xl font-semibold ">Suggestions</h3>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <button
                      className=" mb-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700  "
                      onClick={() => {
                        handleSuggestionClick(suggestion1);
                      }}
                    >
                      {suggestion1}
                    </button>
                    <button
                      className=" mb-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700  "
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
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                  <h3 className="mb-4 text-xl font-semibold ">Feedback</h3>
                  <p>{feedback}</p>
                  {!report && (
                    <>
                      <button
                        className="mt-4 text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-600"
                        type="button"
                        onClick={() => {
                          setReport(true);
                        }}
                      >
                        Report
                      </button>
                      <p
                        className={
                          reportAltText === ""
                            ? "hidden"
                            : "mt-2 text-pink-600 text-sm"
                        }
                      >
                        {reportAltText}
                      </p>
                    </>
                  )}
                  {report && (
                    <>
                      <textarea
                        className={`mt-4 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5  ${
                          flagged ? "border-red-300" : ""
                        }`}
                        value={reportText}
                        placeholder={"Enter report details"}
                        onChange={(e) => {
                          setReportText(e.currentTarget.value);
                        }}
                        onBlur={(e) => {
                          setReportText(e.currentTarget.value);
                        }}
                        onInput={(e) => {
                          setReportText(e.currentTarget.value);
                        }}
                        onFocus={(e) => {
                          setReportText(e.currentTarget.value);
                        }}
                      />
                      <div className="space-x-4">
                        <button
                          className="mt-4 text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-600"
                          type="button"
                          onClick={sendReport}
                        >
                          Send Report
                        </button>
                        <button
                          className="mb-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                          type="button"
                          onClick={resetReportState}
                        >
                          Cancel Report
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {achievements !== "" && (
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                  <h3 className="mb-4 text-xl font-semibold ">Achievements</h3>
                  <div>
                    {ProcessAchievements(achievements)}
                    <span id="rewardId" />
                  </div>
                </div>
              )}
              {showFinal && (
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                  <h3 className="mb-4 text-xl font-semibold ">Results</h3>
                  <div className="font-bold">
                    Score:{" "}
                    <span className="font-bold text-green-700">
                      <span id="rewardId" />
                      {finalScore}/100
                    </span>
                    <br></br>
                    {isCustomStory ? (
                      <>
                        Previous High Score:{" "}
                        <span className="font-bold text-green-700">
                          {prevHighScore}/100
                        </span>{" "}
                      </>
                    ) : (
                      <>
                        Rating:{" "}
                        <span className="font-bold text-green-700">
                          {rating}
                        </span>{" "}
                        <span className="font-semibold text-green-700">
                          {ratingDiff}
                        </span>
                        <br></br>
                        <br></br>
                        {unlockGlobal && (
                          <div className="font-semibold">
                            <b className="font-bold text-green-700">
                              You have unlocked Global Mode!{" "}
                            </b>
                            Start a new story to try it out!
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-1">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                <div className="py-2">
                  <img
                    className="mb-4 rounded-lg w-1024 h-1024 sm:mb-0 xl:mb-4 2xl:mb-0"
                    src={imgSrc}
                    alt="Loading icon"
                  />
                </div>
                <form id="form-img">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Image style
                    </label>
                    <select
                      name="action"
                      className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                      onChange={(e) => {
                        setStyle(e.currentTarget.value);
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
                        handleImageRegen(currentPage, true);
                      }}
                    >
                      Regenerate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className={`fixed ${
              completedProfile ? `top-20` : `top-32`
            } bg-blue-200 right-5 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  flex items-center space-x-4 mb-4 p-1 `}
          >
            {currentPage !== 0 && (
              <button
                className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                  setFlagged(false);
                  getStoryData(currentPage - 1);
                  resetReportState();
                }}
              >
                Previous
              </button>
            )}
            {!(currentPage === latestIndex) && (
              <button
                className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  setFlagged(false);
                  getStoryData(currentPage + 1);
                  resetReportState();
                }}
              >
                Next
              </button>
            )}
            <button
              className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
              onClick={async () => {
                await axios.post(
                  import.meta.env.VITE_BACKEND_ENDPOINT + "/reset_story_index",
                  {},
                  {
                    headers: {
                      Authorization: authHeader(),
                    },
                  }
                );
                setCurrentPage(-1);
                resetReportState();
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
