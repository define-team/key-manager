import {WifiData} from "@alias-esp/constants/wifi-data";
import Wifi = require('Wifi');

export default {
  init: function () {
    console.log('[INFO]: Connecting to wifi');

    Wifi.connect(WifiData.ssid, { password: WifiData.pass }, function (err) {
      if (err) {
        console.error("[Error]: Wi-Fi connection error:", err);
        return;
      }

      console.log("[INFO]: Connected wifi");
      return;
    });
  },
  initAsync: function(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[INFO]: Connecting to wifi');

      Wifi.connect(WifiData.ssid, { password: WifiData.pass }, function (err) {
        if (err) {
          console.error("[Error]: Wi-Fi connection error:", err);
          reject(err);
        }

        console.log("[INFO]: Connected wifi");
        resolve();
      });
    })
  }
}
