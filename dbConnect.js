const mongoose = require("mongoose");

module.exports = () => {
    const mongoUri =
  "mongodb+srv://rohan:UOR9nbc1B6qjvpUp@cluster0.alvqasg.mongodb.net/?retryWrites=true&w=majority";

    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    
    mongoose
        .connect(mongoUri, connectionParams)
        .then(() => {
            console.log('MongoDb connected');
        })
        .catch((err) => {
            // console.error(`Error connecting to the database. \n${err}`);
            console.log("Error connecting to the database", err);
            process.exit(1);
        });
}

