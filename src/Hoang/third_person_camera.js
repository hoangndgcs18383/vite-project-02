import * as THREE from 'three'
import {entity} from './entity.js';


export const third_person_camera = (() => {
  
  class ThirdPersonCamera extends entity.Component {
    constructor(params) {
      super();

      this._params = params;
      this._camera = params.camera;

      this._currentPosition = new THREE.Vector3();
      this._currentLookat = new THREE.Vector3();
    }

    _CalculateOffset() {
      const Offset = new THREE.Vector3(20, 100, -500);
      Offset.applyQuaternion(this._params.target._rotation);
      Offset.add(this._params.target._position);
      return Offset;
    }

    _CalculateLookat() {
      const Lookat = new THREE.Vector3(0, 100, 0);
      Lookat.applyQuaternion(this._params.target._rotation);
      Lookat.add(this._params.target._position);
      return Lookat;
    }

    Update(timeElapsed) {
      const Offset = this._CalculateOffset();
      const Lookat = this._CalculateLookat();

      // const t = 0.05;
      // const t = 4.0 * timeElapsed;
      const t = 1.0 - Math.pow(0.01, timeElapsed);

      this._currentPosition.lerp(Offset, t);
      this._currentLookat.lerp(Lookat, t);

      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
    }
  }

  return {
    ThirdPersonCamera: ThirdPersonCamera
  };

})();