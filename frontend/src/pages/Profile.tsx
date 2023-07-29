import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const Profile = () => {
  const [jsonData, setJsonData] = useState(null);
  const [blobData, setBlobData] = useState(null);
  const authHeader = useAuthHeader();

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
        setJsonData(jsonifiedData);
        console.log(jsonifiedData);
        console.log(jsonData);
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
        setBlobData(binaryData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfilePic();
  }, []);

  return (
    <div>
      <h1>Your Profile</h1>
      {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
      {blobData && (
        <img
          src={window.URL.createObjectURL(
            new Blob([blobData], { type: "image/jpeg" })
          )}
          alt="Profile Picture"
        />
      )}
    </div>
  );
};

export default Profile;
