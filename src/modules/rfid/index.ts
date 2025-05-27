import MFRC522 = require("MFRC522");
import {Pins} from "@alias-esp/constants/pins";

export type RfidCardData = Array<number> | null;

type FindCardsCb = ((cardData: RfidCardData) => void) | undefined

type Rfid = {
  findCards: (cb: FindCardsCb) => void
};

let rfid: undefined | Rfid;

export default {
  init: function() {
    SPI1.setup({ sck: Pins.rfid.sck, mosi: Pins.rfid.mosi, miso: Pins.rfid.miso });
    if(!rfid) {
      rfid = MFRC522.connect(SPI1, Pins.rfid.sda);
    }
  },
  findCards: function (cb: FindCardsCb) {
    return rfid ? rfid.findCards(cb) : cb?.(null);
  },
}
