/** A Turnstile token belongs to one request, including an unsuccessful request. */
export function createVerificationQueue() {
  let previous: Promise<unknown> = Promise.resolve();

  return function verify<T>(
    getToken: () => Promise<string>,
    request: (token: string) => Promise<T>,
    reset: () => void,
  ): Promise<T> {
    const next = previous.then(async () => {
      const token = await getToken();
      try {
        return await request(token);
      } finally {
        // Reset before the next caller can ask for a token. Acquisition errors
        // stay visible until the visitor retries instead of restarting a loop.
        reset();
      }
    });
    previous = next.catch(() => undefined);
    return next;
  };
}
