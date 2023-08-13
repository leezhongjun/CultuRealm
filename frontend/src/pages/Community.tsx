import { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import axios from "axios";
// import { ages, races, religions } from "../pages/Settings";
import { ages, races } from "../pages/Settings";
import { Link, useNavigate } from "react-router-dom";
import { useIsAuthenticated, useAuthHeader } from "react-auth-kit";
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
  Upvotes: "upvotes",
  New: "createdAt",
};

function Community() {
  const [storiesData, setStoriesData] = useState([]);
  const [rawStoriesData, setRawStoriesData] = useState([]);
  const [filterValue, setFilterValue] = useState("Race");
  const [optionValue, setOptionValue] = useState("All");
  const [username, setUsername] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("Rating");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [genStoryLoading, setGenStoryLoading] = useState(false);

  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();

  const getStories = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/get_stories"
    );
    console.log(res.data);
    setStoriesData(res.data.stories);
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
    setDescription(response.data.story_desc);
    setTitle(response.data.story_title);
    setGenStoryLoading(false);
  }

  useEffect(() => {
    getStories();
    setIsAuth(isAuthenticated());
  }, []);

  // useEffect(() => {
  //   setLeaderboardData(
  //     rawLeaderboardData.filter(
  //       (user) =>
  //         user.username.includes(username) &&
  //         (user[filterValue.toLowerCase()] === optionValue ||
  //           optionValue === "All")
  //     )
  //   );
  // }, [username, filterValue, optionValue]);

  const submitVote = async (
    story_id: string,
    old_votes: number,
    vote_dir: number
  ) => {
    if (!isAuth) {
      return;
    }
    let new_votes = vote_dir;
    if (
      (vote_dir === -1 && old_votes === -1) ||
      (vote_dir === 1 && old_votes === 1)
    ) {
      new_votes = 0;
    }
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/vote_story",
      { story_id: story_id, votes: new_votes },
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    );
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
    return res.data.story_id;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const story_id = await submitNewStory();
  };

  const handleAddPlay = async (e) => {
    e.preventDefault();
    const story_id = await submitNewStory();
    // process starting story
    navigate("/story");
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
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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
                    onClick={handleAdd}
                  >
                    Add Only
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
              <div className="col-span-1 block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
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
                  Created at: <a>{item.created_at}</a>
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
              </div>
            ))}
          </div>
          {isAuth && (
            <div className="fixed bottom-0 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 flex items-center space-x-4 mb-4 p-1 dark:bg-gray-800">
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
