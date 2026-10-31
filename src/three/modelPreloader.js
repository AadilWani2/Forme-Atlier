import { useGLTF } from "@react-three/drei";

export const MODEL_PATHS = {
  mug: "/models/plain_mug.glb",
  bottle: "/models/water_bottle_simple_textures.glb",
  notebook: "/models/pbr_dark_diary.glb",
  pen: "/models/simple_pen_2_0.glb",
  keychain: "/models/keychain.glb",
};

export function preloadAllModels() {
  try {
    Object.values(MODEL_PATHS).forEach((path) => {
      useGLTF.preload(path);
    });
  } catch (err) {
    console.warn("Model preload deferred:", err);
  }
}

