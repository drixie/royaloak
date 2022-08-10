import { io } from 'socket.io-client';

const Alpaca = require('@alpacahq/alpaca-trade-api');
const { AlpacaStream } = require('@master-chief/alpaca');

const prodStream = io('https://nelson-z9ub6.ondigitalocean.app', { transports: ['websocket'] });

export const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY,
  secretKey: process.env.ALPACA_SECRET,
  paper: process.env.NODE_ENV == 'development'
  //   usePolygon: false
});

// const alpaca = new Alpaca({
//   keyId: process.env.ALPACA_KEY,
//   secretKey: process.env.ALPACA_SECRET,
//   usePolygon: false
// })

// module.exports = alpaca

export const alpacaAccount = new AlpacaStream({
  credentials: {
    key: process.env.ALPACA_KEY,
    secret: process.env.ALPACA_SECRET,
    paper: true
  },
  type: 'account'
});

// alpacaAccount
//   .on('error', (error) => {
//     console.log('Alpaca error:', error);
//   })
//   .on('message', (message) => {
//     console.warn('Alpaca message:', message);
//   })
//   .once('authenticated', () => {
//     console.log('LOG: Account stream authenticated');

//     alpacaAccount.subscribe('trade_updates');
//     alpacaAccount.on('trade_updates', (data) => {
//       if (data.event == 'fill') console.log(data);
//       if (data.event == 'fill' && ipcStream) {
//         ipcStream.send('data', {
//           type: 'order',
//           content: JSON.stringify(data)
//         });
//       }
//     });
//   });

// module.exports = account
