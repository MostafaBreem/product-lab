// Wraps app.json. Pages build sets EXPO_BASE_URL=/product-lab/lab/vezeeta (served under a sub-path);
// local and artifact builds leave it unset and serve from the root.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}) },
});
