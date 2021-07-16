const CrossOriginLocalStorage = function (
  currentWindow,
  iframe,
  allowedOrigins,
  onMessage
) {
  this.allowedOrigins = allowedOrigins;

  let childWindow;
  // some browser (don't remember which one) throw exception when you try to access
  // contentWindow for the first time, it works when you do that second time
  try {
    childWindow = iframe.contentWindow;
  } catch (e) {
    childWindow = iframe.contentWindow;
  }

  currentWindow.onmessage = (event) => {
    if (!this.isAllowedOrigin(event.origin)) {
      return;
    }

    return onMessage(JSON.parse(event.data), event);
  };

  this.isAllowedOrigin = (origin) => {
    return this.allowedOrigins.includes(origin);
  };

  this.getData = (key) => {
    const messageData = {
      key: key,
      method: "get",
    };
    this.postMessage(messageData);
  };

  this.setData = (key, data) => {
    const messageData = {
      key: key,
      method: "set",
      data: data,
    };
    this.postMessage(messageData);
  };

  this.postMessage = (messageData) => {
    childWindow.postMessage(JSON.stringify(messageData), "*");
  };
};

export default CrossOriginLocalStorage;
