import http = require("http");
import {WifiData} from "@alias-esp/constants/wifi-data";

const initialState = {
  keys: {
    '101': '01310a24226a213f',
    '102': '013395a8010000f2',
    '103': '0195a3a70100009e'
  },
  unKeys: {
    '01310a24226a213f': '101',
    '013395a8010000f2': '102',
    '0195a3a70100009e': '103'
  }
}

const slots = ['101', '102', '103']

let preparedAuthToken = '';

function postJSON<T extends string>(
  postURL: string,
  data: Record<string, any>,
  isAuth?: boolean,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const content = JSON.stringify(data);
    const options = url.parse(postURL, true) as http.RequestOptions;
    options.method = 'POST';
    options.headers = {
      "Content-Type": "application/json",
      "Content-Length": content.length
    };

    if (isAuth) {
      options.headers['Authorization'] = preparedAuthToken;
    }

    const req = http.request(options, function (res) {
      let d = '';
      res.on('data', function (chunk: string) {
        d += chunk;
      });
      res.on('end', function () {
        resolve(d as T);
      });
    });

    req.on('error', function (e) {
      console.error("Request error:", e);
      reject(e);
    });
    console.log(content);
    req.end(content);
  })
}

function getJSON<T extends string>(
  postURL: string,
  isAuth?: boolean,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const options = url.parse(postURL, true) as http.RequestOptions;
    options.method = 'GET';
    options.headers = {
      "Content-Type": "application/json"
    };

    if (isAuth) {
      options.headers['Authorization'] = preparedAuthToken;
    }

    const req = http.request(options, function (res) {
      let d = '';
      res.on('data', function (chunk: string) {
        d += chunk;
      });
      res.on('end', function () {
        resolve(d as T);
      });
    });

    req.on('error', function (e) {
      console.error("Request error:", e);
      reject(e);
    });

    req.end();
  })
}

export default {
  init: async function(): Promise<{
    token: string;
  }> {
    return postJSON(WifiData.host + '/device/init/', {
        auth_key: WifiData.deviceKey,
        device_id: WifiData.deviceId
      }).then((response) => {
        if(!response) {
          console.error('[ERROR][API]: Unable to get device info');
          throw 'Unable to get device info';
        }
        const parsed = JSON.parse(response) as {
          token: string
        };
        preparedAuthToken = `Bearer ${parsed.token}`;
        console.log(`[INFO][API]: Success token: ${preparedAuthToken}`);
        return parsed;
    });
  },
  takeKey: function (req: { nfcId: number[], keyNumber: string }): Promise<{
    keyUuid: string,
    keySlotNumber: number
  }> {
    const preparedNfcId: string = req.nfcId.map((i) => i.toString(16)).join('-');
    return postJSON(WifiData.host + '/device/get_key/', {
      number: req.keyNumber,
      nfcId: preparedNfcId,
    }, true).then((response) => {
      if(!response) {
        console.error('[ERROR][API]: Unable to get key');
        throw 'Unable to get key';
      }
      const parsed = JSON.parse(response) as {
        keySlotNumber: number,
        keyUuid: string,
        status: string,
        message?: string,
      };
      if(parsed.status === 'error') {
        throw parsed?.message || 404
      }
      console.log(`[INFO][API]: Success get key: ${response}`);
      return {
        keyUuid: parsed.keyUuid,
        keySlotNumber: parsed.keySlotNumber,
      };
    });
  },
  getEmptySlot: function (): Promise<number> {
    return getJSON(WifiData.host + '/device/get_empty_slot/', true).then((response) => {
      if(!response) {
        console.error('[ERROR][API]: Unable to get empty slot');
        throw 'Unable to get empty slot';
      }
      const parsed = JSON.parse(response) as {
        "keySlotId": string,
        "keySlotNumber": number,
        "status": "success"
      };
      console.log(`[INFO][API]: Success get empty slot: ${response}`);
      return parsed.keySlotNumber;
    });
  },
  returnKey: function (req: { nfcId?: number[], keyUuid: string, keySlotNumber: number }): Promise<void> {
    const preparedNfcId: string | undefined = req.nfcId?.map((i) => i.toString(16)).join('-');
    console.log(`[INFO][API]: Request return key: ${JSON.stringify({
      keyId: req.keyUuid,
      nfcId: preparedNfcId,
      keySlotNumber: req.keySlotNumber,
    })}`);
    return postJSON(WifiData.host + '/device/return_key/', {
      keyId: req.keyUuid,
      nfcId: preparedNfcId,
      keySlotNumber: req.keySlotNumber,
    }, true).then((response) => {
      if(!response) {
        console.error('[ERROR][API]: Unable to return key');
        throw 'Unable to return key';
      }
      // const parsed = JSON.parse(response) as {
      //   keyId: string,
      //   keySlotNumber: number,
      //   nfcId: string,
      //   "status": string
      // };
      console.log(`[INFO][API]: Success return key: ${response}`);
      return;
    });
  },
  authKey: function (req: { nfcId?: number[] }): Promise<void> {
    const preparedNfcId: string | undefined = req.nfcId?.map((i) => i.toString(16)).join('-');
    return postJSON(WifiData.host + '/device/return_key/', {
      nfcId: preparedNfcId,
    }, true).then((response) => {
      if(!response) {
        console.error('[ERROR][API]: Unable to validate nfc');
        throw 'Unable to validate nfc';
      }
      console.log(`[INFO][API]: Success auth card: ${response}`);
      return;
    });
  }
}
