(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {Behavior, property} = wfl.behavior;

class ArrowKeyMovement extends Behavior {
  constructor() {
    super();
    
    // Whether or not the update should be handled from an external behavior
    this.waitForExternalUpdate = false;

    // The top of the stack determines which direction to face
    this._walkDirectionStack = [];
  }
  
  begin() {
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = this.moveSpeed;
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._player.customData.direction = 'down';
    
    this._lastDirection = Keyboard.DOWN;
  }
  
  update(dt) {
    if (!this.waitForExternalUpdate) {
      this.applyFriction();
      this.handleInput();
    }
  }
  
  applyFriction() {
    if (this.gameObject.velocity) {
      this.gameObject.velocity.multiply(this.friction);
      this.gameObject.acceleration.multiply(this.friction);
    }
  }
  
  checkAvailability() {
    return Keyboard.anyKeyPressed;
  }
  
  handleInput() {
    let key           = Keyboard;
    let lastPressed   = key.getKeyJustPressed();
    let leftPriority  = -1;
    let rightPriority = -1;
    let upPriority    = -1;
    let downPriority  = -1;

    // Remove values that shouldn't be in the stack
    for (let i = this._walkDirectionStack.length; i >= 0; i--) {
      if (!key.isPressed(this._walkDirectionStack[i])) {
        this._walkDirectionStack.splice(i, 1);
      }
    }

    // Add the current direction of movement to the stack (if any)
    if (lastPressed > -1) {
      switch (lastPressed) {
        case key.LEFT:
        case key.RIGHT:
        case key.UP:
        case key.DOWN:
          this._walkDirectionStack.push(lastPressed);
          break;
      }
    }

    // Determine the priorities of the directions
    var priorityCounter = 0;
    for (let i = 0; i < this._walkDirectionStack.length; i++) {
      switch (this._walkDirectionStack[i]) {
        case key.LEFT:
          leftPriority = priorityCounter;
          priorityCounter++;
          break;
        case key.RIGHT:
          rightPriority = priorityCounter;
          priorityCounter++;
          break;
        case key.UP:
          upPriority = priorityCounter;
          priorityCounter++;
          break;
        case key.DOWN:
          downPriority = priorityCounter;
          priorityCounter++;
          break;
      }
    }
    
    if (this._walkDirectionStack.length > 0) {
      this._lastDirection = this._walkDirectionStack[this._walkDirectionStack.length - 1];
    }
    
    switch (this._lastDirection) {
      case key.LEFT:
        this._player.customData.direction = 'left';
        break;
      case key.RIGHT:
        this._player.customData.direction = 'right';
        break;
      case key.UP:
        this._player.customData.direction = 'up';
        break;
      case key.DOWN:
        this._player.customData.direction = 'down';
        break;
    }

    // Move the physics object in the appropriate direction
    if (this.gameObject.velocity) {
      if (leftPriority > rightPriority) {
        let movementForce = new geom.Vec2(-1, 0);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      if (rightPriority > leftPriority) {
        let movementForce = new geom.Vec2(1, 0);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      if (upPriority > downPriority) {
        let movementForce = new geom.Vec2(0, -1);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      if (downPriority > upPriority) {
        let movementForce = new geom.Vec2(0, 1);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      
    // If not a physics object, still allow basic movement
    } else {
      let dx = 0;
      let dy = 0;
      
      if (leftPriority > rightPriority) {
        dx += -this.moveSpeed;
      }
      if (rightPriority > leftPriority) {
        dx += this.moveSpeed;
      }
      if (upPriority > downPriority) {
        dy += -this.moveSpeed;
      }
      if (downPriority > upPriority) {
        dy += this.moveSpeed;
      }
      
      this.gameObject.position._x += dx;
      this.gameObject.position._y += dy;
    }
  }
}

ArrowKeyMovement.moveSpeed = property.Number(5);
ArrowKeyMovement.friction  = property.Number(0.9, 0, 1);

module.exports = ArrowKeyMovement;
},{}],2:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const PIXI = wfl.PIXI;
const GridHelper = require('./_GridHelper');

class MarkTileAheadOfPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    
    let gfx0 = PIXI.loader.resources['TileMarker0'].texture;
    let gfx1 = PIXI.loader.resources['TileMarker1'].texture;
    
    this.frame0 = GameObject.createFrame(gfx0, this.animationSpeed);
    this.frame1 = GameObject.createFrame(gfx1, this.animationSpeed);
    
    this.state = GameObject.createState();
    this.state.addFrame(this.frame0);
    this.state.addFrame(this.frame1);
    
    this.gameObject.addState('default', this.state);
    this.gameObject.setState('default');
  }
  
  update(dt) {
    let directionAhead = GridHelper.directionNameToVector(this._player.customData.direction);
    let aheadTilePos = GridHelper.tileAhead(this._player.position, directionAhead);
    let aheadWorldPos = GridHelper.tileToWorld(aheadTilePos);
    this.gameObject.position.x = aheadWorldPos.x;
    this.gameObject.position.y = aheadWorldPos.y;
  }
}

MarkTileAheadOfPlayer.animationSpeed = property.Number(10, 1);

module.exports = MarkTileAheadOfPlayer;
},{"./_GridHelper":8}],3:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;

class MovementManager extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    const ArrowKeyMovement = require('./ArrowKeyMovement');
    const StandardControllerMovement = require('./StandardControllerMovement');
    
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = this.moveSpeed;
  
    this._movementBehaviors = [];
    this._keyboardMovement = null;
    this._controllerMovement = null;
    
    // Find all movement schemes
    for (let behavior of this.gameObject._behaviors) {
      if (behavior instanceof ArrowKeyMovement) {
        this._keyboardMovement = behavior;
        this._movementBehaviors.push(behavior);
      }
      if (behavior instanceof StandardControllerMovement) {
        this._controllerMovement = behavior;
        this._movementBehaviors.push(behavior);
      }
    }
    
    // Unify properties for all movement behaviors
    for (let behavior of this._movementBehaviors) {
      behavior.moveSpeed = this.moveSpeed;
      behavior.friction  = this.friction;
      behavior.waitForExternalUpdate = true;
    }
  
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._registered = {};
  }
  
  update(dt) {
    // Keyboard takes priority
    if (this._keyboardMovement && this._keyboardMovement.checkAvailability()) {
      this._keyboardMovement.applyFriction();
      this._keyboardMovement.handleInput();
    
    // Use controller movement if keyboard isn't in use
    } else if (this._controllerMovement && this._controllerMovement.checkAvailability()) {
      this._controllerMovement.applyFriction();
      this._controllerMovement.handleInput();
    }
    
    this._updatePlayerState();
  }
  
  registerButton(key, keyCodes, gamePadButtons) {
    this._registered[key] = {
      keyCodes: keyCodes,
      gamePadButtons: gamePadButtons
    };
  }
  
  checkButton(key) {
    let registered = this._registered[key];
    
    if (this._keyboardMovement) {
      for (let keyCode of registered.keyCodes) {
        if (Keyboard.isPressed(keyCode)) {
          return true;
        }
      }
    }
    
    if (this._controllerMovement && this._controllerMovement.currentController) {
      let currentController = this._controllerMovement.currentController;
      for (let gamePadButton of registered.gamePadButtons) {
        if (currentController.buttons[gamePadButton].pressed) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  _updatePlayerState() {
    let direction = this._player.customData.direction;
    let state     = null;
    let walking   = false;
    
    switch (direction) {
      case 'up':
        walking = this._player.velocity._y < -0.05;
        state = walking ? 'walk_u' : 'idle_u';
        break;
        
      case 'down':
        walking = this._player.velocity._y > 0.05;
        state = walking ? 'walk_d' : 'idle_d';
        break;
        
      case 'left':
        walking = this._player.velocity._x < -0.05;
        state = walking ? 'walk_l' : 'idle_l';
        break;
        
      case 'right':
        walking = this._player.velocity._x > 0.05;
        state = walking ? 'walk_r' : 'idle_r';
        break;
    }
    
    if (state) {
      this._player.setState(state);
    }
  }
}

MovementManager.moveSpeed = property.Number(5);
MovementManager.friction  = property.Number(0.9, 0, 1);

module.exports = MovementManager;
},{"./ArrowKeyMovement":1,"./StandardControllerMovement":7}],4:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const GridHelper = require('./_GridHelper');
const entities = require('./entities');

class PressButtonToAddEntityAheadOfPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    const MovementManager = require('./MovementManager');
  
    this._movementManager = null;
    
    // Find MovementManager
    for (let behavior of this.gameObject._behaviors) {
      if (behavior instanceof MovementManager) {
        this._movementManager = behavior;
      }
    }
  
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._entityClass = entities[this.entityModuleName];
    this._objPool = [];
    this._lastPlacementTimer = Infinity;
    
    // Register buttons for this behavior
    if (this._movementManager) {
      this._movementManager.registerButton(
        'place-entity',
        [this.keyPrimary, this.keySecondary],
        [this.buttonPrimary, this.buttonSecondary]
      );
    }
  }
  
  update(dt) {
    this._lastPlacementTimer += dt;
  
    if (this._lastPlacementTimer >= this.placementTimer &&
        this._movementManager &&
        this._movementManager.checkButton('place-entity')) {
      
      let directionAhead = GridHelper.directionNameToVector(this._player.customData.direction);
      let aheadTilePos = GridHelper.tileAhead(this._player.position, directionAhead);
      let aheadWorldPos = GridHelper.tileToWorld(aheadTilePos);
      let aheadObjects = this._scene.findGameObjectsInRect(
        aheadWorldPos.x - 15,
        aheadWorldPos.y - 15,
        30,
        30
      );
      
      let canAdd = true;
      for (let obj of aheadObjects) {
        if (obj !== this._player) {
          canAdd = false;
          
          if (obj.customData.grabbable) {
            this.removeObj(obj);
            this._lastPlacementTimer = 0;
            break;
          }
        }
      }
      
      if (canAdd && this._entityClass) {
        let gameObject = this.createObj();
        gameObject.position.x = aheadWorldPos.x;
        gameObject.position.y = aheadWorldPos.y;
        this._lastPlacementTimer = 0;
      }
    }
  }
  
  createObj() {
    let obj = null;
  
    if (this._objPool.length > 0) {
      obj = this._objPool[this._objPool.length - 1];
      obj.solid = true;
      obj.fixed = true;
      obj.visible = true;
      this._objPool.splice(this._objPool.length - 1, 1);
    } else {
      obj = new this._entityClass();
      this._scene.addGameObject(obj, this.entityLayer);
    }
    
    return obj;
  }
  
  removeObj(obj) {
    if (obj) {
      obj.solid = false;
      obj.fixed = false;
      obj.visible = false;
      this._objPool.push(obj);
    }
  }
}

PressButtonToAddEntityAheadOfPlayer.entityModuleName = property.String();
PressButtonToAddEntityAheadOfPlayer.entityLayer = property.Integer(0, 0);
PressButtonToAddEntityAheadOfPlayer.keyPrimary = property.Integer(Keyboard.SPACEBAR, 0, 255);
PressButtonToAddEntityAheadOfPlayer.keySecondary = property.Integer(0, 0, 255);
PressButtonToAddEntityAheadOfPlayer.buttonPrimary = property.Integer(0, 0, 255);
PressButtonToAddEntityAheadOfPlayer.buttonSecondary = property.Integer(2, 0, 255);
PressButtonToAddEntityAheadOfPlayer.placementTimer = property.Integer(30, 0);

module.exports = PressButtonToAddEntityAheadOfPlayer;
},{"./MovementManager":3,"./_GridHelper":8,"./entities":10}],5:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const $ = wfl.jquery;
const PIXI = wfl.PIXI;

const fragSrc =
`
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform vec2 cameraPosition;
uniform vec4 tint0;
uniform vec4 tint1;
uniform float tintBias;
uniform float minRadius;
uniform float maxRadius;
uniform float radiusFadeSize;

void main() {
  vec2 screenCoord = (vTextureCoord * filterArea.xy + filterArea.zw);
  vec2 clampedCoord = clamp(vTextureCoord, filterClamp.xy, filterClamp.zw);
  vec4 color = texture2D(uSampler, clampedCoord);
  vec2 normalizedCoord = screenCoord / dimensions;
  vec2 offset = vec2(0.5, 0.5);
  offset.x *= dimensions.x;
  offset.y *= dimensions.y;
  normalizedCoord.x *= dimensions.x;
  normalizedCoord.y *= dimensions.y;
  
  vec2 displacement = offset - normalizedCoord;
  float distSquared = dot(displacement, displacement);
  
  vec4 currentTint = mix(tint0, tint1, tintBias);
  color = color * currentTint;
  
  float currentRadius = mix(minRadius, maxRadius, tintBias);
  float currentMaxRadius = currentRadius + radiusFadeSize;
 
  // TODO: Remove branches
  if (distSquared < currentRadius * currentRadius) {
    gl_FragColor = color;
  } else if (distSquared < currentMaxRadius * currentMaxRadius)  {
    float radiusDiffSquared = radiusFadeSize * radiusFadeSize;
    float remainingDist = distSquared - currentRadius * currentRadius;
    color *= 1.0 - remainingDist / radiusDiffSquared;
    gl_FragColor = vec4(color.r, color.g, color.b, 1);
  } else {
    gl_FragColor = vec4(0, 0, 0, 1);
  }
}
`.split('\n').reduce((c, a) => c + a.trim() + '\n');

class ShowCamRadius extends Behavior {
  constructor() {
    super();
    
    // Reset filters
    this._scene = world.findScene('wfl');
    this._scene._stage.filters = [];
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    this._player = this._scene.findGameObjectByName('player');
    this.canvas = this._scene.canvas;
    
    let scene = this._scene;
    let minRadius = this.minRadius;
    let maxRadius = this.maxRadius;
    let radiusFadeSize = this.radiusFadeSize;
    let r0 = this.tintR0;
    let g0 = this.tintG0;
    let b0 = this.tintB0;
    let r1 = this.tintR1;
    let g1 = this.tintG1;
    let b1 = this.tintB1;
    let tintShiftTime = this.tintShiftTime * 1000;
    let lastRender = Date.now();
    let renderTimer = 0;
    
    this.filter = new PIXI.Filter(null, fragSrc);
    this.filter.autoFit = false;
    this.filter.apply = function(filterManager, input, output) {
      let now = Date.now();
      renderTimer += now - lastRender;
      lastRender = now;
    
      this.uniforms.dimensions[0] = scene.renderer.view.width;
      this.uniforms.dimensions[1] = scene.renderer.view.height;
      this.uniforms.cameraPosition[0] = scene.camera.position.x;
      this.uniforms.cameraPosition[1] = scene.camera.position.y;
      this.uniforms.minRadius = minRadius;
      this.uniforms.maxRadius = maxRadius;
      this.uniforms.radiusFadeSize = radiusFadeSize;
      this.uniforms.tint0[0] = r0;
      this.uniforms.tint0[1] = g0;
      this.uniforms.tint0[2] = b0;
      this.uniforms.tint0[3] = 1;
      this.uniforms.tint1[0] = r1;
      this.uniforms.tint1[1] = g1;
      this.uniforms.tint1[2] = b1;
      this.uniforms.tint1[3] = 1;
      this.uniforms.tintBias = 1 + 0.5 * Math.sin(Math.PI * 2 * renderTimer / tintShiftTime);
      
      // Draw the filter
      filterManager.applyFilter(this, input, output);
    }
     
    this._scene._stage.filters = [this.filter];
    
    this.fullSizeGameObject = new GameObject();
    this.fullSizeGraphics = new PIXI.Graphics;
    
    this._scene.addGameObject(this.fullSizeGameObject, Infinity);
  }
  
  update(dt) {
    this.fullSizeGraphics.clear();
    this.fullSizeGraphics.beginFill(0, 0);
    this.fullSizeGraphics.drawRect(
      -this._scene.renderer.view.width * 0.5,
      -this._scene.renderer.view.height * 0.5,
      this._scene.renderer.view.width,
      this._scene.renderer.view.height
    );
    this.fullSizeGraphics.endFill();
    this.fullSizeGameObject.addChild(this.fullSizeGraphics);
    this.fullSizeGameObject.position.x = this._scene.camera.position.x;
    this.fullSizeGameObject.position.y = this._scene.camera.position.y;
  }
}

ShowCamRadius.minRadius = property.Number(200, 1);
ShowCamRadius.maxRadius = property.Number(250, 1);
ShowCamRadius.radiusFadeSize = property.Number(50, 0);
ShowCamRadius.tintR0    = property.Number(1, 0, 1);
ShowCamRadius.tintG0    = property.Number(1, 0, 1);
ShowCamRadius.tintB0    = property.Number(1, 0, 1);
ShowCamRadius.tintR1    = property.Number(1, 0, 1);
ShowCamRadius.tintG1    = property.Number(1, 0, 1);
ShowCamRadius.tintB1    = property.Number(1, 0, 1);
ShowCamRadius.tintShiftTime = property.Number(5, 1);

module.exports = ShowCamRadius;
},{}],6:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const PIXI = wfl.PIXI;

class SpawnPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    
    this._scene = world.findScene('wfl');
    this._scene.player = this.gameObject;
    
    this._scene.camera.follow(this.gameObject);
    this._scene.camera.position.x = this.gameObject.position.x;
    this._scene.camera.position.y = this.gameObject.position.y;
    
    let gfx_U0 = PIXI.loader.resources['Player_Up0'].texture;
    let gfx_U1 = PIXI.loader.resources['Player_Up1'].texture;
    let gfx_U2 = PIXI.loader.resources['Player_Up2'].texture;
    let gfx_U3 = PIXI.loader.resources['Player_Up3'].texture;
    let gfx_D0 = PIXI.loader.resources['Player_Down0'].texture;
    let gfx_D1 = PIXI.loader.resources['Player_Down1'].texture;
    let gfx_D2 = PIXI.loader.resources['Player_Down2'].texture;
    let gfx_D3 = PIXI.loader.resources['Player_Down3'].texture;
    let gfx_L0 = PIXI.loader.resources['Player_Left0'].texture;
    let gfx_L1 = PIXI.loader.resources['Player_Left1'].texture;
    let gfx_L2 = PIXI.loader.resources['Player_Left2'].texture;
    let gfx_L3 = PIXI.loader.resources['Player_Left3'].texture;
    let gfx_R0 = PIXI.loader.resources['Player_Right0'].texture;
    let gfx_R1 = PIXI.loader.resources['Player_Right1'].texture;
    let gfx_R2 = PIXI.loader.resources['Player_Right2'].texture;
    let gfx_R3 = PIXI.loader.resources['Player_Right3'].texture;
    
    this.frameU0 = GameObject.createFrame(gfx_U0, this.animationSpeed);
    this.frameU1 = GameObject.createFrame(gfx_U1, this.animationSpeed);
    this.frameU2 = GameObject.createFrame(gfx_U2, this.animationSpeed);
    this.frameU3 = GameObject.createFrame(gfx_U3, this.animationSpeed);
    
    this.frameD0 = GameObject.createFrame(gfx_D0, this.animationSpeed);
    this.frameD1 = GameObject.createFrame(gfx_D1, this.animationSpeed);
    this.frameD2 = GameObject.createFrame(gfx_D2, this.animationSpeed);
    this.frameD3 = GameObject.createFrame(gfx_D3, this.animationSpeed);
    
    this.frameL0 = GameObject.createFrame(gfx_L0, this.animationSpeed);
    this.frameL1 = GameObject.createFrame(gfx_L1, this.animationSpeed);
    this.frameL2 = GameObject.createFrame(gfx_L2, this.animationSpeed);
    this.frameL3 = GameObject.createFrame(gfx_L3, this.animationSpeed);
    
    this.frameR0 = GameObject.createFrame(gfx_R0, this.animationSpeed);
    this.frameR1 = GameObject.createFrame(gfx_R1, this.animationSpeed);
    this.frameR2 = GameObject.createFrame(gfx_R2, this.animationSpeed);
    this.frameR3 = GameObject.createFrame(gfx_R3, this.animationSpeed);
    
    this.stateIdleU = GameObject.createState();
    this.stateIdleU.addFrame(this.frameU0);
    
    this.stateIdleD = GameObject.createState();
    this.stateIdleD.addFrame(this.frameD0);
    
    this.stateIdleL = GameObject.createState();
    this.stateIdleL.addFrame(this.frameL0);
    
    this.stateIdleR = GameObject.createState();
    this.stateIdleR.addFrame(this.frameR0);
    
    this.stateWalkU = GameObject.createState();
    this.stateWalkU.addFrame(this.frameU0);
    this.stateWalkU.addFrame(this.frameU1);
    this.stateWalkU.addFrame(this.frameU2);
    this.stateWalkU.addFrame(this.frameU3);
    
    this.stateWalkD = GameObject.createState();
    this.stateWalkD.addFrame(this.frameD0);
    this.stateWalkD.addFrame(this.frameD1);
    this.stateWalkD.addFrame(this.frameD2);
    this.stateWalkD.addFrame(this.frameD3);
    
    this.stateWalkL = GameObject.createState();
    this.stateWalkL.addFrame(this.frameL0);
    this.stateWalkL.addFrame(this.frameL1);
    this.stateWalkL.addFrame(this.frameL2);
    this.stateWalkL.addFrame(this.frameL3);
    
    this.stateWalkR = GameObject.createState();
    this.stateWalkR.addFrame(this.frameR0);
    this.stateWalkR.addFrame(this.frameR1);
    this.stateWalkR.addFrame(this.frameR2);
    this.stateWalkR.addFrame(this.frameR3);
    
    this.gameObject.addState('idle_u', this.stateIdleU);
    this.gameObject.addState('idle_d', this.stateIdleD);
    this.gameObject.addState('idle_l', this.stateIdleL);
    this.gameObject.addState('idle_r', this.stateIdleR);
    this.gameObject.addState('walk_u', this.stateWalkU);
    this.gameObject.addState('walk_d', this.stateWalkD);
    this.gameObject.addState('walk_l', this.stateWalkL);
    this.gameObject.addState('walk_r', this.stateWalkR);
    this.gameObject.setState('idle_d');
  }
}

SpawnPlayer.animationSpeed = property.Number(5, 1);

module.exports = SpawnPlayer;
},{}],7:[function(require,module,exports){
"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {Behavior, property} = wfl.behavior;

let gamepadEventsAvailable = 'ongamepadconnected' in window;
let controllers = {};

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
}

function removeGamepad(gamepad) {
  delete controllers[gamepad.index];
}

function scanGamepads() {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() :
                (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addGamepad(gamepads[i]);
      }
    }
  }
}

function onGamepadConnect(e) {
  addGamepad(e.gamepad);
}

function onGamepadDisconnect(e) {
  removeGamepad(e.gamepad);
}

window.addEventListener('gamepadconnected', onGamepadConnect);
window.addEventListener('gamepaddisconnected', onGamepadDisconnect);

class StandardControllerMovement extends Behavior {
  constructor() {
    super();
    
    // Whether or not the update should be handled from an external behavior
    this.waitForExternalUpdate = false;
    this.controllers = controllers;
    this.currentController = null;
  }
  
  begin() {
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = this.moveSpeed;
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._player.customData.direction = 'down';
  }
  
  update(dt) {
    this._updateCurrentController();
  
    if (!this.waitForExternalUpdate) {
      this.applyFriction();
      this.handleInput();
    }
  }
  
  applyFriction() {
    if (this.gameObject.velocity) {
      this.gameObject.velocity.multiply(this.friction);
      this.gameObject.acceleration.multiply(this.friction);
    }
  }
  
  checkAvailability() {
    if (!this.currentController || !this.currentController.connected) {
      return false;
    }
    
    for (let button of this.currentController.buttons) {
      if (button.pressed) {
        return true;
      }
    }
    
    for (let axis of this.currentController.axes) {
      if (Math.abs(axis) >= this.deadzoneX) {
        return true;
      }
    }
    
    return false;
  }
  
  _updateCurrentController() {
    if (!gamepadEventsAvailable) {
      scanGamepads();
    }
  
    let controllerKeys = Object.keys(this.controllers);
    let currentController = null;
    
    for (let key of controllerKeys) {
      if (this.controllers[key].mapping === 'standard' || this.allowNonStandardGamepads) {
        currentController = this.controllers[key];
        break;
      }
    }
    
    // No current controller, so use the first one found
    if (this.currentController === null) {
      this.currentController = currentController;
    
    // There is a current controller, but it doesn't match the one found, so clear it
    } else if (this.currentController !== currentController) {
      this.currentController = null;
    }
  }
  
  handleInput() {
    if (!this.currentController) {
      return;
    }
    
    let xAxis = 0;
    let yAxis = 0;
    
    // Take values from the dpad if it dictates movement
    if (this.dpad) {
      if (this.currentController.buttons.length > 14 &&
          this.currentController.buttons[14].pressed) {
        xAxis = -1;
      }
      if (this.currentController.buttons.length > 15 &&
          this.currentController.buttons[15].pressed) {
        xAxis = 1;
      }
      if (this.currentController.buttons.length > 12 &&
          this.currentController.buttons[12].pressed) {
        yAxis = -1;
      }
      if (this.currentController.buttons.length > 13 &&
          this.currentController.buttons[13].pressed) {
        yAxis = 1;
      }
    
    // Otherwise take values from analog sticks
    } else {
      if (this.currentController.axes.length > 0) {
        xAxis = this.currentController.axes[0];
      }
      if (this.currentController.axes.length > 1) {
        yAxis = this.currentController.axes[1];
      }
      
      if (Math.abs(xAxis) < this.deadzoneX) {
        xAxis = 0;
      }
      if (Math.abs(yAxis) < this.deadzoneY) {
        yAxis = 0;
      }
    }
    
    if (Math.abs(xAxis) >= Math.abs(yAxis)) {
      if (xAxis > 0) {
        this._player.customData.direction = 'right';
      } else if (xAxis < 0) {
        this._player.customData.direction = 'left';
      }
    } else {
      if (yAxis > 0) {
        this._player.customData.direction = 'down';
      } else if (yAxis < 0) {
        this._player.customData.direction = 'up';
      }
    }

    // Move the physics object in the appropriate direction
    if (this.gameObject.velocity) {
      let xMovementForce = new geom.Vec2(xAxis, 0);
      xMovementForce.multiply(this.moveSpeed * this.gameObject.mass);
      this.gameObject.addImpulse(xMovementForce);
      
      let yMovementForce = new geom.Vec2(0, yAxis);
      yMovementForce.multiply(this.moveSpeed * this.gameObject.mass);
      this.gameObject.addImpulse(yMovementForce);
      
    // If not a physics object, still allow basic movement
    } else {
      let dx = this.moveSpeed * xAxis;
      let dy = this.moveSpeed * yAxis;
      
      this.gameObject.position._x += dx;
      this.gameObject.position._y += dy;
    }
  }
}

StandardControllerMovement.moveSpeed = property.Number(5);
StandardControllerMovement.friction  = property.Number(0.9, 0, 1);
StandardControllerMovement.deadzoneX = property.Number(0.03, 0, 1);
StandardControllerMovement.deadzoneY = property.Number(0.03, 0, 1);
StandardControllerMovement.dpad      = property.Boolean(false);
StandardControllerMovement.allowNonStandardGamepads = property.Boolean(false);

module.exports = StandardControllerMovement;
},{}],8:[function(require,module,exports){
'use strict';

const geom = wfl.geom;

module.exports = {
  tileToWorld: function (pos) {
    return new geom.Vec2(
      pos.x * 32 + 16,
      pos.y * 32 + 16
    );
  },
  
  worldToTile: function (pos) {
    return new geom.Vec2(
      Math.floor(pos.x / 32),
      Math.floor(pos.y / 32)
    );
  },
  
  directionNameToVector: function (name) {
    switch (name) {
      case 'up':
        return new geom.Vec2(0, -1);
      
      case 'down':
        return new geom.Vec2(0, 1);
      
      case 'left':
        return new geom.Vec2(-1, 0);
      
      case 'right':
        return new geom.Vec2(1, 0);
      
      default:
        return new geom.Vec2();
    }
  },
  
  tileAhead: function (worldPos, direction) {
    let tilePos = this.worldToTile(worldPos);
    let aheadTilePos = new geom.Vec2(
      tilePos.x + direction.x,
      tilePos.y + direction.y
    );
    return aheadTilePos;
  }
};
},{}],9:[function(require,module,exports){
"use strict";

const {GameObject, PhysicsObject} = wfl.core.entities;
const PIXI = wfl.PIXI;

var PlantA = function () {
  PhysicsObject.call(this);
  
  let gfx_0 = PIXI.loader.resources['PlantA'].texture;
  this.frame0 = GameObject.createFrame(gfx_0);
  this.stateDefault = GameObject.createState();
  this.stateDefault.addFrame(this.frame0);
  this.addState('default', this.stateDefault);
  this.setState('default');
  
  this.solid = true;
  this.fixed = true;
  
  this.customData.grabbable = true;
};

PlantA.prototype = Object.create(PhysicsObject.prototype, {
});

module.exports = PlantA;
},{}],10:[function(require,module,exports){
'use strict';

module.exports = {
  PlantA: require('./PlantA')
};
},{"./PlantA":9}],11:[function(require,module,exports){
'use strict';

module.exports = {
  entities: require('./entities'),
  
  _GridHelper: require('./_GridHelper'),
  ArrowKeyMovement: require('./ArrowKeyMovement'),
  MarkTileAheadOfPlayer: require('./MarkTileAheadOfPlayer'),
  MovementManager: require('./MovementManager'),
  PressButtonToAddEntityAheadOfPlayer: require('./PressButtonToAddEntityAheadOfPlayer'),
  ShowCamRadius: require('./ShowCamRadius'),
  SpawnPlayer: require('./SpawnPlayer'),
  StandardControllerMovement: require('./StandardControllerMovement')
};
},{"./ArrowKeyMovement":1,"./MarkTileAheadOfPlayer":2,"./MovementManager":3,"./PressButtonToAddEntityAheadOfPlayer":4,"./ShowCamRadius":5,"./SpawnPlayer":6,"./StandardControllerMovement":7,"./_GridHelper":8,"./entities":10}],12:[function(require,module,exports){
"use strict";

const behaviors                   = require('./behaviors');
const Scene                       = wfl.display.Scene;
const {GameObject, PhysicsObject} = wfl.core.entities;

class GameScene extends Scene {
  constructor(canvas) {
    super(canvas);
    
    this.useDynamicZOrder = false;
  }
  
  reset() {
    super.reset();
    
    // TODO: Allow for configurable scene names
    this.register('wfl');
  }
  
  drawSort(renderer) {
    if (this.useDynamicZOrder) {
      return this._findSurroundingGameObjects(this.camera, 2).sort(
        (a, b) => {
          // Sort objects on the same layer by their bottom Y-coordinate
          if (a.layer === b.layer) {
            return (a.transform.position._y + a.calculationCache.height * 0.5)
                 - (b.transform.position._y + b.calculationCache.height * 0.5)

          // Otherwise, sort them by layer
          } else {
            return a.layer - b.layer;
          }
        }
      );
    } else {
      return super.drawSort(renderer);
    }
  }
  
  createFinalizedGameObject(original) {
    let gameObject = null;
    
    if (original.physics) {
      let physics = original.physics;
      gameObject = new PhysicsObject();
      
      gameObject.solid = physics.solid || false;
      gameObject.fixed = physics.fixed || false;
      
      gameObject.mass = 'mass' in physics
                      ? parseFloat(physics.mass)
                      : PhysicsObject.DEFAULT_MASS;
      
      gameObject.friction = 'friction' in physics
                      ? parseFloat(physics.friction)
                      : PhysicsObject.DEFAULT_SURFACE_FRICTION;
      
      gameObject.restitution = 'restitution' in physics
                      ? parseFloat(physics.restitution)
                      : PhysicsObject.DEFAULT_SURFACE_RESTITUTION;
    } else {
      gameObject = new GameObject();
    }
    
    let entity  = original.entity;
    let graphic = wfl.PIXI.loader.resources[entity.name];
    let state   = GameObject.createState();
    let frame   = GameObject.createFrame(graphic.texture);
    
    state.addFrame(frame);
    gameObject.addState(GameObject.STATE.DEFAULT, state);
    gameObject.customData.entity = entity;
    
    let rotation = 'rotation' in original ? original.rotation : 0;
    
    // Copy over necessary properties
    gameObject.name = original.name;
    gameObject.position._x = original.x;
    gameObject.position._y = original.y;
    gameObject.rotate(rotation);
    //gameObject.allowVertexRotation  = original.allowVertexRotation;
    gameObject.customData.behaviors = original.behaviors;
    
    // Add behaviors
    if (gameObject.customData.behaviors) {
      let behaviorKeys = Object.keys(gameObject.customData.behaviors);
      for (let key of behaviorKeys) {
        let behaviorData = gameObject.customData.behaviors[key];
        let behaviorClass = behaviors[key];
        let instance = new behaviorClass();
        
        // Set all properties
        let propertyKeys = Object.keys(behaviorData);
        for (let propertyKey of propertyKeys) {
          let propertyValue = behaviorData[propertyKey];
          instance[propertyKey] = propertyValue;
        }
        
        gameObject.addBehavior(instance);
      }
    }
    
    return gameObject;
  }
}








// Create game
var canvas   = document.querySelector("#game-canvas");
var game     = wfl.create(canvas);
var gameData = null;
//game.debug = true;//{vertices: true};

var onLoadWindow = function () {
  wfl.jquery.getJSON('./data.json', onLoadData);
  resize();
};

var onLoadData = function (data) {
  var l = game.loader;
  var level = data.level;
  var entities = level.entities;
  
  gameData = data;
  
  for (let entity of entities) {
    try {
      l = l.add(entity.name, `./assets/${entity.imageSource}`);
    } catch (e) {
    }
  }

  l.load(onLoadAssets);
};

var onLoadAssets = function () {
  let gameScene = new GameScene(canvas);
  gameScene.useDynamicZOrder = gameData.level.dynamicZOrder;
  
  let gameObjects = gameData.level.gameObjects;
  
  for (let gameObject of gameObjects) {
    let obj = gameScene.createFinalizedGameObject(gameObject);
    let layer = gameObject.layer;
    let persists = gameObject.persists || false;
    gameScene.addGameObject(obj, layer, persists);
  }
  
  game.setScene(gameScene);
};

var onResize = function (e) {
  resize();
};

var resize = function () {
  // Use the commented code if you want to limit the canvas size
  // var MAX_WIDTH  = 1366;
  // var MAX_HEIGHT = 768;
  var w = window.innerWidth;  // Math.min(window.innerWidth,  MAX_WIDTH);
  var h = window.innerHeight; // Math.min(window.innerHeight, MAX_HEIGHT);
  
  canvas.width  = w;
  canvas.height = h;
  game.renderer.view.style.width  = w + 'px';
  game.renderer.view.style.height = h + 'px';
  game.renderer.resize(w, h);
}

window.addEventListener('load', onLoadWindow);
window.addEventListener('resize', onResize);
},{"./behaviors":11}]},{},[11,12]);
