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

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [rawLeaderboardData, setRawLeaderboardData] = useState([]);
  const [filterValue, setFilterValue] = useState("Race");
  const [optionValue, setOptionValue] = useState("All");
  const [username, setUsername] = useState("");

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
            Leaderboard
          </h1>
        </div>
        <div className="col-span-full">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Filter by
            </label>
            <div className="flex space-x-4">
              <select
                className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setOptionValue("All");
                }}
              >
                {Object.keys(indexes).map((filterValue) => {
                  return (
                    <option key={filterValue} value={filterValue}>
                      {filterValue}
                    </option>
                  );
                })}
              </select>
              <select
                className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={optionValue}
                onChange={(e) => setOptionValue(e.target.value)}
              >
                {indexes[filterValue].map((optionValue) => {
                  return (
                    <option key={optionValue} value={optionValue}>
                      {optionValue}
                    </option>
                  );
                })}
              </select>
            </div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Search by username
            </label>
            <input
              type="text"
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              defaultValue={username}
              placeholder="Enter username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              onBlur={(e) => {
                setUsername(e.target.value);
              }}
              onInput={(e) => {
                setUsername(e.target.value);
              }}
              onFocus={(e) => {
                setUsername(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="relative overflow-x-auto col-span-full">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {["Ranking", "Username", "Rating", "Race", "Age"].map(
                  (header, index) => (
                    <th scope="col" key={index} className="border px-1 py-2">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              {leaderboardData.map((item, index) => (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  key={index}
                  onClick={() => {
                    window.open(`/profile/${item.id}`, "_blank");
                  }}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {index + 1}
                  </th>
                  <td className="border px-4 py-2 text-black font-bold">
                    {item.username}
                  </td>
                  <td className="border px-4 py-2 text-black font-bold">
                    {item.rating}
                  </td>
                  <td className="border px-4 py-2">{item.race}</td>
                  <td className="border px-4 py-2">{item.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Leaderboard;
