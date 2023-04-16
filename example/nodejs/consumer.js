const { Kafka } = require('kafkajs');
const Chance = require('chance');

const chance = new Chance();


// For running multiple brokers use this

// const kafka = new Kafka({
//   clientId: 'my-consumer',
//   brokers: ['localhost:9092', 'localhost:9093', 'localhost:9094']
// })

// For running single brokers use this

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:9092']
})




const consumer = kafka.consumer({ groupId: chance.character() });

const run = async () => {

  // Producing
  await consumer.connect();
  console.log("Consumer connected successfully...........");
  
  await consumer.subscribe({ topics:['myTopic'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if(topic == "myTopic"){
        var parsedValue = JSON.parse(message.value);
        console.log("consumer myTopicResult:", parsedValue)

      } 
    },
  })

}

module.exports = run;