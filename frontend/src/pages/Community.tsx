import { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import axios from "axios";
// import { ages, races, religions } from "../pages/Settings";
import { ages, races } from "../pages/Settings";
import { Link, useNavigate } from "react-router-dom";
import { useIsAuthenticated, useAuthHeader, useAuthUser } from "react-auth-kit";
import {
  BiUpvote,
  BiDownvote,
  BiSolidUpvote,
  BiSolidDownvote,
} from "react-icons/bi";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const indexes = {
  Race: [...races, "All"],
  Age: [...ages, "All"],
  // Religion: [...religions, "All"],
};

const sortIndexes = {
  Upvotes: "Upvotes",
  New: "New",
};

function Community() {
  const [storiesData, setStoriesData] = useState([]);
  const [rawStoriesData, setRawStoriesData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("New");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [authUser, setAuthUser] = useState({});
  const [showCustom, setShowCustom] = useState(false);
  const [genStoryLoading, setGenStoryLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [currStoryId, setCurrStoryId] = useState("");
  const [startStoryLoading, setStartStoryLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const [flagText, setFlagText] = useState("");
  const [country, setCountry] = useState("Singapore");
  const [addLoading, setAddLoading] = useState(false);

  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const authUserFunc = useAuthUser();
  console.log(isAuthenticated());
  const getStories = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT +
        (isAuth ? "/get_stories_proc" : "/get_stories"),
      {},
      isAuth
        ? {
            headers: {
              Authorization: authHeader(),
            },
          }
        : {}
    );
    console.log(res.data);
    setRawStoriesData(res.data.stories);
    setStoriesData(
      res.data.stories
        .sort(
          sortValue === "Upvotes"
            ? function (a, b) {
                return b.upvotes - a.upvotes;
              }
            : function (a, b) {
                var keyA = new Date(a.created_at),
                  keyB = new Date(b.created_at);
                // Compare the 2 dates
                return keyB - keyA;
              }
        )
        .filter(
          (item) =>
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchValue.toLowerCase())
        )
    );
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
    console.log(response.data);
    setDescription(response.data.story_desc);
    setTitle(response.data.story_title);
    setGenStoryLoading(false);
  }

  useEffect(() => {
    setIsAuth(isAuthenticated());
    isAuthenticated() ? setAuthUser(authUserFunc().id) : null;
    getStories();
  }, []);

  useEffect(() => {
    setStoriesData(
      [...rawStoriesData]
        .sort(
          sortValue === "Upvotes"
            ? function (a, b) {
                return b.upvotes - a.upvotes;
              }
            : function (a, b) {
                var keyA = new Date(a.created_at),
                  keyB = new Date(b.created_at);
                // Compare the 2 dates
                return keyB - keyA;
              }
        )
        .filter(
          (item) =>
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchValue.toLowerCase())
        )
    );
  }, [searchValue, sortValue]);

  const startStory = async (needSuggestions: boolean, story_id: string) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/start_story",
        {
          suggestions: needSuggestions,
          is_custom: true,
          story_id: story_id,
          country: country,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      const data = response.data;
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitVote = async (
    story_id: string,
    old_votes: number,
    vote_dir: number
  ) => {
    if (!isAuthenticated()) {
      return;
    }
    let new_votes = vote_dir;
    if (
      (vote_dir === -1 && old_votes === -1) ||
      (vote_dir === 1 && old_votes === 1)
    ) {
      new_votes = 0;
    }
    console.log(old_votes);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/vote_story",
      { story_id: story_id, votes: new_votes },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data);
    getStories();
  };

  const submitNewStory = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/add_custom_story",
      { story_text: description, title: title },
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

  const deleteStory = async (story_id: string) => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/delete_story",
      { story_id: story_id },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
    console.log(res.data);
    getStories();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    const res = await submitNewStory();
    const story_id = res[0];
    const flagged = res[1];
    const flagged_text = res[2];
    setAddLoading(false);
    if (flagged) {
      setFlag(true);
      setFlagText(flagged_text);
      return;
    }
    getStories();
    setTitle("");
    setDescription("");
    return story_id;
  };

  const handleAddPlay = async (e) => {
    e.preventDefault();
    const res = await submitNewStory();
    const story_id = res[0];
    const flagged = res[1];
    const flagged_text = res[2];
    if (flagged) {
      setFlag(true);
      setFlagText(flagged_text);
      return;
    }
    getStories();
    setCurrStoryId(story_id);
    setModalDesc(description);
    setModalTitle(title);
    setShowModal(true);
  };
  return (
    <>
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
        <div className="mb-4 col-span-full xl:mb-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Community Custom Stories
          </h1>
        </div>
        {isAuth && showCustom && (
          <div
            id="create-new"
            className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
          >
            <h3 className="mb-4 text-xl font-semibold dark:text-white ">
              New Custom Story
            </h3>
            <div className="gap-4">
              <form>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Title
                </label>
                <input
                  type="text"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${
                    flag ? "border-red-300" : ""
                  }`}
                  value={title}
                  placeholder="Title of story"
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  onBlur={(e) => {
                    setTitle(e.target.value);
                  }}
                  onInput={(e) => {
                    setTitle(e.target.value);
                  }}
                  onFocus={(e) => {
                    setTitle(e.target.value);
                  }}
                  required
                />
                <label className="mt-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </label>
                <textarea
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 ${
                    flag ? "border-red-300" : ""
                  }`}
                  value={description}
                  placeholder="Description of story"
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  onBlur={(e) => {
                    setDescription(e.target.value);
                  }}
                  onInput={(e) => {
                    setDescription(e.target.value);
                  }}
                  onFocus={(e) => {
                    setDescription(e.target.value);
                  }}
                  required
                />
                <p className={flag ? "text-pink-600 text-sm" : "hidden"}>
                  {flagText}
                </p>
                <button
                  className="mt-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
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
                <div className="flex gap-4">
                  <button
                    className="mt-4 h-fit text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    type="submit"
                    onClick={handleAddPlay}
                  >
                    Add and Play
                  </button>
                  <button
                    className="mt-4 h-fit text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    type="submit"
                    onClick={async (e) => {
                      const story_id = await handleAdd(e);
                      console.log(story_id);
                      console.log(document.getElementById(story_id));
                      const element = document.getElementById(story_id);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    disabled={addLoading}
                  >
                    {addLoading ? (
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
                      "Add only"
                    )}
                  </button>
                </div>
                <button
                  className="mt-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  type="button"
                  onClick={() => {
                    setShowCustom(false);
                  }}
                >
                  Hide
                </button>
              </form>
            </div>
          </div>
        )}
        {showModal && (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <h3 className="text-3xl font-semibold">
                      Want suggestions?
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-3xl leading-none font-semibold outline-none hover:opacity-100"
                      onClick={() => {
                        setShowModal(false);
                        setDescription("");
                        setTitle("");
                      }}
                    >
                      <span className="text-black opacity-50 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 flex-auto">
                    <p className="font-semibold my-4 text-2xl leading-relaxed">
                      Playing this custom story:
                    </p>
                    <p className="font-semibold my-4 text-slate-500 text-lg leading-relaxed">
                      {modalTitle}
                    </p>
                    <p className="my-4 text-slate-500 text-lg leading-relaxed">
                      {modalDesc}
                    </p>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={async () => {
                        setStartStoryLoading(true);
                        await startStory(false, currStoryId);
                        setShowModal(false);
                        setStartStoryLoading(false);
                        navigate("/story");
                      }}
                    >
                      {startStoryLoading ? (
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
                        "No"
                      )}
                    </button>
                    <button
                      className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={async () => {
                        setStartStoryLoading(true);
                        await startStory(true, currStoryId);
                        setShowModal(false);
                        setStartStoryLoading(false);
                        navigate("/story");
                      }}
                    >
                      {startStoryLoading ? (
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
                        "Yes, I want suggestions"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        )}
        <div className="col-span-full">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Sort by
            </label>
            <div className="flex space-x-4 mb-2">
              <select
                className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={sortValue}
                onChange={(e) => {
                  setSortValue(e.target.value);
                }}
              >
                {Object.keys(sortIndexes).map((sortValue) => {
                  return (
                    <option key={sortValue} value={sortValue}>
                      {sortValue}
                    </option>
                  );
                })}
              </select>
            </div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Search
            </label>
            <input
              type="text"
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              defaultValue={searchValue}
              placeholder="Enter a keyword"
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              onBlur={(e) => {
                setSearchValue(e.target.value);
              }}
              onInput={(e) => {
                setSearchValue(e.target.value);
              }}
              onFocus={(e) => {
                setSearchValue(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="relative overflow-x-auto col-span-full">
          <div className="mb-24 items-center grid grid-cols-1 2xl:grid-cols-5 justify-center gap-4 justify-items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {storiesData.map((item, index) => (
              <div
                key={item.id}
                id={item.id}
                className="col-span-1 block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {item.title}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  {item.desc}
                </p>
                <p className="text-gray-500 font-medium">
                  Created by:{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-700 hover:no-underline"
                    href={`/profile/${item.user_id}`}
                    target="_blank"
                  >
                    {item.username}
                  </a>
                </p>
                <p className="text-gray-500 font-medium">
                  Created at:{" "}
                  <b>{new Date(item.created_at).toLocaleString("en-GB")}</b>
                </p>
                <p className="text-gray-500 font-medium">
                  Times played: <b>{item.play_count}</b>
                </p>
                <p className="text-gray-500 font-medium">
                  High score: <b>{item.high_score}/100</b>
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => submitVote(item.id, item.user_votes, 1)}
                  >
                    {item.user_votes == 1 ? <BiSolidUpvote /> : <BiUpvote />}
                  </button>
                  {item.upvotes}
                  <button
                    onClick={() => submitVote(item.id, item.user_votes, -1)}
                  >
                    {item.user_votes == -1 ? (
                      <BiSolidDownvote />
                    ) : (
                      <BiDownvote />
                    )}
                  </button>
                </div>
                {isAuth && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="mt-4 h-fit text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                      onClick={() => {
                        setCurrStoryId(item.id);
                        setModalDesc(item.desc);
                        setModalTitle(item.title);
                        setShowModal(true);
                      }}
                    >
                      Play
                    </button>
                    {item.user_id === authUser && (
                      <button
                        className="mt-4 py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        onClick={() => deleteStory(item.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {isAuth && (
            <div className="fixed bottom-0 right-5 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 flex items-center space-x-4 mb-4 p-1 dark:bg-gray-800">
              <button
                className="text-xl font-medium p-4 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                onClick={() => {
                  setShowCustom(true);
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }}
              >
                Create New Custom Story +
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Community;
