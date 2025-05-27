export const Pins = {
  rfid: {
    sck: D32,
    mosi: D12,
    miso: D25,
    sda: D13,
  },
  lcdI2c: {
    scl: D22,
    sda: D23
  },
  oneWire: D14,
  slots: [D19, D27, D21],
  keyboard: {
   rows: [D18, D5, D17, D16],
   cols: [D4, D0, D2, D15],
  }
}
