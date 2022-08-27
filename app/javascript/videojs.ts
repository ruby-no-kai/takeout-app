// @ts-ignore
import wasmBinaryPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm";
// @ts-ignore
import wasmWorkerPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js";

import { COMMIT, CACHE_BUSTER } from "./meta";

import videojs from "video.js";
import { registerIVSTech, registerIVSQualityPlugin } from "amazon-ivs-player";

const createAbsolutePath = (assetPath: string) => new URL(assetPath, document.URL).toString();

// register the tech with videojs
registerIVSTech(videojs, {
  wasmWorker: `${createAbsolutePath(wasmWorkerPath)}?v=${CACHE_BUSTER}`,
  wasmBinary: `${createAbsolutePath(wasmBinaryPath)}?v=${CACHE_BUSTER}`,
});

// register the quality plugin
registerIVSQualityPlugin(videojs);
