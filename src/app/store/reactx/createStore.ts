import { DependencyList, FC, ReactNode, createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Context } from "./Context";


export type ActionType = {
  action: Function,
  debounce?: number;
}

type MapGetters = { [key: string]: () => any };

type ContextActions<A extends Actions> = {
  [K in keyof A]: A[K] extends ActionType ? A[K]['action'] : A[K]
}

type GettersKey<S, G extends Getters> = keyof S | keyof G;

type ReturnGetterType<T extends Function> = T extends () => infer R ? R : any;

export type Actions = { [key: string]: ActionType | Function };
export type Getters<T extends MapGetters = MapGetters> = { [K in keyof T]: T[K] };

export type ContextObject<D, A, G> = {
  data: D;
  actions: A & ThisType<D & Readonly<G>>;
  getters: G & ThisType<Readonly<D>>; // & {[K in keyof S]?: never};
};

export function createStore<
  D,
  A extends Actions = Actions,
  G extends Getters = Getters
>(contextData: ContextObject<D, A, G>) {
  const _contextData = new Context(contextData);

  const StoreContext = createContext(_contextData);
  const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const value = useRef(_contextData).current;
    return createElement(StoreContext.Provider, { value }, children);
  };

  const useActions = () => {
    const context = useContext(StoreContext);
    return context.actions as ContextActions<A>;
  };

  const useGetters = <T extends GettersKey<D, G>>(getters: T[]) => {
    const context = useContext(StoreContext);

    const _getters = [...getters] as const;

    type GetterState = { [K in keyof G]: ReturnGetterType<G[K]> } & {
      [K in keyof D]: D[K];
    };
    const [stateValue, setValue] = useState<GetterState>(() =>
      context.initGetterState(getters)
    );

    const updateFunc = (key: GettersKey<D, G>, newValue: any) => {
      setValue((prev) => ({ ...prev, [key]: newValue }));
    };

    const updateFunctions = useRef(
      {} as { [K in GettersKey<D, G>]: (newValue: any) => void }
    ).current;

    useEffect(() => {
      getters.forEach((key) => {
        updateFunctions[key] = (newValue: any) => updateFunc(key, newValue);

        context.subscribe(key, updateFunctions[key]);
      });
      return () => {
        getters.forEach((key) => {
          context.unsubscribe(key, updateFunctions[key]);
        });
      };
    }, []);

    type TypeofGettersValue = typeof stateValue;
    type GettersKeys = (typeof _getters)[number];

    return stateValue as {
      [K in GettersKeys]: TypeofGettersValue[K];
    };
  };

  type DataGettersObj = { [K in keyof G]: ReturnGetterType<G[K]> } & { [K in keyof D]: D[K] };
  type Watchers = { [K in keyof DataGettersObj]?: (newValue: DataGettersObj[K]) => void }


  /**
   * 
   * `useWatchers` is an hook that allows you to perform `side effects` in reaction to data/getters change,
   * by default `useWatchers` is state-less, `deps` recompute watchers after one of them changes.
   * 
   * @param {Watchers} watchers Object of watchers
   * @param {DependencyList} deps (optional)  array of react dependencies
   * 
   * @example
   * 
   * import { useState } from 'react';
   * import { myStore } from './myStore';
   * 
   * export const MyComponent = () => {
   *  const [state, setState] = useState();
   *  myStore.useWatch({
   *    storeKey(newValue) {
   *      if (newValue === state) {
   *        // you must add 'state' to the deps to recompute this function
   *      }
   *    }
   *  }, [state] });
   * 
   * myStore.useWatch({
   *    storeKey(newValue) {
   *      if (newValue === 'some-value') {
   *        // no need to add nothing to deps
   *        setState(newValue);
   *      }
   *    }
   *  }});
   * 
   *  return <div...
   * };
   */
  const useWatch = (
    watchers: Watchers,
    deps: DependencyList | undefined = []
  ) => {
    const context = useContext(StoreContext);

    const __ = useRef({
      init: false,
      watchers,
      callbacks: {} as { [key: string]: (newValue: any) => void }
    });

    const watcherFn = (key: string, val: any) => watchers[key]!(val);

    const updateWatchers = useCallback(() => {
      if (!__.current.init) return;
      Object.keys(watchers).forEach((key) => {
        context.unsubscribe(key, __.current.callbacks[key]);
        __.current.callbacks[key] = (newValue: any) => watcherFn(key, newValue);
        context.subscribe(key, __.current.callbacks[key]);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => { updateWatchers() }, [updateWatchers])

    useEffect(() => {

      const watchersKeys = Object.keys(__.current.watchers);
      const ref = __.current;
      watchersKeys.forEach((key) => {

        __.current.callbacks[key] = (newValue: any) => watcherFn(key, newValue);
        context.subscribe(key, __.current.callbacks[key]);

      });
      __.current.init = true;
      return () => {
        watchersKeys.forEach((key) => {

          context.unsubscribe(key, ref.callbacks[key]);
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  }

  return { Provider: StoreProvider, useActions, useGetters, useWatch };
}