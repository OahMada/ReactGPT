// this file exists for offload certain tasks off the application using comlink
/// <reference lib="webworker" />

export var exportFile = (func: () => void) => func();
