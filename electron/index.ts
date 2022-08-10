// Native
// @ts-nocheck
import { join } from 'path';
import { io } from 'socket.io-client';
const prodStream = io('https://nelson-z9ub6.ondigitalocean.app', { transports: ['websocket'] });
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { Subscription } from 'rxjs';
import {
  IBApiNext,
  LogLevel,
  Contract,
  IBApiNextError,
  OrderBookUpdate,
  OrderBookRows,
  SecType,
  Contract,
  Stock
} from '@stoqey/ib';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import isDev from 'electron-is-dev';

import { ib } from './common/ib';
import { alpaca, alpacaAccount } from './common/alpaca';

const schedule = require('node-schedule');
const pythonPromise = require('./common/python-promise');
const quick = require('quick.db');
const uuid = require('uuid').v4;

let ipcStream = null;
const height = 800 * 0.9;
const width = 1200 * 0.9;

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: false,
    title: 'Guerilla',
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../src/out/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  // Open the DevTools.
  //window.webContents.openDevTools();

  window.webContents.once('dom-ready', () => {
    // Connect IB
    ib.connect();

    // Connect Alpaca
    ipcStream = window.webContents;
    // const account = require('./common/account-stream');
    //  alpacaAccount.on("error", error => console.log("error:", error))
    //  alpacaAccount.on("message", message => console.warn("message:", message))
    alpacaAccount.once('authenticated', () => {
      console.log('account stream authenticated');

      alpacaAccount.subscribe('trade_updates');

      alpacaAccount.on('trade_updates', (data) => {
        if (data.event == 'fill') console.log(data);
        if (data.event == 'fill' && ipcStream) {
          ipcStream.send('data', {
            type: 'order',
            content: JSON.stringify(data)
          });
        }
      });
    });

    // const { initLevels, pollIndicatorLevels } = require('./levels/publish');
    // initLevels(window.webContents);
    const assets = quick.get('watchlist');
    const symbols = assets.map((item) => item.symbol);
    // window.webContents.send ("data", {type: "test", content: "now we are just testing from inside the initLevels inside levels/publish.js"})
    const symbolLevels = symbols.map((symbol) => {
      const channel = `${symbol}.levels`;
      const data = quick.get(channel);
      // if (data && window.webContents) {
      //     window.webContents.emit("levels", {symbol: symbol, levels: data})
      // }
      if (data) {
        window.webContents.send('data', {
          type: 'levels',
          content: { symbol: symbol, levels: data }
        });
      }
    });
    // const levels = publishLevels(symbols)
    // ipc.send("data", {
    //     type: "levels",
    //     content: levels
    // })
    let clientId = 15;
    let tickerId = 0;
    let contract = { symbol: 'MSFT' } as Contract;
    let endDateTime = '';
    let durationStr = '6 D';
    let barSizeSetting = '15 mins';
    let whatToShow = 'TRADES';
    let useRTH = 0; //false
    let formatDate = 1; //1 or 2
    let keepUpToDate = false;
    const plp = ib.reqHistoricalData(
      tickerId++,
      new Stock('AAPL', 'ISLAND', 'USD'),
      // contract,
      endDateTime,
      durationStr,
      barSizeSetting,
      whatToShow,
      useRTH,
      formatDate,
      keepUpToDate
    );
    console.log(plp);

    // // symbols.map((symbol) => {
    // //   clientId++;
    // //   pythonPromise('fetch/main.py', symbol, '15 mins', clientId)
    // //     .then((result) => {
    // //       const candles = JSON.parse(result);
    // //       hydrateCandles(symbol, candles, socket);
    // //       const levels = candles[candles.length - 2];
    // //       hydrateIndicatorLevels(symbol, levels, socket);
    // //     })
    // //     .catch((error) => console.log(error, 'for', symbol));
    // // });
    // // });
    // pollIndicatorLevels(window.webContents);

    // const executeOrders = require('./orders/execute');
    // executeOrders(window.webContents);
  });

  // For AppBar
  ipcMain.on('minimize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  });
  ipcMain.on('maximize', () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMaximized() ? window.restore() : window.maximize();
  });

  ipcMain.on('close', () => {
    window.close();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // app.whenReady().then(() => {
  //   installExtension(REACT_DEVELOPER_TOOLS)
  //     .then((name) => console.log(`Added Extension:  ${name}`))
  //     .catch((err) => console.log('An error occurred: ', err));
  // });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// const aggs = require("./aggs")
prodStream.on('connect', () => {
  console.log('connected to prod stream?', prodStream.connected);
  const executeRules = require('./rules/execute');

  prodStream.on('alpaca-T', (data) => {
    if (ipcStream) {
      // @ts-ignore
      ipcStream.send('stream', data); // @ts-ignore
      executeRules(ipcStream, data);
    }
  });

  prodStream.on('alpaca-AM', (data) => {
    if (ipcStream) {
      ipcStream.send('second-stream', data); // @ts-ignore
    }
  });

  // const params = {
  //   pipeIn: prodStream,
  //   pipeInChannel: "alpaca-T",
  //   pipeOut: ipcStream,
  //   pipeOutChannel: "second-stream",
  //   interval: 60 * 1000,
  //   dataMapping: {
  //       price: "p",
  //       size: "s",
  //       date: "t",
  //       symbol: "S",
  //   }
  // }
  // aggs(params)
});

// console.log(account.getConnection())

// ipcMain.on("document-ready", (event: IpcMainEvent, message: string) => {
//   console.log(message)
//   const { initLevels } = require("./levels/publish")
//   initLevels(event.sender)
//   event.sender.send("Main process just initialized hydration")
// })

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log('latest message from renderer:', message);

  if (message == 'fetch-watchlist-symbols') {
    event.sender.send('data', {
      type: 'watchlist-data',
      content: [
        { symbol: 'AAPL', lastPrice: '165' },
        { symbol: 'TWTR', lastPrice: '54' }
      ]
    });
  }

  // event.sender.send("message", "this message was sent by Idris")
  // setTimeout(() => event.sender.send('message', 'hi from electron'), 1000);
  // setTimeout(() => event.sender.send('message', 'this message was sent by Idris'), 3000);

  // prodStream.on("alpaca-T", function(data: any) {
  //     //event.sender.send("message", data.S)
  //     // io.emit("trades-"+data.S, data)
  //     // event.emit("alpaca-T", data)

  //     if (data.S == "NVDA") {
  //         event.sender.send("message", "NVDA " + data.p)
  //         //console.log(data.p)
  //     }

  // })
});

ipcMain.handle('data', async (event: IpcMainInvokeEvent, data: any) => {
  let response = null;
  const resource = require('./' + data.route);
  try {
    if (data.content) response = await resource(data.content, event.sender);
    else response = await resource(event.sender);

    if (response) {
      //console.log("data stuff", data)
    } else throw 'Undefined response for the requested resource at ' + data.route;
  } catch (e) {
    response = { status: 'error', content: e || `Could not add ${data.content} to the watchlist` };
  }

  event.sender.send('toast', response);
  return response;
});

/** The [[IBApiNext]] instance. */
let api: IBApiNext = null;

/** The subscription on the IBApi errors. */
let error$: Subscription = null;

// the subscription on the market depth data
let subscription$: Subscription = null;

// last time we sent data to frontend
let lastdata: number = null;

// connection settings
const reconnectInterval: number = parseInt(process.env.IB_RECONNECT_INTERVAL) || 5000; // API reconnect retry interval
const host: string = process.env.IB_TWS_HOST || 'localhost'; // TWS host name or IP address
const port: number = parseInt(process.env.IB_TWS_PORT) || 4001; // API port
const rows: number = parseInt(process.env.IB_MARKET_ROWS) || 7; // Number of rows to return
const refreshing: number = parseFloat(process.env.IB_MARKET_REFRESH) || 0.5; // Threshold frequency limit for sending refreshing data to frontend in secs

// listen the channel `data` and resend the received message to the renderer process
ipcMain.on('data', (event: IpcMainEvent, data: any) => {
  // Connect to IB gateway
  if (!api) {
    api = new IBApiNext({ reconnectInterval, host, port });
    api.logLevel = LogLevel.DETAIL;
    this.error$ = api.errorSubject.subscribe((error) => {
      if (error.reqId === -1) {
        console.log(`${error.error.message}`);
      }
    });
    try {
      api.connect(Math.round(Math.random() * 16383));
    } catch (error) {
      console.log('Connection error', error.message);
      console.log(`IB host: ${host} - IB port: ${port}`);
    }
  }

  if (data.type == 'selected-asset') {
    const contract: Contract = { secType: SecType.STK, currency: 'USD', symbol: data.content, exchange: 'SMART' };
    api
      .getContractDetails(contract)
      .then((details) => {
        lastdata = 0;
        subscription$?.unsubscribe();
        subscription$ = api.getMarketDepth(details[0].contract, rows, true).subscribe({
          next: (orderBookUpdate: OrderBookUpdate) => {
            const now: number = Date.now();
            if (now - lastdata > refreshing * 1000) {
              // limit to refresh rate to every x seconds
              lastdata = now;
              const bids: OrderBookRows = orderBookUpdate.all.bids;
              const asks: OrderBookRows = orderBookUpdate.all.asks;
              let content: {
                i: number;
                bidMMID: string;
                bidSize: number;
                bidPrice: number;
                askPrice: number;
                askSize: number;
                askMMID: string;
              }[] = [];
              for (let i = 0; i < Math.max(bids.size, asks.size); i++) {
                const bid: OrderBookRow = bids.get(i);
                const ask: OrderBookRow = asks.get(i);
                if (bid || ask) {
                  const bidMMID = bid?.marketMaker;
                  const bidSize = bid?.size;
                  const bidPrice = bid?.price;
                  const askPrice = ask?.price;
                  const askSize = ask?.size;
                  const askMMID = ask?.marketMaker;
                  content.push({ i, bidMMID, bidSize, bidPrice, askPrice, askSize, askMMID });
                }
              }
              console.log('content:', content);
              event.sender.send('market-depth', {
                symbol: contract.symbol,
                content: content
              });
            }
          },
          error: (err: IBApiNextError) => {
            subscription$?.unsubscribe();
            console.log(`getMarketDepth failed with '${err.error.message}'`);
            event.sender.send('market-depth', {
              error: err.error.message
            });
          }
        });
      })
      .catch((err: IBApiNextError) => {
        subscription$?.unsubscribe();
        console.log(`getContractDetails failed with '${err.error.message}'`);
        event.sender.send('market-depth', {
          error: err.error.message
        });
      });
  }
});
