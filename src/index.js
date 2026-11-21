import { onRequest as apiHandler } from '../functions/api/[[path]].js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return apiHandler({ request, env, params: {} });
    }

    return env.ASSETS.fetch(request);
  }
};
