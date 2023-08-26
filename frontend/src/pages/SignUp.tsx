import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsAuthenticated, useSignIn } from "react-auth-kit";
import { useMyContext } from "../components/Context";
import axios from "axios";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export const checkIsEmailValid = (email: string) => {
  return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
    email
  );
};

export const checkIsUsernameValid = (username: string) => {
  return /^(?=.*[A-Za-z0-9]).{1,80}$/.test(username);
};

export const checkIsNameValid = (name: string) => {
  // only letters, spaces, and hyphens, and max 80 chars
  return /^(?=.*[A-Za-z])[A-Za-z -]{1,80}$/.test(name);
};

export default function SignUp() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrong, setPasswordStrong] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState(false);

  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(false);

  const { contextValue, setContextValue } = useMyContext();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailValid(checkIsEmailValid(event.target.value));
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setUsernameValid(checkIsUsernameValid(event.target.value));
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameValid(checkIsNameValid(event.target.value));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordMatch(event.target.value === confirmPassword);
    checkIsPasswordStrong(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
    setPasswordMatch(event.target.value === password);
  };

  const checkIsPasswordStrong = (password: string) => {
    if (
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,120}$/.test(
        password
      )
    ) {
      setPasswordStrong(true);
      return true;
    } else {
      setPasswordStrong(false);
      return false;
    }
  };

  const location = useLocation();
  const [alertRender, setAlertRender] = useState(true);
  let alertDiv;
  if (location.state) {
    alertDiv = (
      <>
        <div
          className={
            location.state.mainText == "Success!"
              ? "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              : "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          }
          role="alert"
        >
          <strong className="font-bold">{location.state.mainText} </strong>
          <span className="block sm:inline">{location.state.subText}</span>
        </div>
        <br></br>
      </>
    );
  }

  const signIn = useSignIn();
  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(import.meta.env.VITE_BACKEND_ENDPOINT + "/register");
    event.preventDefault();
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/register",
        {
          email: email,
          username: username,
          name: name,
          password: password,
        }
      );
      console.log(res);
      const msg = res.data.message;
      if (msg === "Registered successfully") {
        try {
          const res = await axios.post(
            import.meta.env.VITE_BACKEND_ENDPOINT + "/login",
            {
              emailUsername: email,
              password: password,
            }
          );
          console.log(res);
          const msg = res.data.message;
          if (msg === "Login successful") {
            signIn({
              token: res.data.accessToken,
              expiresIn: res.data.expiresIn,
              tokenType: "Bearer",
              authState: { id: res.data.id },
              refreshToken: res.data.refreshToken,
              refreshTokenExpireIn: res.data.refreshTokenExpireIn,
            });

            setContextValue(!contextValue);
            navigate("/", {
              state: { mainText: "Success!", subText: msg },
            });
          } else {
            navigate("/login", {
              state: { mainText: "Error!", subText: msg },
            });
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        navigate("/sign-up", {
          state: { mainText: "Error!", subText: msg },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
        {alertDiv && alertRender ? alertDiv : null}
        <h1 className="text-3xl font-semibold text-center text-blue-700 capitalize">
          Sign up
        </h1>
        <form id="sign-up-form" className="mt-6">
          <div className="mb-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                email && !emailValid
                  ? "focus:ring-red-300"
                  : "focus:ring-blue-300"
              } focus:outline-none focus:ring focus:ring-opacity-40`}
              placeholder="Email"
              onInput={handleEmailChange}
              onFocus={handleEmailChange}
              onChange={handleEmailChange}
              onBlur={handleEmailChange}
              autoComplete="off"
              required
            />
            <p
              className={
                email && !emailValid ? "mt-2 text-pink-600 text-sm" : "hidden"
              }
            >
              Please enter a valid email address.
            </p>
          </div>
          <div className="mb-2">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-800"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                username && !usernameValid
                  ? "focus:ring-red-300"
                  : "focus:ring-blue-300"
              } focus:outline-none focus:ring focus:ring-opacity-40`}
              placeholder="Username"
              onInput={handleUsernameChange}
              onFocus={handleUsernameChange}
              onChange={handleUsernameChange}
              onBlur={handleUsernameChange}
              autoComplete="off"
              required
            />
            <p
              className={
                username && !usernameValid
                  ? "mt-2 text-pink-600 text-sm"
                  : "hidden"
              }
            >
              Please enter a username with 1-80 characters and at least 1
              alphanumeric character.
            </p>
          </div>
          <div className="mb-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-800"
            >
              Name{" "}
              <span className="text-xs text-gray-500">
                (Characters in the story will call you by this name.)
              </span>
            </label>
            <input
              id="name"
              type="text"
              className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                name && !nameValid
                  ? "focus:ring-red-300"
                  : "focus:ring-blue-300"
              } focus:outline-none focus:ring focus:ring-opacity-40`}
              placeholder="Name"
              onInput={handleNameChange}
              onFocus={handleNameChange}
              onChange={handleNameChange}
              onBlur={handleNameChange}
              autoComplete="off"
              required
            />
            <p
              className={
                name && !nameValid ? "mt-2 text-pink-600 text-sm" : "hidden"
              }
            >
              Please enter a name with 1-80 characters, at least 1 letter, and
              only letters, spaces, or hyphens.
            </p>
          </div>
          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <div className="flex items-center justify-end">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                  password && !passwordStrong
                    ? "focus:ring-red-300"
                    : "focus:ring-blue-300"
                } focus:outline-none focus:ring focus:ring-opacity-40`}
                placeholder="************"
                value={password}
                onInput={handlePasswordChange}
                onFocus={handlePasswordChange}
                onChange={handlePasswordChange}
                onBlur={handlePasswordChange}
              />
              <button
                className="absolute mt-2 mr-4 focus:outline-none"
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setIsPasswordVisible(!isPasswordVisible);
                }}
              >
                {isPasswordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p
              className={
                password && !passwordStrong
                  ? "mt-2 text-pink-600 text-sm"
                  : "hidden"
              }
            >
              Password is not strong enough. Please use 8-120 characters with at
              least 1 number, 1 letter and 1 special character [@$!%*#?&].
            </p>
          </div>
          <div className="mb-2">
            <label
              htmlFor="password2"
              className="block text-sm font-semibold text-gray-800"
            >
              Confirm Password
            </label>
            <div className="flex items-center justify-end">
              <input
                id="password2"
                type={isConfirmPasswordVisible ? "text" : "password"}
                className={`block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 ${
                  confirmPassword && !passwordMatch
                    ? "focus:ring-red-300"
                    : "focus:ring-blue-300"
                } focus:outline-none focus:ring focus:ring-opacity-40`}
                placeholder="************"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button
                className="absolute mt-2 mr-4 focus:outline-none"
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
                }}
              >
                {isConfirmPasswordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <p
              className={
                confirmPassword && !passwordMatch
                  ? "mt-2 text-pink-600 text-sm"
                  : "hidden"
              }
            >
              Passwords are not the same.
            </p>
          </div>
          <div className="mt-6">
            <input
              className={
                passwordStrong &&
                passwordMatch &&
                emailValid &&
                usernameValid &&
                nameValid
                  ? `text-sm font-medium w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none`
                  : `text-sm font-medium w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-400 rounded-md cursor-not-allowed focus:outline-none`
              }
              type="submit"
              value="Sign up"
              disabled={
                !(
                  passwordStrong &&
                  passwordMatch &&
                  emailValid &&
                  usernameValid &&
                  nameValid
                )
              }
              onSubmit={handleSubmit}
            />
          </div>
        </form>
        {/* google sign up*/}
        {/* <div className="relative flex items-center justify-center w-full mt-6 border border-t">
          <div className="absolute px-5 bg-white">Or</div>
        </div>
        <div className="flex mt-4 gap-x-2">
          <button
            type="button"
            className="flex items-center justify-center w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-offset-1 focus:ring-violet-600"
          >
            <p className="mr-2 text-gray-600">Sign up with</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-5 h-5 fill-current"
            >
              <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
            </svg>
          </button>
        </div> */}

        <p className="mt-8 text-xs font-light text-center text-gray-700">
          {" "}
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
