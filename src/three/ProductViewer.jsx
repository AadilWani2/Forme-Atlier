import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  OrbitControls,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useArtworkTexture } from "./useArtworkTexture";
import { MODEL_PATHS } from "./modelPreloader";

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const finishSettings = {
  glossy: { roughness: 0.14, metalness: 0.05 },
  matte: { roughness: 0.88, metalness: 0.02 },
  satin: { roughness: 0.44, metalness: 0.15 },
  metallic: { roughness: 0.22, metalness: 0.78 },
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

import { FONT_MAP } from "../constants/textOptions.js";

const MODEL_CONFIG = {
  "custom-bottle": {
    path: MODEL_PATHS.bottle,
    rotation: [0, 0, 0],
    isCylinder: true,
    cylinderRadius: 0.3562,
    cylinderHeight: 1.56,
    centerOffset: [0, -0.32, 0],
    tintNames: [
      "base_base",
      "base.001",
      "cap_base",
      "handle_material",
      "top_material007",
    ],
  },
  "custom-pen": {
    path: MODEL_PATHS.pen,
    rotation: [0, 0, 0],
    isCylinder: true,
    cylinderRadius: 0.0975,
    cylinderHeight: 1.45,
    centerOffset: [0.0277, -0.10, 0],
    tintNames: ["object_2", "object_0", "none"],
  },
  "custom-notebook": {
    path: MODEL_PATHS.notebook,
    rotation: [1.2000000476837158, 0, 0],
    isCylinder: false,
    planeWidth: 1.22,
    planeHeight: 2.10,
    planePosition: [-0.05, 0, 0.055],
    planeRotation: [0, 0, 0],
    tintNames: ["object_20", "object_28", "object_24"],
  },
  "custom-keychain": {
    path: MODEL_PATHS.keychain,
    rotation: [0, -Math.PI / 2, 0],
    isCylinder: false,
    planeWidth: 0.86,
    planeHeight: 1.55,
    planePosition: [0, -0.335, 0.122],
    planeRotation: [0, 0, 0],
    tintNames: ["polysurface9", "main"],
  },
};

function GLBProductModel({
  productId,
  color,
  finish,
  texture,
  personalText,
  textFont,
  textPosition,
  textOrientation = "horizontal",
  textSize,
  textScale,
  textSpacing,
  textTransform,
  uploadedImage,
  imagePosition,
  imageScale,
  imageMode,
  onSelectDesign,
  onTextPositionChange,
  onImagePositionChange,
  onHoverChange,
  onDragChange,
}) {
  const config = MODEL_CONFIG[productId];
  const { scene } = useGLTF(config.path);
  const isDraggingRef = useRef(false);

  const { normalizedModel, matchedMats } = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    const targetNames = config.tintNames.map((name) => name.toLowerCase());
    const mats = [];

    clone.traverse((object) => {
      if (!object.isMesh) return;
      const objectName = (object.name || "").toLowerCase();
      const originalMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const updatedMaterials = originalMaterials.map((origMat) => {
        const mat = origMat.clone();
        const matName = (mat.name || "").toLowerCase();
        const isTintTarget = targetNames.some(
          (name) => name && (objectName.includes(name) || matName.includes(name))
        );

        if (isTintTarget) {
          mat.map = null;
          mat.needsUpdate = true;
          mats.push(mat);
        } else if (productId === "custom-notebook") {
          mat.map = null;
          if (objectName.includes("object_7") || objectName.includes("object_30")) {
            // Antique brass lock & key
            mat.color = new THREE.Color("#C8A858");
            mat.metalness = 0.85;
            mat.roughness = 0.28;
          } else if (objectName.includes("object_26")) {
            // Authentic creamy book page block
            mat.color = new THREE.Color("#F4EEDD");
            mat.roughness = 0.95;
            mat.metalness = 0.0;
          } else if (objectName.includes("object_22")) {
            // Luxury burgundy bookmark ribbon
            mat.color = new THREE.Color("#8A252C");
            mat.roughness = 0.6;
            mat.metalness = 0.05;
          }
          mat.needsUpdate = true;
        }
        return mat;
      });

      object.material = Array.isArray(object.material)
        ? updatedMaterials
        : updatedMaterials[0];
      object.castShadow = true;
      object.receiveShadow = true;
    });

    const oriented = new THREE.Group();
    oriented.rotation.set(...config.rotation);
    oriented.add(clone);
    oriented.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(oriented);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.4 / maxDimension;

    oriented.scale.setScalar(scale);
    oriented.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return { normalizedModel: oriented, matchedMats: mats };
  }, [scene, config, productId]);

  // Fast, smooth material parameter updates without re-cloning scene geometry
  useEffect(() => {
    const settings = finishSettings[finish] || finishSettings.glossy;
    matchedMats.forEach((material) => {
      material.map = null;
      material.color = new THREE.Color(color);
      material.roughness = settings.roughness;
      material.metalness = settings.metalness;
      if (settings.transmission !== undefined) {
        material.transmission = settings.transmission;
        material.transparent = Boolean(settings.transparent);
        material.opacity = settings.opacity || 0.8;
      }
      material.needsUpdate = true;
    });
  }, [matchedMats, color, finish]);

  // Compute text hitbox bounds in UV space for direct 3D dragging
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
    const words = displayText.split(/\s+/);
    const maxLineWidth = config.isCylinder ? 760 : 880;
    const avgCharWidth = fontSize * 0.58 + (Number(textSpacing) || 0);
    let lineCount = 1;
    let curLen = 0;
    let maxLen = 0;

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

    const lineHeight = fontSize * (fontConfig.lineHeightMultiplier || 1.25);
    const totalHeight = lineCount * lineHeight;
    const estWidth = Math.min(Math.max(maxLen, 120) + 90, 960);
    const estHeight = totalHeight + 60;

    const isVert = textOrientation === "vertical";
    const boxWidth = isVert ? estHeight : estWidth;
    const boxHeight = isVert ? estWidth : estHeight;

    const u = ((textPosition.x % 1) + 1) % 1;
    const v = 1 - textPosition.y;

    const halfU = boxWidth / 2 / 1024;
    const halfV = boxHeight / 2 / 1024;

    return { u, v, halfU, halfV };
  }, [
    personalText,
    textPosition,
    textOrientation,
    textSize,
    textScale,
    textTransform,
    textSpacing,
    textFont,
    config.isCylinder,
  ]);

  // Compute image hitbox bounds in UV space for direct 3D dragging
  const imageHitbox = useMemo(() => {
    if (!uploadedImage) return null;
    if (imageMode === "full-wrap") {
      // In 360 wrap mode, dragging directly on the cylinder rotates the wrap (X) or frames vertically (Y)
      return { u: 0.5, v: 0.5, halfU: 0.5, halfV: 0.5 };
    }
    const u = ((imagePosition.x % 1) + 1) % 1;
    const v = 1 - imagePosition.y;

    const baseSize = 460 * imageScale + 80;
    const halfU = baseSize / 2 / 1024;
    const halfV = baseSize / 2 / 1024;

    return { u, v, halfU, halfV };
  }, [uploadedImage, imagePosition, imageScale, imageMode]);

  const checkHit = useCallback(
    (uv, hitbox) => {
      if (!uv || !hitbox) return false;
      let diffU = Math.abs(uv.x - hitbox.u);
      if (config.isCylinder && diffU > 0.5) diffU = 1 - diffU;
      const diffV = Math.abs(uv.y - hitbox.v);
      return diffU <= hitbox.halfU && diffV <= hitbox.halfV;
    },
    [config.isCylinder]
  );

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

      const sensitivityX = config.isCylinder ? 380 : 320;
      const sensitivityY = config.isCylinder ? 360 : 320;

      const deltaX = deltaPxX / sensitivityX;
      const deltaY = deltaPxY / sensitivityY;

      const newPos = {
        x: config.isCylinder
          ? ((startPos.x + deltaX) % 1 + 1) % 1
          : Math.min(0.92, Math.max(0.08, startPos.x + deltaX)),
        y: Math.min(0.92, Math.max(0.08, startPos.y + deltaY)),
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
    <group>
      <primitive object={normalizedModel} />

      {/* Accurate artwork projection: curved cylinder for cylindrical objects, flush plane for flat surfaces */}
      {config.isCylinder ? (
        <mesh
          position={config.centerOffset}
          rotation={[0, Math.PI, 0]}
          renderOrder={2}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
        >
          <cylinderGeometry
            args={[
              config.cylinderRadius,
              config.cylinderRadius,
              config.cylinderHeight,
              64,
              1,
              true,
            ]}
          />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ) : (
        <mesh
          position={config.planePosition}
          rotation={config.planeRotation}
          renderOrder={10}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
        >
          <planeGeometry args={[config.planeWidth, config.planeHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            depthTest={false}
            side={THREE.FrontSide}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function ProceduralProduct({ productId, color, finish, texture }) {
  const settings = finishSettings[finish] || finishSettings.glossy;
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: settings.metalness,
        roughness: settings.roughness,
      }),
    [color, settings]
  );

  const printMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [texture]
  );

  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b8b8b1",
        metalness: 0.85,
        roughness: 0.22,
      }),
    []
  );

  const dark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#292929",
        metalness: 0.35,
        roughness: 0.35,
      }),
    []
  );

  if (productId === "custom-bottle") {
    return (
      <group>
        <mesh material={material} position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.43, 1.7, 64]} />
        </mesh>
        <mesh material={material} position={[0, 0.86, 0]}>
          <cylinderGeometry args={[0.27, 0.3, 0.22, 48]} />
        </mesh>
        <mesh material={metal} position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.285, 0.285, 0.17, 48]} />
        </mesh>
        <mesh
          material={printMaterial}
          position={[0, -0.05, 0]}
          rotation={[0, Math.PI, 0]}
          renderOrder={2}
        >
          <cylinderGeometry args={[0.482, 0.432, 1.6, 64, 1, true]} />
        </mesh>
      </group>
    );
  }

  if (productId === "custom-pen") {
    return (
      <group rotation={[0, 0, -0.12]}>
        <mesh material={material} castShadow>
          <cylinderGeometry args={[0.105, 0.105, 2.25, 40]} />
        </mesh>
        <mesh material={metal} position={[0, 1.12, 0]}>
          <cylinderGeometry args={[0.108, 0.108, 0.12, 40]} />
        </mesh>
        <mesh material={metal} position={[0, -1.1, 0]}>
          <coneGeometry args={[0.105, 0.2, 40]} />
        </mesh>
        <mesh
          material={printMaterial}
          position={[0, 0.02, 0]}
          rotation={[0, Math.PI, 0]}
          renderOrder={2}
        >
          <cylinderGeometry args={[0.107, 0.107, 1.35, 40, 1, true]} />
        </mesh>
        <mesh material={metal} position={[0.1, 0.6, 0]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.035, 0.8, 0.025]} />
        </mesh>
      </group>
    );
  }

  if (productId === "custom-notebook") {
    return (
      <group rotation={[-0.08, 0.12, -0.1]}>
        <RoundedBox
          args={[1.55, 2.05, 0.22]}
          radius={0.08}
          smoothness={5}
          material={dark}
          position={[0, 0, -0.07]}
          castShadow
        />
        <RoundedBox
          args={[1.48, 1.98, 0.18]}
          radius={0.07}
          smoothness={5}
          material={material}
          position={[0.02, 0, 0.02]}
          castShadow
        />
        <mesh material={printMaterial} position={[0.02, 0, 0.116]} renderOrder={2}>
          <planeGeometry args={[1.25, 1.55]} />
        </mesh>
      </group>
    );
  }

  if (productId === "custom-keychain") {
    return (
      <group rotation={[0.05, 0.1, -0.08]}>
        <mesh
          material={metal}
          position={[0, 0.72, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.35, 0.055, 16, 64]} />
        </mesh>
        <RoundedBox
          args={[0.92, 1.12, 0.22]}
          radius={0.2}
          smoothness={8}
          material={material}
          position={[0, -0.42, 0]}
          castShadow
        />
        <mesh
          material={printMaterial}
          position={[0, -0.42, 0.116]}
          renderOrder={2}
        >
          <planeGeometry args={[0.68, 0.72]} />
        </mesh>
      </group>
    );
  }

  return (
    <RoundedBox
      args={[1, 1.6, 0.4]}
      radius={0.12}
      smoothness={6}
      material={material}
    />
  );
}

export default function ProductViewer({
  productId = "custom-bottle",
  color = "#F1EBDD",
  finish = "glossy",
  personalText = "",
  textColor = "#292929",
  textFont = "sans",
  textSize = 76,
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
  onSelectDesign = () => {},
  onTextPositionChange = () => {},
  onImagePositionChange = () => {},
}) {
  const config = MODEL_CONFIG[productId];
  const isCylinder = Boolean(config?.isCylinder);

  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const texture = useArtworkTexture({
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
    uploadedImage,
    imageScale,
    imagePosition,
    imageMode,
    imageFit,
    imageOpacity,
    imageBlendMode,
    imageFilter,
    isCylinder,
  });

  return (
    <div className="relative h-full min-h-[300px] w-full select-none sm:min-h-[380px]">
      <Canvas
        camera={{ position: [0, 0.2, 4.0], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#eeece5"]} />

        {/* Zero-network instant studio lighting for fast, smooth loading without CDN lag */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={1.0} />
        <directionalLight position={[0, -2, 3]} intensity={0.5} />
        <hemisphereLight skyColor="#ffffff" groundColor="#dad7ce" intensity={0.7} />

        <Center position={[0, -0.05, 0]}>
          {config ? (
            <GLBProductModel
              productId={productId}
              color={color}
              finish={finish}
              texture={texture}
              personalText={personalText}
              textFont={textFont}
              textPosition={textPosition}
              textOrientation={textOrientation}
              textSize={textSize}
              textScale={textScale}
              textSpacing={textSpacing}
              textTransform={textTransform}
              uploadedImage={uploadedImage}
              imagePosition={imagePosition}
              imageScale={imageScale}
              imageMode={imageMode}
              onSelectDesign={onSelectDesign}
              onTextPositionChange={onTextPositionChange}
              onImagePositionChange={onImagePositionChange}
              onHoverChange={setIsHovering}
              onDragChange={setIsDragging}
            />
          ) : (
            <ProceduralProduct
              productId={productId}
              color={color}
              finish={finish}
              texture={texture}
            />
          )}
        </Center>

        <ContactShadows
          position={[0, -1.35, 0]}
          opacity={0.24}
          scale={4.8}
          blur={2.4}
          far={2.5}
        />

        <OrbitControls
          makeDefault
          enabled={!isDragging && !isHovering}
          enablePan={false}
          enableZoom
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
          minDistance={2.0}
          maxDistance={6.5}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-2 left-1/2 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-center text-[9px] font-medium leading-4 text-[#24241f] shadow-sm backdrop-blur-sm sm:bottom-3 sm:px-3.5 sm:text-[11px]">
        Drag on product to move · Drag background to rotate 360°
      </div>
    </div>
  );
}
