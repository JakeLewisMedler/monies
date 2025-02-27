const axios = require("axios");

export default (ctx, inject) => {
  const instance = axios.create({
    baseURL: ctx.$config.API_URL
  });
  instance.interceptors.request.use(async (config) => {
    let token = await ctx.$firebase.getIdToken();
    let value = "Bearer " + token;
    config.headers["Authorization"] = value;

    return config;
  });

  instance.interceptors.response.use((response) => {
    return response.data;
  });

  inject("axios", instance);
};
