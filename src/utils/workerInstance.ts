// worker instance
export const workerInstance = new ComlinkWorker<typeof import('../worker/worker')>(new URL('../worker/worker', import.meta.url));
