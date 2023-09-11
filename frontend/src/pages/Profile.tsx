import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import defaultProfilePic from "../assets/default_profile_pic.png";
import ProcessAchievements from "../components/Achievements";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

function Profile() {
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [rating, setRating] = useState(0);
  const [achievements, setAchievements] = useState("");

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const [race, setRace] = useState("");
  // const [religion, setReligion] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [globalUnlocked, setGlobalUnlocked] = useState(false);
  const [challengesPlayed, setChallengesPlayed] = useState(0);
  const [easyHighScore, setEasyHighScore] = useState(0);
  const [mediumHighScore, setMediumHighScore] = useState(0);
  const [hardHighScore, setHardHighScore] = useState(0);

  // const [profile_pic, setProfile_pic] = useState<File | null>(null);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isEditing, setIsEditing] = useState(false);

  const [imgSrc, setImgSrc] = useState(defaultProfilePic);
  let { id } = useParams();

  useEffect(() => {
    const fetchPref = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_pref_public",
          { id: id },
          {}
        );
        const jsonifiedData = response.data;
        console.log(jsonifiedData);

        setAge(jsonifiedData["age"]);
        setGender(jsonifiedData["gender"]);
        setRace(jsonifiedData["race"]);
        // setReligion(jsonifiedData["religion"]);

        setUsername(jsonifiedData["username"]);
        setName(jsonifiedData["name"]);

        setRating(jsonifiedData["rating"]);
        setHighScore(jsonifiedData["high_score"]);
        setGamesPlayed(jsonifiedData["stories_played"]);
        setAchievements(jsonifiedData["achievements"]); // process achievements
        setGlobalUnlocked(jsonifiedData["global_unlocked"]);
        setChallengesPlayed(jsonifiedData["challenges_played"]);
        setHardHighScore(jsonifiedData["hard_high_score"]);
        setMediumHighScore(jsonifiedData["medium_high_score"]);
        setEasyHighScore(jsonifiedData["easy_high_score"]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPref();

    const fetchProfilePic = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_profile_pic",
          { id: id },
          {
            headers: {
              "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
          }
        );
        const binaryData = response.data;
        console.log(binaryData.byteLength > 0);
        if (binaryData.byteLength > 0) {
          setImgSrc(window.URL.createObjectURL(new Blob([binaryData])));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfilePic();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 ">
        <div className="mb-4 col-span-full xl:mb-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl ">
            Profile
          </h1>
        </div>
        <div className="col-span-full xl:col-auto">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
            <h3 className="px-4 mb-4 text-xl font-semibold ">User</h3>
            <div className="items-center sm:flex xl:block sm:space-x-4 xl:space-x-0 2xl:space-x-4">
              <div className="px-4">
                <img
                  className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                  src={imgSrc}
                  alt="Profile picture"
                ></img>
              </div>
              <div>
                <div className="col-span-6 sm:col-span-3 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Username
                  </label>
                  <input
                    type="text"
                    className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    value={username}
                    disabled
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Name
                  </label>
                  <input
                    type="text"
                    className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    value={name}
                    disabled
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Age
                  </label>
                  <input
                    type="text"
                    className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    value={age}
                    disabled
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Gender
                  </label>
                  <input
                    type="text"
                    className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    value={gender}
                    disabled
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Race
                  </label>
                  <input
                    type="text"
                    className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    value={race}
                    disabled
                  />
                </div>
                {/* <div className="col-span-6 sm:col-span-3 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Religion
                  </label>
                  <input
                    type="text"
                    className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    value={religion}
                    disabled
                  />
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
            <h3 className="mb-4 text-xl font-semibold ">Story</h3>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Rating
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={rating}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  High score
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={`${highScore}/100`}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Stories played
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={gamesPlayed}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Global mode unlocked
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={globalUnlocked ? "Yes" : "No"}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Achievements
                </label>
                <div className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 ">
                  {ProcessAchievements(achievements)}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
            <h3 className="mb-4 text-xl font-semibold ">Challenge</h3>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Unique challenges played
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={challengesPlayed}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Easy mode high score
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={easyHighScore}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Medium mode high score
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={mediumHighScore}
                  disabled
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Hard mode high score
                </label>
                <input
                  type="text"
                  className="font-bold shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                  value={hardHighScore}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
