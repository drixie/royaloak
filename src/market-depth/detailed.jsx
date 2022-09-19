import React, { useState } from 'react';
import { useGlobal } from 'reactn';
import { SettingsIcon } from '@chakra-ui/icons';
import { useDisclosure } from '@chakra-ui/react';
import MarketDepthConfig from './config';

import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';


const evaluateCondition = (condition, conditionValue, rowValue) => {
  switch(condition) {
    case ">":
        return rowValue > conditionValue;
    case "<":
        return rowValue < conditionValue;
    case ">=":
        return rowValue >= conditionValue;
    case "<=":
        return rowValue <= conditionValue;
  }
}

function DetailedMarketDepth(props) {
  const { marketDepthTable } = props;
  const [selectedAsset] = useGlobal('selectedAsset');
  const [marketDepthConfig] = useGlobal('marketDepthConfig');
  const [bidClassname,setBidClassname] = useState(['']);
  const [askClassname, setAskClassname] = useState(['']);

  // Generate calsses from MarketDepth Configuration
  React.useEffect(() => {
    var bidClass = [...bidClassname];
    var askClass = [...askClassname];
    marketDepthTable?.forEach((row,index)=>{
      bidClass[row.i] = '';
      askClass[row.i] = '';
      marketDepthConfig['global'].size?.forEach((sizeCondition,i)=> {
        bidClass[row.i] = evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.bidSize) && !sizeCondition?.show ? "!invisible" : evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.bidSize) ? `${sizeCondition?.color}` : bidClass[row.i];
        askClass[row.i] = evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.askSize) && !sizeCondition?.show ? "!invisible" : evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.askSize) ? `${sizeCondition?.color}` : askClass[row.i];
      // for asset specific configuration
        if (selectedAsset in marketDepthConfig) {
          for (let sizeCondition in marketDepthConfig[selectedAsset].size) {
            bidClass[row.i] = evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.bidSize) && !sizeCondition?.show ? "!invisible" : evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.bidSize) ? `${sizeCondition?.color}` : bidClass[row.i];
            askClass[row.i] = evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.askSize) && !sizeCondition?.show ? "!invisible" : evaluateCondition(sizeCondition?.condition, sizeCondition?.value, row?.askSize) ? `${sizeCondition?.color}` : askClass[row.i];
          }
        }
      });
    });
    setAskClassname(askClass);
    setBidClassname(bidClass);
  }, [marketDepthConfig, marketDepthTable])

  const { isOpen, onOpen, onClose } = useDisclosure();

  let bidCount = 0;
  let askCount = 0;
  let bidVolume = 0;
  let askVolume = 0;
  let countDelta = 0;
  let volumeDelta = 0;

  if (marketDepthTable) {
    //console.log(marketDepthTable[marketDepthTable.length - 1])
    const bidSizes = [];
    const askSizes = [];
    marketDepthTable.map((row, index) => {
      if (!isNaN(row.bidSize)) bidSizes.push(row.bidSize);
      if (!isNaN(row.askSize)) askSizes.push(row.askSize);
    });

    bidCount = bidSizes.length;
    bidVolume = bidSizes.reduce((acc, value) => {
      return acc + value;
    }, 0);
    askCount = askSizes.length;
    askVolume = askSizes.reduce((acc, value) => {
      return acc + value;
    }, 0);
    countDelta = bidCount - askCount;
    volumeDelta = (bidVolume - askVolume) * 100;
  }

  return (
    <>
      <div className="flex justify-between">
        <div>Market Depth for {selectedAsset}</div>
        <div onClick={onOpen} className="cursor-pointer">
          <SettingsIcon />
        </div>
        <MarketDepthConfig isOpen={isOpen} onClose={onClose} />
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <span className="p-1 mb-1">Bid Count: {bidCount}</span>
          <span className="p-1 ">Bid Volume: {bidVolume}</span>
        </div>
        <div className="flex flex-col">
          <span className={'p-1 mb-1 ' + (countDelta < 0 ? 'bg-red-200' : 'bg-green-200')}>
            Count Delta: {countDelta}
          </span>
          <span className={'p-1 ' + (volumeDelta < 0 ? 'bg-red-200' : 'bg-green-200')}>
            Volume Delta: {volumeDelta}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="p-1 mb-1">Ask Count: {askCount}</span>
          <span className="p-1">Ask Volume: {askVolume}</span>
        </div>
      </div>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>MMID</Th>
            <Th>Size</Th>
            <Th>Bid</Th>
            <Th>Ask</Th>
            <Th>Size</Th>
            <Th>MMID</Th>
            <Th>#</Th>
          </Tr>
        </Thead>
        <Tbody>
          {marketDepthTable ? (
            marketDepthTable.map((row, index) => {
              return (
                <Tr key={row.bidMMID + row.bidPrice + row.askMMID + row.askPrice + index}>
                  
                  <Td bg={bidClassname?.[row.i]} className={bidClassname?.[row.i]}>{index + 1}</Td>
                  <Td bg={bidClassname?.[row.i]} className={bidClassname?.[row.i]}>{row.bidMMID != 'DRCTEDGE' ? row.bidMMID : 'EDGE'}</Td>
                  <Td bg={bidClassname?.[row.i]} className={bidClassname?.[row.i]}>
                    <span >{row.bidSize}</span>
                  </Td>
                  <Td bg={bidClassname?.[row.i]} className={bidClassname?.[row.i]}>{row.bidPrice}</Td>
                 
                  <Td bg={askClassname?.[row.i]} className={askClassname?.[row.i]}>{row.askPrice}</Td>
                  <Td bg={askClassname?.[row.i]} className={askClassname?.[row.i]}>
                    <span className={askClassname?.[row.i]}>{row.askSize}</span>
                  </Td>
                  <Td bg={askClassname?.[row.i]} className={askClassname?.[row.i]}>{row.askMMID != 'DRCTEDGE' ? row.askMMID : 'EDGE'}</Td>
                  <Td bg={askClassname?.[row.i]} className={askClassname?.[row.i]}>{index + 1}</Td>
                  
                </Tr>
              );
            })
          ) : (
            <Tr>
              <Td>marketDepthTable undefined.</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </>
  );
}

export default DetailedMarketDepth;
