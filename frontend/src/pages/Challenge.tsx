import { useState, useEffect } from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { useAuthHeader } from "react-auth-kit";
import { classNames } from "../components/Navigation";
import loadingIcon from "../assets/loading-balls.svg";
import { useReward } from "react-rewards";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import "../styles.css";
import { FaPause, FaPlay, FaStop } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

const difficulties = ["", "Easy", "Medium", "Hard"];
const timings = [0, 30, 45, 60];

function App() {
  const [events, setEvents] = useState([
    { event: "", tags: [""], played: false, easy: 0, medium: 0, hard: 0 },
  ]);
  const [rawEvents, setRawEvents] = useState([
    { event: "", tags: [""], played: false, easy: 0, medium: 0, hard: 0 },
  ]);
  const [tags, setTags] = useState<{ id: string; text: string }[]>([]);
  const [allTags, setAllTags] = useState<{ id: string; text: string }[]>([]); // { id: "", text: "" }
  const [allTagsRaw, setAllTagsRaw] = useState<string[]>([]); // [
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, unplayed, played
  const [timeTaken, setTimeTaken] = useState(0); // time taken for essay
  const [ans, setAns] = useState<number[]>([]); // user answer
  const [exp, setExp] = useState<string[]>([]); // explanation
  const [userAns, setUserAns] = useState<number[]>([]); // user answer
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imgSrc, setImgSrc] = useState(loadingIcon); // image url
  const [seconds, setSeconds] = useState(999);
  const [isLoading, setIsLoading] = useState(false);

  const [event, setEvent] = useState(""); // user choice
  const [essay, setEssay] = useState("Loading...");
  const [score, setScore] = useState(0); // score for mcq
  const [mcq, setMCQ] = useState([{ query: "", choices: [""] }]);
  const [difficulty, setDifficulty] = useState(1); // 1: easy, 2: medium, 3: hard

  const [playState, setPlayState] = useState(-1); // -1: not started, 0: essay, 1: mcq, 2: score
  const [totalPlays, setTotalPlays] = useState(0); // total plays

  const { reward } = useReward("rewardId", "confetti");
  const authHeader = useAuthHeader();
  const synth = window.speechSynthesis;

  const handleSpeak = () => {
    if (essay && !isSpeaking) {
      setIsSpeaking(true);
      if (isPaused) {
        setIsPaused(false);
        synth.resume();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(essay);
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    } else if (essay && isSpeaking) {
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

  useEffect(() => {
    setEvents(
      rawEvents
        .filter((event) => {
          if (filter === "all") {
            return true;
          } else if (filter === "unplayed") {
            return !event.played;
          } else if (filter === "played") {
            return event.played;
          }
        })
        .filter((event) => {
          return event.event.toLowerCase().includes(search.toLowerCase());
        })
        .filter((event) => {
          if (tags.length === 0) {
            return true;
          } else {
            return tags.every((tag) => event.tags.includes(tag.id));
          }
        })
    );
  }, [filter, search, tags]);

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  const delimiters = [KeyCodes.comma, KeyCodes.enter];

  const handleDelete = (i: number) => {
    setTags(tags.filter((_tag, index) => index !== i));
  };

  const handleAddition = (tag: { id: string; text: string }) => {
    console.log(allTags);
    if (allTagsRaw.includes(tag.id)) {
      setTags([...tags, tag]);
    }
  };

  const handleDrag = (
    tag: { id: string; text: string },
    currPos: number,
    newPos: number
  ) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  const setRandom = () => {
    setFilter("all");
    setSearch(rawEvents[Math.floor(Math.random() * rawEvents.length)].event);
    setTags([]);
  };

  const getImg = async (event: string) => {
    // use CORS
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_image",
      { event: event },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data.img);
    const result = res.data.img;
    // console.log(await res.json());
    setImgSrc(result);
  };

  const getEvents = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_events",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data);
    setEvents(res.data.events);
    setRawEvents(res.data.events);
    setAllTags(res.data.tags);
    setAllTagsRaw(
      res.data.tags.map((tag: { id: string; text: string }) => tag.id)
    );
    setTotalPlays(res.data.total_plays);
    // setHighScores(res.data.  high_scores);
  };

  const getState = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_index",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data);
    setPlayState(res.data.play_state);
    if (res.data.play_state === -1) {
      getEvents();
      return;
    } else if (res.data.play_state === 0) {
      setEssay(res.data.essay);
    } else if (res.data.play_state === 1) {
      setMCQ(res.data.mcq);
      // setTimeStart(res.data.time_start);
      setUserAns(Array(res.data.mcq.length).fill(-1));
      const date = new Date();
      setSeconds(
        timings[difficulty] -
          Math.floor(date.getTime() / 1000) +
          res.data.time_start
      );
      // setSeconds(Math.floor(Date.now() / 1000) - res.data.time_start);
    } else if (res.data.play_state === 2) {
      setScore(res.data.score);
      setMCQ(res.data.mcq);
      setAns(res.data.ans);
      setExp(res.data.exp);
      setUserAns(res.data.user_ans);
      setEssay(res.data.essay);
      setTimeTaken(res.data.time_taken);
    }
    setEvent(res.data.event);
    setDifficulty(res.data.difficulty);
    getImg(res.data.event);
  };

  // execute getState() when the page is loaded
  useEffect(() => {
    getState();
  }, []);

  const getEssay = async (difficulty: number, event: string) => {
    setIsLoading(true);
    setEvent(event);
    setDifficulty(difficulty);
    setEssay("Loading...");
    setImgSrc(loadingIcon);
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_essay",
        {
          event: event,
          difficulty: difficulty,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      setEssay(res.data.essay);
      getImg(event);
      setIsLoading(false);
      setPlayState(0);
      // console.log(essay);
    } catch (err) {
      console.log(err);
    }
  };

  const getMCQ = async () => {
    setIsLoading(true);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_mcq",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data);
    setUserAns(Array(res.data.mcq.length).fill(-1));
    setMCQ(res.data.mcq);
    // setTimeStart(res.data.time_start);
    const date = new Date();
    setSeconds(
      timings[difficulty] -
        Math.floor(date.getTime() / 1000) +
        res.data.time_start
    );
    setIsLoading(false);
    setPlayState(1);
  };

  const submitMCQ = async () => {
    console.log("playstate", playState);
    setIsLoading(true);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_score_submit",
      {
        answers: userAns,
      },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );

    if (res.data.message !== "Success") {
      setIsLoading(false);
      resetState();
      return;
    }
    setPlayState(2);
    setAns(res.data.ans);
    setExp(res.data.exp);
    setScore(res.data.score);
    setTimeTaken(res.data.time_taken);
    setIsLoading(false);
  };

  const resetState = async () => {
    await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_reset",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log("reset");
    setPlayState(-1);
    getEvents();
    setIsLoading(false);
  };

  //increase seconds by 1 every second
  // call getMCQ() when seconds reaches 0
  useEffect(() => {
    if (playState === 1) {
      const interval = setInterval(() => {
        setSeconds(seconds - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [seconds, playState]);

  useEffect(() => {
    console.log(seconds, playState);
    if (playState === 1 && seconds === 0) {
      // submit mcq
      submitMCQ();
    } else if (playState === 1 && seconds < 0) {
      // reset challenge
      resetState();
    }
  }, [seconds]);

  useEffect(() => {
    if (userAns && playState === 1 && userAns.length === mcq.length) {
      for (let ans1 of userAns) {
        if (ans1 === -1) {
          return;
        }
      }
      // submit mcq
      submitMCQ();
    }
  }, [userAns]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    async function animateReward() {
      await delay(500);
      reward();
    }
    if (playState === 2) {
      animateReward();
    }
  }, [playState]);

  return (
    <>
      {playState === -1 && (
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
                  Challenges
                </h1>
                <p
                  className="text-base text-gray-800 mb-2"
                  data-aos="zoom-y-out"
                  data-aos-delay="150"
                >
                  Unique stories played:{" "}
                  <b className="text-blue-600">
                    {totalPlays}/{rawEvents.length}
                  </b>
                </p>
                {totalPlays < 1 && (
                  <p
                    className="text-base text-gray-800 mb-2"
                    data-aos="zoom-y-out"
                    data-aos-delay="150"
                  >
                    Play <b className="text-green-600">{1 - totalPlays} </b>
                    {`more unique ${
                      1 - totalPlays > 1 ? `stories` : `story`
                    } to unlock `}{" "}
                    <b className="text-blue-600">Medium</b> difficulty
                  </p>
                )}
                {totalPlays >= 1 && totalPlays < 3 && (
                  <p
                    className="text-base text-gray-800 mb-2"
                    data-aos="zoom-y-out"
                    data-aos-delay="150"
                  >
                    Play <b className="text-green-600">{3 - totalPlays} </b>
                    {`more unique ${
                      3 - totalPlays > 1 ? `stories` : `story`
                    } to unlock `}{" "}
                    <b className="text-red-600">Hard</b> difficulty
                  </p>
                )}
                <div className="flex mt-8">
                  <select
                    name="resp"
                    className="mb-2 bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5"
                    onChange={(e) => {
                      setFilter(e.currentTarget.value);
                    }}
                    value={filter}
                  >
                    <option key="all" value="all">
                      All
                    </option>
                    <option key="unplayed" value="unplayed">
                      Unplayed
                    </option>
                    <option key="played" value="played">
                      Played
                    </option>
                  </select>
                  <div className="w-full relative mb-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                        onClick={() => {
                          setSearch("");
                        }}
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </div>
                    <input
                      type="search"
                      id="default-search"
                      className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search Culture and History..."
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                    ></input>
                  </div>
                </div>
                <button
                  className="mt-2 mb-2 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                  type="button"
                  onClick={() => {
                    setRandom();
                  }}
                >
                  Pick Random
                </button>
                <div className="flex justify-center">
                  <ReactTags
                    tags={tags}
                    suggestions={allTags}
                    delimiters={delimiters}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
                    handleDrag={handleDrag}
                    inputFieldPosition="top"
                    minQueryLength={0}
                    placeholder="Enter Tags..."
                    autocomplete
                    autofocus={false}
                  />
                </div>
                <div className="">
                  {/* event list here */}
                  {events.map((item) => (
                    <div
                      key={item.event}
                      id={item.event}
                      className={classNames(
                        item.played
                          ? `bg-green-100 hover:bg-green-200`
                          : `bg-white hover:bg-gray-100`,
                        `w-full m-2 border border-gray-200 rounded-lg shadow`
                      )}
                    >
                      <div className="justify-between items-center sm:flex">
                        <div>
                          <h5 className="mb-2 text-2xl font-bold text-left p-2 text-gray-900">
                            {item.event}
                          </h5>
                          <p className="m-2 font-normal text-left text-gray-700">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </p>
                          <p className="m-2 font-normal text-left text-gray-700">
                            High Scores:{" "}
                            <span className="font-semibold text-green-600">
                              Easy: <b className="font-bold">{item.easy}</b>{" "}
                            </span>
                            <span className="font-semibold text-blue-600">
                              Medium: <b className="font-bold">{item.medium}</b>{" "}
                            </span>
                            <span className="font-semibold text-red-600">
                              Hard: <b className="font-bold">{item.hard}</b>{" "}
                            </span>{" "}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="m-2 bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                            onClick={() => getEssay(1, item.event)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
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
                              "Play Easy"
                            )}
                          </button>
                          {totalPlays >= 1 && (
                            <button
                              className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                              onClick={() => getEssay(2, item.event)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
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
                                "Play Medium"
                              )}
                            </button>
                          )}
                          {totalPlays >= 3 && (
                            <button
                              className="m-2 bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                              onClick={() => getEssay(3, item.event)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
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
                                "Play Hard"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {playState !== -1 && (
        <>
          <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 ">
            <div className="mt-12 px-2 mb-4 col-span-full xl:mb-2">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl ">
                Challenge
              </h1>
            </div>

            <div className="col-span-2">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                <h3 className="mb-4 text-xl font-semibold  ">{event}</h3>
                <p>
                  Difficulty:{" "}
                  <b
                    className={
                      difficulty === 1
                        ? "text-green-600"
                        : difficulty === 2
                        ? "text-blue-600"
                        : "text-red-600"
                    }
                  >
                    {difficulties[difficulty]}
                  </b>
                </p>
                {playState === 0 && (
                  <p className="font-bold text-gray-600">
                    Check out the text below and hit the start button to kick
                    off the challenge!
                  </p>
                )}
                {playState !== 1 && (
                  <>
                    <div className="mb-4 mt-4">
                      <p>{essay}</p>
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
                    {playState === 0 && (
                      <button
                        className="mt-2 text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                        onClick={() => {
                          getMCQ();
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
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
                          "Start Challenge"
                        )}
                      </button>
                    )}
                  </>
                )}
                {playState >= 1 && (
                  <>
                    {playState === 1 && (
                      <div className="z-40 fixed top-20 bg-blue-200 left-5 bg-blue-50 border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  flex items-center space-x-4 mb-4 p-1 ">
                        <p className="text-semibold px-3 py-2 tracking-wide">
                          Seconds left:{" "}
                          <span
                            className={`font-bold ${
                              seconds <= 10 ? `text-red-600` : `text-blue-600`
                            }`}
                          >
                            {seconds < 500 ? seconds : "Loading..."}
                          </span>
                        </p>
                      </div>
                    )}
                    {playState == 2 && (
                      <div>
                        <p className="mt-6 text-xl font-bold">
                          Score:{" "}
                          <span className="font-extrabold text-blue-600">
                            {score}
                            <span id="rewardId" />
                          </span>
                        </p>
                        <p className="mt-6 text-xl font-bold">
                          Time Taken:{" "}
                          <span className="font-extrabold text-blue-600">
                            {timeTaken}s
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="mt-2">
                      {mcq.map((item, index) => {
                        return (
                          <div
                            key={item.query}
                            className="mt-6 font-medium px-3 py-2 tracking-wide text-gray-800 transition-colors duration-200 transform rounded-md"
                          >
                            <div className="mb-2">
                              <span className="font-normal text-gray-600">
                                {index + 1}.{" "}
                              </span>
                              {item.query}
                            </div>
                            <form>
                              {item.choices.map((choice, index2) => {
                                return (
                                  <>
                                    <div
                                      className={`mb-2 mt-2 flex items-center pl-4 border border-gray-200 rounded-lg ${
                                        playState === 2 && index2 === ans[index]
                                          ? ` bg-green-100 hover:bg-green-200`
                                          : index2 === userAns[index]
                                          ? playState === 2
                                            ? ` bg-red-100 hover:bg-red-200`
                                            : ` bg-blue-100 hover:bg-blue-200`
                                          : ` bg-white hover:bg-blue-50`
                                      }`}
                                      key={choice + index}
                                    >
                                      <input
                                        id={choice + index}
                                        type="radio"
                                        value={index2}
                                        name="bordered-radio"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 "
                                        disabled={playState !== 1}
                                        checked={index2 === userAns[index]}
                                        onChange={() => {
                                          setUserAns([
                                            ...userAns.slice(0, index),
                                            index2,
                                            ...userAns.slice(index + 1),
                                          ]);
                                        }}
                                      />
                                      <label
                                        htmlFor={choice + index}
                                        className="w-full py-4 ml-2 text-sm font-medium text-gray-900 "
                                      >
                                        {choice}
                                      </label>
                                    </div>
                                  </>
                                );
                              })}
                            </form>
                            {playState === 2 && (
                              //explanation
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Explanation:{" "}
                                  <span className="font-semibold">
                                    {exp[index]}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {playState === 1 && isLoading && (
                        <p className="text-sm px-3 py-2 font-medium text-gray-700">
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
                          Evaluating Answers...
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-span-1">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
                <h3 className="mb-4 text-xl font-semibold ">Image</h3>
                <div className="py-2">
                  <img
                    className="mb-4 rounded-lg w-1024 h-1024 sm:mb-0 xl:mb-4 2xl:mb-0"
                    src={imgSrc}
                    alt="Loading icon"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="fixed top-20 bg-white right-5 border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  flex items-center space-x-4 mb-4 p-1 ">
            <button
              className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
              onClick={resetState}
            >
              New Challenge
            </button>
            {playState === 0 && (
              <button
                className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                onClick={() => {
                  getMCQ();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
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
                  "Start Challenge"
                )}
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default App;
