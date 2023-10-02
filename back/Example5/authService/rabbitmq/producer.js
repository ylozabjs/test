export default class Producer {
  #channel;
  constructor(channel) {
    this.#channel = channel;
  }

  async produceMessages(data, correlationId, replyTo) {
    console.log("Message has been produced");
    this.#channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(data)), {
      correlationId
    });
  }
}
