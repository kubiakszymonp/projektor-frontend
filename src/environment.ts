const prod = {
  BACKEND_HOST: window.location.protocol + "//" + window.location.host,
};

const dev = {
  BACKEND_HOST:
    window.location.protocol + "//" + window.location.hostname + ":3001",
};

export const environment = prod;
