import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Spector } from "spectorjs";

import fireFliesVertexShader from "./shaders/fireflies/vertex.glsl";
import fireFliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";

/**
 * Basejh
 */
// Debug
const debugObject = {
	backgroundColor: "#20072c", //20072c
	portalColorStart: "#ddbbec", //ddbbec
	portalColorEnd: "#712f7f", //712f7f
};
const gui = new GUI({
	width: 400,
});

// Spector
const spector = new Spector();
// spector.displayUI();

// // Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Load model
gltfLoader.load("./portalroom.glb", (gltf) => {
	scene.add(gltf.scene);
	const bakedMesh = gltf.scene.children.find(
		(child) => child.name === "Cube191"
	);
	const portalLightMesh = gltf.scene.children.find(
		(child) => child.name === "portalLight"
	);
	const poleLightAMesh = gltf.scene.children.find(
		(child) => child.name === "lampLightA"
	);
	const poleLightBMesh = gltf.scene.children.find(
		(child) => child.name === "lampLightB"
	);

	// Apply materials
	bakedMesh.material = bakedMaterial;
	portalLightMesh.material = portalLightMaterial;
	poleLightAMesh.material = poleLightMaterial;
	poleLightBMesh.material = poleLightMaterial;
});

//Textures
const bakedTexture = textureLoader.load("./TexturePortalRoom.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

const bakedMaterial = new THREE.MeshBasicMaterial({
	map: bakedTexture,
});

const poleLightMaterial = new THREE.MeshBasicMaterial({
	color: "white",
});

const portalMaterial = new THREE.ShaderMaterial({
	vertexShader: portalVertexShader,
	fragmentShader: portalFragmentShader,
	uniforms: {
		uTime: new THREE.Uniform(0),
		uColorStart: new THREE.Uniform(
			new THREE.Color(debugObject.portalColorStart)
		),
		uColorEnd: new THREE.Uniform(new THREE.Color(debugObject.portalColorEnd)),
	},
});
const portalLightMaterial = portalMaterial;

gui.addColor(debugObject, "portalColorStart").onChange((value) => {
	portalLightMaterial.uniforms.uColorStart.value.set(
		debugObject.portalColorStart
	);
});
gui.addColor(debugObject, "portalColorEnd").onChange(() => {
	portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
});

// Points
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const firefliesPositions = new Float32Array(firefliesCount * 3);
const firefliesScale = new Float32Array(firefliesCount * 3);

for (let i = 0; i < firefliesCount * 3; i++) {
	firefliesPositions[i * 3 + 0] = (Math.random() - 0.5) * 4;
	firefliesPositions[i * 3 + 1] = Math.random() * 1.5;
	firefliesPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;

	firefliesScale[i] = Math.random();
}

firefliesGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(firefliesPositions, 3)
);

firefliesGeometry.setAttribute(
	"aScale",
	new THREE.BufferAttribute(firefliesScale, 1)
);

const firefliesMaterial = new THREE.ShaderMaterial({
	vertexShader: fireFliesVertexShader,
	fragmentShader: fireFliesFragmentShader,
	uniforms: {
		uTime: new THREE.Uniform(0),
		uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
		uSize: new THREE.Uniform(300),
		uStrength: new THREE.Uniform(0.05),
	},
	blending: THREE.AdditiveBlending,
	depthWrite: false,
	transparent: true,
});

// gui
// 	.add(firefliesMaterial.uniforms.uSize, "value")
// 	.min(0)
// 	.max(40)
// 	.step(0.01)
// 	.name("fireflies size");
// gui
// 	.add(firefliesMaterial.uniforms.uStrength, "value")
// 	.min(0)
// 	.max(1)
// 	.step(0.01)
// 	.name("fireflies strength");

scene.add(new THREE.Points(firefliesGeometry, firefliesMaterial));

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
	firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
		window.devicePixelRatio,
		2
	);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	45,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setClearColor(debugObject.backgroundColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// background
gui.addColor(debugObject, "backgroundColor").onChange((value) => {
	scene.background = new THREE.Color(value);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	firefliesMaterial.uniforms.uTime.value = elapsedTime;
	portalMaterial.uniforms.uTime.value = elapsedTime;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
