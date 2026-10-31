import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FONT_MAP } from "../constants/textOptions.js";

const TEXTURE_SIZE = 1024;
const WALL_TOP_Y = 21;
const WALL_BOTTOM_Y = 510;
const WALL_HEIGHT = WALL_BOTTOM_Y - WALL_TOP_Y; // 489px: 100% full outside cylinder height

const finishSettings = {
  glossy: { roughness: 0.12, metalness: 0, transparent: false },
  matte: { roughness: 0.88, metalness: 0, transparent: false },
  satin: { roughness: 0.42, metalness: 0, transparent: false },
  metallic: { roughness: 0.24, metalness: 0.65, transparent: false },
  glass: {
    roughness: 0.08,
    metalness: 0.05,
    transmission: 0.88,
    transparent: true,
    opacity: 0.72,
    ior: 1.5,
  },
  frosted: {
    roughness: 0.45,
    metalness: 0.05,
    transmission: 0.65,
    transparent: true,
    opacity: 0.82,
    ior: 1.5,
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Map normalized x (0..1 wrapping around 360 deg) to canvas X (0..1024)
// x = 0.5 (Front facing camera) -> canvasX = 992 (U ~ 0.9687)
// x = 0.75 (Right) -> canvasX = 224
// x = 1.0 / 0.0 (Back at handle) -> canvasX = 480
// x = 0.25 (Left) -> canvasX = 736
function getCanvasX(normX) {
  const norm = ((normX % 1) + 1) % 1;
  return (TEXTURE_SIZE * norm + 480) % TEXTURE_SIZE;
}

function getCanvasY(normY) {
  return 40 + clamp(normY, 0.08, 0.92) * 430;
}

function drawText(context, {
  personalText, textColor, textSize, textScale, textPosition,
  textOrientation = "horizontal",
  textFont = "sans", textStyle = "none", textWeight = "600",
  textTransform = "none", textSpacing = 0,
}) {
  if (!personalText.trim()) return;

  let displayText = personalText.trim();
  if (textTransform === "uppercase") displayText = displayText.toUpperCase();
  else if (textTransform === "lowercase") displayText = displayText.toLowerCase();

  const fontSize = clamp(Number(textSize) * textScale * 1.55, 24, 320);
  const centerX = getCanvasX(textPosition.x);
  const centerY = getCanvasY(textPosition.y);
  const maxWidth = 760;

  const fontConfig = FONT_MAP[textFont] || FONT_MAP.sans;
  const fontString = `${textWeight} ${fontSize}px ${fontConfig.family}`;

  context.save();
  context.font = fontString;
  if (context.letterSpacing !== undefined) {
    context.letterSpacing = `${textSpacing}px`;
  }

  const rawLines = displayText.split(/\r?\n/);
  const lines = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    const words = trimmed.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }

  const lineHeight = fontSize * (fontConfig.lineHeightMultiplier || 1.25);

  // Draw at [centerX, centerX - 1024, centerX + 1024] to wrap seamlessly across the 360° seam
  [0, -TEXTURE_SIZE, TEXTURE_SIZE].forEach((offset) => {
    const cx = centerX + offset;
    context.save();
    context.translate(cx, centerY);
    if (textOrientation === "vertical") {
      context.rotate(Math.PI / 2);
    }
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = fontString;
    if (context.letterSpacing !== undefined) {
      context.letterSpacing = `${textSpacing}px`;
    }

    lines.forEach((text, index) => {
      const lineY = (index - (lines.length - 1) / 2) * lineHeight;

      // Text styling effects
      if (textStyle === "outline") {
        context.save();
        context.lineWidth = Math.max(3, fontSize * 0.12);
        context.strokeStyle =
          textColor === "#FFFFFF" || textColor.toLowerCase() === "#fff"
            ? "#111111"
            : "#FFFFFF";
        context.lineJoin = "round";
        context.miterLimit = 2;
        context.strokeText(text, 0, lineY);
        context.restore();
      } else if (textStyle === "shadow") {
        context.save();
        context.shadowColor = "rgba(0, 0, 0, 0.45)";
        context.shadowBlur = Math.max(4, fontSize * 0.1);
        context.shadowOffsetX = Math.max(2, fontSize * 0.04);
        context.shadowOffsetY = Math.max(2, fontSize * 0.05);
        context.fillStyle = textColor;
        context.fillText(text, 0, lineY);
        context.restore();
      } else if (textStyle === "glow") {
        context.save();
        context.shadowColor = textColor;
        context.shadowBlur = Math.max(8, fontSize * 0.25);
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.fillStyle = textColor;
        context.fillText(text, 0, lineY);
        context.restore();
      } else if (textStyle === "embossed") {
        context.save();
        context.shadowColor = "rgba(255, 255, 255, 0.6)";
        context.shadowBlur = 1;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.fillStyle = textColor;
        context.fillText(text, 0, lineY);
        context.restore();
      }

      context.fillStyle = textColor;
      context.fillText(text, 0, lineY);
    });

    context.restore();
  });

  context.restore();
}

function MugModel({
  mugColor, personalText, textColor, textSize, textScale, textPosition,
  textOrientation = "horizontal",
  textFont = "sans", textStyle = "none", textWeight = "600",
  textTransform = "none", textSpacing = 0,
  uploadedImage, imageScale, imagePosition, imageMode = "full-wrap",
  imageFit = "cover", imageOpacity = 1, imageBlendMode = "normal",
  imageFilter = "none", finish,
  onSelectDesign, onTextPositionChange, onImagePositionChange,
  onHoverChange, onDragChange,
}) {
  const { scene } = useGLTF("/models/plain_mug.glb");
  const isDraggingRef = useRef(false);
  const [fontVersion, setFontVersion] = useState(0);

  useEffect(() => {
    if (document.fonts && document.fonts.load) {
      const fontConfig = FONT_MAP[textFont] || FONT_MAP.sans;
      document.fonts
        .load(`${textWeight} 64px ${fontConfig.family}`)
        .then(() => setFontVersion((v) => v + 1))
        .catch(() => {});
    }
  }, [textFont, textWeight]);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    clone.traverse((object) => {
      if (!object.isMesh) return;

      // Convert to non-indexed geometry so every triangle has its own independent 3 vertices.
      // This completely eliminates shared-vertex interpolation, seams, and bleeding at the rim and handle!
      const nonIndexedGeom = object.geometry.toNonIndexed();
      const pos = nonIndexedGeom.attributes.position;
      if (!pos) return;

      const numTris = pos.count / 3;

      // Dedicated clean solid-color zone in canvas texture: (u: 0.5, v: 0.25) => pixel (512, 768)
      // which is in the solid mugColor region (cy: 510..1024)
      const CLEAN_U = 0.5;
      const CLEAN_V = 0.25;

      const uv = nonIndexedGeom.attributes.uv;
      let uvs;
      if (uv && uv.array) {
        uvs = uv.array.slice();
      } else {
        // Automatically generate cylindrical projection UVs for meshes without UV coordinates
        nonIndexedGeom.computeBoundingBox();
        const bbox = nonIndexedGeom.boundingBox || new THREE.Box3();
        const minY = bbox.min.y;
        const maxY = bbox.max.y;
        const height = maxY - minY || 1;
        const centerX = (bbox.min.x + bbox.max.x) / 2;
        const centerZ = (bbox.min.z + bbox.max.z) / 2;

        uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) - centerX;
          const y = pos.getY(i) - minY;
          const z = pos.getZ(i) - centerZ;
          const angle = Math.atan2(z, x); // -PI..PI
          const u = (angle + Math.PI) / (2 * Math.PI);
          const v = 1 - (y / height);
          uvs[i * 2] = u;
          uvs[i * 2 + 1] = v;
        }
      }

      // Invert U coordinates so that text and image prints read naturally from left-to-right on outer mug wall
      for (let i = 0; i < pos.count; i++) {
        uvs[i * 2] = 1.0 - uvs[i * 2];
      }

      for (let t = 0; t < numTris; t++) {
        const idx0 = t * 3;
        const idx1 = t * 3 + 1;
        const idx2 = t * 3 + 2;

        const v0 = new THREE.Vector3(pos.getX(idx0), pos.getY(idx0), pos.getZ(idx0)).applyMatrix4(object.matrixWorld);
        const v1 = new THREE.Vector3(pos.getX(idx1), pos.getY(idx1), pos.getZ(idx1)).applyMatrix4(object.matrixWorld);
        const v2 = new THREE.Vector3(pos.getX(idx2), pos.getY(idx2), pos.getZ(idx2)).applyMatrix4(object.matrixWorld);

        const midY = (v0.y + v1.y + v2.y) / 3;
        const midX = (v0.x + v1.x + v2.x) / 3;
        const midZ = (v0.z + v1.z + v2.z) / 3;
        const midR = Math.hypot(midX, midZ);

        const e1 = new THREE.Vector3().subVectors(v1, v0);
        const e2 = new THREE.Vector3().subVectors(v2, v0);
        const fn = new THREE.Vector3().crossVectors(e1, e2).normalize();

        const rad = new THREE.Vector2(midX, midZ).normalize();
        const dot = rad.x * fn.x + rad.y * fn.y;

        // 1. Inside cup triangles: inner wall (dot < 0.1, r < 0.058) or inside floor (fn.y > 0.6, y < 0.035)
        const isInside = (midR < 0.058 && midY > 0.007 && (dot < 0.1 || fn.y > 0.6));

        // 2. Outside bottom circular base
        const isBottom = (midY < 0.006 && fn.y < -0.5);

        // 3. Crest of the top rim lip that curves into the cup interior
        const isRim = (midY >= 0.149 || (fn.y > 0.35 && midY > 0.140));

        // Only remap inside cup, floor, top rim lip, and bottom base to clean solid ceramic.
        // The outer cup wall AND the handle keep their UVs so the photo fully covers both!
        if (isInside || isBottom || isRim) {
          uvs[idx0 * 2] = CLEAN_U;
          uvs[idx0 * 2 + 1] = CLEAN_V;
          uvs[idx1 * 2] = CLEAN_U;
          uvs[idx1 * 2 + 1] = CLEAN_V;
          uvs[idx2 * 2] = CLEAN_U;
          uvs[idx2 * 2 + 1] = CLEAN_V;
        }
      }

      nonIndexedGeom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
      nonIndexedGeom.attributes.uv.needsUpdate = true;

      object.geometry = nonIndexedGeom;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    });

    return clone;
  }, [scene]);

  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasTexture.image;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const render = (image = null) => {
      if (cancelled) return;

      context.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
      context.fillStyle = mugColor;
      context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

      if (image) {
        context.save();
        context.globalAlpha = clamp(Number(imageOpacity), 0.05, 1.0);

        if (imageBlendMode === "multiply") {
          context.globalCompositeOperation = "multiply";
        } else if (imageBlendMode === "overlay") {
          context.globalCompositeOperation = "overlay";
        } else if (imageBlendMode === "screen") {
          context.globalCompositeOperation = "screen";
        } else {
          context.globalCompositeOperation = "source-over";
        }

        if (imageFilter === "grayscale") {
          context.filter = "grayscale(100%)";
        } else if (imageFilter === "sepia") {
          context.filter = "sepia(85%) contrast(95%)";
        } else if (imageFilter === "vibrant") {
          context.filter = "saturate(160%) contrast(115%)";
        } else {
          context.filter = "none";
        }

        if (imageMode === "full-wrap") {
          // Full 360° continuous wrap covering 100% of the outside cup from rim to base
          const normImageX = ((imagePosition.x % 1) + 1) % 1;
          const centerX = getCanvasX(normImageX);
          const wrapTop = WALL_TOP_Y; // 0 (top rim)
          const wrapHeight = WALL_HEIGHT; // 510 (full outer wall height)
          const wrapWidth = TEXTURE_SIZE; // 1024

          [0, -TEXTURE_SIZE, TEXTURE_SIZE].forEach((offset) => {
            const cx = centerX + offset;
            context.save();

            if (imageFit === "fit") {
              const baseScale = Math.min(wrapWidth / image.width, wrapHeight / image.height) * (imageScale || 1);
              const w = image.width * baseScale;
              const h = image.height * baseScale;
              const cy = getCanvasY(imagePosition.y);
              context.drawImage(image, cx - w / 2, cy - h / 2, w, h);
            } else if (imageFit === "stretch") {
              const h = wrapHeight * (imageScale || 1);
              const cy = getCanvasY(imagePosition.y);
              context.drawImage(image, cx - wrapWidth / 2, cy - h / 2, wrapWidth, h);
            } else {
              // "cover" (default): fills the entire outside of the cup without gaps
              const baseScale = Math.max(wrapWidth / image.width, wrapHeight / image.height) * (imageScale || 1);
              const sW = wrapWidth / baseScale;
              const sH = wrapHeight / baseScale;

              const maxScrollY = Math.max(0, image.height - sH);
              const normY = clamp(imagePosition.y, 0.05, 0.95);
              const sy = clamp((normY - 0.5) * maxScrollY + maxScrollY / 2, 0, maxScrollY);

              const maxScrollX = Math.max(0, image.width - sW);
              const sx = maxScrollX > 0 ? clamp((image.width - sW) / 2, 0, maxScrollX) : 0;

              context.drawImage(
                image,
                sx,
                sy,
                Math.min(image.width - sx, sW),
                Math.min(image.height - sy, sH),
                cx - wrapWidth / 2,
                wrapTop,
                wrapWidth,
                wrapHeight
              );
            }

            context.restore();
          });
        } else if (imageMode === "repeat") {
          // Pattern repeat around mug outer wall
          const normImageX = ((imagePosition.x % 1) + 1) % 1;
          const centerX = getCanvasX(normImageX);
          const repeatSize = clamp(160 * imageScale, 60, 360);
          const wrapTop = WALL_TOP_Y;
          const wrapHeight = WALL_HEIGHT;
          const numX = Math.ceil(TEXTURE_SIZE / repeatSize) + 2;
          const numY = Math.ceil(wrapHeight / repeatSize);

          for (let ix = -1; ix < numX; ix++) {
            for (let iy = 0; iy < numY; iy++) {
              const px = (centerX + ix * repeatSize) % TEXTURE_SIZE;
              const py = wrapTop + iy * repeatSize;
              context.save();
              context.drawImage(image, px - repeatSize / 2, py, repeatSize, repeatSize);
              context.restore();
            }
          }
        } else {
          // "decal": draggable floating patch on the outer mug wall
          const normImageX = ((imagePosition.x % 1) + 1) % 1;
          const centerX = getCanvasX(normImageX);
          const centerY = getCanvasY(imagePosition.y);
          const baseSize = 340 * imageScale;
          const ratio = Math.min(baseSize / image.width, baseSize / image.height);
          const width = image.width * ratio;
          const height = image.height * ratio;

          [0, -TEXTURE_SIZE, TEXTURE_SIZE].forEach((offset) => {
            const cx = centerX + offset;
            context.save();
            context.drawImage(image, cx - width / 2, centerY - height / 2, width, height);
            context.restore();
          });
        }

        context.restore();
      }

      drawText(context, {
        personalText, textColor, textSize, textScale, textPosition,
        textOrientation,
        textFont, textStyle, textWeight, textTransform, textSpacing,
      });

      // Guarantee the inside of the cup, top rim lip, and handle remain 100% pure solid mugColor:
      context.save();
      context.globalAlpha = 1.0;
      context.globalCompositeOperation = "source-over";
      context.filter = "none";
      context.fillStyle = mugColor;
      context.fillRect(0, 0, TEXTURE_SIZE, WALL_TOP_Y); // Top rim lip clean solid mugColor
      context.fillRect(0, WALL_BOTTOM_Y, TEXTURE_SIZE, TEXTURE_SIZE - WALL_BOTTOM_Y); // Inside wall, floor
      context.restore();

      canvasTexture.needsUpdate = true;
    };

    if (!uploadedImage) {
      render();
      return () => { cancelled = true; };
    }

    const image = new Image();
    image.onload = () => render(image);
    image.onerror = () => render();
    image.src = uploadedImage;
    render();

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [
    canvasTexture, mugColor, personalText, textColor, textSize, textScale,
    textPosition, textOrientation, textFont, textStyle, textWeight, textTransform, textSpacing,
    fontVersion, uploadedImage, imageScale, imagePosition,
    imageMode, imageFit, imageOpacity, imageBlendMode, imageFilter,
  ]);

  useEffect(() => {
    const settings = finishSettings[finish] ?? finishSettings.glossy;
    const isGlass = finish === "glass" || finish === "frosted";

    model.traverse((object) => {
      if (!object.isMesh) return;
      let material = object.material;
      if (isGlass && !material.isMeshPhysicalMaterial) {
        material = new THREE.MeshPhysicalMaterial();
        object.material = material;
      } else if (!isGlass && material.isMeshPhysicalMaterial) {
        material = new THREE.MeshStandardMaterial();
        object.material = material;
      }

      material.map = canvasTexture;
      material.color.set("#ffffff");
      material.roughness = settings.roughness;
      material.metalness = settings.metalness;
      material.transparent = Boolean(settings.transparent);
      material.opacity = settings.opacity ?? 1.0;
      if (settings.transmission !== undefined) {
        material.transmission = settings.transmission;
        material.ior = settings.ior ?? 1.5;
        material.thickness = 0.5;
      }
      material.needsUpdate = true;
    });
  }, [model, canvasTexture, finish]);

  // Compute text hitbox bounds in UV space for direct 3D grabbing
  const textHitbox = useMemo(() => {
    if (!personalText || !personalText.trim()) return null;
    let displayText = personalText.trim();
    if (textTransform === "uppercase") displayText = displayText.toUpperCase();
    else if (textTransform === "lowercase") displayText = displayText.toLowerCase();
    else if (textTransform === "capitalize") {
      displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const fontConfig = FONT_MAP[textFont] || FONT_MAP.sans;
    const fontSize = clamp(Number(textSize) * textScale * 1.55, 24, 320);

    // Multi-line wrap calculation matching canvas
    const rawLines = displayText.split(/\r?\n/);
    const maxLineWidth = 760;
    const avgCharWidth = fontSize * 0.58 + (Number(textSpacing) || 0);
    let lineCount = 0;
    let maxLen = 0;

    for (const rawLine of rawLines) {
      const words = rawLine.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;
      lineCount++;
      let curLen = 0;
      for (const word of words) {
        const wLen = word.length * avgCharWidth;
        if (curLen + wLen > maxLineWidth && curLen > 0) {
          lineCount++;
          curLen = wLen;
        } else {
          curLen += wLen + avgCharWidth;
        }
        maxLen = Math.max(maxLen, curLen);
      }
    }
    lineCount = Math.max(1, lineCount);

    const lineHeight = fontSize * (fontConfig.lineHeightMultiplier || 1.25);
    const totalHeight = lineCount * lineHeight;
    const estWidth = Math.min(Math.max(maxLen, 120) + 90, 840);
    const estHeight = totalHeight + 60;

    const isVert = textOrientation === "vertical";
    const boxW = isVert ? estHeight : estWidth;
    const boxH = isVert ? estWidth : estHeight;

    const centerX = getCanvasX(textPosition.x);
    const centerY = getCanvasY(textPosition.y);
    const textU = centerX / TEXTURE_SIZE;
    const textV = 1 - centerY / TEXTURE_SIZE;

    const halfU = boxW / 2 / TEXTURE_SIZE;
    const halfV = boxH / 2 / TEXTURE_SIZE;

    return { u: textU, v: textV, halfU, halfV };
  }, [
    personalText,
    textPosition,
    textOrientation,
    textSize,
    textScale,
    textTransform,
    textSpacing,
    textFont,
  ]);

  // Compute image hitbox bounds in UV space for direct 3D grabbing
  const imageHitbox = useMemo(() => {
    if (!uploadedImage) return null;
    if (imageMode === "full-wrap") {
      return { u: 0.5, v: 0.5, halfU: 0.5, halfV: 0.5 };
    }
    const centerX = getCanvasX(imagePosition.x);
    const centerY = getCanvasY(imagePosition.y);
    const imageU = centerX / TEXTURE_SIZE;
    const imageV = 1 - centerY / TEXTURE_SIZE;

    const baseSize = 420 * imageScale + 80;
    const halfU = baseSize / 2 / TEXTURE_SIZE;
    const halfV = baseSize / 2 / TEXTURE_SIZE;

    return { u: imageU, v: imageV, halfU, halfV };
  }, [uploadedImage, imagePosition, imageScale, imageMode]);

  const checkHit = useCallback((uv, hitbox) => {
    if (!uv || !hitbox) return false;
    let diffU = Math.abs(uv.x - hitbox.u);
    if (diffU > 0.5) diffU = 1 - diffU;
    const diffV = Math.abs(uv.y - hitbox.v);
    return diffU <= hitbox.halfU && diffV <= hitbox.halfV;
  }, []);

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) return;
    const hitText = checkHit(e.uv, textHitbox);
    const hitImage = !hitText && checkHit(e.uv, imageHitbox);

    if (hitText || hitImage) {
      document.body.style.cursor = "grab";
      onHoverChange(true);
    } else {
      document.body.style.cursor = "";
      onHoverChange(false);
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      document.body.style.cursor = "";
      onHoverChange(false);
    }
  };

  const handlePointerDown = (e) => {
    const hitText = checkHit(e.uv, textHitbox);
    const hitImage = !hitText && checkHit(e.uv, imageHitbox);

    if (!hitText && !hitImage) return;

    e.stopPropagation();
    const target = hitText ? "text" : "image";
    onSelectDesign(target);

    isDraggingRef.current = true;
    onDragChange(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = target === "text" ? { ...textPosition } : { ...imagePosition };

    const onMove = (evt) => {
      evt.preventDefault();
      const deltaPxX = evt.clientX - startX;
      const deltaPxY = evt.clientY - startY;

      // Sensitivity: ~400px of mouse travel moves one full 360-degree sweep around the mug
      const deltaX = deltaPxX / 400;
      const deltaY = deltaPxY / 380;

      const newPos = {
        x: ((startPos.x + deltaX) % 1 + 1) % 1,
        y: clamp(startPos.y + deltaY, 0.08, 0.92),
      };

      if (target === "text") {
        onTextPositionChange(newPos);
      } else {
        onImagePositionChange(newPos);
      }
    };

    const onUp = (evt) => {
      evt.preventDefault();
      isDraggingRef.current = false;
      onDragChange(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <Center position={[0, -0.01, 0]}>
      <primitive
        object={model}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      />
    </Center>
  );
}

export default function MugViewer({
  mugColor = "#F1EBDD", personalText = "", textColor = "#292929",
  textSize = 64, textScale = 1, textPosition = { x: 0.5, y: 0.5 },
  textOrientation = "horizontal",
  textFont = "sans", textStyle = "none", textWeight = "600",
  textTransform = "none", textSpacing = 0,
  uploadedImage = "", imageScale = 1, imagePosition = { x: 0.5, y: 0.5 },
  imageMode = "full-wrap", imageFit = "cover", imageOpacity = 1,
  imageBlendMode = "normal", imageFilter = "none",
  finish = "glossy", onSelectDesign = () => {},
  onTextPositionChange = () => {},
  onImagePositionChange = () => {},
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative h-full min-h-0 w-full select-none">
      <Canvas
        camera={{ position: [0, 0.02, 0.49], fov: 36 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.8} />
        <MugModel
          mugColor={mugColor}
          personalText={personalText}
          textColor={textColor}
          textSize={textSize}
          textScale={textScale}
          textPosition={textPosition}
          textOrientation={textOrientation}
          textFont={textFont}
          textStyle={textStyle}
          textWeight={textWeight}
          textTransform={textTransform}
          textSpacing={textSpacing}
          uploadedImage={uploadedImage}
          imageScale={imageScale}
          imagePosition={imagePosition}
          imageMode={imageMode}
          imageFit={imageFit}
          imageOpacity={imageOpacity}
          imageBlendMode={imageBlendMode}
          imageFilter={imageFilter}
          finish={finish}
          onSelectDesign={onSelectDesign}
          onTextPositionChange={onTextPositionChange}
          onImagePositionChange={onImagePositionChange}
          onHoverChange={setIsHovering}
          onDragChange={setIsDragging}
        />
        <OrbitControls
          enabled={!isDragging && !isHovering}
          enablePan={false}
          enableZoom
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.8}
          minDistance={0.24}
          maxDistance={0.75}
          minPolarAngle={0.4}
          maxPolarAngle={Math.PI / 2 + 0.15}
          target={[0, -0.01, 0]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/plain_mug.glb");
