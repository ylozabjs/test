import rabbitClient from "./client.js";

export default class Consumer {
  #channel;
  #consumedQueue;
  #handler;

  constructor(channel, consumedQueue, handler) {
    this.#channel = channel;
    this.#consumedQueue = consumedQueue;
    this.#handler = handler;

    this.#consumeMessages();
  }

  async #consumeMessages() {
    console.log("Ready to consume messages");

    this.#channel.consume(
      this.#consumedQueue,
      async (msg) => {
        const { properties, content } = msg;
        const { correlationId, replyTo, headers } = properties;

        if (!correlationId || !replyTo || !headers.action) {
          console.log("Missing 'correlationId', 'replyTo' or 'headers.action' field");

          return;
        }

        const result = await this.#handler(headers.action, JSON.parse(content.toString()));

        rabbitClient.produce(result, correlationId, replyTo);
      },
      { noAck: true }
    );
  }
}
