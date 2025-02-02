import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const CubeInScreenSpace = () => {
  const mountRef = useRef(null);
  const draggingPointRef = useRef(null);  // Use a ref to track the dragging point

  const [cube, setCube] = useState(null);
  const [points, setPoints] = useState([
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.2 },
    { x: 0.5, y: 0.8 },
  ]);

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Create a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cubeObj = new THREE.Mesh(geometry, material);
    scene.add(cubeObj);

    // Position camera
    camera.position.z = 5;

    // Create draggable points
    const pointGeometry = new THREE.CircleGeometry(0.05, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pointMeshes = points.map((point, index) => {
      const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
      pointMesh.position.set(point.x * 2 - 1, -(point.y * 2 - 1), 0);
      pointMesh.userData = { index }; // Store index for identifying the point
      scene.add(pointMesh);
      return pointMesh;
    });

    // Update points positions
    const updateCubePosition = () => {
      const worldPoints = pointMeshes.map((pointMesh) => {
        const vector = new THREE.Vector3(
          pointMesh.position.x,
          pointMesh.position.y,
          0.5
        ).unproject(camera);
        return vector;
      });

      const box = new THREE.Box3().setFromPoints(worldPoints);
      cubeObj.position.copy(box.getCenter(new THREE.Vector3()));
      const size = box.getSize(new THREE.Vector3());
      cubeObj.scale.set(size.x, size.y, size.z);
    };

    // Event listener for mouse move
    const onMouseMove = (event) => {
      if (draggingPointRef.current !== null) {
        // Update mouse position
        const rect = mountRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the dragging point's position
        const intersectedPoint = pointMeshes[draggingPointRef.current];
        intersectedPoint.position.set(mouse.x, mouse.y, 0);
        updateCubePosition();
      }
    };

    // Event listener for mouse down
    const onMouseDown = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check for intersection with points
      const intersects = raycaster.intersectObjects(pointMeshes);
      if (intersects.length > 0) {
        const index = intersects[0].object.userData.index; // Get the index of the clicked point
        draggingPointRef.current = index;  // Use ref to set the dragged point
      }
    };

    // Event listener for mouse up
    const onMouseUp = () => {
      draggingPointRef.current = null; // Stop dragging
    };

    // Add event listeners for mouse events
    mountRef.current.addEventListener('mousedown', onMouseDown);
    mountRef.current.addEventListener('mousemove', onMouseMove);
    mountRef.current.addEventListener('mouseup', onMouseUp);
    mountRef.current.addEventListener('mouseleave', onMouseUp);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    setCube(cubeObj);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      mountRef.current.removeEventListener('mousedown', onMouseDown);
      mountRef.current.removeEventListener('mousemove', onMouseMove);
      mountRef.current.removeEventListener('mouseup', onMouseUp);
      mountRef.current.removeEventListener('mouseleave', onMouseUp);
    };
  }, [points]);

  return (
    <div ref={mountRef} style={{ width: '100vh', height: '100vh' }}>
      {/* Optionally, you can show the points on a separate UI */}
    </div>
  );
};

export default CubeInScreenSpace;
