import React, { useState } from "react";
import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

function Settings() {
  const [race, setRace] = useState("");
  const [religion, setReligion] = useState("");
  const [gender, setGender] = useState("");
  const [profile_pic, setProfile_pic] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const authHeader = useAuthHeader();

  const handleFormSubmit2 = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (profile_pic) {
        const formData = new FormData();
        formData.append("profile_pic", profile_pic);

        // Log the binary data of the uploaded file before making the request
        const binaryData = await profile_pic.arrayBuffer();
        console.log(binaryData);

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
        console.log(res.data);
        setIsEditing(false); // set isEditing to false to hide the file input and confirm button
      } else {
        setErrorMessage("Please select a file.");
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred.");
      console.log(error);
    }
  };

  const handleFormSubmit1 = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      //json element
      const json = {
        race: race,
        religion: religion,
        gender: gender,
      };
      console.log(json);

      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/user_pref",
        json,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: authHeader(),
            // 'Content-Type': 'application/json'
          },
        }
      );
      console.log(res.data);
    } catch (error) {
      setErrorMessage(error.message || "An error occurred.");
      console.log(error);
    }
  };

  const handleRaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRace(event.target.value);
  };

  const handleReligionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReligion(event.target.value);
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGender(event.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true); // set isEditing to true to show the file input and confirm button
  };

  return (
    <div>
      <h1>Change your profile setting</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <form id="form1" onSubmit={handleFormSubmit1}>
        <label>
          Race:
          <input
            type="text"
            value={race}
            onChange={handleRaceChange}
            onInput={handleRaceChange}
            onFocus={handleRaceChange}
            onBlur={handleRaceChange}
          />
        </label>
        <br />
        <label>
          Religion:
          <input
            type="text"
            value={religion}
            onChange={handleReligionChange}
            onInput={handleReligionChange}
            onFocus={handleReligionChange}
            onBlur={handleReligionChange}
          />
        </label>
        <br />
        <label>
          Gender:
          <input
            type="text"
            value={gender}
            onChange={handleGenderChange}
            onInput={handleGenderChange}
            onFocus={handleGenderChange}
            onBlur={handleGenderChange}
          />
        </label>
        <br />
        <button id="submit2" type="submit">
          Submit
        </button>
      </form>

      <br />

      <form id="form2" onSubmit={handleFormSubmit2}>
        <label>
          Profile Picture:
          {isEditing ? (
            <div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) =>
                  setProfile_pic(e.target.files ? e.target.files[0] : null)
                }
              />
              <button type="submit">Confirm</button>
            </div>
          ) : (
            <div>
              <button onClick={handleEditClick}>Edit</button>
            </div>
          )}
        </label>
      </form>
    </div>
  );
}

export default Settings;
