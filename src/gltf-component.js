import * as THREE from 'three'

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import {entity} from './entity.js';

import * as constants from './constants.js';
import dat from 'dat.gui';


export const gltf_component = (() => {

  class StaticModelComponent extends entity.Component {
    constructor(params) {
      super();
      this._Init(params);
    }
  
    _Init(params) {
      this._params = params;
  
      this._LoadModels();
    }
  
    InitComponent() {
      this._RegisterHandler('update.position', (m) => { this._OnPosition(m); });
    }

    _OnPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value);
      }
    }


    _LoadModels() {
      if (this._params.resourceName.endsWith('glb') || this._params.resourceName.endsWith('gltf')) {
        this._LoadGLB();
      } else if (this._params.resourceName.endsWith('fbx')) {
        this._LoadFBX();
      }
    }

    _OnLoaded(obj) {
      this._target = obj;
      this._params.scene.add(this._target);

      this._target.scale.setScalar(this._params.scale);
      this._target.position.copy(this._parent._position);

      let texture = null;
      if (this._params.resourceTexture) {
        const texLoader = new THREE.TextureLoader();
        texture = texLoader.load(this._params.resourceTexture);
        texture.encoding = THREE.sRGBEncoding;
      }

      this._target.traverse(c => {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            if (texture) {
              m.map = texture;
            }
            if (this._params.specular) {
              m.specular = this._params.specular;
            }
            if (this._params.emissive) {
              m.emissive = this._params.emissive;
            }
          }
        }
        if (this._params.receiveShadow != undefined) {
          c.receiveShadow = this._params.receiveShadow;
        }
        if (this._params.castShadow != undefined) {
          c.castShadow = this._params.castShadow;
        }
        if (this._params.visible != undefined) {
          c.visible = this._params.visible;
        }
      });
    }

    _LoadGLB() {
      const loader = new GLTFLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (glb) => {
        this._OnLoaded(glb.scene);
      });
    }

    _LoadFBX() {
      const loader = new FBXLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (fbx) => {
        this._OnLoaded(fbx);
      });
    }

    Update(timeInSeconds) {
    }
  };


  class AnimatedModelComponent extends entity.Component {
    constructor(params) {
      super();
      this._Init(params);
    }
  
    InitComponent() {
      this._RegisterHandler('update.position', (m) => { this._OnPosition(m); });
    }

    _OnPosition(m) {
      if (this._target) {
        this._target.position.copy(m.value);
        this._target.position.y = 0.35;
      }
    }

    _Init(params) {
      this._params = params;
  
      this._LoadModels();
    }
  
    _LoadModels() {
      if (this._params.resourceName.endsWith('glb') || this._params.resourceName.endsWith('gltf')) {
        this._LoadGLB();
      } else if (this._params.resourceName.endsWith('fbx')) {
        this._LoadFBX();
      }
    }

    _OnLoaded(obj, animations) {
      this._target = obj;
      this._params.scene.add(this._target);

      this._target.scale.setScalar(this._params.scale);
      this._target.position.copy(this._parent._position);

      let texture = null;
      if (this._params.resourceTexture) {
        const texLoader = new THREE.TextureLoader();
        texture = texLoader.load(this._params.resourceTexture);
        texture.encoding = THREE.sRGBEncoding;
      }

      this._target.traverse(c => {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            if (texture) {
              m.map = texture;
            }
            if (this._params.specular) {
              m.specular = this._params.specular;
            }
            if (this._params.emissive) {
              m.emissive = this._params.emissive;
            }
          }
        }
        if (this._params.receiveShadow != undefined) {
          c.receiveShadow = this._params.receiveShadow;
        }
        if (this._params.castShadow != undefined) {
          c.castShadow = this._params.castShadow;
        }
        if (this._params.visible != undefined) {
          c.visible = this._params.visible;
        }
      });

      const _OnLoad = (anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
  
        action.play();
      };

      const loader = new FBXLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceAnimation, (a) => { _OnLoad(a); });

      this._mixer = new THREE.AnimationMixer(this._target);

      this._parent._mesh = this._target;
    }

    _LoadGLB() {
      const loader = new GLTFLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (glb) => {
        this._OnLoaded(glb.scene, glb.animations);
      });
    }

    _LoadFBX() {
      const loader = new FBXLoader();
      loader.setPath(this._params.resourcePath);
      loader.load(this._params.resourceName, (fbx) => {
        this._OnLoaded(fbx);
        fbx.rotation.set(0, -10, 0)
		    //this._OnLoadSkin(fbx);
        this._createGUI();
      });
    }

    _OnLoadSkin(_target) {

      const _textureLoader = new THREE.TextureLoader();

      const _listName = [
        'Accessories_NFT',
        'Gloves_NFT',
        'Hair_NFT',
        'Head_NFT',
        'Pants_NFT',
        'Shirt_NFT',
        'Shoes_NFT'
      ];
  
      const _listPath = [
        constants.accessories_NFT1,
        constants.gloves_NFT1,
        constants.hair_NFT1,
        constants.head_NFT1,
        constants.pants_NFT1,
        constants.shirt_NFT1,
        constants.shoes_NFT1
      ];
  
      var item = _target.children.find((item) => item.name === "GRP");

      const gui = new dat.GUI()
				const accessories = [
					_textureLoader.load(constants.accessories_NFT1),
					_textureLoader.load(constants.accessories_NFT2),
					//textureLoader.load('./textures/matcaps/3.png')
				]

				const parameters = {
					Accessories_NFT: 'Accessories_NFT_01',
          Gloves_NFT: 'Gloves_NFT_01',
          Hair_NFT: 'Hair_NFT_01',
          Head_NFT: 'Head_NFT_01',
          Pants_NFT: 'Pants_NFT_01',
          Shirt_NFT: 'Shirt_NFT_01',
          Shoes_NFT: 'Shoes_NFT_01',
				}
				
				const updateAllMaterials = (value) => {
          var _checkMat = value.slice(0 , value.length - 3)
          console.log(_checkMat);

          switch(_checkMat){
            case "Accessories_NFT": LoadMat(value, 0); break;
            case "Gloves_NFT": LoadMat(value, 1); break;
            case "Hair_NFT": LoadMat(value, 2); break;
            case "Head_NFT": LoadMat(value, 3); break;
            case "Pants_NFT": LoadMat(value, 4); break;
            case "Shirt_NFT": LoadMat(value, 5); break;
            case "Shoes_NFT": LoadMat(value, 6); break;
            default: break;
          }

				}

        const LoadMat = (value, _index) => {
          var item = _target.children.find((item) => item.name === "GRP");
            item.children[_index].material.map = _textureLoader
            .load("../resources/Adam_NFT/textures/A_"+ value +"_M_D.png");
        }
        
        
        const setDefaultMaterials = () => {
          var item = _target.children.find((item) => item.name === "GRP");
          for (let index = 0; index < _listName.length; index++) {
						if(item.children[index].name == _listName[index]){
						 item.children[index].material.map = _textureLoader.load(
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
          .onFinishChange((value)=>{
            //console.log(item);
            console.log(value)
            updateAllMaterials(value)

          })
        }
        setDefaultMaterials();
    }




    Update(timeInSeconds) {
      if (this._mixer) {
        this._mixer.update(timeInSeconds);
      }
    }
  };


  return {
      StaticModelComponent: StaticModelComponent,
      AnimatedModelComponent: AnimatedModelComponent,
  };

})();