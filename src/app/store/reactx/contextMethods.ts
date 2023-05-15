import { Context } from "./Context";
import { getDependencies } from "./dependencies";

type ActionType = {
  action: Function,
  debounce?: number;
} | Function;

export class Action {
  name: string;
  action: Function;
  debounce: number = 0;
  timer: NodeJS.Timeout | null = null;
  dependencies: string[];


  constructor(name: string, action: ActionType, public origin: Context<object>) {
    this.name = name;
    if (action instanceof Function) {
      this.action = action;
    } else {
      this.action = action.action;
      this.debounce = action?.debounce || 0;
    }

    this.dependencies = getDependencies(
      this.action,
      "action",
      Object.keys(origin.getters)
    );

    this.action = this.action.bind(origin.contextData)
  }

  public getDeps() {
    return this.dependencies;
  }

  updateContext(...p: any[]) {
    const payload = this.action(...p);
    this.origin.updateData(this.name);
    return payload;
  }

  call(...p: any[]) {
    if (this.debounce > 0) {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => this.updateContext(...p), this.debounce);
    } else {
      this.updateContext(...p);
    }
  }
}

export class Computed {
  name: string;
  computed: Function;
  dependencies: string[];

  constructor(name: string, computed: Function, public origin: Context<object>) {
    this.name = name;
    this.computed = computed;
    this.dependencies = getDependencies(
      computed,
      "getter"
    );

    this.computed = this.computed.bind(origin.contextData);
  }

  public getDeps() {
    return this.dependencies;
  }

  call() {
    return this.computed.bind(this.origin.contextData);
  }
}
