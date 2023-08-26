import React, { createContext, useContext, useState } from "react";

type MyContextType = {
  contextValue: boolean;
  setContextValue: (newValue: boolean) => void;
};

const MyContext = createContext<MyContextType>({
  contextValue: false,
  setContextValue: () => {},
});

export const useMyContext = () => useContext(MyContext);

const MyContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [contextValue, setContextValue] = useState<boolean>(false);

  return (
    <MyContext.Provider value={{ contextValue, setContextValue }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyContextProvider;
