 import * as THREE from "three";

import {gltf_component} from './gltf-component.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import {entity_manager} from './entity_manager.js';

import {grid_controller} from './grid_manager.js';
import {grid} from './grid.js';
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera.js";

import { GUI } from "dat.gui";
import { entity } from "./entity.js";

const scene = new THREE.Scene();

const light = new THREE.PointLight();
light.position.set(2.5, 7.5, 15);
scene.add(light);
//add_place(30, 30);

const camera = new CinematicCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//camera.setLens(5);
camera.position.set(3, 5, 3.0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

let mixer: THREE.AnimationMixer;
let modelReady = false;
const animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction;
let lastAction: THREE.AnimationAction;

const _grid = new grid.Grid([[-1000, -1000], [1000, 1000]], [100, 100]);
const _entityManager = new entity_manager.EntityManager();

const defaultUrl =
  "../resources/Adam/Adam_01.fbx";
const neutralUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Neutral Idle.fbx";
const runningMantUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Dancing Running Man.fbx";
const dancingTwerktUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Dancing Twerk.fbx";
const uprockUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Brooklyn Uprock.fbx";
const gangnamStyleUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Gangnam Style.fbx";
const hiphopManUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Hip Hop Dancing.fbx";
const lockingHipHopUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Locking Hip Hop Dance.fbx";
const northernSoulFloorCompoUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Northern Soul Floor Combo.fbx";
const rumbaManUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Rumba Dancing.fbx";
const salsaDancingtUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Salsa Dancing.fbx";
const tutHipHopUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Tut Hip Hop Dance.fbx";
const twistDanceUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Twist Dance.fbx";
const waveHipHopUrl =
  "../resources/Dancing Animations/Mixamo YBot Model@Wave Hip Hop Dance.fbx";

  const ListUrlAnimation = [
    defaultUrl,
    neutralUrl,
    runningMantUrl,
    dancingTwerktUrl,
    uprockUrl,
    gangnamStyleUrl,
    hiphopManUrl,
    lockingHipHopUrl,
    northernSoulFloorCompoUrl,
    rumbaManUrl,
    salsaDancingtUrl,
    tutHipHopUrl,
    twistDanceUrl,
    waveHipHopUrl
  ];
  
  const listAnimation = [
    "default",
    "idle",
    "dance_running_man",
    "dancing_twerk",
    "dance_uprock",
    "gangname_style",
    "hiphop",
    "locking_hiphop",
    "northern_soul_floor",
    "rumba_man",
    "salsa_dancing",
    "tut_hiphop",
    "twist_dance",
    "wave_hiphop",
  ];

//loading
const loadingManager = new THREE.LoadingManager();
let progressBarContainer = document.querySelector(
  ".progress-bar-container"
) as HTMLDivElement;
var progressBar = document.getElementById("progress") as HTMLProgressElement;
var percent = document.getElementById("percentCount") as HTMLDivElement;
var taptostart = document.getElementById("tap-to-start") as HTMLDivElement;
var fakeProgress = 25;
var realProgress = 0.0;
var newRun = 1;
var newProgressFake = 75;
var firstLoadComplete = false;
var id = setInterval(updateLoadingProgressUI, 30);
var numberofanimloaded = 0;

//loading total progress
function HandleLoadingProgress() {
  if (numberofanimloaded >= 5) {
    newProgressFake = 100;
  } else {
    newProgressFake = Math.round(75 + realProgress * (numberofanimloaded / 5));
  }
  console.log("Progress " + numberofanimloaded);
}

loadingManager.onStart = function (url, itemLoaded, itemTotal) {
  var value = (itemLoaded / itemTotal) * 25 * (numberofanimloaded / 5);
  console.log(value, "value");

  realProgress = value;
  updateLoadingProgressUI();
  console.log(
    "started loading: " +
      url +
      ".\nLoaded " +
      itemLoaded +
      " of " +
      itemTotal +
      " files. "
  );
};

function updateLoadingFakeProgress() {
  if (fakeProgress >= 50) {
    clearInterval(id);
  } else {
    fakeProgress += 1;
    updateLoadingProgressUI();
  }
}

function updateLoadingProgressUI() {
  newRun += 1;
  //gia trị % fake
  if (newRun >= newProgressFake) {
    newRun = newProgressFake;
  }

  if (newRun >= 100 && firstLoadComplete == false) {
    firstLoadComplete = true;
    progressBar.style.display = "none";
    taptostart.style.display = "block";
    progressBarContainer.onclick = function (e) {
      progressBarContainer.style.display = "none";
    };
  }
  percent.innerText = Math.round(newRun) + "";
}

loadingManager.onProgress = function (url, counter, total) {
  console.log("url progress " + url + ", " + counter + ", total " + total);
  //gia trị real % mỗi anim
  var value = (counter / total) * 25 * (numberofanimloaded / 5);
  //console.log(value, "value");

  realProgress = value;
  updateLoadingProgressUI();
};

loadingManager.onLoad = function () {
  console.log("Loading complete!");
};

loadingManager.onError = function (url) {
  console.log(`got a problem loading: ${url} `);
};

const fbxLoader: FBXLoader = new FBXLoader(loadingManager);

fbxLoader.load(
  defaultUrl,
  (object) => {
    object.scale.set(0.01, 0.01, 0.01);
    mixer = new THREE.AnimationMixer(object);
    console.log(object);  
    const animationAction = mixer.clipAction(
      (object as THREE.Object3D).animations[0]
    );
    animationActions.push(animationAction);
    animationsFolder.add(animations, "default");
    activeAction = animationActions[0];

    scene.add(object);
    scene.position.set(0, 0, 0);

    // for (let i = 1; i < 100; i++) {
    //   const model = SkeletonUtils.clone(object);
    //   scene.add(model);
    //   model.position.set(i % 10, 0, Math.round(i / 10));

      
    // }

    numberofanimloaded++;
    HandleLoadingProgress();

    // //add an animation from another file
    fbxLoader.load(
      neutralUrl,
      (object) => {
        console.log("loaded neutral");

        const animationAction = mixer.clipAction(
          (object as THREE.Object3D).animations[0]
        );
        animationActions.push(animationAction);
        animationsFolder.add(animations, "idle");

        animationActions[1].play();
        
        //add an animation from another file
        fbxLoader.load(
          runningMantUrl,
          (object) => {
            console.log("loaded running");
            const animationAction = mixer.clipAction(
              (object as THREE.Object3D).animations[0]
            );
            animationActions.push(animationAction);
            animationsFolder.add(animations, "dance_running_man");

            numberofanimloaded++;
            HandleLoadingProgress();
            //add an animation from another file
            fbxLoader.load(
              dancingTwerktUrl,
              (object) => {
                console.log("loaded dancing_twerk");
                (object as THREE.Object3D).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                //console.dir((object as THREE.Object3D).animations[0])
                const animationAction = mixer.clipAction(
                  (object as THREE.Object3D).animations[0]
                );
                animationActions.push(animationAction);
                animationsFolder.add(animations, "dancing_twerk");

                numberofanimloaded++;
                HandleLoadingProgress();

                fbxLoader.load(
                  uprockUrl,
                  (object) => {
                    console.log("loaded dance_uprock");
                    (object as THREE.Object3D).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                    //console.dir((object as THREE.Object3D).animations[0])
                    const animationAction = mixer.clipAction(
                      (object as THREE.Object3D).animations[0]
                    );
                    animationActions.push(animationAction);
                    animationsFolder.add(animations, "dance_uprock");

                    numberofanimloaded++;
                    HandleLoadingProgress();

                    fbxLoader.load(
                      gangnamStyleUrl,
                      (object) => {
                        console.log("loaded gangnam style");
                        (object as THREE.Object3D).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                        //console.dir((object as THREE.Object3D).animations[0])
                        const animationAction = mixer.clipAction(
                          (object as THREE.Object3D).animations[0]
                        );
                        animationActions.push(animationAction);
                        animationsFolder.add(animations, "gangname_style");

                        numberofanimloaded++;
                        HandleLoadingProgress();

                        fbxLoader.load(
                          hiphopManUrl,
                          (object) => {
                            console.log("loaded hiphop man");
                            (
                              object as THREE.Object3D
                            ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                            //console.dir((object as THREE.Object3D).animations[0])
                            const animationAction = mixer.clipAction(
                              (object as THREE.Object3D).animations[0]
                            );
                            animationActions.push(animationAction);
                            animationsFolder.add(animations, "hiphop");

                            fbxLoader.load(
                              lockingHipHopUrl,
                              (object) => {
                                console.log("loaded locking hiphop");
                                (
                                  object as THREE.Object3D
                                ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                //console.dir((object as THREE.Object3D).animations[0])
                                const animationAction = mixer.clipAction(
                                  (object as THREE.Object3D).animations[0]
                                );
                                animationActions.push(animationAction);
                                animationsFolder.add(
                                  animations,
                                  "locking_hiphop"
                                );

                                fbxLoader.load(
                                  northernSoulFloorCompoUrl,
                                  (object) => {
                                    console.log("loaded northern Soul Floor");
                                    (
                                      object as THREE.Object3D
                                    ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                    //console.dir((object as THREE.Object3D).animations[0])
                                    const animationAction = mixer.clipAction(
                                      (object as THREE.Object3D).animations[0]
                                    );
                                    animationActions.push(animationAction);
                                    animationsFolder.add(
                                      animations,
                                      "northern_soul_floor"
                                    );

                                    fbxLoader.load(
                                      rumbaManUrl,
                                      (object) => {
                                        console.log("loaded rumba man");
                                        (
                                          object as THREE.Object3D
                                        ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                        //console.dir((object as THREE.Object3D).animations[0])
                                        const animationAction =
                                          mixer.clipAction(
                                            (object as THREE.Object3D)
                                              .animations[0]
                                          );
                                        animationActions.push(animationAction);
                                        animationsFolder.add(
                                          animations,
                                          "rumba_man"
                                        );

                                        fbxLoader.load(
                                          salsaDancingtUrl,
                                          (object) => {
                                            console.log("loaded salsa dancing");
                                            (
                                              object as THREE.Object3D
                                            ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                            //console.dir((object as THREE.Object3D).animations[0])
                                            const animationAction =
                                              mixer.clipAction(
                                                (object as THREE.Object3D)
                                                  .animations[0]
                                              );
                                            animationActions.push(
                                              animationAction
                                            );
                                            animationsFolder.add(
                                              animations,
                                              "salsa_dancing"
                                            );

                                            fbxLoader.load(
                                              tutHipHopUrl,
                                              (object) => {
                                                console.log(
                                                  "loaded tut hiphop"
                                                );
                                                (
                                                  object as THREE.Object3D
                                                ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                                //console.dir((object as THREE.Object3D).animations[0])
                                                const animationAction =
                                                  mixer.clipAction(
                                                    (object as THREE.Object3D)
                                                      .animations[0]
                                                  );
                                                animationActions.push(
                                                  animationAction
                                                );
                                                animationsFolder.add(
                                                  animations,
                                                  "tut_hiphop"
                                                );

                                                fbxLoader.load(
                                                  twistDanceUrl,
                                                  (object) => {
                                                    console.log(
                                                      "loaded twist dance"
                                                    );
                                                    (
                                                      object as THREE.Object3D
                                                    ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                                    //console.dir((object as THREE.Object3D).animations[0])
                                                    const animationAction =
                                                      mixer.clipAction(
                                                        (
                                                          object as THREE.Object3D
                                                        ).animations[0]
                                                      );
                                                    animationActions.push(
                                                      animationAction
                                                    );
                                                    animationsFolder.add(
                                                      animations,
                                                      "twist_dance"
                                                    );

                                                    fbxLoader.load(
                                                      waveHipHopUrl,
                                                      (object) => {
                                                        console.log(
                                                          "loaded wave Hiphop"
                                                        );
                                                        (
                                                          object as THREE.Object3D
                                                        ).animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
                                                        //console.dir((object as THREE.Object3D).animations[0])
                                                        const animationAction =
                                                          mixer.clipAction(
                                                            (
                                                              object as THREE.Object3D
                                                            ).animations[0]
                                                          );
                                                        animationActions.push(
                                                          animationAction
                                                        );
                                                        animationsFolder.add(
                                                          animations,
                                                          "wave_hiphop"
                                                        );
                                                        modelReady = true;
                                                      },
                                                      (xhr) => {
                                                        console.log(
                                                          (xhr.loaded /
                                                            xhr.total) *
                                                            100 +
                                                            "% loaded"
                                                        );
                                                      },
                                                      (error) => {
                                                        console.log(error);
                                                      }
                                                    );
                                                  },
                                                  (xhr) => {
                                                    console.log(
                                                      (xhr.loaded / xhr.total) *
                                                        100 +
                                                        "% loaded"
                                                    );
                                                  },
                                                  (error) => {
                                                    console.log(error);
                                                  }
                                                );
                                              },
                                              (xhr) => {
                                                console.log(
                                                  (xhr.loaded / xhr.total) *
                                                    100 +
                                                    "% loaded"
                                                );
                                              },
                                              (error) => {
                                                console.log(error);
                                              }
                                            );
                                          },
                                          (xhr) => {
                                            console.log(
                                              (xhr.loaded / xhr.total) * 100 +
                                                "% loaded"
                                            );
                                          },
                                          (error) => {
                                            console.log(error);
                                          }
                                        );
                                      },
                                      (xhr) => {
                                        console.log(
                                          (xhr.loaded / xhr.total) * 100 +
                                            "% loaded"
                                        );
                                      },
                                      (error) => {
                                        console.log(error);
                                      }
                                    );
                                  },
                                  (xhr) => {
                                    console.log(
                                      (xhr.loaded / xhr.total) * 100 +
                                        "% loaded"
                                    );
                                  },
                                  (error) => {
                                    console.log(error);
                                  }
                                );
                              },
                              (xhr) => {
                                console.log(
                                  (xhr.loaded / xhr.total) * 100 + "% loaded"
                                );
                              },
                              (error) => {
                                console.log(error);
                              }
                            );
                          },
                          (xhr) => {
                            console.log(
                              (xhr.loaded / xhr.total) * 100 + "% loaded"
                            );
                          },
                          (error) => {
                            console.log(error);
                          }
                        );
                      },
                      (xhr) => {
                        console.log(
                          (xhr.loaded / xhr.total) * 100 + "% loaded"
                        );
                      },
                      (error) => {
                        console.log(error);
                      }
                    );
                  },
                  (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                  },
                  (error) => {
                    console.log(error);
                  }
                );
              },
              (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
              },
              (error) => {
                console.log(error);
              }
            );
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

// Add lights
let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;
// Add directional Light to scene
scene.add(dirLight);

// Floor
let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0,
});

let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -11;
scene.add(floor);

let geometry = new THREE.SphereGeometry(8, 32, 32);
let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e
let sphere = new THREE.Mesh(geometry, material);

sphere.position.z = -15;
sphere.position.y = -2.5;
sphere.position.x = -0.25;
scene.add(sphere);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);

const animations = {
  default: function () {
    setAction(animationActions[0]);
  },
  idle: function () {
    setAction(animationActions[1]);
  },
  dance_running_man: function () {
    setAction(animationActions[2]);
  },
  dancing_twerk: function () {
    setAction(animationActions[3]);
  },
  dance_uprock: function () {
    setAction(animationActions[4]);
  },
  gangname_style: function () {
    setAction(animationActions[5]);
  },
  hiphop: function () {
    setAction(animationActions[6]);
  },
  locking_hiphop: function () {
    setAction(animationActions[7]);
  },
  northern_soul_floor: function () {
    setAction(animationActions[8]);
  },
  rumba_man: function () {
    setAction(animationActions[9]);
  },
  salsa_dancing: function () {
    setAction(animationActions[10]);
  },
  tut_hiphop: function () {
    setAction(animationActions[11]);
  },
  twist_dance: function () {
    setAction(animationActions[12]);
  },
  wave_hiphop: function () {
    setAction(animationActions[13]);
  },
};

const setAction = (toAction: THREE.AnimationAction) => {
  if (toAction != activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    //lastAction.stop()
    lastAction.fadeOut(1);
    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  }
};

const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
animationsFolder.open();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (modelReady) mixer.update(clock.getDelta());

  render();
  stats.update();
}

function render() {
  camera.lookAt(scene.position);
  camera.updateMatrixWorld();

  renderer.clear();
  renderer.render(scene, camera);
}

animate();
