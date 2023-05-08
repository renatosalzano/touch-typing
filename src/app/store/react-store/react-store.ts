import { cloneDeep, isEqual } from "lodash";
import {
  DependencyList,
  FC,
  ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { getDependencies } from "./dependencies";

type MapGetters = { [key: string]: () => any };

type Actions = { [key: string]: Function };
type Getters<T extends MapGetters = MapGetters> = { [K in keyof T]: T[K] };

type GettersKey<S, G extends Getters> = keyof S | keyof G;

type ReturnGetterType<T extends Function> = T extends () => infer R ? R : any;

type ContextObject<D, A, G> = {
  data: D;
  actions: A & ThisType<D & Readonly<G>>;
  getters: G & ThisType<Readonly<D>>; // & {[K in keyof S]?: never};
};

class ContextData<D, A extends Actions, G extends Getters> {
  contextData: { [key: string]: any };
  previousData: { [key: string]: any };
  actions: Actions = {};
  getters: Getters = {};

  observable: { [key: string]: Function[] } = {};
  dependencies: {
    action: { [key: string]: string[] };
    getters: { [key: string]: string[] };
  } = {
      action: {},
      getters: {},
    };

  constructor({ data, actions, getters }: ContextObject<D, A, G>) {
    this.contextData = { ...data, ...actions, ...getters };
    this.previousData = cloneDeep(this.contextData);
    // ACTIONS
    Object.entries(actions).forEach(([actionName, action]) => {
      const actionDependencies = getDependencies(
        action,
        "action",
        Object.keys(getters)
      );
      this.dependencies.action[actionName] = actionDependencies;

      this.actions[actionName] = (...p: any[]) => {
        const returnAction = action.bind(this.contextData)(...p);
        this.updateData(actionName);
        return returnAction;
      };
    });

    // GETTERS
    Object.entries(getters).forEach(([getterName, getter]) => {
      const gettersDependencies = getDependencies(getter, "getter");

      this.getters[getterName] = getter.bind(this.contextData);

      this.dependencies.getters[getterName] = gettersDependencies;
    });

    // GENERATE GETTERS FROM STORE
    Object.keys(data as object).forEach((dataKey) => {
      const storeGetter = () => (this.contextData as any)[dataKey];

      this.getters[dataKey] = storeGetter.bind(this.contextData);

      this.dependencies.getters[dataKey] = [dataKey];

      // INIT OBSERVABLE
      this.observable[dataKey] = [];
    });
  }

  private updateData(actionName: string) {
    let dataEqual = true;

    for (const dep of this.dependencies.action[actionName]) {
      /* check if the action has mutated the data  */
      if (!isEqual(this.contextData[dep], this.previousData[dep])) {
        dataEqual = false;
        this.previousData[dep] = cloneDeep(this.contextData[dep]);
        // passare il valore aggiornato direttamente ai getters
        this.observable[dep].forEach((update) =>
          update(this.previousData[dep])
        );
      }
    }

    /* this.dependencies.action[actionName].forEach((dep) => {
      if (!isEqual(this.contextData[dep], this.previousData[dep])) {
        dataEqual = false;
        this.previousData[dep] = cloneDeep(this.contextData[dep]);
        // passare il valore aggiornato direttamente ai getters
        this.observable[dep].forEach((update) => update());
      }
    }); */
    return !dataEqual;
  }

  subscribe(getterName: any, callback: (...p: any[]) => void) {
    this.dependencies.getters[getterName].forEach((dep) => {
      const index = this.observable[dep].indexOf(callback);
      if (index === -1) {
        this.observable[dep].push(callback);
      } else {
        this.observable[dep].splice(index, 1, callback);
      }
    });
  }

  unsubscribe(getterName: any, callback: (...p: any[]) => void, log = false) {
    this.dependencies.getters[getterName].forEach((dep) => {
      log && console.log(this.observable[dep]);
      const index = this.observable[dep].indexOf(callback);
      this.observable[dep].splice(index, 1);
      log && console.log(this.observable[dep]);
    });
  }

  updateSubscription(getterName: any, callback: (...p: any[]) => void) {
    this.dependencies.getters[getterName].forEach((dep) => {
      const index = this.observable[dep].indexOf(callback);
      this.observable[dep].splice(index, 1, callback);
    });
  }

  log(dev?: boolean, ...l: any[]) {
    if (dev) console.log(...l);
  }

  initGetterState<T>(getters: any[]) {
    const initState: { [key: string]: any } = {};
    for (const getterName of getters) {
      if (this.getters[getterName]) {
        initState[getterName] = this.getters[getterName]();
      }
    }
    return initState as T;
  }

}

export function createStore<
  D,
  A extends Actions = Actions,
  G extends Getters = Getters
>(contextData: ContextObject<D, A, G>) {
  const _contextData = new ContextData(contextData);

  const StoreContext = createContext(_contextData);
  const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const value = useRef(_contextData).current;
    return createElement(StoreContext.Provider, { value }, children);
  };

  const useActions = () => {
    const context = useContext(StoreContext);
    return context.actions as ContextObject<D, A, G>["actions"];
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
   * @param watchers is an object that allows you to perform 'side effects' in reaction to data/getters change.
   * @param deps by default 'side effects' of watchers are state-less, `deps` recompute watchers after one of them changes.
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
