import HD44780 = require("HD44780");
import {Pins} from "@alias-esp/constants/pins";

type LCD = {
  clear: VoidFunction;
  print: (text: string) => void;
  setCursor: (
    x: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
    y: 0 | 1,
  ) => void
};

let lcd: undefined | LCD;

export default {
  init: function() {
    I2C1.setup({ scl: Pins.lcdI2c.scl, sda: Pins.lcdI2c.sda });
    if(!lcd) {
      lcd = HD44780.connectI2C(I2C1);
    }
  },
  clear: () => lcd?.clear(),
  print: (text: string) => {
    if(text.length > 16) {
      lcd?.print(text.slice(0, 16));
      lcd?.setCursor(0, 1);
      lcd?.print(text.slice(16));
    } else {
      lcd?.print(text)
    }
  },
}
