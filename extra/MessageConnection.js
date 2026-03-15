var MessageTransport = class {
  onMessage = null;
  #onDisconnect = null;
  #host;
  #target;

  constructor() {
    const params = new URLSearchParams(location.search);
    console.log(`[MessageTransport] Initializing...`);
    
    this.#host = params.get("msgorigin") || "*";
    this.#target = window !== window.parent ? window.parent : window.opener;

    if (this.#target) {
      const initMessage = JSON.stringify({ type: "devtools:server:init", data: {} });
      console.log(`[MessageTransport] Attempting to connect to target`);
      
      for (let i = 0; i < 10; i++) {
        this.#target.postMessage(initMessage, this.#host);
      }
    }

    window.addEventListener("message", this.#handleParentOrigin);
    window.addEventListener("message", this.#handleIncomingMessage);
  }

  // Using private fields (#) and arrow functions for clean encapsulation and context binding
  #handleParentOrigin = (event) => {
    const { origin, data } = event;
    
    try {
      const parsedMessage = typeof data === "string" ? JSON.parse(data) : data;
      if (parsedMessage?.type !== "devtools:client:init") return;
    } catch {
      return; 
    }

    console.debug(`[MessageTransport] Creating Connection to:`, origin);

    const isValidOrigin = 
      origin && 
      (origin.startsWith("http://") || origin.startsWith("https://")) && 
      origin !== location.origin;

    if (!isValidOrigin) {
      console.log(`[MessageTransport] Closing Connection: Invalid Origin`);
      this.disconnect();
      return;
    }

    this.#host = origin;
    window.removeEventListener("message", this.#handleParentOrigin);
  };

  #handleIncomingMessage = (event) => {
    const { origin, data } = event;
    
    if (origin !== this.#host && this.#host !== "*") return;
    if (!this.onMessage) return;

    try {
      const parsedMessage = typeof data === "string" ? JSON.parse(data) : data;
      if (parsedMessage?.type !== "devtools:client:message") return;
      
      console.debug("[MessageTransport] Receiving Incoming Command.");
      
      // Ensure the payload passed to the CDP client is an object, 
      // as expected by standard DevTools connections.
      const payload = typeof parsedMessage.data === "string" 
        ? JSON.parse(parsedMessage.data) 
        : parsedMessage.data;

      this.onMessage.call(null, payload);
    } catch {
      // Ignore malformed messages
    }
  };

  setOnMessage(onMessage) {
    this.onMessage = onMessage;
  }

  setOnDisconnect(onDisconnect) {
    this.#onDisconnect = onDisconnect;
  }

  sendRawMessage(message) {
    if (!this.#target) return;

    try {
      // The CDP client passes a stringified JSON to this method. 
      // We parse it first so it fits cleanly into the wrapper envelope.
      const messageData = typeof message === "string" ? JSON.parse(message) : message;
      const payload = JSON.stringify({ type: "devtools:server:message", data: messageData });
      
      this.#target.postMessage(payload, this.#host);
    } catch {
      this.disconnect();
    }
  }

  // Kept async to match the interface of your StubTransport
  async disconnect() {
    if (this.#onDisconnect) {
      this.#onDisconnect.call(null, "force disconnect");
    }
    
    this.#onDisconnect = null;
    this.onMessage = null;
    
    window.removeEventListener("message", this.#handleParentOrigin);
    window.removeEventListener("message", this.#handleIncomingMessage);
  }
}
