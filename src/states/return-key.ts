import LCD from "@alias-esp/modules/lcd";
import {StateData} from "@alias-esp/states/base";
import Api from "@alias-esp/modules/api/api";
import Slots from "@alias-esp/modules/slots/slots";

type PayloadReturnKey = { nfcId: number[] }

export default function ReturnKey(transitionTo: (state: string, data?: any) => void) {
  let handleNewKey: ((key: string) => void) | undefined
  let timeout: number | undefined;

  return {
    enter: async function ({payload}: StateData<PayloadReturnKey>) {
      LCD.clear();
      LCD.print("Wait... Return key");
      let slot = await Api.getEmptySlot().catch(() => {
        transitionTo('ErrorState', {
          payload: {
            error: 'Fail get empty slot'
          }
        })
        return undefined;
      });

      if(slot === undefined) {
        transitionTo('ErrorState', {
          payload: {
            error: 'Internal. Try again'
          }
        })
        return;
      }

      LCD.clear();
      LCD.print(`Put key in to ${slot} slot`);

      handleNewKey = (key: string) => {
        if(timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }
        if(handleNewKey) {
          Slots.offKey(handleNewKey);
        }
        console.log(`[INFO] Enter key with uuid: ${key}`);
        setTimeout(async () => {
          await Slots.close(slot as number).catch((e) => {
            console.error(`[ERROR][STATE:RETURN-KEY][SLOTS_CLOSE]: ${e}`);
          });
          await Api.returnKey({
            nfcId: payload.nfcId,
            keyUuid: key,
            keySlotNumber: slot as number
          }).catch((e) => {
            console.error(`[ERROR][STATE:RETURN-KEY][API]: ${e}`);
          })
          LCD.clear();
          LCD.print(`Success: ${key}`);

          setTimeout(() => {
            transitionTo('Idle');
          }, 3000);
        }, 1000);
        return;
      }
      Slots.onNewDevice(handleNewKey);
      await Slots.open(slot as number);

      timeout = setTimeout(() => {
        Slots.close(slot as number);
        transitionTo('ErrorState', {
          payload: {
            error: 'Timeout'
          }
        })
      }, 10000);
    },
    exit: () => {
      if(handleNewKey) {
        Slots.offKey(handleNewKey);
        handleNewKey = undefined;
      }

      if(timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
      }
    },
  }
}
