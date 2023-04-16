const express = require('express');
const app = express();
const port = process.env.PORT || 3410;

const dotenv = require('dotenv').config();

const kafkaConsumer = require('./consumer');

const produceMessage = require('./producer');

app.get("/:name", (req, res) => {
    const name = req.params.name;

    // producing message 
    produceMessage(name, "myTopic");

    res.send("Hello Send");
});

app.listen(port, async () => {
    console.log("Server listening on port " + port + "...")
    try{
        //Starting kafka consumer when server starts
        kafkaConsumer().catch(err => {
            console.log(err)
        });

    }catch(err){
        console.log(err);
    }
});
