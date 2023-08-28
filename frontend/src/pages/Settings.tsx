import React, { useState, useEffect } from "react";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import defaultProfilePic from "../assets/default_profile_pic.png";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import { useMyContext } from "../components/Context";
import {
  checkIsEmailValid,
  checkIsNameValid,
  checkIsUsernameValid,
} from "./SignUp";

export const styles = ["Pixel", "Photorealistic", "Cartoon", "Anime"];

export const countries = [
  "Random",
  "Singapore",
  "United States",
  "China",
  "India",
  "Russia",
  "Japan",
  "Brazil",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Canada",
  "South Korea",
  "Australia",
  "Mexico",
  "Spain",
  "Indonesia",
  "Turkey",
  "Saudi Arabia",
  "South Africa",
  "Nigeria",
  "Argentina",
  "Egypt",
  "Pakistan",
  "Iran",
  "Vietnam",
  "Thailand",
  "Poland",
  "Netherlands",
  "Malaysia",
  "Philippines",
  "Colombia",
  "Ukraine",
  "Belgium",
  "Sweden",
  "Switzerland",
  "Austria",
  "Greece",
  "Chile",
  "Norway",
  "Denmark",
  "Finland",
  "Israel",
  "Portugal",
  "Ireland",
  "New Zealand",
  "Czech Republic",
  "Romania",
  "Hungary",
  "United Arab Emirates",
  "Peru",
  "Bangladesh",
  "Hong Kong",
  "Iraq",
  "Kuwait",
  "Qatar",
  "Venezuela",
  "Morocco",
  "Puerto Rico",
  "Cuba",
  "Jordan",
  "Oman",
  "Slovakia",
];

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

// export const religions = [
//   "Buddhism",
//   "Christianity",
//   "Islam",
//   "Hinduism",
//   "Other",
//   "Unspecified",
// ];

function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [race, setRace] = useState("");
  // const [religion, setReligion] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [style, setStyle] = useState("");

  // const [profile_pic, setProfile_pic] = useState<File | null>(null);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isEditing, setIsEditing] = useState(false);

  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const [profilePic, setProfilePic] = useState<Blob | null>(null);
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
        // setReligion(jsonifiedData["religion"]);

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
    if (profilePic) {
      formData.append("profile_pic", profilePic);
    }
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
      // religion: religion,
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
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 ">
        <div className="mb-4 col-span-full xl:mb-2">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl ">
            Settings
          </h1>
        </div>
        <div className="col-span-full xl:col-auto">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
            <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
              <img
                className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                src={imgSrc}
                alt="Profile picture"
              ></img>
              <div>
                <h3 className="mb-1 text-xl font-bold text-gray-900 ">
                  Profile picture
                </h3>
                <div className="mb-4 text-sm text-gray-500 ">
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
                          className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700  "
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
                        <p className="text-sm text-gray-500 ">{uploadResult}</p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
            <h3 className="mb-4 text-xl font-semibold ">Settings</h3>
            <form id="form2" onSubmit={(e) => handleSubmit("settings", e)}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 ">
                  Image style
                </label>
                <select
                  name="countries"
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
                  type="submit"
                >
                  Save
                </button>
                <p className="text-sm text-gray-500 ">{settingResult}</p>
              </div>
            </form>
          </div>
        </div>
        <div className="col-span-2">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  sm:p-6 ">
            <h3 className="mb-4 text-xl font-semibold ">Preferences</h3>
            <form id="form3" onSubmit={(e) => handleSubmit("profile", e)}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Username
                  </label>
                  <input
                    type="text"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    defaultValue={username}
                    placeholder={username}
                    onChange={(e) => {
                      setUsername(e.currentTarget.value);
                    }}
                    onBlur={(e) => {
                      setUsername(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                      setUsername(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                      setUsername(e.currentTarget.value);
                    }}
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Email
                  </label>
                  <input
                    type="text"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    defaultValue={email}
                    placeholder={email}
                    onChange={(e) => {
                      setEmail(e.currentTarget.value);
                    }}
                    onBlur={(e) => {
                      setEmail(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                      setEmail(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                      setEmail(e.currentTarget.value);
                    }}
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Name{" "}
                    <span className="text-xs text-gray-500">
                      (Characters in the story will call you by this name.)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    defaultValue={name}
                    placeholder={name}
                    onChange={(e) => {
                      setName(e.currentTarget.value);
                    }}
                    onBlur={(e) => {
                      setName(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                      setName(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                      setName(e.currentTarget.value);
                    }}
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="image-style"
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Age
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    onChange={(e) => {
                      setAge(e.currentTarget.value);
                    }}
                    onBlur={(e) => {
                      setAge(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                      setAge(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                      setAge(e.currentTarget.value);
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
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Gender
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    onChange={(e) => {
                      setGender(e.currentTarget.value);
                    }}
                    onBlur={(e) => {
                      setGender(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                      setGender(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                      setGender(e.currentTarget.value);
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
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Race
                  </label>
                  <select
                    id="image-style"
                    name="countries"
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                    onChange={(e) => {
                      setRace(e.currentTarget.value);
                    }}
                    onBlur={(e) => {
                      setRace(e.currentTarget.value);
                    }}
                    onInput={(e) => {
                      setRace(e.currentTarget.value);
                    }}
                    onFocus={(e) => {
                      setRace(e.currentTarget.value);
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

                <div className="space-y-2 col-span-full">
                  <button
                    className="text-sm font-medium px-3 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600"
                    type="submit"
                  >
                    Save
                  </button>
                  <p className="text-sm text-gray-500 ">{profileResult}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
