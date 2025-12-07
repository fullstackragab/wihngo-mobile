import "dotenv/config";

export default ({ config }) => {
  const ENV = process.env.APP_MODE || "development";

  return {
    ...config,
    extra: {
      apiUrl: process.env.API_URL,
      appMode: ENV,
    },
  };
};
