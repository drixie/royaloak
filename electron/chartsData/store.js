const quick = require("quick.db")

module.exports = (data) => {
    return new Promise ( async (resolve, reject) => {
       
        try {
            quick.set("chartData", data)
            resolve({
                status: "success", 
                module: "chartData", 
                content: `chartData added`,
                data: data
            })
        } catch (error) {
            reject({
                status: "error",
                module: "chartData",
                content: `Could not add chartData`,
                data: null, 
                error: error
            })
        }  
    })
  }