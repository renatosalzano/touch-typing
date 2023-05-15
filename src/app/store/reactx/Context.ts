import { cloneDeep, isEqual } from "lodash";
import { Action, Computed } from "./contextMethods";
import type { Actions, Getters, ContextObject } from "./createStore";


export class Context<D, A extends Actions = Actions, G extends Getters = Getters> {
  contextData: { [key: string]: any };
  previousData: { [key: string]: any };
  actions: Actions = {};
  getters: Getters = {};
  methods: { [key: string]: Action | Computed } = {};

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
      this.methods[actionName] = new Action(actionName, action, this);
      const bindAction = this.methods[actionName].call.bind(this.methods[actionName]);
      this.actions[actionName] = bindAction;
    });

    // GETTERS
    Object.entries(getters).forEach(([getterName, getter]) => {
      this.methods[getterName] = new Computed(getterName, getter, this);
      const bindComputed = (this.methods[getterName] as Computed).computed.bind(this.methods[getterName]);
      this.getters[getterName] = bindComputed;
    });

    // GENERATE GETTERS FROM STORE
    Object.keys(data as object).forEach((dataKey) => {
      const computed = () => (this.contextData as any)[dataKey];

      this.methods[dataKey] = new Computed(dataKey, computed, this);
      this.methods[dataKey].dependencies = [dataKey]
      const bindComputed = (this.methods[dataKey] as Computed).computed.bind(this.methods[dataKey]);
      this.getters[dataKey] = bindComputed;

      // INIT OBSERVABLE
      this.observable[dataKey] = [];
    });

  }

  updateData(actionName: string) {
    let dataEqual = true;

    for (const dep of this.methods[actionName].getDeps()) {
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

    return !dataEqual;
  }

  subscribe(getterName: any, callback: (...p: any[]) => void) {
    const computed = this.methods[getterName] as Computed;
    console.log(this.methods)
    computed.dependencies.forEach((dep) => {
      const index = this.observable[dep].indexOf(callback);
      if (index === -1) {
        this.observable[dep].push(callback);
      } else {
        this.observable[dep].splice(index, 1, callback);
      }
    });
  }

  unsubscribe(getterName: any, callback: (...p: any[]) => void, log = false) {
    this.methods[getterName].getDeps().forEach((dep) => {
      log && console.log(this.observable[dep]);
      const index = this.observable[dep].indexOf(callback);
      this.observable[dep].splice(index, 1);
      log && console.log(this.observable[dep]);
    });
  }

  /* updateSubscription(getterName: any, callback: (...p: any[]) => void) {
    this.dependencies.getters[getterName].forEach((dep) => {
      const index = this.observable[dep].indexOf(callback);
      this.observable[dep].splice(index, 1, callback);
    });
  } */

  initGetterState<T>(getters: any[]) {
    const initState: { [key: string]: any } = {};
    for (const getterName of getters) {
      if (this.getters[getterName]) {
        initState[getterName] = this.getters[getterName]();
      }
    }
    console.log(initState)
    return initState as T;
  }

}