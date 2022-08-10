import { IBApi, EventName, ErrorCode, Contract } from '@stoqey/ib';

export const ib = new IBApi({
  clientId: 1,
  host: '127.0.0.1',
  port: 7497
});

// register event handler

// let positionsCount = 0;

ib.on(EventName.connected, () => {
  console.log('IBApi CONNECTED');
  console.log(ib.isConnected);
  console.log(ib.serverVersion);
  // ib.reqPositions();
})
  .on(EventName.disconnected, () => {
    console.log('IBApi DISCONNECTED');
  })
  .on(EventName.server, (serverVersion: number, serverConnectionTime: string) => {
    console.log('SERVER VERSION');
    console.log(serverVersion);
    console.log(serverConnectionTime);
  })
  .on(EventName.error, (err: Error, code: ErrorCode, reqId: number) => {
    console.error(`${err.message} - code: ${code} - reqId: ${reqId}`);
  })
  .on(EventName.position, (account: string, contract: Contract, pos: number, avgCost?: number) => {
    console.log(`${account}: ${pos} x ${contract.symbol} @ ${avgCost}`);
    // positionsCount++;
  });
// .once(EventName.positionEnd, () => {
//   console.log(`Total: ${positionsCount} positions.`);
//   ib.disconnect();
// })
