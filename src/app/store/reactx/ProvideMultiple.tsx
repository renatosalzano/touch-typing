import React, { FC, ReactNode } from "react";

import { createStore } from "./createStore";

type CreateStore = ReturnType<typeof createStore>;

export const ProvideMultiple: FC<{
  stores: CreateStore[]
  children: ReactNode;
}> = ({ stores: [parent, ...nested], children }) => {

  return (
    <parent.Provider>
      {nested.length > 0
        ? <ProvideMultiple stores={nested} children={children} />
        : children}
    </parent.Provider>
  )
}

