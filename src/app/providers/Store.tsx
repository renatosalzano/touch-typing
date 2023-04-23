import { createContext, FC, ReactNode, useMemo } from "react";


const StoreContext = createContext({});

export const Store: FC<{
  children: ReactNode | ReactNode[];
}> = ({
  children
}) => {
    const value = useMemo(() => ({
      actions: {},
      getters: {}
    }), [])
    return (
      <StoreContext.Provider value={value}>
        {children}
      </StoreContext.Provider>
    )
  }