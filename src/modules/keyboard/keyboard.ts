import {Pins} from "@alias-esp/constants/pins";

const keys = [
  ['1','2','3','A'],
  ['4','5','6','B'],
  ['7','8','9','C'],
  ['*','0','#','D']
];

let subscribers: ((key: string) => void)[] = [];
let interval: number | undefined;

function readKey () {
  const {cols, rows} = Pins.keyboard
  for (let c = 0; c < cols.length; c++) {
    digitalWrite(cols[c], 0);
    for (let r = 0; r < rows.length; r++) {
      if (!digitalRead(rows[r])) {
        digitalWrite(cols[c], 1);
        return keys[r][c];
      }
    }
    digitalWrite(cols[c], 1);
  }
  return null;
}

function scanKeys() {
  const res = readKey();
  if(res !== null) {
    subscribers.forEach(fn => fn(res));
  }
}

export default {
  init: function() {
    for (let r of Pins.keyboard.rows) pinMode(r, 'input_pullup', false);
    for (let c of Pins.keyboard.cols) pinMode(c, 'output', false);
  },
  readKey,
  onKey(callback: (key: string) => void) {
    if (subscribers.length === 0) {
      interval = setInterval(scanKeys, 100); // запускаем сканирование только один раз
    }
    subscribers.push(callback);
  },
  offKey(callback: (key: string) => void) {
    subscribers = subscribers.filter(fn => fn !== callback);
    if (subscribers.length === 0 && interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }
}
