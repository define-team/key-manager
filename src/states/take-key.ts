import LCD from "@alias-esp/modules/lcd";
import {StateData} from "@alias-esp/states/base";
import Api from "@alias-esp/modules/api/api";
import Slots from "@alias-esp/modules/slots/slots";

type PayloadTakeKey = { nfcId: number[], keyNumber: string }

export default function TakeKey(transitionTo: (state: string, data?: any) => void) {
  let handleRemoveKey: ((key: string) => void) | undefined
  let timeout: number | undefined;

  return {
    enter: async function ({payload}: StateData<PayloadTakeKey>) {
      LCD.clear();
      LCD.print("Wait... TakeKey");
      let err = false;
      const {
        keyUuid,
        keySlotNumber: slot,
      } = await Api.takeKey(payload).catch((res) => {
        err = true;
        transitionTo('ErrorState', {
          payload: {
            error: "Bad user role or number"
          }
        })
        return res
      });

      if(err) {
        return;
      }

      LCD.clear();
      LCD.print(`Get key from ${slot} slot`);

      handleRemoveKey = (key: string) => {
        console.log(`[INFO] Remove key with uuid: ${key}`);
        if(key !== keyUuid) {
          return;
        }
        if(timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }
        if(handleRemoveKey) {
          Slots.offDeviceRemove(handleRemoveKey);
        }
        setTimeout(async () => {
          await Slots.close(slot as number);
          LCD.clear();
          LCD.print(`Success: ${key}`);

          setTimeout(() => {
            transitionTo('Idle');
          }, 3000);
        }, 1000);
        return;
      }
      Slots.onDeviceRemove(handleRemoveKey);
      await Slots.open(slot as number);

      timeout = setTimeout(() => {
        Slots.close(slot as number);
        Api.returnKey({
          nfcId: payload.nfcId,
          keyUuid,
          keySlotNumber: slot
        })
        transitionTo('ErrorState', {
          payload: {
            error: 'Timeout'
          }
        })
      }, 10000);
    },
    exit: () => {
      if(handleRemoveKey) {
        Slots.offDeviceRemove(handleRemoveKey);
        handleRemoveKey = undefined;
      }

      if(timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
      }
    },
  }
}
