import React, { ReactNode, createContext, useContext, useState } from "react";

// Create context
const LoadingContext = createContext({
  isLoading: false,
  setLoading: (a: boolean) => {},
});

// Custom hook to use the loading context
export function useLoading() {
  return useContext(LoadingContext);
}

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
