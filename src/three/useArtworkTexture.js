import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FONT_MAP } from "../constants/textOptions.js";

const TEXTURE_SIZE = 1024;
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

export function useArtworkTexture({
  personalText = "",
  textColor = "#292929",
  textFont = "sans",
  textSize = 64,
  textScale = 1,
  textPosition = { x: 0.5, y: 0.5 },
  textOrientation = "horizontal",
  textStyle = "none",
  textWeight = "600",
  textTransform = "none",
  textSpacing = 0,
  uploadedImage = "",
  imageScale = 1,
  imagePosition = { x: 0.5, y: 0.5 },
  imageMode = "decal",
  imageFit = "cover",
  imageOpacity = 1,
  imageBlendMode = "normal",
  imageFilter = "none",
  isCylinder = false,
}) {
  const [fontVersion, setFontVersion] = useState(0);

  // Preload web font for high accuracy
  useEffect(() => {
    if (document.fonts && document.fonts.load) {
      const fontConfig = FONT_MAP[textFont] || FONT_MAP.sans;
      document.fonts
        .load(`${textWeight || "600"} 64px ${fontConfig.family}`)
        .then(() => setFontVersion((v) => v + 1))
        .catch(() => {});
    }
  }, [textFont, textWeight]);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = texture.image;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const render = (image = null) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

      // 1. Draw Image / Artwork
      if (image) {
        ctx.save();
        ctx.globalAlpha = clamp(Number(imageOpacity), 0.05, 1.0);

        if (imageBlendMode === "multiply") {
          ctx.globalCompositeOperation = "multiply";
        } else if (imageBlendMode === "overlay") {
          ctx.globalCompositeOperation = "overlay";
        } else if (imageBlendMode === "screen") {
          ctx.globalCompositeOperation = "screen";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        if (imageFilter === "grayscale") {
          ctx.filter = "grayscale(100%)";
        } else if (imageFilter === "sepia") {
          ctx.filter = "sepia(85%) contrast(95%)";
        } else if (imageFilter === "vibrant") {
          ctx.filter = "saturate(160%) contrast(115%)";
        } else {
          ctx.filter = "none";
        }

        const normX = ((imagePosition.x % 1) + 1) % 1;
        const normY = clamp(imagePosition.y, 0.05, 0.95);
        const centerX = normX * TEXTURE_SIZE;
        const centerY = normY * TEXTURE_SIZE;

        if (imageMode === "full-wrap") {
          // Covers the full 360 wrap edge-to-edge without artificial margins or seams
          const wrapWidth = TEXTURE_SIZE;
          const wrapHeight = TEXTURE_SIZE;
          const scaleMultiplier = Math.max(0.4, Number(imageScale) || 1);

          const offsets = isCylinder ? [0, -TEXTURE_SIZE, TEXTURE_SIZE] : [0];
          offsets.forEach((offset) => {
            const cx = centerX + offset;
            ctx.save();

            if (imageFit === "contain") {
              const baseScale = Math.min(wrapWidth / image.width, wrapHeight / image.height) * scaleMultiplier;
              const w = image.width * baseScale;
              const h = image.height * baseScale;
              ctx.drawImage(image, cx - w / 2, centerY - h / 2, w, h);
            } else if (imageFit === "stretch") {
              const h = wrapHeight * scaleMultiplier;
              ctx.drawImage(image, cx - wrapWidth / 2, centerY - h / 2, wrapWidth, h);
            } else {
              // "cover" (default): fills 100% of wrap width and height cleanly without repeating cuts
              const baseScale = Math.max(wrapWidth / image.width, wrapHeight / image.height) * scaleMultiplier;
              const sW = wrapWidth / baseScale;
              const sH = wrapHeight / baseScale;

              const maxScrollY = Math.max(0, image.height - sH);
              const sy = clamp((normY - 0.5) * maxScrollY + maxScrollY / 2, 0, maxScrollY);

              const maxScrollX = Math.max(0, image.width - sW);
              const sx = maxScrollX > 0 ? clamp((image.width - sW) / 2, 0, maxScrollX) : 0;

              ctx.drawImage(
                image,
                sx,
                sy,
                Math.min(image.width - sx, sW),
                Math.min(image.height - sy, sH),
                cx - wrapWidth / 2,
                0,
                wrapWidth,
                wrapHeight
              );
            }
            ctx.restore();
          });
        } else if (imageMode === "repeat") {
          const repeatSize = clamp(180 * imageScale, 50, 400);
          const numX = Math.ceil(TEXTURE_SIZE / repeatSize) + 2;
          const numY = Math.ceil(TEXTURE_SIZE / repeatSize) + 1;

          for (let ix = -1; ix < numX; ix++) {
            for (let iy = 0; iy < numY; iy++) {
              const px = (centerX + ix * repeatSize) % TEXTURE_SIZE;
              const py = (iy * repeatSize) % TEXTURE_SIZE;
              ctx.drawImage(image, px - repeatSize / 2, py, repeatSize, repeatSize);
            }
          }
        } else {
          // Decal floating print
          const baseSize = 420 * imageScale;
          const ratio = imageFit === "contain"
            ? Math.min(baseSize / image.width, baseSize / image.height)
            : Math.max(baseSize / image.width, baseSize / image.height);
          const w = image.width * ratio;
          const h = image.height * ratio;

          const offsets = isCylinder ? [0, -TEXTURE_SIZE, TEXTURE_SIZE] : [0];
          offsets.forEach((offset) => {
            const cx = centerX + offset;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
            ctx.clip();
            ctx.drawImage(image, cx - w / 2, centerY - h / 2, w, h);
            ctx.restore();
          });
        }

        ctx.restore();
      }

      // 2. Draw Personalized Text
      if (personalText && personalText.trim()) {
        let displayText = personalText.trim();
        if (textTransform === "uppercase") displayText = displayText.toUpperCase();
        else if (textTransform === "lowercase") displayText = displayText.toLowerCase();
        else if (textTransform === "capitalize") {
          displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
        }

        const fontConfig = FONT_MAP[textFont] || FONT_MAP.sans;
        const fontSize = clamp(Number(textSize) * textScale * 1.55, 24, 320);
        const fontString = `${textWeight || "600"} ${fontSize}px ${fontConfig.family}`;

        ctx.save();
        ctx.font = fontString;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${textSpacing || 0}px`;
        }

        // Word wrap lines per line
        const rawLines = displayText.split(/\r?\n/);
        const lines = [];
        const maxLineWidth = isCylinder ? 760 : 880;

        for (const rawLine of rawLines) {
          const trimmed = rawLine.trim();
          if (!trimmed) continue;
          const words = trimmed.split(/\s+/).filter(Boolean);
          let curLine = "";
          for (const word of words) {
            const candidate = curLine ? `${curLine} ${word}` : word;
            if (ctx.measureText(candidate).width > maxLineWidth && curLine) {
              lines.push(curLine);
              curLine = word;
            } else {
              curLine = candidate;
            }
          }
          if (curLine) lines.push(curLine);
        }

        const lineHeight = fontSize * (fontConfig.lineHeightMultiplier || 1.25);

        const normX = ((textPosition.x % 1) + 1) % 1;
        const normY = clamp(textPosition.y, 0.08, 0.92);
        const centerX = normX * TEXTURE_SIZE;
        const centerY = normY * TEXTURE_SIZE;

        const offsets = isCylinder ? [0, -TEXTURE_SIZE, TEXTURE_SIZE] : [0];
        offsets.forEach((offset) => {
          const cx = centerX + offset;
          ctx.save();
          ctx.translate(cx, centerY);

          if (textOrientation === "vertical") {
            ctx.rotate(Math.PI / 2);
          }

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = fontString;
          if (ctx.letterSpacing !== undefined) {
            ctx.letterSpacing = `${textSpacing || 0}px`;
          }

          lines.forEach((lineText, index) => {
            const lineY = (index - (lines.length - 1) / 2) * lineHeight;

            // Styles
            if (textStyle === "outline") {
              ctx.save();
              ctx.lineWidth = Math.max(3, fontSize * 0.12);
              ctx.strokeStyle =
                textColor === "#FFFFFF" || textColor.toLowerCase() === "#fff"
                  ? "#111111"
                  : "#FFFFFF";
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              ctx.strokeText(lineText, 0, lineY);
              ctx.restore();
            } else if (textStyle === "shadow") {
              ctx.save();
              ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
              ctx.shadowBlur = Math.max(4, fontSize * 0.12);
              ctx.shadowOffsetX = Math.max(2, fontSize * 0.04);
              ctx.shadowOffsetY = Math.max(2, fontSize * 0.05);
              ctx.fillStyle = textColor;
              ctx.fillText(lineText, 0, lineY);
              ctx.restore();
            } else if (textStyle === "glow") {
              ctx.save();
              ctx.shadowColor = textColor;
              ctx.shadowBlur = Math.max(8, fontSize * 0.25);
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.fillStyle = textColor;
              ctx.fillText(lineText, 0, lineY);
              ctx.restore();
            } else if (textStyle === "embossed") {
              ctx.save();
              ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
              ctx.shadowBlur = 1;
              ctx.shadowOffsetX = 1;
              ctx.shadowOffsetY = 1;
              ctx.fillStyle = textColor;
              ctx.fillText(lineText, 0, lineY);
              ctx.restore();
            }

            // Fill base text
            ctx.fillStyle = textColor;
            ctx.fillText(lineText, 0, lineY);
          });

          ctx.restore();
        });

        ctx.restore();
      }

      texture.needsUpdate = true;
    };

    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => render(img);
      img.onerror = () => render();
      img.src = uploadedImage;
    } else {
      render();
    }

    return () => {
      cancelled = true;
    };
  }, [
    texture,
    personalText,
    textColor,
    textFont,
    textSize,
    textScale,
    textPosition,
    textOrientation,
    textStyle,
    textWeight,
    textTransform,
    textSpacing,
    fontVersion,
    uploadedImage,
    imageScale,
    imagePosition,
    imageMode,
    imageFit,
    imageOpacity,
    imageBlendMode,
    imageFilter,
    isCylinder,
  ]);

  return texture;
}

