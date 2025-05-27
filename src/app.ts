import Rfid from './modules/rfid'
import LCD from './modules/lcd'
import Keyboard from "@alias-esp/modules/keyboard/keyboard";
import {transitionTo} from "@alias-esp/states/state-manager";
import Slots from "@alias-esp/modules/slots/slots";
import Wifi from "@alias-esp/modules/wifi/wifi";
import Api from "@alias-esp/modules/api/api";

function init() {
  Rfid.init();
  LCD.init();
  Keyboard.init();
  Slots.init();

  const rows = [D18, D5, D17, D16];
  const cols = [D4, D0, D2, D15];

  for (let r of rows) pinMode(r, 'input_pullup', false);
  for (let c of cols) pinMode(c, 'output', false);
}

init();

function start() {
  Wifi.initAsync().then(() => {
    Api.init().then(() => {
      transitionTo('Idle')
    })
  })
}

start();
