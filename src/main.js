import "./style.css";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 9;

// Throttle wheel event to only run handler once every 2 seconds
let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function throttleWheelHandler(event) {
    const currentTime = Date.now();
    if (currentTime - lastWheelTime < throttleDelay) return;
  
    lastWheelTime = currentTime;
  
    const direction = event.deltaY > 0 ? 1 : -1;
    scrollCount = (scrollCount + direction + 4) % 4;
  
    const headings = document.querySelectorAll(".heading");
  
    // text movement
    gsap.to(headings, {
      y: `-${scrollCount * 100}%`,
      duration: 1,
      ease: "power2.inOut",
    });
  
    // planet rotation
    gsap.to(spheres.rotation, {
      y: `-${scrollCount * (Math.PI / 2)}`,
      duration: 1,
      ease: "power2.inOut",
    });
  
    console.log("Active index:", scrollCount);
  }
  

window.addEventListener("wheel", throttleWheelHandler);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const rgbeLoader = new HDRLoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
  }
);


// Directional light coming from the right
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 3.5, 1); // from the right
scene.add(directionalLight);

// Small amount of ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);


const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];

const spheres = new THREE.Group();

// Create a big sphere to act as a star field backdrop
const starsTextureLoader = new THREE.TextureLoader();
const starsTexture = starsTextureLoader.load("./stars.jpg"); // make sure this path is correct!
starsTexture.colorSpace = THREE.SRGBColorSpace
const starsGeometry = new THREE.SphereGeometry(50, 64, 64);
const starsMaterial = new THREE.MeshStandardMaterial({
  map: starsTexture,
  // transparent: true,
  opacity:0.1,
  side: THREE.BackSide,
});
const starsSphere = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(starsSphere);

const spheresMesh = []

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);

  texture.colorSpace = THREE.SRGBColorSpace

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  // sphere.position.x = (i - 1.5) * 2;
  spheresMesh.push(sphere)

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);

  spheres.add(sphere);
}

spheres.rotation.x = 0.1;
spheres.position.y = -0.8;

scene.add(spheres);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.enableZoom = true;

// setInterval(()=>{
//   gsap.to(spheres.rotation,{
//     y : `+=${Math.PI/2}`,
//     duration : 2,
//     ease : "expo.easeInOut"
//   })

// },2500)

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

let clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();
  
    for (let i = 0; i < spheresMesh.length; i++) {
      spheresMesh[i].rotation.y += delta * 0.02;
    }
  
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  

animate();
