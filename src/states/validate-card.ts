import {RfidCardData} from "@alias-esp/modules/rfid";
import LCD from "@alias-esp/modules/lcd";
import {StateData} from "@alias-esp/states/base";

var validCard = [33, 135, 250, 3];
function isSameCard(a: Array<number>, b: Array<number>) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export default function ValidateCard(transitionTo: (state: string, data?: any) => void) {

  return {
    enter: function ({payload}: StateData<{ card: NonNullable<RfidCardData> }>) {
      LCD.clear();
      LCD.print("Wait...");
      if (isSameCard(payload.card, validCard)) {
        transitionTo('KeyInput', {
          payload: {
            nfcId: payload.card,
          }
        });
      } else {
        transitionTo('ErrorState', {
          payload: {
            error: 'Invalid card'
          }
        });
      }
    },
    exit: undefined,
  }
}
