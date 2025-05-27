import LCD from "@alias-esp/modules/lcd";
import {StateData} from "@alias-esp/states/base";

export default function ErrorState(transitionTo: (state: string, data?: any) => void) {

  return {
    enter: function ({payload}: StateData<{ error: string }>) {
      LCD.clear();
      LCD.print("Error: " + payload.error);
      setTimeout(() => {
        transitionTo('Idle');
      }, 1000)
    },
    exit: undefined
  }
}
