/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function firstRoute(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return { hello: "plugin" };
  });
}

export default firstRoute;

export const foo = 9;
