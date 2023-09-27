const mongoose = require('mongoose');

const homeDB_Url = process.env.HOMEMONGO;
const serverDB_Url = process.env.SERVERDB;

const mongooseOptions = {useUnifiedTopology: true, }

const connectDBs = () =>{
    try{
        const homeDB =  mongoose.createConnection(homeDB_Url, mongooseOptions)
        const serverDB = mongoose.createConnection(serverDB_Url, mongooseOptions)
        console.log("monogose is online");
        return {homeDB, serverDB}
    }catch(err){
        console.log(`Error: :${err.message}`)
        process.exit(1)
    }
}

module.exports = {connectDBs};