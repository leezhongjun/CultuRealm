import React, { useState, useEffect } from "react";
import axios from "axios";
import { WithContext as ReactTags } from "react-tag-input";
import { useAuthHeader } from "react-auth-kit";
import { classNames } from "../components/Navigation";
import loadingIcon from "../assets/loading-balls.svg";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import "../styles.css";
import { FaPause, FaPlay, FaStop } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

const difficulties = ["", "Easy", "Medium", "Hard"];
const timings = [0, 30, 90, 150];

function App() {
  const [events, setEvents] = useState([
    { event: "", tags: [""], played: false, easy: 0, medium: 0, hard: 0 },
  ]);
  const [rawEvents, setRawEvents] = useState([
    { event: "", tags: [""], played: false, easy: 0, medium: 0, hard: 0 },
  ]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]); // { id: "", text: "" }
  const [allTagsRaw, setAllTagsRaw] = useState([{ id: "", text: "" }]); // [
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, unplayed, played
  const [timeTaken, setTimeTaken] = useState(0); // time taken for essay
  const [timeStart, setTimeStart] = useState(0); // time taken for essay
  const [ans, setAns] = useState([]); // user answer
  const [exp, setExp] = useState([]); // explanation
  const [userAns, setUserAns] = useState([]); // user answer
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imgSrc, setImgSrc] = useState(loadingIcon); // image url
  const [seconds, setSeconds] = useState(0);

  const [event, setEvent] = useState(""); // user choice
  const [essay, setEssay] = useState("Loading...");
  const [score, setScore] = useState(0); // score for mcq
  const [mcq, setMCQ] = useState([{ query: "", choices: [""] }]);
  const [choices, setChoices] = useState([-1]); // user choice
  const [difficulty, setDifficulty] = useState(1); // 1: easy, 2: medium, 3: hard
  const [displayScore, setDisplayScore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // const [seconds, setSeconds] = useState(0);

  const [playState, setPlayState] = useState(-1); // -1: not started, 0: essay, 1: mcq, 2: score

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

  const fetchEvents = async () => {
    try {
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
      // setEvents(res.data.even  ts);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEssay = async (e) => {
    e.preventDefault();
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
      // console.log(essay);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMCQ = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_mcq",
        {},
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      setMCQ(res.data.mcq);
      setChoices(Array(res.data.mcq.length).fill(-1));
      // console.log(res.data.mcq);
      // console.log(mcq);
    } catch (err) {
      console.log(err);
    }
  };

  const storeChoice = (e) => {
    let choices_temp = choices;
    choices_temp[parseInt(e.target.name)] = parseInt(e.target.value);
    // console.log(choices_temp);
    setChoices(choices_temp);
    // console.log(choices);
  };

  const calculateScore = () => {
    let score_temp = 0;
    let choices_temp = choices;
    for (let i = 0; i < mcq.length; i++) {
      if (mcq[i].answer === choices[i]) {
        score_temp++;
        choices_temp[i] = 100; // correct
      }
    }
    try {
      axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_score_submit",
        { score: score_temp },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      // test
      setSubmitted(true);
    } catch (err) {
      console.log(err);
    }
    setScore(score_temp);
    setChoices(choices_temp);
    setDisplayScore(true);
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
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    if (allTagsRaw.includes(tag.id)) {
      setTags([...tags, tag]);
    }
  };

  const handleDrag = (tag, currPos: number, newPos: number) => {
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
    setPlayState(res.data.play_state);
    if (res.data.play_state === -1) {
      getEvents();
      return;
    } else if (res.data.play_state === 0) {
      setEssay(res.data.essay);
    } else if (res.data.play_state === 1) {
      setMCQ(res.data.mcq);
      setTimeStart(res.data.time_start);
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
      setTimeTaken(res.data.essay);
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
    setPlayState(0);
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
      // console.log(essay);
    } catch (err) {
      console.log(err);
    }
  };

  const getMCQ = async () => {
    setPlayState(1);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_mcq",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    setMCQ(res.data.mcq);
    setTimeStart(res.data.time_start);
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
    if (seconds === 0) {
      // submit mcq
    }
  }, [seconds]);
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
                <div className="flex mt-8">
                  <select
                    name="resp"
                    className="mb-2 bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setFilter(e.target.value);
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
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
                      className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Search Culture and History..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    ></input>
                  </div>
                </div>
                <button
                  className="mt-2 mb-2 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
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
                    minQueryLength={1}
                    placeholder="Enter tags..."
                    autocomplete
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
                          ? `bg-white hover:bg-gray-100`
                          : `bg-blue-100/50 hover:bg-blue-200`,
                        `w-full m-2 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700`
                      )}
                    >
                      <div className="justify-between items-center sm:flex">
                        <div>
                          <h5 className="mb-2 text-2xl font-bold text-left p-2 text-gray-900 dark:text-white">
                            {item.event}
                          </h5>
                          <p className="m-2 font-normal text-left text-gray-700 dark:text-gray-400">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </p>
                          <p className="m-2 font-normal text-left text-gray-700 dark:text-gray-400">
                            Scores:{" "}
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
                          >
                            Play Easy
                          </button>
                          <button
                            className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                            onClick={() => getEssay(2, item.event)}
                          >
                            Play Medium
                          </button>
                          <button
                            className="m-2 bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                            onClick={() => getEssay(3, item.event)}
                          >
                            Play Hard
                          </button>
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
          <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
            <div className="mt-12 px-2 mb-4 col-span-full xl:mb-2">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Challenge
              </h1>
            </div>

            <div className="col-span-2">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white ">
                  {event}
                </h3>
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
                  </>
                )}
                {playState === 1 && (
                  <>
                    <div className="z-40 fixed top-20 bg-blue-200 left-5 bg-blue-50 border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 flex items-center space-x-4 mb-4 p-1 dark:bg-gray-800">
                      <p className="text-sm px-3 py-2 tracking-wide">
                        Seconds left:{" "}
                        <span className="font-semibold text-blue-600">
                          {seconds}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-4">
                      {mcq.map((item, index) => {
                        return (
                          <div
                            key={item.query}
                            className="font-medium px-3 py-2 tracking-wide text-gray-800 transition-colors duration-200 transform rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                          >
                            <span className="font-normal text-gray-600">
                              {index + 1}.{" "}
                            </span>
                            {item.query}
                            {item.choices.map((choice) => {
                              return <div key={choice}>{choice}</div>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
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
              </div>
            </div>
          </div>
          <div className="fixed top-20 bg-blue-50 right-5 border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 flex items-center space-x-4 mb-4 p-1 dark:bg-gray-800">
            <button
              className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={async () => {
                await axios.post(
                  import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_reset",
                  {},
                  {
                    headers: {
                      Authorization: authHeader(),
                    },
                  }
                );
                setPlayState(-1);
                getEvents();
              }}
            >
              New Challenge
            </button>
            {playState === 0 && (
              <button
                className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                onClick={() => {
                  getMCQ();
                  setPlayState(1);
                }}
              >
                Start
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default App;
