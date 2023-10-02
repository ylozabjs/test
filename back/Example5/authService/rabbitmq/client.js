import { connect } from "amqplib";
import Producer from "./producer.js";
import Consumer from "./consumer.js";
import { authHandler } from "../controllers/auth/auth.handler.js";
import { roleHandler } from "../controllers/role/role.handler.js";
import { usersHandler } from "../controllers/user/user.handler.js";
import {
  AUTH_EXCHANGE,
  AUTH_QUEUE,
  USER_QUEUE,
  ROLE_QUEUE,
  AUTH_ROUTING_KEY,
  USER_ROUTING_KEY,
  ROLE_ROUTING_KEY
} from "../CONSTANTS.js";

class RabbitMQClient {
  #userConsumer;
  #authConsumer;
  #roleConsumer;
  #producer;
  #connection;
  #producerChannel;
  #consumerChannel;

  static getInstance() {
    if (!this.instance) this.instance = new RabbitMQClient();

    return this.instance;
  }

  async init() {
    try {
      this.#connection = await connect(process.env.RABBITMQ_CONNECTION_STRING);

      this.#consumerChannel = await this.#connection.createChannel();
      this.#producerChannel = await this.#connection.createChannel();

      this.#consumerChannel.assertExchange(AUTH_EXCHANGE, "direct");

      const { queue: authReplyQueueName } = await this.#consumerChannel.assertQueue(AUTH_QUEUE, { exclusive: true });
      const { queue: userReplyQueueName } = await this.#consumerChannel.assertQueue(USER_QUEUE, { exclusive: true });
      const { queue: roleReplyQueueName } = await this.#consumerChannel.assertQueue(ROLE_QUEUE, { exclusive: true });

      this.#consumerChannel.bindQueue(authReplyQueueName, AUTH_EXCHANGE, AUTH_ROUTING_KEY);
      this.#consumerChannel.bindQueue(userReplyQueueName, AUTH_EXCHANGE, USER_ROUTING_KEY);
      this.#consumerChannel.bindQueue(roleReplyQueueName, AUTH_EXCHANGE, ROLE_ROUTING_KEY);

      this.#producer = new Producer(this.#producerChannel);
      this.#authConsumer = new Consumer(this.#consumerChannel, authReplyQueueName, authHandler);
      this.#userConsumer = new Consumer(this.#consumerChannel, userReplyQueueName, usersHandler);
      this.#roleConsumer = new Consumer(this.#consumerChannel, roleReplyQueueName, roleHandler);
    } catch (error) {
      throw new Error("ERROR: ", error);
    }
  }

  async produce(data, correlationId, replyTo) {
    return this.#producer.produceMessages(data, correlationId, replyTo);
  }
}

export default RabbitMQClient.getInstance();
