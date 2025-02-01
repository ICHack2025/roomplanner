import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import { OBJLoader } from "three/examples/jsm/Addons.js";

const hdrPath = "./sky.hdr";
const plyPath = "./reconstructed_mesh.obj";

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

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("./texture.jpg", () => {
      console.log("Texture loaded");
    });

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      metalness: 0,
      roughness: 0,
      transparent: false,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.25,
      flatShading: false,
    });

    const loader = new OBJLoader();
    loader.load(
      plyPath, // Use your .obj file path here
      (object) => {
        object.traverse((child) => {
          if (child.isMesh) {
            
            child.material = material; // Apply your material if needed
            child.geometry.computeVertexNormals(); // If needed, to compute normals for lighting
          }
        });
        object.rotateX(-Math.PI / 2); // Rotate if necessary
        scene.add(object);
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
