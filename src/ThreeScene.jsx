import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const Location = Object.freeze ({
  leftWall: "leftWall",
  rightWall: "rightWall",
  Center: "Center"
})

const cubeScale = 20;

const hdrPath = "./sky.hdr";
const objPath = "./template_room.obj"; // Path to your .obj file
const overlayImage = "./texture.jpg"; // Replace with the path to your overlay image
const ikeaObject = "./somethingIkea.glb";
const bedObject = "./bed.glb";

const ThreeScene = () => {
  const containerRef = useRef();
  const keyPressed = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
  });

  const [points, setPoints] = useState([
    { x: 100, y: 100, worldPosition: new THREE.Vector3() },  // Point 1
    { x: 300, y: 100, worldPosition: new THREE.Vector3() },  // Point 2
    { x: 200, y: 300, worldPosition: new THREE.Vector3() },  // Point 3
  ]);
  const cubeRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const spritesRef = useRef([]);

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
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = true;
    controls.enableZoom = false;

    const stats = new Stats();
    containerRef.current.appendChild(stats.dom);

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


    // cube
    const objLoader = new OBJLoader();
    objLoader.load(
      objPath,
      (object) => {
        object.position.set(0, 0, 0);
        object.scale.set(cubeScale, cubeScale, cubeScale);
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });
        scene.add(object);
        cubeRef.current = object;

        //get dimensions
        const bbox = new THREE.Box3().setFromObject(object);

        const size = new THREE.Vector3();
        bbox.getSize(size);


        console.log("box Width:", size.x);
        console.log("box Height:", size.y);
        console.log("box Depth:", size.z);
      },
      undefined,
      (error) => {
        console.error("Error loading OBJ file:", error);
      }
    );

    const gltfloader = new GLTFLoader();
    // Attach DRACOLoader to GLTFLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"); // Use Draco's CDN or your local path
    gltfloader.setDRACOLoader(dracoLoader);
    

    function placeObject(location, path) {
      gltfloader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(10,10,10);

          const bbox = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          bbox.getSize(size);

          var xPos = 0;
          var yPos = 0;
          
          if (location == Location.leftWall) {
            xPos = 0;
            yPos = -cubeScale + (size.x/2);
          }
          if (location == Location.rightWall) {
            xPos = -cubeScale + (size.z/2);
            yPos = 0;
          }
          if (location == Location.corner) {
            xPos = -cubeScale + (size.z/2);
            yPos = -cubeScale + (size.x/2);
          }

          console.log("box Width:", size.x);
        console.log("box Height:", size.y);
        console.log("box Depth:", size.z);
          model.position.set(yPos, -cubeScale, xPos);
          

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });

          scene.add(model);
        }
      ) 
    }

    placeObject(Location.rightWall, bedObject);
    placeObject(Location.leftWall, ikeaObject);
    placeObject(Location.corner, ikeaObject);
    /*
    gltfloader.load(
      bedObject,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0,-subeScale,-7.5);
        model.scale.set(10,10,10);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });
        
        scene.add(model)

        //get dimensions
        const bbox = new THREE.Box3().setFromObject(model);

        const size = new THREE.Vector3();
        bbox.getSize(size);


        console.log("Width:", size.x);
        console.log("Height:", size.y);
        console.log("Depth:", size.z);
      }
    )
      */

    // Function to create sprite for each point
    const createSprite = () => {
      const spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png"),
        color: 0xff0000,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(10, 10, 10); // Set sprite size
      return sprite;
    };

    // Create sprites for the points
    points.forEach(() => {
      const sprite = createSprite();
      scene.add(sprite);
      spritesRef.current.push(sprite);
    });

    // Function to update sprite position based on world position
    const updateSpritePosition = () => {
      const { x: width, y: height } = window;

      points.forEach((point, index) => {
        // Update the point's world position (this can be done via raycasting in screen space)
        const screenPosition = point.worldPosition.clone().project(camera);

        const x = (screenPosition.x * 0.5 + 0.5) * width;
        const y = (screenPosition.y * -0.5 + 0.5) * height;

        const sprite = spritesRef.current[index];
        sprite.position.set(x, y, 0);
      });
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);

    const movementSpeed = 0.1;
    const bounds = {
      x: [-50, 50],
      y: [-50, 50],
      z: [10, 70],
    };

    const handleKeyDown = (event) => {
      if (keyPressed.current[event.key] !== undefined) {
        keyPressed.current[event.key] = true;
      }
    };

    const handleKeyUp = (event) => {
      if (keyPressed.current[event.key] !== undefined) {
        keyPressed.current[event.key] = false;
      }
    };

    const handleEKeyDown = (event) => {
      if (event.key === 'e' ){
        console.log("e key pressed");

        if (cameraRef.current) {
          controls.target.set(0,0,0);
          controls.update();
        }
      }
    }

    // FOV change on scroll
    const onScroll = (event) => {
      if (event.deltaY > 0 && camera.fov < 120) {
        camera.fov += 2;
      } else if (event.deltaY < 0 && camera.fov > 30) {
        camera.fov -= 1;
      }
      camera.updateProjectionMatrix();
    };
    window.addEventListener("wheel", onScroll);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleEKeyDown)

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      updateSpritePosition(); // Update sprite position based on world positions

      controls.update();
      renderer.render(scene, camera);
      stats.update();
    };

    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      controls.dispose();
      renderer.dispose();
      containerRef.current.removeChild(renderer.domElement);
      containerRef.current.removeChild(stats.dom);
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <img
        src={overlayImage}
        alt="Overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />
    </div>
  );
};

export default ThreeScene;
