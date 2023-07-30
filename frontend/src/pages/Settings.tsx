import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
import defaultProfilePic from "../assets/default_profile_pic.png";
import ProcessAchievements from "../components/Achievements";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

function Settings() {
  const stylesDef = [
    { name: "Pixel", selected: false },
    { name: "Photorealistic", selected: false },
    { name: "Cartoon", selected: false },
    { name: "Anime", selected: false },
  ];

  function generateAges() {
    const objectsArray = [];

    for (let i = 5; i <= 50; i++) {
      const name = i === 50 ? "50+" : i.toString();
      const selected = false;

      const obj = { name, selected };
      objectsArray.push(obj);
    }
    objectsArray.push({ name: "Unspecified", selected: false });
    return objectsArray;
  }

  const agesDef = generateAges();

  const gendersDef = [
    { name: "Male", selected: false },
    { name: "Female", selected: false },
    { name: "Other", selected: false },
    { name: "Unspecified", selected: false },
  ];

  const racesDef = [
    { name: "Chinese", selected: false },
    { name: "Indian", selected: false },
    { name: "Malay", selected: false },
    { name: "Eurasian", selected: false },
    { name: "Other", selected: false },
    { name: "Unspecified", selected: false },
  ];

  const religionsDef = [
    { name: "Buddhism", selected: false },
    { name: "Christianity", selected: false },
    { name: "Islam", selected: false },
    { name: "Hinduism", selected: false },
    { name: "Other", selected: false },
    { name: "Unspecified", selected: false },
  ];

  const [styles, setStyles] = useState(stylesDef);
  const [ages, setAges] = useState(agesDef);
  const [genders, setGenders] = useState(gendersDef);
  const [races, setRaces] = useState(racesDef);
  const [religions, setReligions] = useState(religionsDef);

  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [achievements, setAchievements] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [race, setRace] = useState("");
  const [religion, setReligion] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [style, setStyle] = useState("");

  // const [profile_pic, setProfile_pic] = useState<File | null>(null);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isEditing, setIsEditing] = useState(false);

  const authHeader = useAuthHeader();
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState(defaultProfilePic);
  const [uploadResult, setUploadResult] = useState("");
  const [settingResult, setSettingResult] = useState("");
  const [profileResult, setProfileResult] = useState("");

  useEffect(() => {
    const fetchPref = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_pref",
          {},
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: authHeader(),
            },
          }
        );
        const jsonifiedData = response.data;
        console.log(jsonifiedData);

        styles[
          styles.findIndex((x) => x.name === jsonifiedData["image_style"])
        ].selected = true;
        setStyles(styles);
        setStyle(jsonifiedData["image_style"]);
        ages[ages.findIndex((x) => x.name === jsonifiedData["age"])].selected =
          true;
        setAges(ages);
        setAge(jsonifiedData["age"]);
        genders[
          genders.findIndex((x) => x.name === jsonifiedData["gender"])
        ].selected = true;
        setGenders(genders);
        setGender(jsonifiedData["gender"]);
        races[
          races.findIndex((x) => x.name === jsonifiedData["race"])
        ].selected = true;
        setRaces(races);
        setRace(jsonifiedData["race"]);
        religions[
          religions.findIndex((x) => x.name === jsonifiedData["religion"])
        ]["selected"] = true;
        setReligions(religions);
        setReligion(jsonifiedData["religion"]);

        setUsername(jsonifiedData["username"]);
        setEmail(jsonifiedData["email"]);

        setHighScore(jsonifiedData["high_score"]);
        setGamesPlayed(jsonifiedData["stories_played"]);
        setAchievements(jsonifiedData["achievements"]); // process achievements
      } catch (error) {
        console.error(error);
      }
    };

    fetchPref();

    const fetchProfilePic = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_profile_pic",
          {},
          {
            headers: {
              Authorization: authHeader(),
            },
            responseType: "arraybuffer", // set response type to arraybuffer to get binary data
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

  const handleSubmitPfp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("profile_pic", profilePic);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/set_user_profile_pic",
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: authHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    setUploadResult(res.data.message);
  };

  const handleSubmit = async (
    type: String,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const json = {
      race: race,
      religion: religion,
      gender: gender,
      age: age,
      image_style: style,
      username: username,
      email: email,
    };
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/set_user_pref",
        json,
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      console.log(res.data);
      if (type === "settings") {
        setSettingResult("Successfully saved settings");
      } else {
        setProfileResult("Successfully saved profile");
      }
    } catch (error) {
      console.log(error);
      if (type === "settings") {
        setSettingResult("An error occurred");
      } else {
        setProfileResult("An error occurred");
      }
    }
  };
  return (
    <>
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
        <div className="mb-4 col-span-full xl:mb-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Profile settings
          </h1>
        </div>
        <div className="col-span-full xl:col-auto">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
              <img
                className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                src={imgSrc}
                alt="Jese picture"
              ></img>
              <div>
                <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                  Profile picture
                </h3>
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  JPG, JPEG, GIF or PNG
                </div>
                <div className="flex items-center space-x-4">
                  <form id="form" onSubmit={handleSubmitPfp}>
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <label
                          htmlFor="dropzone-file"
                          className="inline-flex items-center text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                        >
                          <svg
                            className="w-4 h-4 mr-2 -ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                            <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                          </svg>
                          Upload picture
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.gif"
                            onChange={async (e) => {
                              if (e.target.files) {
                                const res =
                                  await e.target.files[0].arrayBuffer();
                                setProfilePic(e.target.files[0]);
                                setImgSrc(
                                  window.URL.createObjectURL(new Blob([res]))
                                );
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                          onClick={() => {
                            setImgSrc(defaultProfilePic);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-2">
                        <button
                          className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                          type="submit"
                        >
                          Save all
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {uploadResult}
                        </p>
                      </div>
                    </div>
                  </form>
                  {/* <form>
                    <input
                      type="file"
                      className="inline-flex items-center text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    >
                      <svg
                        className="w-4 h-4 mr-2 -ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                        <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                      </svg>
                      Upload picture
                    </input>
                    <input type="submit" value="Submit" />
                  </form>
                  <button
                    type="button"
                    className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Delete
                  </button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold dark:text-white">
              Settings
            </h3>
            <form id="form2" onSubmit={(e) => handleSubmit("settings", e)}>
              <div className="mb-4">
                <label
                  htmlFor="image-style"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Image style
                </label>
                <select
                  id="image-style"
                  name="countries"
                  className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  onChange={(e) => {
                    setStyle(e.target.value);
                  }}
                >
                  {styles.map((style) => {
                    return (
                      <option selected={style.selected}>{style.name}</option>
                    );
                  })}
                </select>
              </div>
              {/* <div className="mb-6">
              <label
                htmlFor="settings-timezone"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Time Zone
              </label>
              <select
                id="settings-timezone"
                name="countries"
                className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              >
                <option>GMT+0 Greenwich Mean Time (GMT)</option>
                <option selected={true}>
                  GMT+1 Central European Time (CET)
                </option>
                <option>GMT+2 Eastern European Time (EET)</option>
                <option>GMT+3 Moscow Time (MSK)</option>
                <option>GMT+5 Pakistan Standard Time (PKT)</option>
                <option>GMT+8 China Standard Time (CST)</option>
                <option>GMT+10 Eastern Australia Standard Time (AEST)</option>
              </select>
            </div> */}
              <div className="space-y-2">
                <button
                  className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                  type="submit"
                >
                  Save all
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {settingResult}
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className="col-span-2">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold dark:text-white">
              Preferences
            </h3>
            <form id="form3" onSubmit={(e) => handleSubmit("profile", e)}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Username
                  </label>
                  <input
                    type="text"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    defaultValue={username}
                    placeholder={username}
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
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Email
                  </label>
                  <input
                    type="text"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    defaultValue={email}
                    placeholder={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    onBlur={(e) => {
                      setEmail(e.target.value);
                    }}
                    onInput={(e) => {
                      setEmail(e.target.value);
                    }}
                    onFocus={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="image-style"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Age
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setAge(e.target.value);
                    }}
                    onBlur={(e) => {
                      setAge(e.target.value);
                    }}
                    onInput={(e) => {
                      setAge(e.target.value);
                    }}
                    onFocus={(e) => {
                      setAge(e.target.value);
                    }}
                  >
                    {ages.map((age) => {
                      return (
                        <option selected={age.selected}>{age.name}</option> // default value instead
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="image-style"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Gender
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setGender(e.target.value);
                    }}
                    onBlur={(e) => {
                      setGender(e.target.value);
                    }}
                    onInput={(e) => {
                      setGender(e.target.value);
                    }}
                    onFocus={(e) => {
                      setGender(e.target.value);
                    }}
                  >
                    {genders.map((gender) => {
                      return (
                        <option selected={gender.selected}>
                          {gender.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="image-style"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Race
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setRace(e.target.value);
                    }}
                    onBlur={(e) => {
                      setRace(e.target.value);
                    }}
                    onInput={(e) => {
                      setRace(e.target.value);
                    }}
                    onFocus={(e) => {
                      setRace(e.target.value);
                    }}
                  >
                    {races.map((race) => {
                      return (
                        <option selected={race.selected}>{race.name}</option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="image-style"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Religion
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    onChange={(e) => {
                      setReligion(e.target.value);
                    }}
                    onBlur={(e) => {
                      setReligion(e.target.value);
                    }}
                    onInput={(e) => {
                      setReligion(e.target.value);
                    }}
                    onFocus={(e) => {
                      setReligion(e.target.value);
                    }}
                  >
                    {religions.map((religion) => {
                      return (
                        <option selected={religion.selected}>
                          {religion.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <button
                    className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    type="submit"
                  >
                    Save all
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profileResult}
                  </p>
                </div>
              </div>
            </form>
          </div>
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold dark:text-white">
              Statistics
            </h3>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="image-style"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  High score
                </label>
                <p
                  id="image-style"
                  className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  {highScore}
                </p>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="image-style"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Games played
                </label>
                <p
                  id="image-style"
                  className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  {gamesPlayed}
                </p>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="image-style"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Achievements
                </label>
                <p
                  id="image-style"
                  className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  {achievements}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold dark:text-white">
              Password information
            </h3>
            <form action="#">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="current-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Current password
                  </label>
                  <input
                    type="text"
                    name="current-password"
                    id="current-password"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    New password
                  </label>
                  <input
                    data-popover-target="popover-password"
                    data-popover-placement="bottom"
                    type="password"
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <div
                    data-popover
                    id="popover-password"
                    role="tooltip"
                    className="absolute z-10 invisible inline-block text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                  >
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Must have at least 6 characters
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-1 bg-orange-300 dark:bg-orange-400"></div>
                        <div className="h-1 bg-orange-300 dark:bg-orange-400"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
                      </div>
                      <p>It’s better to have:</p>
                      <ul>
                        <li className="flex items-center mb-1">
                          <svg
                            className="w-4 h-4 mr-2 text-green-400 dark:text-green-500"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          Upper & lower case letters
                        </li>
                        <li className="flex items-center mb-1">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-400"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          A symbol (#$&)
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-400"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          A longer password (min. 12 chars.)
                        </li>
                      </ul>
                    </div>
                    <div data-popper-arrow></div>
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm password
                  </label>
                  <input
                    type="text"
                    name="confirm-password"
                    id="confirm-password"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-full">
                  <button
                    className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    type="submit"
                  >
                    Save all
                  </button>
                </div>
              </div>
            </form> *
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Settings;
