import LCD from "@alias-esp/modules/lcd";
import Keyboard from "@alias-esp/modules/keyboard/keyboard";
import {StateData} from "@alias-esp/states/base";

export default function KeyInput(transitionTo: (state: string, data?: any) => void) {
  let typedUserText = "";
  let timeout: undefined | number;

  const baseText = "Enter key number: ";

  let handleKey: undefined | ((key: string) => void);

  return {
    enter: function ({payload}: StateData<{ nfcId: number[]}>) {
      LCD.clear();
      LCD.print(baseText);

      const createExitTimeout = () => {
        if(timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }

        timeout = setTimeout(() => {
          transitionTo('ErrorState', {
            payload: {
              error: 'Timeout'
            }
          })
        }, 7000);
      };

      createExitTimeout();

      handleKey = (key: string) => {
        createExitTimeout();
        console.log("[info] Pressed keyboard: " + key);

        if ("0123456789".includes(key)) {
          typedUserText += key;
        }

        if (key === '*') {
          if(typedUserText.length > 0) {
            typedUserText = typedUserText.slice(0, -1);
          } else {
            transitionTo('ErrorState', {
              payload: {
                error: 'Aborted'
              }
            })
            return;
          }
        }

        if (key === '#') {
          transitionTo('ProcessKeyNumber', {
            payload: {
              nfcId: payload.nfcId,
              keyNumber: typedUserText
            }
          });
          return;
        }

        LCD.clear();
        LCD.print(baseText + typedUserText);
      };

      Keyboard.onKey(handleKey)
    },
    exit: function () {
      typedUserText = '';
      if(handleKey) {
        Keyboard.offKey(handleKey);
        handleKey = undefined;
      }
      if(timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
    },
  }
}
