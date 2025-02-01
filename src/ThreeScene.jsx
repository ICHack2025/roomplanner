import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { RGBELoader } from "three/examples/jsm/Addons.js";

const hdrPath = "./sky.hdr";
const plyPath = "./model.ply";

const ThreeScene = () => {
  const containerRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader2 = new RGBELoader();
    loader2.load(
      hdrPath, // Replace with your actual .hdr file path
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping; // Enable reflections
        scene.environment = texture; // Set as the environment map
        scene.background = texture; // Optional: Use as the background
      },
      undefined, // Optional: Progress callback
      (error) => {
        console.error("Error loading HDR file:", error);
      }
    );

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xb2ffc8,
      metalness: 0,
      roughness: 0,
      transparent: true,
      transmission: 1.0,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.25,
    });

    const loader = new PLYLoader();
loader.load(
  plyPath,
  (geometry) => {
    geometry.computeVertexNormals();
    
    // Check if the geometry has color attributes
    if (geometry.hasAttribute("color")) {
      const materialWithVertexColors = new THREE.MeshStandardMaterial({
        vertexColors: true, // Enable vertex colors
      });

      const mesh = new THREE.Mesh(geometry, materialWithVertexColors);
      mesh.rotateX(-Math.PI / 2);
      scene.add(mesh);
    } else {
      // Fallback to your custom material if no colors are present
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotateX(-Math.PI / 2);
      scene.add(mesh);
    }
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error(error);
  }
);


    const stats = new Stats();
    containerRef.current.appendChild(stats.dom);

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      stats.update();
    };

    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      controls.dispose();
      renderer.dispose();
      containerRef.current.removeChild(renderer.domElement);
      containerRef.current.removeChild(stats.dom);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeScene;
