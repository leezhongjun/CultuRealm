import { useEffect, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import axios from "axios";
import { ages, races, religions } from "../pages/Settings";
import { Link } from "react-router-dom";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const indexes = {
  Race: [...races, "All"],
  Age: [...ages, "All"],
  Religion: [...religions, "All"],
};

const sortIndexes = {
  Upvotes: "upvotes",
  New: "createdAt",
};

function Community() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [rawLeaderboardData, setRawLeaderboardData] = useState([]);
  const [filterValue, setFilterValue] = useState("Race");
  const [optionValue, setOptionValue] = useState("All");
  const [username, setUsername] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("Rating");

  const getLeaderboard = async () => {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/leaderboard",
      {
        limit: 50,
      }
    );
    console.log(res.data);
    setRawLeaderboardData(res.data);
    setLeaderboardData(res.data);
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  useEffect(() => {
    setLeaderboardData(
      rawLeaderboardData.filter(
        (user) =>
          user.username.includes(username) &&
          (user[filterValue.toLowerCase()] === optionValue ||
            optionValue === "All")
      )
    );
  }, [username, filterValue, optionValue]);

  return (
    <>
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
        <div className="mb-4 col-span-full xl:mb-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Community Custom Stories
          </h1>
        </div>
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
          <div className="items-center grid grid-cols-1 2xl:grid-cols-5 justify-center gap-4 justify-items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {leaderboardData.map((item, index) => (
              <Link
                to="#"
                className="col-span-1 block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Noteworthy technology acquisitions 2021
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Here are the biggest enterprise technology acquisitions of
                  2021 so far, in reverse chronological order.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Community;
