import amqp from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = "facebook_events";

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", {
      durable: false,
    });
    logger.info("Connected to RabbitMQ");
    return channel;
  } catch (error) {
    logger.error("Error connecting to RabbitMQ: ", error);
  }
}

export async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  await channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published to RabbitMQ: ${routingKey}`);
}

export async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  const queue = await channel.assertQueue("", {
    exclusive: true,
  });
  await channel.bindQueue(queue.queue, EXCHANGE_NAME, routingKey);
  channel.consume(queue.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });
  logger.info(`Event consumed from RabbitMQ: ${routingKey}`);
}
