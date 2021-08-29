// @ts-ignore
import wasmBinaryPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm";
// @ts-ignore
import wasmWorkerPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js";

import videojs from "video.js";
import { registerIVSTech, registerIVSQualityPlugin } from "amazon-ivs-player";

import "video.js/dist/video-js.css";

const createAbsolutePath = (assetPath: string) =>
  new URL(assetPath, document.URL).toString();

// register the tech with videojs
registerIVSTech(videojs, {
  wasmWorker: createAbsolutePath(wasmWorkerPath),
  wasmBinary: createAbsolutePath(wasmBinaryPath),
});

// register the quality plugin
registerIVSQualityPlugin(videojs);
