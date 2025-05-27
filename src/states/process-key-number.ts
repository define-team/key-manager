import LCD from "@alias-esp/modules/lcd";
import {StateData} from "@alias-esp/states/base";

type PayloadProcessKeyNumber = { nfcId: number[], keyNumber: string }

export default function ProcessKeyNumber(transitionTo: (state: string, data?: any) => void) {

  return {
    enter: function ({payload}: StateData<PayloadProcessKeyNumber>) {
      LCD.clear();
      LCD.print("Wait...");

      if(payload.keyNumber === '') {
        transitionTo('ReturnKey', {
          payload: {
            nfcId: payload.nfcId,
          }
        })
      } else {
        transitionTo('TakeKey', {
          payload
        })
      }
    },
    exit: undefined,
  }
}
