const db = require("quick.db")

module.exports  = () => new Promise (async (resolve, reject) => {

    try {
        const config = await db.get("chartData")
        resolve (
            {
                status: "success", 
                module: "chartData",
                content: "chartData returned",
                data: config
            }
        )
    } catch (e) {
        reject (
           {
               status: "error", 
               module: "chartData", 
               content: "chartData could not be returned",
               data: null,
               error: e
           }
        )
    }
    
})