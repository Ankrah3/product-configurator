import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const finishSettings = {
  standard: { metalness: 0, roughness: 0.9, clearcoat: 0 },
  metallic: { metalness: 1, roughness: 0.25, clearcoat: 0 },
  glossy: { metalness: 0.1, roughness: 0.05, clearcoat: 1 },
};

function useFinish(meshRef, customColor, material) {
  const target = useMemo(() => new THREE.Color(customColor), [customColor]);
  useFrame((_, delta) => {
    const settings = finishSettings[material] || finishSettings.standard;
    meshRef.current?.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((mat) => {
        if (!mat.color) return;
        // The GLB's packed roughness/metalness map can mask the finish preset.
        // Keep its color and normal detail, but let the selected finish own
        // these two channels.
        if (mat.userData.activeFinish !== material) {
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.userData.activeFinish = material;
          mat.needsUpdate = true;
        }
        mat.color.lerp(target, 1 - Math.exp(-delta * 5));
        mat.metalness = THREE.MathUtils.damp(mat.metalness ?? 0, settings.metalness, 5, delta);
        mat.roughness = THREE.MathUtils.damp(mat.roughness ?? 0.5, settings.roughness, 5, delta);
        if (mat.isMeshPhysicalMaterial) {
          mat.clearcoat = THREE.MathUtils.damp(mat.clearcoat, settings.clearcoat, 5, delta);
          mat.clearcoatRoughness = THREE.MathUtils.damp(mat.clearcoatRoughness, settings.roughness, 5, delta);
        }
      });
    });
  });
}

function FallbackProduct({ customColor, material }) {
  const ref = useRef();
  useFinish(ref, customColor, material);
  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial color={customColor} roughness={0.9} metalness={0} clearcoat={0} />
      </mesh>
    </group>
  );
}

function GLTFProduct({ customColor, material }) {
  const { scene } = useGLTF("/models/product.glb");
  const ref = useRef();
  const normalized = useMemo(() => {
    const model = scene.clone(true);
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const asPhysicalMaterial = (mat) => {
        // The GLB's Standard materials do not define MeshPhysical-only vector
        // properties, so copy just the shared PBR fields instead of calling
        // MeshPhysicalMaterial.copy(), which expects those fields to exist.
        const physical = new THREE.MeshPhysicalMaterial({
          color: mat.color?.clone() || new THREE.Color("white"),
          map: mat.map || null,
          metalness: mat.metalness ?? 0,
          roughness: mat.roughness ?? 1,
          opacity: mat.opacity ?? 1,
          transparent: mat.transparent ?? false,
          side: mat.side ?? THREE.FrontSide,
        });
        physical.name = mat.name;
        physical.aoMap = mat.aoMap || null;
        physical.aoMapIntensity = mat.aoMapIntensity ?? 1;
        physical.normalMap = mat.normalMap || null;
        physical.normalScale.copy(mat.normalScale || new THREE.Vector2(1, 1));
        physical.roughnessMap = mat.roughnessMap || null;
        physical.metalnessMap = mat.metalnessMap || null;
        physical.emissive.copy(mat.emissive || new THREE.Color(0, 0, 0));
        physical.emissiveMap = mat.emissiveMap || null;
        physical.emissiveIntensity = mat.emissiveIntensity ?? 1;
        physical.alphaMap = mat.alphaMap || null;
        physical.alphaTest = mat.alphaTest ?? 0;
        return physical;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(asPhysicalMaterial)
        : asPhysicalMaterial(object.material);
    });
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 2.2 / Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    return model;
  }, [scene]);
  useFinish(ref, customColor, material);
  return <group ref={ref}><primitive object={normalized} /></group>;
}

function Product({ customColor, material, hasModel }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.025;
  });
  return (
    <group ref={ref}>
      {hasModel ? <GLTFProduct customColor={customColor} material={material} /> : <FallbackProduct customColor={customColor} material={material} />}
    </group>
  );
}

function LoadingModel() {
  return <Html center className="text-sm text-white">Loading model...</Html>;
}

export default function Scene({ customColor, material }) {
  const [hasModel, setHasModel] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  useEffect(() => {
    fetch("/models/product.glb", { method: "HEAD" }).then((response) => setHasModel(response.ok)).catch(() => setHasModel(false));
  }, []);

  return (
    <div className="scene-viewport relative bg-slate-950">
      <Canvas shadows camera={{ position: [3, 2, 4], fov: 50 }}>
        <color attach="background" args={["#111c2d"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={2} castShadow shadow-mapSize={1024} />
        <pointLight position={[-4, 2, -3]} intensity={0.8} />
        <Suspense fallback={<LoadingModel />}>
          <Product customColor={customColor} material={material} hasModel={hasModel} />
          <Environment preset="city" />
        </Suspense>
        <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={8} blur={2.8} far={3} />
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.2}
          maxDistance={7}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI - 0.12}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate}
          autoRotateSpeed={0.45}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>
    </div>
  );
}
