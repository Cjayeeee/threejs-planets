import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ---------------- HDRI ---------------- */

new RGBELoader().load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

/* ---------------- Lights ---------------- */

scene.add(new THREE.DirectionalLight(0xffffff, 1.5));
scene.add(new THREE.AmbientLight(0xffffff, 0));

/* ---------------- Planets ---------------- */

const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;

const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];

const spheres = new THREE.Group();

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

const spheresMesh = [];

textures.forEach((path, i) => {
  const texture = new THREE.TextureLoader().load(path);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    new THREE.MeshStandardMaterial({ map: texture })
  );

  const angle = (i / textures.length) * Math.PI * 2;
  mesh.position.set(
    orbitRadius * Math.cos(angle),
    0,
    orbitRadius * Math.sin(angle)
  );

  spheres.add(mesh);
  spheresMesh.push(mesh);
});

spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

/* ---------------- Scroll Logic ---------------- */

let scrollIndex = 0;
let lastTime = 0;
const delay = 1200;

function handleScroll(direction) {
  const now = Date.now();
  if (now - lastTime < delay) return;
  lastTime = now;

  scrollIndex = (scrollIndex + direction + textures.length) % textures.length;

  gsap.to(spheres.rotation, {
    y: -scrollIndex * (Math.PI / 2),
    duration: 1,
    ease: "power2.inOut",
  });

  const headings = document.querySelectorAll(".heading");
  gsap.to(headings, {
    y: `-${scrollIndex * 100}%`,
    duration: 1,
    ease: "power2.inOut",
  });
}

/* ---------------- Desktop Wheel ---------------- */

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    handleScroll(e.deltaY > 0 ? 1 : -1);
  },
  { passive: false }
);

/* ---------------- Mobile Touch ---------------- */

let startX = 0;

window.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
}, { passive: true });

window.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) < 40) return;

  // swipe left → next
  // swipe right → previous
  handleScroll(diff > 0 ? 1 : -1);
}, { passive: true });

/* ---------------- Resize ---------------- */

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

/* ---------------- Animate ---------------- */

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  spheresMesh.forEach((s) => (s.rotation.y += delta * 0.3));
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
