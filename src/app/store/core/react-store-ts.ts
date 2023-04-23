interface ReactStore<T extends object> {
  store: T;
  actions: { [key: string]: (this: T, ...args: any[]) => unknown };
  getters: { [key: string]: (this: Readonly<T>) => unknown };
}

const getDependencies = (
  func: (...args: any[]) => any,
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
  callback: (item: T[keyof T], key?: string, index?: number) => void
) {
  return Object.entries(obj).forEach(([key, value], index) => {
    callback(value, key, index);
  });
}

/* 
  actions: {
    [actionName]: {
      action: fuction;
      observer: funcion[]
    }
  }
  getters: {
    [getterName]: {
      getter: value;
      subscribe();
      unsubscribe();
    }
  }
  dependencies: {
    [dep]: actionName[];
  }

*/

type Actions<T extends object> = {
  [Property in keyof T]: {
    action: T[Property];
    observer: (() => void)[];
  }
}

type Getters<T extends object> = {
  [Property in keyof T]: {
    computedValue: T[Property];
    subscribe(getterName: string, callback: () => void): void;
    unsubscribe(getterName: string, callback: () => void): void;
  }
}

type StoreGetters<T extends object> = {
  [key: string]: T[keyof T]
}

class Getter<T> {
  name: string;
  computedValue: T;

  constructor(name: string, computedValue: T) {
    this.name = name;
    this.computedValue = computedValue;

  }

  subscribe() {

  }
}

class Store<T extends object> {
  store: T;
  actions: Actions<ReactStore<T>['actions']> = {};
  getters: Getters<ReactStore<T>["getters"]> = {};
  storeGetters: Getters<StoreGetters<T>> = {}
  dependencies: { [key: string]: string[] } = {};
  subscription: { [key: string]: string[] } = {};

  constructor({ store, actions, getters }: ReactStore<T>) {
    this.store = store;
    each(actions, (action, actionName = "") => {
      this.actions[actionName] = {
        action: action.bind(this.store),
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
      this.subscription[key].forEach(actionName => {
        this.actions[actionName].observer.push(callback);
      })
    };
    const unsubscribe = (key: string, callback: () => void) => {
      this.subscription[key].forEach(actionName => {
        const index = this.actions[actionName].observer.indexOf(callback);
        this.actions[actionName].observer.slice(index, 1);
      })
    }

    each(getters, (getter, getterName = "") => {
      let actionsDependencies: string[] = [];
      getDependencies(getter, "getter").forEach(dependency => {
        if (this.dependencies[dependency]) {
          actionsDependencies = [...this.dependencies[dependency]]
        }
      });
      this.subscription[getterName] = actionsDependencies;

      this.getters[getterName] = {
        computedValue: getter.bind(this.store),
        subscribe: subscribe.bind(this),
        unsubscribe: unsubscribe.bind(this)
      }

    });

    each(store, (item, itemName = '') => {
      if (this.dependencies[itemName]) {
        this.subscription[itemName] = [...this.dependencies[itemName]];
      };

      const computedValue = () => (this as any)[itemName];

      this.getters[itemName] = {
        computedValue: computedValue.bind(this.store),
        subscribe: subscribe.bind(this),
        unsubscribe: unsubscribe.bind(this)
      }
    })
  }

  subscribe() {

  }
}

export function createStore<T extends object>(store: ReactStore<T>) {
  const initStore = new Store(store);
}

export const testStore = createStore({
  store: {
    test: 1,
    nested: {
      test: "test",
    },
    map: {} as { [key: string]: any },
  },
  actions: {
    setTest(test: string) {
      this.nested.test = test; this.test = 3; this.map.newKey = "newvalue"; return test;
    },
  },
  getters: {
    test() {
      return this.nested.test + this.test;
    },
  },
});
