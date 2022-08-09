import { ipcRenderer, contextBridge } from 'electron';
import {
  IBApi,
  EventName
  //  ErrorCode, Contract
} from '@stoqey/ib';

declare global {
  interface Window {
    Main: typeof api;
    ipcRenderer: typeof ipcRenderer;
  }
}

const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },

  sendToast: (toast: object) => {
    ipcRenderer.send('toast', toast);
  },

  sendData: (data: any) => {
    ipcRenderer.send('data', data);
  },

  sendStream: (data: any) => {
    ipcRenderer.send('stream', data);
  },

  sendSecondStream: (data: any) => {
    ipcRenderer.send('second-stream', data);
  },

  sendMarketDepth: (data: any) => {
    ipcRenderer.send('market-depth', data);
  },

  asyncData: async (data: any) => {
    return await ipcRenderer.invoke('data', data);
  },
  /**
    Here function for AppBar
   */
  Minimize: () => {
    ipcRenderer.send('minimize');
  },
  Maximize: () => {
    ipcRenderer.send('maximize');
  },
  Close: () => {
    ipcRenderer.send('close');
  },
  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

  once: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.once(channel, (_, data) => callback(data));
  },

  off: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, (_, data) => callback(data));
  },

  reset: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld('Main', api);

/**
 * Using the ipcRenderer directly in the browser through the contextBridge ist not really secure.
 * I advise using the Main/api way !!
 */
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

console.log('PLP');

const ib = new IBApi({
  clientId: 1,
  host: '127.0.0.1',
  port: 7497
});

// register event handler

// let positionsCount = 0;

ib.on(EventName.connected, () => {
  console.log('CONNECTED IBApi');
});
// .on(EventName.error, (err: Error, code: ErrorCode, reqId: number) => {
//   console.error(`${err.message} - code: ${code} - reqId: ${reqId}`);
// })
// .on(EventName.position, (account: string, contract: Contract, pos: number, avgCost?: number) => {
//   console.log(`${account}: ${pos} x ${contract.symbol} @ ${avgCost}`);
//   positionsCount++;
// })
// .once(EventName.positionEnd, () => {
//   console.log(`Total: ${positionsCount} positions.`);
//   ib.disconnect();
// });

// call API functions

ib.connect();
// ib.reqPositions();

//////

// About Warning:
//DevTools failed to load source map: Could not load content for http://localhost:3000/api.js.map: HTTP error: status code 404, net::ERR_HTTP_RESPONSE_CODE_FAILURE

// https://stackoverflow.com/questions/61339968/error-message-devtools-failed-to-load-sourcemap-could-not-load-content-for-chr?rq=1
