const quick = require("quick.db")

module.exports = (data) => {
    return new Promise ( async (resolve, reject) => {
       
        try {
            quick.set("marketDepthConfig", data)
            resolve({
                status: "success", 
                module: "marketDepthConfig", 
                content: `marketDepthConfig added`,
                data: data
            })
        } catch (error) {
            reject({
                status: "error",
                module: "marketDepthConfig",
                content: `Could not add marketDepthConfig`,
                data: null, 
                error: error
            })
        }  
    })
  }