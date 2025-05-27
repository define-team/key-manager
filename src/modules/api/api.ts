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

export default {
  takeKey: function (req: { nfcId: number[], keyNumber: string }): Promise<{
    keyUuid: string,
    keySlotNumber: number
  }> {
    return new Promise((resolve, reject) => {
      const slotIndex = slots.indexOf(req.keyNumber);
      if(req.keyNumber === '103') {
        reject('403');
      }
      if(slotIndex === -1) {
        reject('404');
        return;
      }
      slots[slotIndex] = null as any;
      console.log(`[INFO] [API] Take key: ${req.keyNumber} ${initialState.keys[req.keyNumber as '101' as '102' as '103']}`);

      setTimeout(() => {resolve({
        keyUuid: initialState.keys[req.keyNumber as '101' as '102' as '103'],
        keySlotNumber: slotIndex + 1,
      })}, 2000);
    })
  },
  getEmptySlot: function () {
    return new Promise((resolve) => {
      setTimeout(() => {resolve(
        slots.indexOf(null as any) + 1
      )}, 2000);
    }) as Promise<number>
  },
  returnKey: function (req: { nfcId?: number[], keyUuid: string }): Promise<void> {
    return new Promise((resolve) => {
      console.log(`[INFO] [API] Retun key: ${req.keyUuid} ${slots.indexOf(null as any)} ${slots[slots.indexOf(null as any)]}`);

      // @ts-ignore
      slots[slots.indexOf(null as any)] = initialState.unKeys[req.keyUuid];
      setTimeout(() => {resolve()}, 2000);
    }) as Promise<void>
  }
}
