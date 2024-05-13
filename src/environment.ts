const prod = {
  BACKEND_HOST: window.location.protocol + "//" + window.location.host,
  SOCKET_HOST: "wss://" + window.location.host + ":81",
};

const dev = {
  BACKEND_HOST:
    window.location.protocol + "//" + window.location.hostname + ":3001",
  SOCKET_HOST: "wss://" + window.location.hostname + ":81",
};

export const environment = dev;
