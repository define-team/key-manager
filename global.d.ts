declare module "HD44780" {
  type LCD = {
    clear: VoidFunction;
    print: (text: string) => void;
    setCursor: (
      x: number,
      y: number,
    ) => void
  };

  const HD44780: {
    connectI2C: (i2c: I2C) => LCD;
  };
  export = HD44780;
}

declare module "MFRC522" {
  type RfidCardData = Array<number> | null;

  type FindCardsCb = ((cardData: RfidCardData) => void) | undefined

  type Rfid = {
    findCards: (cb: FindCardsCb) => void
  };

  const MFRC522: {
    connect: (spi: SPI, sda: Pin) => Rfid
  };
  export = MFRC522;
}

declare class OneWire {
  constructor(pin: Pin);
  search(): string[];
}

declare module "servo" {
  type MoveOptions = {
    soft?: boolean;
  };

  type MoveCallback = (() => void) | undefined;

  type Servo = {
    /**
     * Move servo to position between 0 and 1
     * @param pos Position (0..1)
     * @param time Time in ms (optional, default 1000ms)
     * @param callback Callback called after move completes (optional)
     * @param options Options (optional)
     */
    move: (pos: number, time?: number | MoveCallback, callback?: MoveCallback, options?: MoveOptions) => void;
  };

  type ConnectOptions = {
    range?: number;
  };

  const servo: {
    /**
     * Connect servo to pin with options
     * @param pin Pin to control
     * @param options Optional settings (range etc.)
     * @returns Servo object with move method
     */
    connect: (pin: Pin, options?: ConnectOptions) => Servo;
  };

  export = servo;
}

declare module "http" {
  type DataCallback = (chunk: string | ArrayBuffer) => void;
  type CloseCallback = () => void;
  type ErrorCallback = (error: any) => void;

  interface IncomingMessage {
    on(event: "data", callback: DataCallback): void;
    on(event: "close", callback: CloseCallback): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }

  interface ClientRequest {
    on(event: "error", callback: ErrorCallback): void;
    on(event: string, callback: (...args: any[]) => void): void;
    end(data?: string): void;
  }

  interface RequestOptions {
    host?: string;
    hostname?: string;
    port?: number;
    path?: string;
    method?: "POST" | "GET";
    headers?: { [key: string]: string | number };
  }

  function get(
    url: string,
    callback: (res: IncomingMessage) => void
  ): ClientRequest;

  function request(
    options: RequestOptions,
    callback: (res: IncomingMessage) => void
  ): ClientRequest;

  export { get, request, ClientRequest, IncomingMessage, RequestOptions };
}
