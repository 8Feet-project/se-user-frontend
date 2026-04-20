import { createCorsHeaders } from './cors.ts';

export function jsonResponse(data: unknown, status = 200, origin?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...createCorsHeaders(origin),
    },
  });
}

export function errorResponse(message: string, status = 400, origin?: string) {
  return jsonResponse(
    {
      error: message,
    },
    status,
    origin
  );
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
