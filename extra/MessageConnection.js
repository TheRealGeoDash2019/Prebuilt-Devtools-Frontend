export class MessageConnection {
  onMessage;
  onDisconnect;
  host;
  constructor() {
    console.log(`[MessageConnection] Initializing...`)
    this.onMessage = null;
    this.onDisconnect = null;
    this.host = null;
    window.addEventListener("message", this._getParentOriginHandler);
    window.addEventListener("message", (event) => {
      const { origin } = event;
      console.log(`[MessageConnection] Message from:`, origin);
      if (origin !== this.host) return;
      if (this.onMessage) {
        try {
          const _message = JSON.parse(event.data);
          if (_message.type !== "devtools:client:message") return;
          this.onMessage.call(null, _message.data);
        } catch {};
      }
    })
  }
  _getParentOriginHandler(event) {
    const { origin, data } = event;
    if (data !== JSON.stringify({ type: "devtools:client:init", data: {} })) return;
    console.log(`[MessageConnection] Creating Connection to:`, origin);
    if (!origin || (!origin?.startsWith?.("http://") && !origin?.startsWith?.("https://")) || (origin === location.origin)) {
      if (this.onDisconnect) {
        console.log(`[MessageConnection] Closing Connection: Invalid Origin`);
        this.onDisconnect.call(null, "connection failed");
      }
      this.onDisconnect = null;
      this.onMessage = null;
    };
    this.host = origin;
    window.removeEventListener("message", this._getParentOriginHandler)
  }
  setOnMessage(onMessage) {
    this.onMessage = onMessage;
  }
  setOnDisconnect(onDisconnect) {
    this.onDisconnect = onDisconnect;
  }
  sendRawMessage(message) {
    const target = (window.opener || window.parent);
    try {
      const _message = JSON.stringify({type: "devtools:server:message", data: message});
      target.postMessage(_message, this.#host);
    } catch {
      return this.disconnect();
    }
  }
  async disconnect() {
    if (this.onDisconnect) {
      this.onDisconnect.call(null, "force disconnect");
    }
    this.onDisconnect = null;
    this.onMessage = null;
  }
}
