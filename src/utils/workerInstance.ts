// https://github.com/mathe42/vite-plugin-comlink#vite-plugin-comlink
// https://github.com/GoogleChromeLabs/comlink#callbacks
// https://dev.to/franciscomendes10866/how-to-use-service-workers-with-react-17p2
// https://blog.logrocket.com/comlink-web-workers-match-made-in-heaven/ Treating function as data with Comlink
// worker instance
export const workerInstance = new ComlinkWorker<typeof import('../worker/worker')>(new URL('../worker/worker', import.meta.url));
