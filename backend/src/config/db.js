const mongoose=require('mongoose');

// function to connect to the mongodb
async function main()
{
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
}

module.exports=main;