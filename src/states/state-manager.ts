import Idle from "@alias-esp/states/idle";
import ValidateCard from "@alias-esp/states/validate-card";
import ErrorState from "@alias-esp/states/error-state";
import KeyInput from "@alias-esp/states/key-input";
import ProcessKeyNumber from "@alias-esp/states/process-key-number";
import ReturnKey from "@alias-esp/states/return-key";
import TakeKey from "@alias-esp/states/take-key";

let states: ReturnType<typeof createStates>;

const createStates = (transitionTo: (state: string, data?: any) => void) => {
  return {
    Idle: Idle(transitionTo),
    ValidateCard: ValidateCard(transitionTo),
    ErrorState: ErrorState(transitionTo),
    KeyInput: KeyInput(transitionTo),
    ProcessKeyNumber: ProcessKeyNumber(transitionTo),
    ReturnKey: ReturnKey(transitionTo),
    TakeKey: TakeKey(transitionTo),
  }
}

type StateName = keyof typeof states;
type StatesMap = typeof states;

let currentState: StatesMap[StateName] | null = null;

export function transitionTo(stateName: string, data = {}) {
  if (currentState && currentState?.exit) currentState.exit();
  currentState = states[stateName as StateName];
  // @ts-ignore
  currentState?.enter(data);
}

states = createStates(transitionTo);
