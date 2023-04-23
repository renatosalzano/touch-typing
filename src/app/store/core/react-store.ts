import { FC, ReactNode, createContext, createElement, useContext, useEffect, useRef, useState } from "react";


type Actions = { [key: string]: Function };
type Getters = { [key: string]: Function };

type ContextStore<S, A extends Actions = Actions, G extends Getters = Getters> = {
  store: S,
  actions: A & ThisType<S>;
  getters: G & ThisType<Readonly<S>>// & {[K in keyof S]?: never};
}

type ActionsData = {
  [key: string]: {
    observer: (() => void)[];
  }
}

type GettersData = {
  [key: string]: {
    subscribe(getterName: string, callback: () => void): void;
    unsubscribe(getterName: string, callback: () => void): void;
  }
}

type GettersKey<S,G extends Getters> = keyof S | keyof G

const getDependencies = (
  func: Function,
  type: "action" | "getter"
) => {
  const dependencies: string[] = [];
  const funcString = func.toString();
  const body = funcString
    .substring(funcString.indexOf("{") + 1, funcString.lastIndexOf("}"))
    .trim();
  body.split("this").forEach((str) => {
    if (str.indexOf(".") === 0) {
      const afterThis = `${str.substring(1)}`;
      const lastIndex = afterThis.search(type === "action" ? "=" : /[^a-zA-Z\d]/g);
      let dep = afterThis.substring(0, lastIndex);
      if (dep.includes('.')) dep = dep.substring(0, dep.indexOf('.'))
      if (dep && !dependencies.includes(dep)) {
        dependencies.push(dep.trim());
      }
    }
  });
  return dependencies;
};

function each<T extends object>(
  obj: T,
  callback: (item: T[keyof T], key: string, index?: number) => void
) {

  return Object.entries(obj).forEach(([k, v], index) => {
    callback(v as T[keyof T], k, index);
  });
}

class Store<S, A extends Actions, G extends Getters> {
  store: object;
  actions: Actions = {};
  getters: Getters = {};
  actionsData: ActionsData = {};
  gettersData: GettersData = {};
  dependencies: { [key: string]: string[] } = {};
  subscription: { [key: string]: string[] } = {};

  constructor({ store, actions, getters }: ContextStore<S, A, G>) {
    this.store = store as object;
    each<Actions>(actions, (action, actionName) => {
      this.actions[actionName] = (...args: any[]) => {
        const bindAction = action.bind(this.store);
        const returnAction = bindAction(...args);
        this.updateGetters(actionName);
        return returnAction;
      };
      this.actionsData[actionName] = {
        observer: [],
      }
      const dependecies = getDependencies(action, "action");
      dependecies.forEach(dependency => {
        if (this.dependencies[dependency]) {
          this.dependencies[dependency].push(actionName);
        } else {
          this.dependencies[dependency] = [actionName]
        }
      })
    });

    const subscribe = (key: string, callback: () => void) => {
      this.subscription[key].forEach((actionName) => {
        this.actionsData[actionName].observer.push(callback);
      })
    };
    const unsubscribe = (key: string, callback: () => void) => {
      this.subscription[key].forEach(actionName => {
        const index = this.actionsData[actionName].observer.indexOf(callback);
        this.actionsData[actionName].observer.slice(index, 1);
      })
    }

    each<Getters>(getters, (getter, getterName) => {
      let actionsDependencies: string[] = [];
      getDependencies(getter, "getter").forEach(dependency => {
        if (this.dependencies[dependency]) {
          actionsDependencies = [...this.dependencies[dependency]]
        }
      });
      this.subscription[getterName] = actionsDependencies;

      this.getters[getterName] = getter.bind(this.store);

      this.gettersData[getterName] = {
        subscribe: subscribe.bind(this),
        unsubscribe: unsubscribe.bind(this)
      }
    });

    each<object>(store as object, (storeValue, storeKey) => {
      this.subscription[storeKey] = [...this.dependencies[storeKey]];

      const storeGetter = () => (this.store as any)[storeKey];

      this.getters[storeKey] = storeGetter.bind(this.store);

      this.gettersData[storeKey] = {
        subscribe: subscribe.bind(this),
        unsubscribe: unsubscribe.bind(this)
      }
    })

    console.log(this)
  }

  private updateGetters(actionName: string) {
    console.log(this.store)
    this.actionsData[actionName].observer.forEach(u => u());
  }
}

export function createStore<S, A extends Actions = Actions, G extends Getters = Getters>(initStore: ContextStore<S, A, G>) {
  const _initStore = new Store(initStore);

  const StoreContext = createContext(_initStore);
  const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const value = useRef(_initStore).current;
    return createElement(StoreContext.Provider, { value }, children);
  }

  const useActions = () => {
    const context = useContext(StoreContext);
    return context.actions as ContextStore<S, A, G>['actions'];
  }
  const useGetters = (getters: GettersKey<S,G>[]) => {
    const context = useContext(StoreContext);

    const [, forceRender] = useState({});
    const update = () => forceRender(() => { });
    
    const getValues = () => {
      const values: any = {};
      getters.forEach(key => {
        const getterName = key as string;
        if (context.getters[getterName])
        values[getterName] = context.getters[getterName]();
      })
      return values;
    };

    const gettersValue = useRef(getValues());

    const updateFunc = (key: string) => {
      const updatedValue = context.getters[key]();
      console.log(gettersValue.current[key], updatedValue)
      if (gettersValue.current[key] !== updatedValue) {
        gettersValue.current[key] = updatedValue;
        update()
      }
    }

    useEffect(() => {
      
      getters.forEach((key) => {
        const getterName = key as string;
        context.gettersData[getterName]
          .subscribe(getterName, () => updateFunc(getterName));
      })
      return () => {
        getters.forEach((key) => {
          const getterName = key as string;
          context.gettersData[getterName]
            .unsubscribe(getterName, () => updateFunc(getterName));
        })
      }
    },[]);

    type ReturnGetterType<T extends Function> = T extends () => infer R ? R : any;

    return gettersValue.current as {[K in keyof G]: ReturnGetterType<G[K]>} & {[K in keyof S]: S[K]}

  }
  return { Provider: StoreProvider, useActions, useGetters };
};