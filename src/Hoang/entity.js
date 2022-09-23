import * as THREE from 'three'


export const entity = (() => {

  class Entity {
    constructor() {
      this._name = null;
      this._components = {};

      this._position = new THREE.Vector3();
      this._rotation = new THREE.Quaternion();
      this._handlers = {};
      this._parent = null;
    }

    _RegisterHandler(n, h) {
      if (!(n in this._handlers)) {
        this._handlers[n] = [];
      }
      this._handlers[n].push(h);
    }

    SetParent(p) {
      this._parent = p;
    }

    SetName(n) {
      this._name = n;
    }

    get Name() {
      return this._name;
    }

    SetActive(b) {
      this._parent.SetActive(this, b);
    }

    AddComponent(c) {
      c.SetParent(this);
      this._components[c.constructor.name] = c;

      c.InitComponent();
    }

    GetComponent(n) {
      return this._components[n];
    }

    FindEntity(n) {
      return this._parent.Get(n);
    }

    SetPosition(p) {
      this._position.copy(p);
    }

    SetQuaternion(r) {
      this._rotation.copy(r);
    }

    Update(timeElapsed) {
      for (let k in this._components) {
        this._components[k].Update(timeElapsed);
      }
    }
  };

  class Component {
    constructor() {
      this._parent = null;
    }

    SetParent(p) {
      this._parent = p;
    }

    InitComponent() {}

    GetComponent(n) {
      return this._parent.GetComponent(n);
    }

    FindEntity(n) {
      return this._parent.FindEntity(n);
    }

    Update(_) {}

    _RegisterHandler(n, h) {
      this._parent._RegisterHandler(n, h);
    }
  };

  return {
    Entity: Entity,
    Component: Component,
  };

})();