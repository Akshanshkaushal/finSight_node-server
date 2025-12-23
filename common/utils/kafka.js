// Kafka producer and consumer utilities

const { Kafka } = require('kafkajs');
const { KAFKA_CONFIG } = require('../constants');

const kafka = new Kafka({
  clientId: KAFKA_CONFIG.CLIENT_ID,
  brokers: KAFKA_CONFIG.BROKERS
});

class KafkaProducer {
  constructor() {
    this.producer = kafka.producer();
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }

  async send(topic, messages) {
    await this.connect();
    const messageArray = Array.isArray(messages) ? messages : [messages];
    await this.producer.send({
      topic,
      messages: messageArray.map(msg => ({
        key: msg.key || null,
        value: JSON.stringify(msg.value),
        headers: msg.headers || {}
      }))
    });
  }
}

class KafkaConsumer {
  constructor(groupId, topics, handler) {
    this.consumer = kafka.consumer({ groupId });
    this.topics = Array.isArray(topics) ? topics : [topics];
    this.handler = handler;
    this.isRunning = false;
  }

  async connect() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: this.topics, fromBeginning: false });
    this.isRunning = true;
  }

  async start() {
    await this.connect();
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value.toString());
          await this.handler({ topic, partition, message, value });
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      }
    });
  }

  async disconnect() {
    if (this.isRunning) {
      await this.consumer.disconnect();
      this.isRunning = false;
    }
  }
}

module.exports = { KafkaProducer, KafkaConsumer };

