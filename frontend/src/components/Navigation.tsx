import { Fragment, useState, useContext, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  useIsAuthenticated,
  useSignOut,
  useAuthHeader,
  useAuthUser,
} from "react-auth-kit";
import axios from "axios";
import Cookies from "js-cookie";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

import { useMyContext } from "../components/Context";
import defaultProfilePic from "../assets/default_profile_pic.png";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  { name: "Play a Story", href: "/story", current: false },
  { name: "Community Stories", href: "/community-stories", current: false },
  { name: "View Top Stories", href: "/top-stories", current: false },
  { name: "Leaderboard", href: "/leaderboard", current: false },
];

export default function Navigation() {
  const [isRender, renderSettingContainer] = useState(false);
  const [imgSrc, setImgSrc] = useState(defaultProfilePic);

  const isAuthenticated = useIsAuthenticated();
  console.log(isAuthenticated());

  const signOut = useSignOut();
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const navigate = useNavigate();
  async function signOutFunc() {
    //sign out logic
    const res = await axios.delete(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/logout",
      {
        headers: { Authorization: authHeader() },
      }
    );
    console.log(res);
    const res2 = await axios.delete(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/logout",
      {
        headers: { Authorization: `Bearer ${Cookies.get("_auth_refresh")}` },
      }
    );
    console.log(res2);

    signOut();
    navigate("/login", {
      state: {
        mainText: "Success!",
        subText: "Signed out successfully.",
      },
    });
  }

  const fetchProfilePic = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/get_user_profile_pic",
        authUser(),
        {
          responseType: "arraybuffer", // set response type to arraybuffer to get binary data
        }
      );
      const binaryData = response.data;
      console.log(binaryData.byteLength > 0);
      if (binaryData.byteLength > 0) {
        setImgSrc(window.URL.createObjectURL(new Blob([binaryData])));
      } else {
        setImgSrc(defaultProfilePic);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const { contextValue } = useMyContext();
  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfilePic();
    }
  }, [contextValue]);

  return (
    <>
      <Disclosure as="nav" className="bg-blue-100">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-blue-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center">
                    <Link
                      to="/"
                      className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"
                    >
                      CultuRealm
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          to={item.href}
                          key={item.name}
                          onClick={renderSettingContainer}
                          className={classNames(
                            window.location.pathname === item.href
                              ? "bg-blue-300 text-gray-900"
                              : "text-gray-600 hover:bg-blue-200 hover:text-gray-700",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {isAuthenticated() ? (
                    <>
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src={imgSrc}
                              alt="Profile picture"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to={`/profile/${authUser()["id"]}`}
                                  onClick={renderSettingContainer}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/settings"
                                  onClick={renderSettingContainer}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  Settings
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  onClick={() => {
                                    renderSettingContainer(true);
                                    signOutFunc();
                                  }}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  Sign out
                                </Link>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={renderSettingContainer}
                        className="text-gray-600 hover:bg-blue-200 hover:text-gray-700 px-2 py-2 rounded-md text-sm font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        to="/sign-up"
                        onClick={renderSettingContainer}
                        className="text-gray-600 hover:bg-blue-200 hover:text-gray-700 px-1.5 py-2 rounded-md text-sm font-medium"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    onClick={renderSettingContainer}
                    className={classNames(
                      window.location.pathname === item.href
                        ? "bg-blue-300 text-gray-900"
                        : "text-gray-600 hover:bg-blue-200 hover:text-gray-700",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <Outlet />
    </>
  );
}
