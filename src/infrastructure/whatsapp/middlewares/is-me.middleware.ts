import { createMiddleware } from "$core/decorators/command-middleware";

export const IsOnlyMeMiddleware = createMiddleware(async (socket, ctx) => {
	return !!ctx.key.fromMe;
});
