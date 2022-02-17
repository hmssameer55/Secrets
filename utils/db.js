const Mongoose  = require("mongoose")

const makeDbConnection = async () => {
    try {
        await Mongoose.connect("mongodb+srv://hmssameer55:sRRmwwY3GcmbArqR@cluster0.6ghbz.mongodb.net/secrets")
        console.log("connected to db")
    } catch(err){
        console.log("something went wrong while connecting to db")
    }
    Mongoose.Promise=global.Promise
}

module.exports = makeDbConnection