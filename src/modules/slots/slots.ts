import {Pins} from "@alias-esp/constants/pins";

let ow: OneWire | undefined;
let subscribers: ((key: string) => void)[] = [];
let removeDeviceSubscribers: ((key: string) => void)[] = [];
let interval: number | undefined;
let devicesInitial: string[] = [];

const lockedAngle = 90;
const unlockedAngle = 170;

function searchDevices(): string[] {
  return ow?.search() || [];
}

function scanKeys() {
  if (!ow) return;
  console.log(`[INFO] Scan device initial ${devicesInitial}`)

  const currentDevices = searchDevices();
  if(currentDevices.length === 0) return;
  const newDevices = currentDevices.filter(addr => devicesInitial.indexOf(addr) === -1);
  const removedDevices = devicesInitial.filter(addr => currentDevices.indexOf(addr) === -1);

  if (newDevices.length > 0) {
    newDevices.forEach(addr => {
      subscribers.forEach(cb => cb(addr));
    });
  }
  if (removedDevices.length > 0) {
    removedDevices.forEach(addr => {
      removeDeviceSubscribers.forEach(cb => cb(addr));
    });
  }

  if(newDevices.length > 0 || removedDevices.length > 0) {
    devicesInitial = currentDevices;
    console.log(`[INFO] Updated device initial ${devicesInitial}`)
  }
}

async function servoWrite(pin: Pin, deg: number): Promise<void> {
  return new Promise((resolve) => {
    const pulse = 0.5 + deg / 180 * 2;
    analogWrite(pin, pulse / 20, { freq: 50 });
    setTimeout(() => {
      resolve();
    }, 1000);
  })
}

export default {
  init: async function () {
    ow = new OneWire(Pins.oneWire);
    devicesInitial = searchDevices();
    await servoWrite(Pins.slots[0], lockedAngle)
    await servoWrite(Pins.slots[1], lockedAngle)
    await servoWrite(Pins.slots[2], lockedAngle)
  },
  onNewDevice: function (callback: (key: string) => void) {
    console.log('dev initial', devicesInitial);
    if (interval === undefined) {
      interval = setInterval(scanKeys, 1000);
    }
    subscribers.push(callback);
  },
  onDeviceRemove: function (callback: (key: string) => void) {
    if (interval === undefined) {
      interval = setInterval(scanKeys, 1000);
    }
    removeDeviceSubscribers.push(callback);
  },
  offKey: function (callback: (key: string) => void) {
    subscribers = subscribers.filter(fn => fn !== callback);
    if (subscribers.length === 0 && removeDeviceSubscribers.length === 0 && interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }
  },
  offDeviceRemove: function (callback: (key: string) => void) {
    removeDeviceSubscribers = removeDeviceSubscribers.filter(fn => fn !== callback);
    if (subscribers.length === 0 && removeDeviceSubscribers.length === 0 && interval !== undefined) {
      clearInterval(interval);
      interval = undefined;
    }
  },
  open: async function(slotNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if(slotNumber > Pins.slots.length) {
        reject(new Error("Slot number must be less than slots pin count"));
        return;
      }
      servoWrite(Pins.slots[slotNumber - 1], unlockedAngle);
      setTimeout(() => {
        resolve();
      }, 1000);
    })
  },
  close: function(slotNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if(slotNumber > Pins.slots.length) {
        reject(new Error("Slot number must be less than slots pin count"));
        return;
      }
      servoWrite(Pins.slots[slotNumber - 1], lockedAngle);
      setTimeout(() => {
        resolve();
      }, 1000);
    })
  }
}

