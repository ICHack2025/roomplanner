// src/ThreeScene.js
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/Addons.js";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.AmbientLight(0x404040, 2); // soft white light
    scene.add(light);

    // Load PLY model
    const loader = new PLYLoader();
    loader.load("./model.ply", (geometry) => {
      const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });

    // Set up camera position
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate model if necessary
      scene.rotation.y += 0.005;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default ThreeScene;

