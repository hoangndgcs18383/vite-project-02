import { TextureLoader } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import {constants} from './constants';

export const load_obj = (() => {
    
    class BasicLoadingObject{
        constructor(scene){
            this._Init(scene);
        }

        _Init(scene) {
            this._scene = scene;

            const modelLoader = new FBXLoader();
            const textureLoader = new TextureLoader();
    
            const listNamePartModel = [
                'Accessories_NFT',
                'Gloves_NFT',
                'Hair_NFT',
                'Head_NFT',
                'Pants_NFT',
                'Shirt_NFT',
                'Shoes_NFT'
            ];
    
            const listPathModel = [
                constants.accessories_NFT1,
                constants.gloves_NFT1,
                constants.hair_NFT1,
                constants.head_NFT1,
                constants.pants_NFT1,
                constants.shirt_NFT1,
                constants.shoes_NFT1
            ];
    
            this._loadObject(this._scene, modelLoader, textureLoader, listNamePartModel, listPathModel);
        }

        _loadPotal(_scene, _loader) {
            _loader.load(
                constants.pathPortal,
                (object) => {
                    _scene.add(object);
                    console.log("add potal")
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            );
        };
    
        _loadObject(_scene, _loader, _textureLoader, _listName, _listPath) {
            _loader.load(
                constants.pathModel,
                (object) => {
                    player = object;
                    _scene.add(object);
                    console.log("add model")
                    //object.position.set(0, 0, 0)
                    object.scale.set(0.02, 0.02, 0.02)
                    const playerDiv = document.createElement('div');
                    playerDiv.textContent = "Player0000";
                    playerDiv.style.color = 'black';
                    const playerLable = new CSS2DObject(playerDiv);
                    playerLable.position.set(object.position.x, 190, -5);
                    object.add(playerLable);
        
                    var item = object.children.find((item) => item.name === "GRP");
    
                    for (let index = 0; index < _listName.length; index++) {
                       if(item.children[index].name == _listName[index]){
                        item.children[index].material.map = _textureLoader.load(
                            _listPath[index]
                        );
                       }  
                    }
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            );
        };
    };

    return {
        BasicLoadingObject: BasicLoadingObject
    };
})();

