export class MessageConnection {
  onMessage;
  #onDisconnect;
  #host;
  constructor() {
    this.onMessage = null;
    this.#onDisconnect = null;
    this.#host = null;
    window.addEventListener("message", (event) => {
      const { origin } = event;
      if (!origin) {
        if (this.#onDisconnect) {
          this.#onDisconnect.call(null, "connection failed");
        }
        this.#onDisconnect = null;
        this.onMessage = null;
      };
      this.#host = origin;
    }, {
      once: true
    });
    window.addEventListener("message", (event) => {
      if (this.onMessage) {
        this.onMessage.call(null, event.data);
      }
    })
  }
  setOnMessage(onMessage) {
    this.onMessage = onMessage;
  }
  setOnDisconnect(onDisconnect) {
    this.#onDisconnect = onDisconnect;
  }
  sendRawMessage(message) {
    const target = (window.opener || window.parent);
    try {
      target.postMessage(message, this.#host);
    } catch {
      return this.disconnect();
    }
  }
  async disconnect() {
    if (this.#onDisconnect) {
      this.#onDisconnect.call(null, "force disconnect");
    }
    this.#onDisconnect = null;
    this.onMessage = null;
  }
}
