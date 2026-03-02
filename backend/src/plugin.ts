import type { FastifyPluginAsync } from "fastify";
import firstRoute from "./route.ts";

const plugin: FastifyPluginAsync = async function pluginRoutes(fastify, _opts) {
  fastify.register(firstRoute);
};

export default plugin;
