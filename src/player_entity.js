import * as THREE from 'three'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { entity } from './entity.js';
import { finite_state_machine } from './finite_state_machine.js';
import { player_state } from './player_state.js';
import * as constants from './constants.js';
import dat from 'dat.gui';


export const player_entity = (() => {

  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }

    _Init() {
      this._AddState('Adam_run', player_state.RunState);
      this._AddState('Adam_run_DF', player_state.Run_DFState);
      this._AddState('Hip Hop Dancing', player_state.HipHopDancingState)
    }
  };

  class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }

    get animations() {
      return this._animations;
    }
  };


  class BasicCharacterController extends entity.Component {

    constructor(params) {
      super();
      this._Init(params);
    }

    _Init(params) {
      this._params = params;
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.125, 50.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();

      this._previousRAF = null;
      this._animations = [];
      this._listModels = [];
      this._listAnims = [];
      this._clock = new THREE.Clock();
      this._states = ['Adam_run', 'Adam_run_DF', 'Hip Hop Dancing'];
      this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));

      const setPath = "../resources/Adam/";
      const name = "Adam_01.fbx";


      //this._LoadModels(setPath, name);
      this._createGUI();
      this._LoadModelsReal();
      
    }

    _LoadModelsReal() {
      const listModelPaths = ['Adam_01.fbx', 'Adam_01_G.fbx', 'Adam_01_IKFK.fbx', 'Adam_01_IKFKG.fbx'];
      const listAnimPaths = ['Adam_run.fbx', 'Adam_run_DF.fbx', 'Hip Hop Dancing.fbx']


      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
       
      };

      this._manager.onProgress = (url, loaded, total) => {
        if (loaded == total) {
          this._onHandleModelsProcess();
        }
      };

      const loader = new FBXLoader(this._manager);
      const setPath = "../resources/Adam/";

      loader.setPath(setPath)
      for (let i = 0; i < listModelPaths.length; i++) {
        loader.load(listModelPaths[i], (fbx) => {
          this._listModels.push(fbx);
        });
      }

      for (let i = 0; i < listAnimPaths.length; i++) {
        loader.load(listAnimPaths[i], (a) => {
          this._listAnims.push(a);
          a.name = this._states[i]
        });
      }
    }

    _onHandleModelsProcess() {
      this._createAnimForModel(this._listModels[0], this._listAnims[0]);
    }

    _createAnimForModel(model, anim) {
      if (this._target != null)
      {
        this._RemoveEntity(this._target);
        //remove currentPlayer re khoi scene

      }

      const clone = SkeletonUtils.clone(model);
      this._target = clone;

      this._params.scene.add(clone);
      //clone thang dau tien trong list model

      clone.traverse(c => {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material && c.material.map) {
          c.material.map.encoding = THREE.sRGBEncoding;
        }
      });

      this._createMixerAnimation(clone, anim);
      console.log(this._mixer);
      // this._RAF();
      this._RAF()
    }

    _createMixerAnimation(target, anim){

      this._mixer = new THREE.AnimationMixer(target);
      //new clipAnimation tu thang dau tien trong list anim
      const clip = anim.animations[0];
      const action = this._mixer.clipAction(clip);
      
    
      action.play()
      
     // console.log(this._mixer)
    }

    _LoadModels(setPath, name, state, isModified) {
      const loader = new FBXLoader();

      loader.setPath(setPath)
      loader.load(name, (fbx) => {
        if (isModified) {
          try {
            if (this._target) {
              console.log(this._target, 'removed from scene');
              this._RemoveEntity(this._target);
            }
          }
          catch (error) {
            console.log(error);
          }
        }
        this._target = null;
        this._target = fbx;
        //this._target.scale.setScalar(1);
        this._params.scene.add(this._target);
        //console.log(fbx);

        //this._OnLoadSkin(fbx);

        this._bones = {};

        for (let b of this._target.children[1].skeleton.bones) {
          this._bones[b.name] = b;
          // if(b.name.startsWith("mixamo") && !b.name.startsWith("mixamorig")){
          //   b.name = b.name.replace('mixamo', 'mixamorig');
          // }
        }

        //this._bones['Bind_LeftArm'].name = 'mixamorigLeftArm';
        //this._bones['']

        //console.log(this._bones);

        this._target.traverse(c => {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material && c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
          }
        });


        this._mixer = new THREE.AnimationMixer(this._target);
        



        const _OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = this._mixer.clipAction(clip);
          //console.log(action)

          //if(clip.)

          // for (let c of clip.tracks) {
          //   if(c.name.startsWith("mixamo") && !c.name.startsWith("mixamorig")){
          //     c.name = c.name.replace('mixamo', 'mixamorig');
          //   }
          //   //console.log(c);
          // }
          // console.log(clip.tracks);

          this._animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        console.log(state)
        this._manager = new THREE.LoadingManager();
        this._manager.onLoad = () => {
          this._stateMachine.SetState(state)
        };


        const loader = new FBXLoader(this._manager);
        loader.setPath('../resources/Adam/');
        loader.load('Adam_run.fbx', (a) => { _OnLoad('Adam_run', a); });
        loader.load('Adam_run_DF.fbx', (a) => { _OnLoad('Adam_run_DF', a); });
        loader.load('Hip Hop Dancing.fbx', (a) => { _OnLoad('Hip Hop Dancing', a); });

      });
    }



    _RAF() {
      requestAnimationFrame((t) => {
        if (this._previousRAF === null) {
          this._previousRAF = t;
        }

        this._RAF();

        //this._Step(t - this._previousRAF);
        if(this._mixer) this._mixer.update(this._clock.getDelta());
        this._previousRAF = t;
      });
    }

    _Step(timeElapsed) {
      const timeElapsedS = Math.min(1.0, timeElapsed * 0.001);
      //this._UpdateSun();
      this.Update(timeElapsedS);
    }

    _RemoveEntity(fbx) {
      var object = fbx
      var selectedObj = this._params.scene.getObjectByName(object.name);
      this._params.scene.remove(selectedObj);
      //this.Update();
    }

    _createGUI() {
      const gui = new dat.GUI();
      //model
      const apiModel = { state: '0' };
      const api = { state: '0' };

      const statesModel = {
        Adam_01 : 0,
        Adam_01_G: 1,
        Adam_01_IKFK: 2,
        Adam_01_IKFKG: 3
      };

      const stateAnim = {
        'Adam_run': 0,
        'Adam_run_DF': 1,
        'Hip hop dancing': 2
      }

      const statesModelFolder = gui.addFolder('Models');
      const statesFolder = gui.addFolder('Animations');

      const ModelCtrl = statesModelFolder.add(apiModel, 'state').options(statesModel);
      const clipCtrl = statesFolder.add(api, 'state').options(stateAnim);

      const stateMaching = this._stateMachine

      ModelCtrl.onFinishChange((value) => {
        //this.tar
        let isModified = ModelCtrl.isModified()

        if (isModified) {
          statesFolder.open();
        }
        let getAnimState = clipCtrl.getValue();
        this._createAnimForModel(this._listModels[value], this._listAnims[getAnimState]);
      });

      //ModelCtrl.setValue("Adam_run");

      //states
      clipCtrl.onFinishChange((value) => {
        let getModelState = clipCtrl.getValue();
        this._createAnimForModel(this._listModels[getModelState], this._listAnims[value]);
        //stateMaching.SetState(value);
      });

      statesModelFolder.open();
    }




    _OnLoadSkin(_target) {

      const _textureLoader = new THREE.TextureLoader();

      const _listName = [
        'Accessories_NFT',
        'Hair_NFT',
        'Gloves_NFT',
        'Pants_NFT',
        'Shirt_NFT',
        'Head_NFT',
        'Shoes_NFT'
      ];

      const _listPath = [
        constants.accessories_NFT1,
        constants.hair_NFT1,
        constants.gloves_NFT1,
        constants.pants_NFT1,
        constants.shirt_NFT1,
        constants.head_NFT1,
        constants.shoes_NFT1
      ];

      const gui = new dat.GUI()
      const parameters = {
        Accessories_NFT: 'Accessories_NFT_01',
        Hair_NFT: 'Hair_NFT_01',
        Gloves_NFT: 'Gloves_NFT_01',
        Pants_NFT: 'Pants_NFT_01',
        Shirt_NFT: 'Shirt_NFT_01',
        Head_NFT: 'Head_NFT_01',
        Shoes_NFT: 'Shoes_NFT_01',
      }

      const updateAllMaterials = (value) => {
        var _checkMat = value.slice(0, value.length - 3)
        console.log(_checkMat);

        switch (_checkMat) {
          case "Accessories_NFT": LoadMat(value, 0); break;
          case "Hair_NFT": LoadMat(value, 1); break;
          case "Gloves_NFT": LoadMat(value, 2); break;
          case "Pants_NFT": LoadMat(value, 4); break;
          case "Head_NFT": LoadMat(value, 3); break;
          case "Shirt_NFT": LoadMat(value, 5); break;
          case "Shoes_NFT": LoadMat(value, 6); break;
          default: break;
        }

      }

      console.log(_target);
      const LoadMat = (value, _index) => {
        //var item = _target.children.find((item) => item.name === "GRP");
        _target.children[_index].material.map = _textureLoader
          .load("../resources/Adam_NFT/textures/A_" + value + "_M_D.png");
      }


      const setDefaultMaterials = () => {
        //var item = _target.children.find((item) => item.name === "GRP");
        for (let index = 0; index < _listName.length; index++) {
          if (_target.children[index].name == _listName[index] && _target.children[index].name != "Armature") {
            _target.children[index].material.map = _textureLoader.load(
              _listPath[index]
            );
          }
        }
      }

      const SkinsFolder = gui.addFolder("Skins")
      SkinsFolder.open();

      for (let index = 0; index < _listName.length; index++) {
        SkinsFolder.add(parameters, _listName[index], {
          common: _listName[index] + "_01",
          uncommon: _listName[index] + "_02",
          rare: _listName[index] + "_03",
          epic: _listName[index] + "_04",
          legendary: _listName[index] + "_05"
        })
          .onFinishChange((value) => {
            //console.log(item);
            console.log(value)
            updateAllMaterials(value)

          })
      }
      setDefaultMaterials();
    }


    // _FindIntersections(pos) {

    //   const grid = this.GetComponent('SpatialGridController');
    //   const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e));
    //   const collisions = [];

    //   for (let i = 0; i < nearby.length; ++i) {
    //     const e = nearby[i].entity;
    //     const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

    //     // HARDCODED
    //     if (d <= 4) {
    //       collisions.push(nearby[i].entity);
    //     }
    //   }
    //   return collisions;
    // }

    Update(timeInSeconds) {
      if (!this._stateMachine._currentState) {
        return;
      }

      const input = this.GetComponent('BasicCharacterControllerInput');
      this._stateMachine.Update(timeInSeconds, input);

      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }

      // // HARDCODED
      // if (this._stateMachine._currentState._action) {
      //   this.Broadcast({
      //     topic: 'player.action',
      //     action: this._stateMachine._currentState.Name,
      //     time: this._stateMachine._currentState._action.time,
      //   });
      // }

      const currentState = this._stateMachine._currentState;
      if (currentState.Name != 'Adam_run_DF' &&
        currentState.Name != 'Adam_run') {
        return;
      }

      // const velocity = this._velocity;
      // const frameDecceleration = new THREE.Vector3(
      //   velocity.x * this._decceleration.x,
      //   velocity.y * this._decceleration.y,
      //   velocity.z * this._decceleration.z
      // );
      // frameDecceleration.multiplyScalar(timeInSeconds);
      // frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      //   Math.abs(frameDecceleration.z), Math.abs(velocity.z));

      // velocity.add(frameDecceleration);

      // const controlObject = this._target;
      // const _Q = new THREE.Quaternion();
      // const _A = new THREE.Vector3();
      // const _R = controlObject.quaternion.clone();

      // const acc = this._acceleration.clone();

      // if (input._keys.forward) {
      //   velocity.z += acc.z * timeInSeconds * 20;
      //   acc.multiplyScalar(20.0);
      // }
      // if (input._keys.backward) {
      //   velocity.z -= acc.z * timeInSeconds;
      //   acc.multiplyScalar(2.0);
      // }
      // if (input._keys.left) {
      //   _A.set(0, 1, 0);
      //   _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
      //   _R.multiply(_Q);
      // }
      // if (input._keys.right) {
      //   _A.set(0, 1, 0);
      //   _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
      //   _R.multiply(_Q);
      // }

      // this._CopyPosition(controlObject, _R, velocity, timeInSeconds);
    }

    _CopyPosition(target, _r, _velocity, _timeInSeconds) {
      target.quaternion.copy(_r);

      const oldPosition = new THREE.Vector3();
      oldPosition.copy(target.position);

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(target.quaternion);
      forward.normalize();

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(target.quaternion);
      sideways.normalize();

      sideways.multiplyScalar(_velocity.x * _timeInSeconds);
      forward.multiplyScalar(_velocity.z * _timeInSeconds);


      const pos = target.position.clone();
      pos.add(forward);
      pos.add(sideways);


      target.position.copy(pos);
      this._position.copy(pos);

      this._parent.SetPosition(this._position);
      this._parent.SetQuaternion(this._target.quaternion);
    }
  };


  return {
    BasicCharacterControllerProxy: BasicCharacterControllerProxy,
    BasicCharacterController: BasicCharacterController,
  };

})();