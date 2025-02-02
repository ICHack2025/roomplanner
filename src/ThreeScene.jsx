import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const hdrPath = "./sky.hdr";
const objPath = "./template_room.obj"; // Path to your .obj file
const overlayImage = "./texture.jpg"; // Replace with the path to your overlay image

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
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // OrbitControls initialization
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = true;
    controls.enableZoom = true;

    // Load HDR Environment
    const loader2 = new RGBELoader();
    loader2.load(
      hdrPath,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
      },
      undefined,
      (error) => {
        console.error("Error loading HDR file:", error);
      }
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });

    // Load .obj Model
    const objLoader = new OBJLoader();
    objLoader.load(
      objPath,
      (object) => {
        object.position.set(0, 0, 0); // Position the object in the background
        object.scale.set(10, 10, 10); // Adjust the size of the model
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });
        scene.add(object);
      },
      undefined,
      (error) => {
        console.error("Error loading OBJ file:", error);
      }
    );

    // Stats
    const stats = new Stats();
    containerRef.current.appendChild(stats.dom);

    // Handle Resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);

    // WASD Controls and Bounds (no sliding)
    const movementSpeed = 0.5;
    const bounds = {
      x: [-50, 50],
      y: [-50, 50],
      z: [10, 70],
    };

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "w":
          if (camera.position.z - movementSpeed >= bounds.z[0]) {
            camera.position.z -= movementSpeed;
          }
          break;
        case "s":
          if (camera.position.z + movementSpeed <= bounds.z[1]) {
            camera.position.z += movementSpeed;
          }
          break;
        case "a":
          if (camera.position.x - movementSpeed >= bounds.x[0]) {
            camera.position.x -= movementSpeed;
          }
          break;
        case "d":
          if (camera.position.x + movementSpeed <= bounds.x[1]) {
            camera.position.x += movementSpeed;
          }
          break;
        case "ArrowUp":
          if (camera.position.y + movementSpeed <= bounds.y[1]) {
            camera.position.y += movementSpeed;
          }
          break;
        case "ArrowDown":
          if (camera.position.y - movementSpeed >= bounds.y[0]) {
            camera.position.y -= movementSpeed;
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // FOV change on scroll without re-rendering
    const onScroll = (event) => {
      if (event.deltaY > 0 && camera.fov < 120) {
        camera.fov += 1;
      } else if (event.deltaY < 0 && camera.fov > 30) {
        camera.fov -= 1;
      }
      camera.updateProjectionMatrix();
    };
    window.addEventListener("wheel", onScroll);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Only update the controls here
      renderer.render(scene, camera);
      stats.update();
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", onScroll);
      controls.dispose();
      renderer.dispose();
      containerRef.current.removeChild(renderer.domElement);
      containerRef.current.removeChild(stats.dom);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Overlay Image */}
      <img
        src={overlayImage}
        alt="Overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Prevent image from blocking interaction
          mixBlendMode: "multiply", // Optional: Adjust blending with the scene
          opacity: 0.5, // Adjust for visibility
        }}
      />
    </div>
  );
};

export default ThreeScene;
