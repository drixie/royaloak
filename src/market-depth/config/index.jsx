import { useGlobal } from 'reactn';
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Radio,
  RadioGroup,
  Select,
  Switch,
  CheckboxGroup,
  Checkbox,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image
} from '@chakra-ui/react';
import { HexColorPicker } from 'react-colorful';

import { SunIcon, AddIcon, MinusIcon } from '@chakra-ui/icons';

function MarketDepthConfig(props) {
  const [marketDepthConfig, setMarketDepthConfig] = useGlobal('marketDepthConfig');
  const [selectedAsset] = useGlobal('selectedAsset');
  const [saveFor, setSaveFor] = useState({ 'this-window': true, 'windows-default': false, 'current-asset': false });
  const [localMarketDepthConfig, setLocalMarketDepthConfig] = useState({});
  const [colorPickerVisible, setColorPickerVisible] = useState([false]);
  
  const initialRow = {
    id:1,
    condition:'>=',
    show:false,
    value:'',
    color:'#FFFF',
    colorPickerVisible: false,
  }
  const [sizeRows, setSizeRows] = useState([{...initialRow}]);

  const toggleColorPickerVisibilty = (index) => {
    let rowsArray = [...colorPickerVisible];
    rowsArray[index] = !rowsArray[index];
    setColorPickerVisible(
      rowsArray
    )
  }
  

  const addNewRow = ()=>{
    let newRow = {...initialRow};
    newRow.id = sizeRows[sizeRows.length -1]?.id ? sizeRows[sizeRows.length -1]?.id +1 : 1;
    setSizeRows([...sizeRows, newRow]);
  }

  // set coming input from the form into sizeRows state 
  const setRowValue = (e, index)=>{
    let rowsArray = [...sizeRows];
    rowsArray[index][e.target.name] = e.target.value;
    setSizeRows(
      rowsArray
    )
  }
  // have to use separate function because `select` has a specific field that has our desired value i.e. `checked`. Unlike `target.value` for all other inputs
  const setShowValue = (e, index)=>{
    let rowsArray = sizeRows;
    rowsArray[index][e.target.name] = e.target.checked;
    setSizeRows(
      rowsArray
    )
  }
  // same reason as with setShowValue. Color picker doesn't generate an event rather passes plain color value so needs to be handled separately
  const setColorValue = (value, index)=>{
    let rowsArray = [...sizeRows];
    rowsArray[index]["color"] = value;
    setSizeRows(
      rowsArray
    )
  }

  const removeRow=(id)=>{
    const rowsArray = sizeRows.filter(row => row.id != id)
    setSizeRows(rowsArray)
  }

  // for global data outside mutliple rows inputs like size conditions or price conditions, currently only used for NumOfRows
  const handleInputChange = (e) => {
    const obj = localMarketDepthConfig;
    obj[e.target.name] = e.target.value;
    setLocalMarketDepthConfig(obj);
  };

  // to populate config window from the db
  useEffect(async () => {
    const response = await window.Main.asyncData({
      route: "marketDepthConfig/get-config"
    });
    if (response.data) {
      // console.log("Received from db, use it to prepopulate the config settings for synced look")
    }
  }, [])

  //  save config to global state, save config to db, reset saveFor state, close window
  const onClose = () => {
    let numOfRows = localMarketDepthConfig.numOfRows;

    if (saveFor['this-window']) {
      const config = marketDepthConfig;
      config.global.numOfRows = numOfRows ? numOfRows : config.global.numOfRows;
      config.global.size = sizeRows;
      setMarketDepthConfig(config)
    }
    if (saveFor['current-asset']) {
      const config = marketDepthConfig;
      config[selectedAsset] = {}
      config[selectedAsset].numOfRows = numOfRows ? numOfRows : config.global.numOfRows;
      config[selectedAsset].size = sizeRows;
      setMarketDepthConfig(config)
    }
  //
      const response = window.Main.asyncData({
        route: "marketDepthConfig/new",
        content: marketDepthConfig
      })
    //  console.log("ipc response:  ", response);
    //
    setSaveFor({ 'this-window': true, 'windows-default': false, 'current-asset': false });
    props.onClose();
  };
  return (
    <>
      <Modal isOpen={props.isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader className="font-bold uppercase">Configure Market Depth Window</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <div>
                <p className="bg-blue-200 p-2 border-2 border-dotted border-blue-500 font-semibold">
                  Select Market Depth Display Type
                </p>
                <div className="p-3">
                  <Tabs>
                    <TabList>
                      <Tab>Detailed Table</Tab>
                      <Tab>Detailed Vertical</Tab>
                      <Tab>Smart Vertical</Tab>
                      <Tab>Smart Table</Tab>
                      <Tab>Cumulative</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <p>one!</p>
                      </TabPanel>
                      <TabPanel>
                        <p>two!</p>
                      </TabPanel>
                      <TabPanel>
                        <div className="flex flex-row">
                          <div className="w-1/4">
                            <p>
                              Displays the market depth vertically with the sizes aggregated by Market Maker IDs. This
                              makes the market depth more compact, easier to read, and most importantly, see the zone
                              between bid and ask where the market maker is most likely to fill a market order
                            </p>
                            <p>
                              A Smart Vertical Market Depth with a slim profile can be lined up right beside a chart
                              since it displays individual price levels
                            </p>
                            <div className="flex-flex-row">
                              <RadioGroup>
                                <Stack direction="row">
                                  <Radio value="wide">Wide Profile</Radio>
                                  <Radio value="slim">Slim Profile</Radio>
                                </Stack>
                              </RadioGroup>
                            </div>
                          </div>
                          <div className="w-3/4">
                            <Image src="assets/images/smart-vertical-wide.PNG" alt="Smart Vertical Wide Profile" />
                          </div>
                        </div>
                      </TabPanel>
                      <TabPanel>
                        <p>three!</p>
                      </TabPanel>
                      <TabPanel>
                        <p>three!</p>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
              </div>
              <div className="flex flex-row">
                <div className="w-1/2 mr-5">
                  <div className="mb-2 ">
                    <p className="bg-blue-200 p-2 border-2 border-dotted border-blue-500 font-semibold">
                      Row Configuration
                    </p>
                    <div className="flex flex-row p-5">
                      <p>Number of Rows </p>&nbsp;{' '}
                      <p>
                        <Input size="xs" name="numOfRows" onChange={handleInputChange} />
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="bg-blue-200 p-2 border-2 border-dotted border-blue-500 font-semibold">
                      Row Filter / Cell Highlight
                    </p>
                    <Tabs>
                      <TabList>
                        <Tab>MMID</Tab>
                        <Tab>Size</Tab>
                        <Tab>Price</Tab>
                        <Tab>Groups</Tab>
                      </TabList>

                      <TabPanels>
                        <TabPanel>
                          <p>one!</p>
                        </TabPanel>
                        <TabPanel>
                       {sizeRows.map((row,index)=>(
                          <Stack key={row.id} direction="row" className="border-b p-3">
                            <Select size="sm" name="condition" onChange={()=>setRowValue(event,index)}>
                              <option value=">=">&gt;=</option>
                              <option value=">">&gt;</option>
                              <option value="<=">&lt;=</option>
                              <option value="<">&lt;</option>
                            </Select>
                            <Input size="sm" name='value' value={sizeRows[index].value} onChange={()=>setRowValue(event,index)}/>
                            <Stack direction="row">
                              <span>Show</span>
                              <span>
                                <Switch colorScheme="green" size="sm" name='show' onChange={()=>setShowValue(event,index)}/>
                              </span>
                            </Stack>
                            <Stack direction="row">
                              <span>Highlight</span>
                              <span className="inline-block cursor-pointer hover:text-yellow-500">
                                <div>
                                <SunIcon onClick={() => {toggleColorPickerVisibilty(index)}}/>
                                <HexColorPicker className={colorPickerVisible[index] ? "!absolute !z-50" : "!hidden"} name='color' color={sizeRows[index].color} onChange={(value)=>setColorValue(value,index)}/>
                                </div>
                                
                              </span>
                              <Button size={"xs"} className="hover:!bg-red-600" onClick={() => {removeRow(row.id)}}> <MinusIcon className='hover:invert' /> </Button>
                              
                              </Stack>
                              
                          </Stack>
                          ))}
                          <Stack direction="row" className="mt-2" style= {{cursor:"pointer"}}>
                            <span onClick={addNewRow}>
                              <AddIcon onClick={addNewRow} />
                            </span>
                            <span className="italic" onClick={addNewRow}>Add a new size condition</span>
                          </Stack>
                        </TabPanel>
                        <TabPanel>
                          <p>three!</p>
                        </TabPanel>
                        <TabPanel>
                          <p>four!</p>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </div>
                </div>

                <div className="w-1/2">
                  <p className="bg-blue-200 p-2">Column Configuration</p>
                  <div className="flex flex-row">
                    <div className="w-1/4">
                      <p>All Columns</p>
                    </div>
                    <div className="w-3/4">
                      <p>Displayed Columns</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <CheckboxGroup colorScheme="green" defaultValue="this-window">
                  <Stack spacing={[1, 5]} direction={['column', 'row']}>
                    <Checkbox
                      value="this-window"
                      isChecked={saveFor['this-window']}
                      onChange={(e) =>
                        setSaveFor({
                          'this-window': e.target.checked,
                          'windows-default': saveFor['windows-default'],
                          'current-asset': saveFor['current-asset']
                        })
                      }
                    >
                      Save for this window
                    </Checkbox>
                    <Checkbox
                      value="windows-default"
                      isChecked={saveFor['windows-default']}
                      onChange={(e) =>
                        setSaveFor({
                          'this-window': saveFor['this-window'],
                          'windows-default': e.target.checked,
                          'current-asset': saveFor['current-asset']
                        })
                      }
                    >
                      Save as default for all windows
                    </Checkbox>
                    <Checkbox
                      value="current-asset"
                      isChecked={saveFor['current-asset']}
                      onChange={(e) =>
                        setSaveFor({
                          'this-window': saveFor['this-window'],
                          'windows-default': saveFor['windows-default'],
                          'current-asset': e.target.checked
                        })
                      }
                    >
                      Save as default for current asset
                    </Checkbox>
                  </Stack>
                </CheckboxGroup>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            {/* <Button variant='ghost'>Secondary Action</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MarketDepthConfig;
