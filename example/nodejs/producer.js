const { Kafka, Partitioners, CompressionTypes } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-producer',
  brokers: ['localhost:9092']
})

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })


// Custom Function to send message
const produceMessage = async (value, topic) => {
  try{
    await producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        { value },
      ],
    })

  } catch(err){
    console.log(err);
  }
}

const run = async () => {
  // Producing
  await producer.connect();
  console.log("Kafka producer successfully connected................");
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
})

module.exports = produceMessage;
