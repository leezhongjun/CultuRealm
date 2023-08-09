import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import defaultProfilePic from "../assets/default_profile_pic.png";
import ProcessAchievements from "../components/Achievements";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import { useMyContext } from "../components/Context";
import {
  checkIsEmailValid,
  checkIsNameValid,
  checkIsUsernameValid,
} from "./SignUp";

export const styles = ["Pixel", "Photorealistic", "Cartoon", "Anime"];

function generateAges() {
  const objectsArray = [];

  for (let i = 5; i <= 50; i++) {
    const name = i === 50 ? "50+" : i.toString();
    objectsArray.push(name);
  }
  objectsArray.push("Unspecified");
  return objectsArray;
}

export const ages = generateAges();

export const genders = ["Male", "Female", "Other", "Unspecified"];

export const races = [
  "Chinese",
  "Indian",
  "Malay",
  "Eurasian",
  "Other",
  "Unspecified",
];

export const religions = [
  "Buddhism",
  "Christianity",
  "Islam",
  "Hinduism",
  "Other",
  "Unspecified",
];

function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [race, setRace] = useState("");
  const [religion, setReligion] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [style, setStyle] = useState("");

  // const [profile_pic, setProfile_pic] = useState<File | null>(null);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isEditing, setIsEditing] = useState(false);

  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState(defaultProfilePic);
  const [uploadResult, setUploadResult] = useState("");
  const [settingResult, setSettingResult] = useState("");
  const [profileResult, setProfileResult] = useState("");

  const { contextValue, setContextValue } = useMyContext();

  useEffect(() => {
    const fetchPref = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_pref",
          {},
          {
            headers: {
              Authorization: authHeader(),
            },
          }
        );
        const jsonifiedData = response.data;
        console.log(jsonifiedData);

        setStyle(jsonifiedData["image_style"]);
        setAge(jsonifiedData["age"]);
        setGender(jsonifiedData["gender"]);
        setRace(jsonifiedData["race"]);
        setReligion(jsonifiedData["religion"]);

        setUsername(jsonifiedData["username"]);
        setEmail(jsonifiedData["email"]);
        setName(jsonifiedData["name"]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPref();

    const fetchProfilePic = async () => {
      try {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_profile_pic",
          authUser(),
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
    setContextValue(!contextValue);
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
      name: name,
    };
    try {
      if (!checkIsUsernameValid(username)) {
        setProfileResult("Username is invalid");
        return;
      }
      if (!checkIsEmailValid(email)) {
        setProfileResult("Email is invalid");
        return;
      }
      if (!checkIsNameValid(name)) {
        setProfileResult("Name is invalid");
        return;
      }

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
        if (res.data.message !== "Success") {
          setProfileResult(res.data.message);
        }
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
            Settings
          </h1>
        </div>
        <div className="col-span-full xl:col-auto">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
              <img
                className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                src={imgSrc}
                alt="Profile picture"
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
                          className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                          onClick={() => {
                            setImgSrc(defaultProfilePic);
                            setProfilePic(null);
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
                          Save
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {uploadResult}
                        </p>
                      </div>
                    </div>
                  </form>
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
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Image style
                </label>
                <select
                  name="countries"
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
                  type="submit"
                >
                  Save
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
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Name{" "}
                    <span className="text-xs text-gray-500">
                      (Characters in the story will call you by this name.)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    defaultValue={name}
                    placeholder={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    onBlur={(e) => {
                      setName(e.target.value);
                    }}
                    onInput={(e) => {
                      setName(e.target.value);
                    }}
                    onFocus={(e) => {
                      setName(e.target.value);
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
                    value={age}
                  >
                    {ages.map((age) => {
                      return (
                        <option key={age} value={age}>
                          {age}
                        </option> // default value instead
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
                    value={gender}
                  >
                    {genders.map((gender) => {
                      return (
                        <option key={gender} value={gender}>
                          {gender}
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
                    value={race}
                  >
                    {races.map((race) => {
                      return (
                        <option key={race} value={race}>
                          {race}
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
                    value={religion}
                  >
                    {religions.map((religion) => {
                      return (
                        <option key={religion} value={religion}>
                          {religion}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2 col-span-full">
                  <button
                    className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    type="submit"
                  >
                    Save
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profileResult}
                  </p>
                </div>
              </div>
            </form>
          </div>
          {/* <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold dark:text-white">
              Statistics
            </h3>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="image-style"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Rating
                </label>
                <p
                  id="image-style"
                  className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  {rating}
                </p>
              </div>
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
                  Stories played
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
          </div> */}
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
