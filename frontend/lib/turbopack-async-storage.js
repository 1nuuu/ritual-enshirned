const asyncStorage = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

module.exports = {
  default: asyncStorage,
  ...asyncStorage,
};
