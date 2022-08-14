import {
  IBApi,
  IBApiNext,
  LogLevel,
  Contract,
  IBApiNextError,
  OrderBookUpdate,
  OrderBookRows,
  SecType,
  EventName,
  ErrorCode
} from '@stoqey/ib';
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { Subscription } from 'rxjs';

/** The [[IBApiNext]] instance. */
let api: IBApiNext = null;
/** The subscription on the IBApi errors. */
let error$: Subscription = null;
// the subscription on the market depth data
let subscription$: Subscription = null;
// last time we sent data to frontend
let lastdata: number = null;
// connection settings
// const reconnectInterval: number = parseInt(process.env.IB_RECONNECT_INTERVAL) || 5000; // API reconnect retry interval
// const host: string = process.env.IB_TWS_HOST || 'localhost'; // TWS host name or IP address
// const ibport: number = parseInt(process.env.IB_TWS_PORT) || 4001; // API port
// const rows: number = parseInt(process.env.IB_MARKET_ROWS) || 7; // Number of rows to return
// const refreshing: number = parseFloat(process.env.IB_MARKET_REFRESH) || 0.5; // Threshold frequency limit for sending refreshing data to frontend in secs

export const ibnext = new IBApiNext({ reconnectInterval: 500, host: 'localhost', port: 7497 });

export const connect = (input?: any) =>
  new Promise(async (resolve, reject) => {
    try {
      ibnext.connect();
      let res = {
        success: true,
        messsage: 'everything fine'
      };
      resolve(res);
      resolve({ success: true });
    } catch (e) {
      //let err = new Error("Wrong username/password");
      let err = {
        success: false,
        message: 'awful error'
      };
      reject(err);
    }
  });
