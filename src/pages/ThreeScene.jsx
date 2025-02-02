import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

const ThreeScene = () => {
  const containerRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    // Get URL parameters from the browser
    // Setup three.js scene
    const scene = new THREE.Scene();
    // scene.add(new THREE.AxesHelper(5));

    // const light = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(light);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    const urlParams = new URLSearchParams(window.location.search);
    let cube = JSON.parse(urlParams.get("cube"));
    cube = cube.map((x) => new THREE.Vector3(x.x, -x.y, -1).unproject(camera));

    const v0 = new THREE.Vector3(0, 0, 0);
    const v1 = new THREE.Vector3(
      cube[1].x - cube[0].x,
      cube[1].y - cube[0].y,
      cube[1].z + 1
    )
    const v2 = new THREE.Vector3(
      cube[2].x - cube[0].x,
      cube[2].y - cube[0].y,
      cube[2].z + 1
    )
    const v3 = new THREE.Vector3(
      cube[3].x - cube[0].x,
      cube[3].y - cube[0].y,
      cube[3].z + 1
    )

    // Draw the three vectors in the world:
    const material1 = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 10,
    });
    const geometry1 = new THREE.BufferGeometry().setFromPoints([v0, v1]);
    const line1 = new THREE.Line(geometry1, material1);
    scene.add(line1);

    const material2 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const geometry2 = new THREE.BufferGeometry().setFromPoints([v0, v2]);
    const line2 = new THREE.Line(geometry2, material2);
    scene.add(line2);

    const material3 = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry3 = new THREE.BufferGeometry().setFromPoints([v0, v3]);
    const line3 = new THREE.Line(geometry3, material3);
    scene.add(line3);

    // Construct the rotation matrix R from v1, v2, v3
    const R = new THREE.Matrix3();
    R.set(v1.x, v2.x, v3.x, v1.y, v2.y, v3.y, v1.z, v2.z, v3.z);

    // Now, extract the Euler angles from the rotation matrix R
    // Assuming R is a proper rotation matrix
    const angleX = Math.atan2(R.elements[5], R.elements[8]); // Rotation around X-axis (pitch)
    const angleY = Math.atan2(
        -R.elements[6],
        Math.sqrt(R.elements[0] ** 2 + R.elements[3] ** 2) // Yaw (Rotation around Y-axis)
      );
    const angleZ = Math.atan2(R.elements[3], R.elements[0]); // Rotation around Z-axis (roll)

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderer.shadowMap.enabled = true

    const stats = new Stats();
    containerRef.current.appendChild(stats.dom);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("texture.jpg");

    scene.environment = texture;
    scene.background = texture;

    const faceSize = 1; // Size of each face
    const planeSize = 100;
    const faceMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });

    // Create 6 PlaneGeometries for each face
    const planes = [
        { position: [0, 0, 0.5], rotation: [0, Math.PI, 0] }, // Front
        { position: [0, 0, -0.5], rotation: [0, 0, 0] }, // Back
        { position: [0.5, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // Right
        { position: [-0.5, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Left
        { position: [0, 0.5, 0], rotation: [Math.PI / 2, 0, 0] }, // Top
        { position: [0, -0.5, 0], rotation: [-Math.PI / 2, 0, 0] }, // Bottom
      ];
      

    const cubeGroup = new THREE.Object3D();

    // Create meshes for each face
    planes.forEach(({ position, rotation }) => {
      const planeGeometry = new THREE.PlaneGeometry(faceSize, faceSize);
      const planeMesh = new THREE.Mesh(planeGeometry, faceMaterial);
      // Set position
      planeMesh.position.set(
        position[0] * planeSize,
        position[1] * planeSize,
        position[2] * planeSize
      );

      // Set rotation
      planeMesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      // Scale
      planeMesh.scale.set(planeSize, planeSize, planeSize);
      planeMesh.receiveShadow = true;

      cubeGroup.add(planeMesh);
    });

    cubeGroup.position.set(cube[0].x / 2 / 10 + 2, 10, 0);
    cubeGroup.rotateX(angleX - 0.7);
    cubeGroup.rotateY(-angleY);
    cubeGroup.rotateZ(angleZ);
    cubeGroup.receiveShadow = true;

    // Get all face meshes from the cubeGroup
    const faceMeshes = cubeGroup.children;

    const to_remove = [0, 1, 3];

    // Remove the three closest faces
    for (let i = 0; i < 6; i++) {
      if (to_remove.includes(i)) {
        cubeGroup.remove(faceMeshes[i]);
      }
    }

    scene.add(cubeGroup);

    // scene.add(cubeMesh);

    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 5, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true; // Sphere casts a shadow
    scene.add(sphere);

    //   Add light above sphere
    const light2 = new THREE.PointLight(0xffffff, 100, 100);
    light2.position.set(0, 8, 0);
    light2.castShadow = true; // Light casts a shadow
    scene.add(light2);
    light2.shadow.mapSize.width = 512; // default
    light2.shadow.mapSize.height = 512; // default
    light2.shadow.camera.near = 0.5; // default
    light2.shadow.camera.far = 500; // default

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      stats.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resizing
    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ThreeScene;
