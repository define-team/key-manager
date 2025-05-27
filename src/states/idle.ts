import LCD from "@alias-esp/modules/lcd";
import Rfid from "@alias-esp/modules/rfid";

export default function Idle(transitionTo: (state: string, data?: any) => void) {
  const stateData = {
    interval: undefined as number | undefined,
  };

  return {
    enter: function () {
      LCD.clear();
      LCD.print("Wait card");

      stateData.interval = setInterval(function () {
        Rfid.findCards((card) => {
          if (!card) return;
          if (stateData.interval !== undefined) {
            clearInterval(stateData.interval);
            stateData.interval = undefined;
          }
          transitionTo('ValidateCard', {
            payload: {
              card
            }
          })
        })
      }, 200)
    },
    exit: function () {
      if (stateData.interval !== undefined) {
        clearInterval(stateData.interval);
        stateData.interval = undefined;
      }
    }
  }
}
