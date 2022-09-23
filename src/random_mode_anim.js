import * as THREE from "three";
import { gltf_component } from "./gltf-component.js";
import { player_entity } from "./player_entity.js";
import { player_input } from "./player_input.js";
import { entity } from "./entity";
import { entity_manager } from "./entity_manager.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { grid_controller } from "./grid_manager.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { grid } from "./grid.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera.js";
import { GUI } from "dat.gui";

import * as constants from "./constants.js";
import { third_person_camera } from "./third_person_camera.js";

const _VS = `
    varying vec3 vWorldPosition;
    void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;

const _FS = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
    float h = normalize( vWorldPosition + offset ).y;
    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
    }`;

class Main {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.gammaFactor = 2.2;
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.domElement.id = "_renderer";
    document.getElementById("container").appendChild(this._renderer.domElement);

    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    //camera
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    this._camera.position.set(25, 10, 25);
    //scene

    this._scene = new THREE.Scene();
    this._scene.backgound = new THREE.Color(0x2554c7);
    this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);
    //loght
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(-10, 500, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x1e601c,
      })
    );

    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;

    this._scene.add(plane);

    this._grid = new grid.Grid(
      [
        [-1000, -1000],
        [1000, 1000],
      ],
      [100, 100]
    );
    this._entityManager = new entity_manager.EntityManager();

    this._LoadPlayer();
    this._LoadSky();
    this._Clone100Models(this._scene);

    this._previousRAF = null;
    const model = null;
    this._RAF();
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _LoadSky() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this._scene.add(hemiLight);

    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    };
    uniforms["topColor"].value.copy(hemiLight.color);

    this._scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _FS,
      side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this._scene.add(sky);
  }

  _LoadPlayer() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    };


    const player = new entity.Entity();
    player.AddComponent(new player_input.BasicCharacterControllerInput(params));
    player.AddComponent(new player_entity.BasicCharacterController(params));
    player.AddComponent(
      new grid_controller.GridController({ grid: this._grid })
    );
    this._entityManager.Add(player, "player");
    player.SetPosition(new THREE.Vector3(20, 0, 0));

    //load player camera
    const camera = new entity.Entity();
    camera.AddComponent(
      new third_person_camera.ThirdPersonCamera({
        camera: this._camera,
        target: this._entityManager.Get("player"),
      })
    );

    this._entityManager.Add(camera, "player-camera");
  }

  _Clone100Models(scene) {
    let activeAction;
    let lastAction;
    let mixer;
    let botBoss;
    const listMixer = [];
    const animationActions = [];
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onError = function (url) {
      console.log(`got a problem loading: ${url} `);
    };
    const fbxLoader = new FBXLoader(loadingManager);

    //create main bot
    fbxLoader.load(constants.defaultUrl, (model) => {
      botBoss = model;
      scene.add(model);
      model.scale.setScalar(0.035);
      model.position.set(0, 0, 0);
      mixer = new THREE.AnimationMixer(model);
      listMixer.push(mixer);

      for (let i = 1; i < 100; i++) {
        const botClone = SkeletonUtils.clone(botBoss);
        botClone.position.set((i % 5) * 5, 0, Math.round((i / 5) * 5));
        const mixerClone = new THREE.AnimationMixer(botClone);
        listMixer.push(mixerClone);
        scene.add(botClone);
      }

      //create list animation
      for (let i = 0; i < constants.listURLAnimation.length; i++) {
        fbxLoader.load(constants.listURLAnimation[i], (object) => {
          //let clip = mixer.clipAction(object.animations[0]);
          animationActions.push(object);
          //animationsFolder.add(animations, constants.listAnimation[i]);
        });
      }
      animate();
    });
    loadingManager.onProgress = function (url, itemLoaded, itemTotal) {
      console.log("progress " + itemLoaded + ", Total " + itemTotal);
      if (itemLoaded == itemTotal) {
        listMixer.forEach((element) => {
          let ani = randomAnimation();
          let clip = element.clipAction(ani.animations[0]);
          clip.play();
        });

        animate();
      }
    };

    function randomAnimation() {
      return animationActions[
        Math.floor(Math.random() * animationActions.length)
      ];
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

    const setAction = (toAction) => {
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
      const delta = clock.getDelta();

      for (const mixer of listMixer) {
        if (mixer) {
          mixer.update(delta);
        }
      }
      stats.update();
    }
  }

  _LoadPotal(_scene, _loader) {
    _loader.load(
      constants.pathPortal,
      (object) => {
        _scene.add(object);
        object.position.set(0, 5, 60);
        console.log(object.position);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  }

  _UpdateSun() {
    const player = this._entityManager.Get("player");
    const pos = player._position;

    this._sun.position.copy(pos);
    this._sun.position.add(new THREE.Vector3(-10, 500, -10));
    this._sun.target.position.copy(pos);
    this._sun.updateMatrixWorld();
    this._sun.target.updateMatrixWorld();
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._renderer.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _LoadModels() {}

  _Step(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 100.0, timeElapsed * 0.001);

    //this._UpdateSun();

    this._entityManager.Update(timeElapsedS);
  }
}

let _APP = null;

window.addEventListener("DOMContentLoaded", () => {
  _APP = new Main();
});
