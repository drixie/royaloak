const db = require("quick.db")

module.exports  = () => new Promise (async (resolve, reject) => {

    try {
        const config = await db.get("marketDepthConfig")
        resolve (
            {
                status: "success", 
                module: "marketDepthConfig",
                content: "marketDepthConfig returned",
                data: config
            }
        )
    } catch (e) {
        reject (
           {
               status: "error", 
               module: "marketDepthConfig", 
               content: "marketDepthConfig could not be returned",
               data: null,
               error: e
           }
        )
    }
    
})