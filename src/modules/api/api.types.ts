export type ResponseGuard<TResponse> = (body: unknown) => body is TResponse;
