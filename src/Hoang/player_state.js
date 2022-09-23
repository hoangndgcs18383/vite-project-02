import dat from 'dat.gui';

export const player_state = (() => {




  class State {
    constructor(parent) {
      this._parent = parent;
    }

    
  
    Enter() {}
    Exit() {}
    Update() {}
  };

  // class WalkState extends State {
  //   constructor(parent) {
  //     super(parent);
  //   }
  
  //   get Name() {
  //     return 'Adam_run_DF';
  //   }
  
  //   Enter(prevState) {
  //     const curAction = this._parent._proxy._animations['Adam_run_DF'].action;
  //     if (prevState) {
  //       const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
  //       curAction.enabled = true;
  
  //       if (prevState.Name == 'run') {
  //         const ratio = curAction.getClip().duration / prevAction.getClip().duration;
  //         curAction.time = prevAction.time * ratio;
  //       } else {
  //         curAction.time = 0.0;
  //         curAction.setEffectiveTimeScale(1.0);
  //         curAction.setEffectiveWeight(1.0);
  //       }
  
  //       curAction.crossFadeFrom(prevAction, 0.1, true);
  //       curAction.play();
  //     } else {
  //       curAction.play();
  //     }
  //   }
  
  //   Exit() {
  //   }
  
  //   Update(timeElapsed, input) {
  //     if (input._keys.forward || input._keys.backward) {
  //       if (input._keys.shift) {
  //         this._parent.SetState('run');
  //       }
  //       return;
  //     }

  //     this._parent.SetState('Adam_run_DF');
  //   }
  // };
  
  
  // class RunState extends State {
  //   constructor(parent) {
  //     super(parent);
  //   }
  
  //   get Name() {
  //     return 'run';
  //   }
  
  //   Enter(prevState) {
  //     const curAction = this._parent._proxy._animations['run'].action;
  //     if (prevState) {
  //       const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
  //       curAction.enabled = true;
  
  //       if (prevState.Name == 'Adam_run_DF') {
  //         const ratio = curAction.getClip().duration / prevAction.getClip().duration;
  //         curAction.time = prevAction.time * ratio;
  //       } else {
  //         curAction.time = 0.0;
  //         curAction.setEffectiveTimeScale(1.0);
  //         curAction.setEffectiveWeight(1.0);
  //       }
  
  //       curAction.crossFadeFrom(prevAction, 0.1, true);
  //       curAction.play();
  //     } else {
  //       curAction.play();
  //     }
  //   }
  
  //   Exit() {
  //   }
  
  //   Update(timeElapsed, input) {
  //     if (input._keys.forward || input._keys.backward) {
  //       if (!input._keys.shift) {
  //         this._parent.SetState('Adam_run_DF');
  //       }
  //       return;
  //     }
  
  //     this._parent.SetState('Adam_run');
  //   }
  // };
  
  
  class RunState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'Adam_run';
    }
  
    Enter(prevState) {
      const idleAction = this._parent._proxy._animations['Adam_run'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.25, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(_, input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('Adam_run_DF');
      }
      this._parent.SetState('Adam_run');
    }
  };

  class Run_DFState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'Adam_run_DF';
    }
  
    Enter(prevState) {
      const idleAction = this._parent._proxy._animations['Adam_run_DF'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.25, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(_, input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('Adam_run_DF');
      }
      this._parent.SetState('Adam_run_DF');
    }
  };

  class HipHopDancingState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'Hip Hop Dancing';
    }
  
    Enter(prevState) {
      const idleAction = this._parent._proxy._animations['Hip Hop Dancing'].action;
      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.25, true);
        idleAction.play();
      } else {
        idleAction.play();
      }
    }
  
    Exit() {
    }
  
    Update(_, input) {
      if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('Hip Hop Dancing');
      }
      this._parent.SetState('Hip Hop Dancing');
    }
  };

  // class DancingState extends State {
  //   constructor(parent) {
  //     super(parent);
  //   }
  
  //   get Name() {
  //     return 'Hip Hop Dancing';
  //   }
  
  //   Enter(prevState) {
  //     const curAction = this._parent._proxy._animations['Hip Hop Dancing'].action;
  //     if (prevState) {
  //       const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
  //       curAction.enabled = true;
  
  //       if (prevState.Name == 'Adam_run_DF' || prevState.Name == 'Adam_run') {
  //         const ratio = curAction.getClip().duration / prevAction.getClip().duration;
  //         curAction.time = prevAction.time * ratio;
  //       } else {
  //         curAction.time = 0.0;
  //         curAction.setEffectiveTimeScale(1.0);
  //         curAction.setEffectiveWeight(1.0);
  //       }
  
  //       curAction.crossFadeFrom(prevAction, 0.1, true);
  //       curAction.play();
  //     } else {
  //       curAction.play();
  //     }
  //   }
  
  //   Exit() {
  //   }
  
  //   Update(timeElapsed, input) {
  //     if (input._keys.forward || input._keys.backward) {
  //       if (input._keys.shift) {
  //         this._parent.SetState('run');
  //       }
  //       return;
  //     }
  //     this._parent.SetState('Hip Hop Dancing');
  //   }
  // };

  return {
    // State: State,
    // IdleState: IdleState,
    // WalkState: WalkState,
    // RunState: RunState,
    // DancingState: DancingState

    RunState: RunState,
    Run_DFState : Run_DFState,
    HipHopDancingState : HipHopDancingState,
  };

})();