import { cloneDeep, isEqual } from "lodash";
import {
  FC,
  ReactNode,
  createContext,
  createElement,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { getDependencies } from "./dependencies";

type Actions = { [key: string]: Function };
type Getters = { [key: string]: Function };

type GettersKey<S, G extends Getters> = keyof S | keyof G;

type ReturnGetterType<T extends Function> = T extends () => infer R ? R : any;

type ContextObject<D, A, G> = {
  data: D;
  actions: A & ThisType<D & Readonly<G>>;
  getters: G & ThisType<Readonly<D>>; // & {[K in keyof S]?: never};
};

class ContextData<D, A extends Actions, G extends Getters> {
  contextData: { [key: string]: any };
  currentData = {} as D;
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
      this.actions[actionName] = (...p: any[]) => {
        const callAction = action.bind(this.contextData)(...p);
        this.updateData(actionName);
        return callAction;
      };
      const actionDependencies = getDependencies(
        action,
        "action",
        Object.keys(getters)
      );
      this.dependencies.action[actionName] = actionDependencies;
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

    console.log(this);
  }

  private updateData(actionName: string) {
    let dataEqual = true;

    this.dependencies.action[actionName].forEach((dep) => {
      if (!isEqual(this.contextData[dep], this.previousData[dep])) {
        dataEqual = false;
        this.previousData[dep] = cloneDeep(this.contextData[dep]);
        // passare il valore aggiornato direttamente ai getters
        this.observable[dep].forEach((update) => update());
      }
    });
    return !dataEqual;
  }

  subscribe(getterName: string, callback: (...p: any[]) => void) {
    this.dependencies.getters[getterName].forEach((dep) => {
      this.observable[dep].push(callback);
    });
  }

  unsubscribe(getterName: string, callback: () => void) {
    this.dependencies.getters[getterName].forEach((dep) => {
      const index = this.observable[dep].indexOf(callback);
      this.observable[dep].slice(index, 1);
    });
  }
}

export function createStore<
  S,
  A extends Actions = Actions,
  G extends Getters = Getters
>(contextData: ContextObject<S, A, G>) {
  const _contextData = new ContextData(contextData);

  const StoreContext = createContext(_contextData);
  const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const value = useRef(_contextData).current;
    return createElement(StoreContext.Provider, { value }, children);
  };

  const useActions = () => {
    const context = useContext(StoreContext);
    return context.actions as ContextObject<S, A, G>["actions"];
  };

  const useGetters = <T extends GettersKey<S, G>>(getters: T[]) => {
    const context = useContext(StoreContext);

    const [, forceRender] = useReducer((x) => x + 1, 0);

    const _getters = [...getters] as const;

    const getValues = () => {
      const values = {} as { [K in keyof G]: ReturnGetterType<G[K]> } & {
        [K in keyof S]: S[K];
      };
      getters.forEach((key) => {
        const getterName = key as string;
        if (context.getters[getterName])
          values[key] = context.getters[getterName]();
      });
      return values;
    };

    const gettersValue = useRef(getValues());

    const updateFunc = (key: GettersKey<S, G>) => {
      const updatedValue = context.getters[key as string]();
      gettersValue.current[key] = updatedValue;
      forceRender();
    };

    useEffect(() => {
      getters.forEach((key) => {
        const getterName = key as string;
        context.subscribe(getterName, () => updateFunc(getterName));
      });
      return () => {
        getters.forEach((key) => {
          const getterName = key as string;
          context.unsubscribe(getterName, () => updateFunc(getterName));
        });
      };
    }, []);

    type TypeofGettersValue = typeof gettersValue.current;
    type GettersKeys = (typeof _getters)[number];

    return gettersValue.current as {
      [K in GettersKeys]: TypeofGettersValue[K];
    };
  };

  const useWatch = (
    watchers: {
      [K in keyof G]?: (newValue: ReturnGetterType<G[K]>) => void;
    } & { [K in keyof S]?: (newValue: S[K]) => void }
  ) => {
    type Watchers = { [key: string]: (value?: any) => void };

    const context = useContext(StoreContext);

    const data = useRef({
      watchers: watchers as Watchers,
      values: getPrevValues(),
    }).current;

    function getPrevValues() {
      const values: any = {};
      Object.keys(watchers).forEach((key) => {
        if (context.getters[key]) values[key] = context.getters[key]();
      });
      return values;
    }

    const updateFunc = (key: string) => {
      const newValue = context.getters[key]();
      // RISCRIVERE QUESTA CONDIZIONE CHE MI CAUSA PROBLEMI CON GLI ARRAY
      data.watchers[key](newValue);
      data.values[key] = newValue;
    };

    useEffect(() => {
      if (!isEqual(data.watchers, watchers)) {
        data.watchers = watchers as Watchers;
      }
    }, [watchers]);

    useEffect(() => {
      Object.keys(data.watchers).forEach((key) => {
        context.subscribe(key, () => updateFunc(key));
      });
      return () => {
        Object.keys(data.watchers).forEach((key) => {
          context.unsubscribe(key, () => updateFunc(key));
        });
      };
    }, []);
  };
  return { Provider: StoreProvider, useActions, useGetters, useWatch };
}
