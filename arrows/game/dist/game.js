(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var LivingObject = require('./LivingObject');
var Player = require('./Player');

var Arrow = function Arrow(alliance) {
  PhysicsObject.call(this);

  // Reference graphics
  this.arrowGraphic = Assets.get(Assets.ARROW).texture;

  this.dealtImpactDamage = false;

  // Create state
  this.stateBasic = GameObject.createState();
  this.frame1 = GameObject.createFrame(this.arrowGraphic);
  this.stateBasic.addFrame(this.frame1);

  // Add states
  this.addState(Arrow.STATE.BASIC, this.stateBasic);

  // Set constants
  this.maxSpeed = Arrow.MAX_SPEED;
  this.maxAcceleration = Arrow.MAX_ACCELERATION;

  // Custom data
  this.customData.alliance = alliance;
  this.customData.DEFAULT_FRICTION = Arrow.DEFAULT_FRICTION;

  this.restitution = 0.8;
};

Object.defineProperties(Arrow, {
  MAX_SPEED: {
    value: 50
  },

  MAX_ACCELERATION: {
    value: 8
  },

  MAX_DAMAGE: {
    value: 100
  },

  KNOCKBACK_SCALAR: {
    value: 1000
  },

  DAMAGE_MAGNITUDE_SCALAR: {
    value: 0.5
  },

  MIN_ARROW_CHARGE_TIME: {
    value: 200
  },

  MAX_ARROW_CHARGE_TIME: {
    value: 500
  },

  DEFAULT_FRICTION: {
    value: 0.985
  },

  STATE: {
    value: {
      BASIC: "BASIC"
    }
  }
});

Arrow.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // If the arrow is going too slow, it can no longer deal damage
      if (this.velocity.getMagnitudeSquared() < 0.001) {
        this.stop();
      }
    }
  },

  resolveCollisions: {
    value: function value() {
      PhysicsObject.prototype.resolveCollisions.call(this);
      this.acceleration.multiply(0);
      this.velocity.multiply(0);
    }
  },

  // Extend player stuff here 
  onCollide: {
    value: function value(physObj, collisionData) {
      if (physObj instanceof LivingObject && !this.dealtImpactDamage) {
        this.customData.forceRemove = true;

        // Damage as a function of arrow velocity
        var damage = this.velocity.clone().multiply(Arrow.DAMAGE_MAGNITUDE_SCALAR).getMagnitudeSquared();
        // Set a max damage - to be changed by item pickups
        if (damage > Arrow.MAX_DAMAGE) {
          damage = Arrow.MAX_DAMAGE;
        }
        // Take damage
        physObj.takeDamage(damage);
        // Add knockback to the item it hit
        physObj.addImpulse(this.velocity.clone().multiply(Arrow.KNOCKBACK_SCALAR));

        physObj.attachObject(this);
      }

      // Use custom collision resolution
      if (physObj.solid) {
        PhysicsObject.prototype.onCollide.call(this, physObj, collisionData);
        this.stop();
      }
    }
  },

  canCollide: {
    value: function value(physObj) {
      // Ignore collisions with entities that are the same alliance
      return physObj.customData.alliance !== this.customData.alliance;
    }
  },

  lookAt: {
    value: function value(point) {
      var displacement = geom.Vec2.subtract(point, this.position);
      var angle = displacement.getAngle();
      this.rotate(angle - this.rotation);
    }
  },

  stop: {
    value: function value() {
      //this.acceleration.multiply(0);
      //this.velocity.multiply(0);

      this.solid = false;
      this.fixed = true;

      // Once the arrow has hit something solid, it can no longer deal damage
      this.dealtImpactDamage = true;
    }
  }
}));

Object.freeze(Arrow);

module.exports = Arrow;

},{"../util":45,"./LivingObject":4,"./Player":6}],2:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var LivingObject = require('./LivingObject');
var Player = require('./Player');
var Arrow = require('./Arrow');

var ArrowRicochet = function ArrowRicochet(alliance) {
  Arrow.call(this, alliance);

  this.lastHit = null;

  this.restitution = 1;

  // // Reference graphics
  // this.arrowGraphic = Assets.get(Assets.ARROW).texture;

  // this.dealtImpactDamage = false;

  // // Create state
  // this.stateBasic = GameObject.createState();
  // this.frame1     = GameObject.createFrame(this.arrowGraphic);
  // this.stateBasic.addFrame(this.frame1);

  // // Add states
  // this.addState(Arrow.STATE.BASIC, this.stateBasic);

  // // Set constants
  // this.maxSpeed        = Arrow.MAX_SPEED;
  // this.maxAcceleration = Arrow.MAX_ACCELERATION;

  // // Custom data
  // this.customData.alliance = alliance;
  // this.customData.DEFAULT_FRICTION = Arrow.DEFAULT_FRICTION;

  // this.restitution = 0.8;

  this.prevCollisions = {};
};

Object.defineProperties(ArrowRicochet, {
  // MAX_SPEED: {
  // value: 50
  // },

  // MAX_ACCELERATION: {
  // value: 8
  // },

  // MAX_DAMAGE: {
  // value: 100
  // },

  // KNOCKBACK_SCALAR: {
  // value: 1000
  // },

  // DAMAGE_MAGNITUDE_SCALAR: {
  // value: 0.5
  // },

  // MIN_ARROW_CHARGE_TIME: {
  // value: 200
  // },

  // MAX_ARROW_CHARGE_TIME: {
  // value: 500
  // },

  // DEFAULT_FRICTION: {
  // value: 0.985
  // },

  STATE: {
    value: {
      BASIC: "BASIC"
    }
  },

  MAX_OBJECT_COLLISION_TIMER: {
    value: 3
  },

  WALL_FRICTION: {
    value: 0.8
  },

  // The speed the arrow must be traveling before its velocity cuts hard
  MIN_NORMAL_SPEED: {
    value: 1
  },

  MIN_SPEED: {
    value: 0.01
  },

  FINAL_SLOWING_RATE: {
    value: 0.9
  }
});

ArrowRicochet.prototype = Object.freeze(Object.create(Arrow.prototype, {
  update: {
    value: function value(dt) {
      Arrow.prototype.update.call(this, dt);

      var keys = Object.keys(this.prevCollisions);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;
          var _prevCollisions$key = this.prevCollisions[key],
              obj = _prevCollisions$key.obj,
              prevPosition = _prevCollisions$key.prevPosition,
              prevVelocity = _prevCollisions$key.prevVelocity;

          var displacement = geom.Vec2.subtract(obj.position, this.position);
          var prevDisplacement = geom.Vec2.subtract(obj.position, prevPosition);

          // If it is now on the other side of the object, it has phased
          // through it, so it should undo its movements back until it started
          // colliding with the object
          if (geom.Vec2.dot(prevDisplacement, displacement) < 0) {
            prevPosition = this.prevCollisions[key].prevPosition;
            prevVelocity = this.prevCollisions[key].prevVelocity;
            this.velocity._x = -prevVelocity._x;
            this.velocity._y = -prevVelocity._y;
            this.position._x = prevPosition._x + this.velocity._x * 2;
            this.position._y = prevPosition._y + this.velocity._y * 2;
            this.rotate(this.velocity.getAngle() - this.rotation);
            this.collisionDisplacementSum._x = 0;
            this.collisionDisplacementSum._y = 0;
            this.cacheCalculations();
            delete this.prevCollisions[key];
          } else if (this.prevCollisions[key].collisionTimer >= ArrowRicochet.MAX_OBJECT_COLLISION_TIMER) {

            delete this.prevCollisions[key];
          } else {
            this.prevCollisions[key].collisionTimer++;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var minNormalSpeed = ArrowRicochet.MIN_NORMAL_SPEED;
      var minSpeed = ArrowRicochet.MIN_SPEED;
      if (this.velocity.getMagnitudeSquared() < minNormalSpeed * minNormalSpeed) {
        this.velocity.multiply(ArrowRicochet.FINAL_SLOWING_RATE);
      }

      if (this.velocity.getMagnitudeSquared() < minSpeed * minSpeed) {
        this.velocity.multiply(0);
        this.stop();
      }
    }
  },

  resolveCollisions: {
    value: function value() {
      // Snap to the next integer so that objects can move smoothly after
      // colliding
      var dx = this.collisionDisplacementSum._x;
      var dy = this.collisionDisplacementSum._y;

      if (dx < 0) dx = Math.floor(dx);else dx = Math.ceil(dx);
      if (dy < 0) dy = Math.floor(dy);else dy = Math.ceil(dy);

      this.transform.position._x += dx;
      this.calculationCache.x += dx;

      this.transform.position._y += dy;
      this.calculationCache.y += dy;
    }
  },

  // Extend player stuff here 
  onCollide: {
    value: function value(physObj, collisionData) {
      var hitLivingObject = false;
      var prevVelocity = this.velocity.clone();
      var prevPosition = this.position.clone();

      if (this.lastHit === physObj) return;

      if (physObj instanceof LivingObject && !this.dealtImpactDamage) {
        this.customData.forceRemove = true;

        // Damage as a function of arrow velocity
        var damage = this.velocity.clone().multiply(Arrow.DAMAGE_MAGNITUDE_SCALAR).getMagnitudeSquared();
        // Set a max damage - to be changed by item pickups
        if (damage > Arrow.MAX_DAMAGE) {
          damage = Arrow.MAX_DAMAGE;
        }
        // Take damage
        physObj.takeDamage(damage);
        // Add knockback to the item it hit
        physObj.addImpulse(this.velocity.clone().multiply(Arrow.KNOCKBACK_SCALAR));

        physObj.attachObject(this);

        hitLivingObject = true;
      }

      // Use custom collision resolution
      if (physObj.solid) {
        PhysicsObject.prototype.onCollide.call(this, physObj, collisionData);
      }

      // Run calculations for bouncing only if it's an object the arrow can
      // bounce off of
      if (!hitLivingObject) {
        var prevForward = {
          x: this.forward._x,
          y: this.forward._y
        };

        // If there's an edge, deflect off it
        if (collisionData.edgeDirection) {
          var right = {
            x: -this.forward._y,
            y: this.forward._x
          };
          var forwardDotEdge = this.forward._x * collisionData.edgeDirection.x + this.forward._y * collisionData.edgeDirection.y;
          var rightDotEdge = right.x * collisionData.edgeDirection.x + right.y * collisionData.edgeDirection.y;
          var theta = Math.acos(forwardDotEdge);

          if (rightDotEdge < 0) {
            this.rotate(-2 * theta);
          } else {
            this.rotate(2 * theta);
          }

          this.velocity.setAngle(this.rotation);

          // Otherwise, reflect backwards from the point of collision
        } else {
          this.rotate(Math.PI);
          this.velocity._x *= -1;
          this.velocity._y *= -1;
        }

        // Try to move the arrow out of the object
        var halfHeight = this._cachedHeight * 0.5;
        this.position._x += prevForward.x * halfHeight + this.forward._x * halfHeight;
        this.position._y += prevForward.y * halfHeight + this.forward._y * halfHeight;

        // If this arrow has been colliding with a specific object for a while,
        // keep track of data to ensure it doesn't phase through it
        if (this.prevCollisions[physObj.wflId]) {
          this.prevCollisions[physObj.wflId] = {
            obj: physObj,
            prevPosition: this.prevCollisions[physObj.wflId].prevPosition,
            prevVelocity: this.prevCollisions[physObj.wflId].prevVelocity,
            collisionTimer: 0
          };
        } else {
          this.prevCollisions[physObj.wflId] = {
            obj: physObj,
            prevPosition: prevPosition,
            prevVelocity: prevVelocity,
            collisionTimer: 0
          };
        }

        // Apply friction from wall
        this.velocity.multiply(ArrowRicochet.WALL_FRICTION);
      }
    }
  }
}));

Object.freeze(ArrowRicochet);

module.exports = ArrowRicochet;

},{"../util":45,"./Arrow":1,"./LivingObject":4,"./Player":6}],3:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var LivingObject = require('./LivingObject');
var Segment = require('./Segment');
var Player = require('./Player');

var Enemy = function Enemy(player, quadtree) {
  LivingObject.call(this);
  this.player = player;

  this.quadtree = quadtree;
  // Reference graphics
  this.enemyGraphic = Assets.get(Assets.ENEMY).texture;

  // Create state
  this.stateBasic = GameObject.createState();
  this.frame1 = GameObject.createFrame(this.enemyGraphic);
  this.stateBasic.addFrame(this.frame1);

  // Add states
  this.addState(Enemy.STATE.BASIC, this.stateBasic);

  // Set constants
  this.maxSpeed = Enemy.MAX_SPEED;
  this.maxAcceleration = Enemy.MAX_ACCELERATION;

  this.rays = [];

  this.mass = 1;
};

Object.defineProperties(Enemy, {
  MAX_SPEED: {
    value: 1
  },

  MAX_ACCELERATION: {
    value: 4
  },

  SPRINT_MAX_SPEED: {
    value: 2
  },

  SPRINT_BOOST_ACCELERATION: {
    value: 6
  },

  BOOST_ACCELERATION: {
    value: .5
  },

  VIEW_LIMIT: {
    // Some arbitrary number for now
    value: 256
  },

  VIEW_SEGMENTS: {
    value: 11
  },

  VIEW_ANGLE_LIMIT: {
    value: Math.PI * 0.5
  },

  ALLIANCE: {
    value: 2
  },

  STATE: {
    value: {
      BASIC: "BASIC"
    }
  }
});

Enemy.prototype = Object.freeze(Object.create(LivingObject.prototype, {
  update: {
    value: function value(dt) {
      LivingObject.prototype.update.call(this, dt);

      // If player is in range to be seen
      if (geom.Vec2.subtract(this.player.position, this.position).getMagnitude() < Enemy.VIEW_LIMIT + 20) {
        this._handleViewing();

        /*
        // TODO: Point enemy in direction of the seek force vector, not
        // velocity
        // Point the enemy towards its seek force vector
        if (this.velocity.getMagnitudeSquared() > 0.0001) {
          this.rotate(this.velocity.getAngle() - this.forward.getAngle());
        }
        */
      }
    }
  },

  takeDamage: {
    value: function value(damage) {
      this.health -= damage;
    }
  },

  _handleViewing: {
    value: function value() {
      var increment = Enemy.VIEW_ANGLE_LIMIT / (Enemy.VIEW_SEGMENTS - 1);
      this.rays = [];
      var v = new geom.Vec2.fromAngle(this.rotation - Enemy.VIEW_ANGLE_LIMIT * 0.5).multiply(Enemy.VIEW_LIMIT);
      var v1 = v.clone().multiply(-.5);
      var v2 = v.clone().multiply(.5);
      var seg = new Segment(Enemy.VIEW_LIMIT, v.getAngle(), v1, v2);
      seg.position.add(this.position);
      seg.position.add(v2);
      seg.update();
      this.rays.push(seg);

      for (var i = 1; i < Enemy.VIEW_SEGMENTS; i++) {
        v.rotate(increment);
        v1 = v.clone().multiply(-.5);
        v2 = v.clone().multiply(.5);
        seg = new Segment(Enemy.VIEW_LIMIT, v.getAngle(), v1, v2);
        seg.position.add(this.position);
        seg.position.add(v2);
        seg.update();
        this.rays.push(seg);
      }

      /*
      for (var i = 0; i < this.rays.length; i++) {
        this.rays[i].drawDebugVertices();
      }
      */

      var gos = [];
      var collisions = [];
      var docheck = false;
      var seent = false;
      var collisionDat, min, minObj, dist;
      for (var i = 0; i < this.rays.length; i++) {
        gos = [];
        collisions = [];
        docheck = false;
        this.quadtree.retrieve(gos, this.rays[i]);
        for (var x = 0; x < gos.length; x++) {
          collisionDat = this.rays[i].checkCollision(gos[x]);
          if (collisionDat.colliding) {
            collisions.push(gos[x]);
            if (gos[x] instanceof Player) {
              docheck = true;
            }
          }
        }
        if (docheck) {
          min = Infinity;
          minObj = -1;
          for (var j = 0; j < collisions.length; j++) {
            if (!(collisions[j] instanceof Enemy)) {
              dist = geom.Vec2.subtract(this.position, collisions[j].position).getMagnitudeSquared();
              if (dist < min) {
                min = dist;
                minObj = j;
              }
            }
          }
          if (collisions[minObj] instanceof Player) {
            seent = true;
          }
        }
        docheck = false;
      }
    }
  }
}));

Object.freeze(Enemy);

module.exports = Enemy;

},{"../util":45,"./LivingObject":4,"./Player":6,"./Segment":7}],4:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var LivingObject = function LivingObject() {
  PhysicsObject.call(this);

  this.health = LivingObject.DEFAULT_MAX_HEALTH;
  this.maxHealth = LivingObject.DEFAULT_MAX_HEALTH;

  this.friction = 0.2;
  this.restitution = 0.8;
};

Object.defineProperties(LivingObject, {
  DEFAULT_MAX_HEALTH: {
    value: 100
  }
});

LivingObject.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);
    }
  },

  attachObject: {
    value: function value(obj) {
      obj.solid = false;
      obj.static = true;
      this.addChild(obj);
    }
  },

  lookAt: {
    value: function value(point) {
      var displacement = geom.Vec2.subtract(point, this.position);
      var angle = displacement.getAngle();
      this.rotate(angle - this.rotation);
    }
  }
}));

Object.freeze(LivingObject);

module.exports = LivingObject;

},{"../util":45}],5:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var Platform = function Platform() {
  PhysicsObject.call(this);

  // Reference graphics
  this.platformGraphic = Assets.get(Assets.PLATFORM).texture;

  // Create state
  this.stateBasic = GameObject.createState();
  this.frame1 = GameObject.createFrame(this.platformGraphic);
  this.stateBasic.addFrame(this.frame1);

  // Add states
  this.addState(Platform.STATE.BASIC, this.stateBasic);

  this.fixed = true;
  this.solid = true;
};

Object.defineProperties(Platform, {
  STATE: {
    value: {
      BASIC: "BASIC"
    }
  }
});

Platform.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {}));

module.exports = Platform;

},{"../util":45}],6:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var LivingObject = require('./LivingObject');

var Player = function Player() {
  LivingObject.call(this);

  // Reference graphics
  this.playerGraphic = Assets.get(Assets.PLAYER).texture;

  // Create state
  this.stateBasic = GameObject.createState();
  this.frame1 = GameObject.createFrame(this.playerGraphic);
  this.stateBasic.addFrame(this.frame1);

  // Add states
  this.addState(Player.STATE.BASIC, this.stateBasic);

  // Set constants
  this.maxSpeed = Player.MAX_SPEED;
  this.maxAcceleration = Player.MAX_ACCELERATION;

  // Custom data
  this.customData.alliance = Player.ALLIANCE;

  // The top of the stack determines which direction the player faces
  this._walkDirectionStack = [];

  // Ensure bounding box doesn't rotate
  this.allowVertexRotation = false;
};

Object.defineProperties(Player, {
  MAX_SPEED: {
    value: 2
  },

  MAX_ACCELERATION: {
    value: .5
  },

  SPRINT_MAX_SPEED: {
    value: 4
  },

  SPRINT_BOOST_ACCELERATION: {
    value: 1
  },

  BOOST_ACCELERATION: {
    value: .5
  },

  STATE: {
    value: {
      BASIC: "BASIC"
    }
  },

  ALLIANCE: {
    value: 1
  }
});

Player.prototype = Object.freeze(Object.create(LivingObject.prototype, {
  update: {
    value: function value(dt) {
      LivingObject.prototype.update.call(this, dt);
    }
  },

  canCollide: {
    value: function value(physObj) {
      // Ignore collisions with entities that are the same alliance
      return physObj.customData.alliance !== this.customData.alliance;
    }
  },

  lookAt: {
    value: function value(point) {
      var displacement = geom.Vec2.subtract(point, this.position);
      var angle = displacement.getAngle();
      this.rotate(angle - this.rotation);
    }
  },

  handleInput: {
    value: function value(keyboard) {
      var sprinting = keyboard.isPressed(keyboard.SHIFT);
      var lastPressed = keyboard.getKeyJustPressed();
      var leftPriority = -1;
      var rightPriority = -1;
      var upPriority = -1;
      var downPriority = -1;

      // Remove values that shouldn't be in the stack
      for (var i = this._walkDirectionStack.length; i >= 0; i--) {
        if (!keyboard.isPressed(this._walkDirectionStack[i])) {
          this._walkDirectionStack.splice(i, 1);
        }
      }

      // Add the current direction of movement to the stack (if any)
      if (lastPressed > -1) {
        switch (lastPressed) {
          case keyboard.A:
          case keyboard.D:
          case keyboard.W:
          case keyboard.S:
            this._walkDirectionStack.push(lastPressed);
            break;
        }
      }

      // Determine the priorities of the directions
      var priorityCounter = 0;
      for (var i = 0; i < this._walkDirectionStack.length; i++) {
        switch (this._walkDirectionStack[i]) {
          case keyboard.A:
            leftPriority = priorityCounter;
            priorityCounter++;
            break;
          case keyboard.D:
            rightPriority = priorityCounter;
            priorityCounter++;
            break;
          case keyboard.W:
            upPriority = priorityCounter;
            priorityCounter++;
            break;
          case keyboard.S:
            downPriority = priorityCounter;
            priorityCounter++;
            break;
        }
      }

      // Determine how fast the player should be moving
      var boost;
      if (sprinting) {
        boost = Player.SPRINT_BOOST_ACCELERATION;
        this.maxSpeed = Player.SPRINT_MAX_SPEED;
      } else {
        boost = Player.BOOST_ACCELERATION;
        this.maxSpeed = Player.MAX_SPEED;
      }

      // Move the player in the appropriate direction
      if (leftPriority > rightPriority) {
        var movementForce = new geom.Vec2(-1, 0);
        movementForce.multiply(boost * this.mass);

        this.addForce(movementForce);
      }
      if (rightPriority > leftPriority) {
        var movementForce = new geom.Vec2(1, 0);
        movementForce.multiply(boost * this.mass);

        this.addForce(movementForce);
      }
      if (upPriority > downPriority) {
        var movementForce = new geom.Vec2(0, -1);
        movementForce.multiply(boost * this.mass);

        this.addForce(movementForce);
      }
      if (downPriority > upPriority) {
        var movementForce = new geom.Vec2(0, 1);
        movementForce.multiply(boost * this.mass);

        this.addForce(movementForce);
      }
    }
  }
}));

Object.freeze(Player);

module.exports = Player;

},{"../util":45,"./LivingObject":4}],7:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var LivingObject = require('./LivingObject');
var Player = require('./Player');
var Enemy = require('./Enemy');

var Segment = function Segment(width, rotation, v1, v2) {
  PhysicsObject.call(this);
  this.vertices = [];
  this.vertices.push(v1.clone());
  this.vertices.push(v2.clone());
  var width = width;
  var height = 1;
  var absCosRotation = Math.abs(Math.cos(rotation));
  var absSinRotation = Math.abs(Math.sin(rotation));

  var abWid = absCosRotation * width + absSinRotation * height;
  var abHgt = absCosRotation * height + absSinRotation * width;

  this.calculationCache = {
    x: this.position.x,
    y: this.position.y,
    width: width,
    height: 1,
    aabbWidth: abWid,
    aabbHeight: abHgt,
    aabbHalfWidth: abWid * 0.5,
    aabbHalfHeight: abHgt * 0.5
  };
};

Object.defineProperties(Segment, {
  STATE: {
    value: {
      BASIC: "BASIC"
    }
  }
});

Segment.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value() {
      PhysicsObject.prototype.update.call(this, 0);

      this.calculationCache.x = this.position.x;
      this.calculationCache.y = this.position.y;
    }
  },

  resolveCollisions: {
    value: function value() {}
  }
}));

Object.freeze(Segment);

module.exports = Segment;

},{"../util":45,"./Enemy":3,"./LivingObject":4,"./Player":6}],8:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var SmallBlock = function SmallBlock() {
  PhysicsObject.call(this);

  // Reference graphics
  this.smallBlockGraphic = Assets.get(Assets.SMALL_BLOCK).texture;

  // Create state
  this.stateBasic = GameObject.createState();
  this.frame1 = GameObject.createFrame(this.smallBlockGraphic);
  this.stateBasic.addFrame(this.frame1);

  // Add states
  this.addState(SmallBlock.STATE.BASIC, this.stateBasic);

  this.solid = true;
};

Object.defineProperties(SmallBlock, {
  STATE: {
    value: {
      BASIC: "BASIC"
    }
  }
});

SmallBlock.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {}));

module.exports = SmallBlock;

},{"../util":45}],9:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var Wall = function Wall() {
  PhysicsObject.call(this);

  // Reference graphics
  this.wallGraphic = Assets.get(Assets.WALL).texture;

  // Create state
  this.stateBasic = GameObject.createState();
  this.frame1 = GameObject.createFrame(this.wallGraphic);
  this.stateBasic.addFrame(this.frame1);

  // Add states
  this.addState(Wall.STATE.BASIC, this.stateBasic);

  this.fixed = true;
  this.solid = true;

  this.restitution = 0.8;
};

Object.defineProperties(Wall, {
  STATE: {
    value: {
      BASIC: "BASIC"
    }
  }
});

Wall.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {}));

Object.freeze(Wall);

module.exports = Wall;

},{"../util":45}],10:[function(require,module,exports){
"use strict";

var Player = require('./Player.js');
var Enemy = require('./Enemy.js');
var Arrow = require('./Arrow.js');
var ArrowRicochet = require('./ArrowRicochet.js');
var Wall = require('./Wall.js');
var LivingObject = require('./LivingObject.js');

var Platform = require('./Platform.js');
var SmallBlock = require('./SmallBlock.js');

module.exports = {
  LivingObject: LivingObject,
  Player: Player,
  Enemy: Enemy,
  Arrow: Arrow,
  Wall: Wall,
  ArrowRicochet: ArrowRicochet,

  Platform: Platform,
  SmallBlock: SmallBlock
};

},{"./Arrow.js":1,"./ArrowRicochet.js":2,"./Enemy.js":3,"./LivingObject.js":4,"./Platform.js":5,"./Player.js":6,"./SmallBlock.js":8,"./Wall.js":9}],11:[function(require,module,exports){
"use strict";

var util = require('./util');
var scenes = require('./scenes');
var Assets = require('./util/Assets.js');
var map = require('./map');

// Create game
var canvas = document.querySelector("#game-canvas");
var game = wfl.create(canvas);
//game.debug = true;//{vertices: true};

var onLoadWindow = function onLoadWindow() {
  var l = game.loader;

  // Prepare to load assets
  for (var asset in Assets) {
    try {
      l = l.add(Assets[asset]);
    } catch (e) {}
  }

  l.load(onLoadAssets);
  resize();
};

var onLoadAssets = function onLoadAssets() {
  Assets.get = function (path) {
    return PIXI.loader.resources[path];
  };

  // Send a request for all map data
  wfl.jquery.getJSON(Assets.MAP1, onLoadMap);
};

var onLoadMap = function onLoadMap(mapData) {
  map.Room.setRooms(mapData.maps);

  // Load scene here
  var gameScene = new scenes.GameScene(canvas, game.pixi);
  //scenes.test.TestSceneBase.hideMessages();
  // var gameScene = new scenes.test.TestScene1(canvas, game.pixi);

  game.setScene(gameScene);

  //var mapParser = new map.MapParser(gameScene, mapData);
};

var onResize = function onResize(e) {
  resize();
};

var resize = function resize() {
  // Use the commented code if you want to limit the canvas size
  // var MAX_WIDTH  = 1366;
  // var MAX_HEIGHT = 768;
  var w = window.innerWidth; // Math.min(window.innerWidth,  MAX_WIDTH);
  var h = window.innerHeight; // Math.min(window.innerHeight, MAX_HEIGHT);

  canvas.width = w;
  canvas.height = h;
  game.renderer.view.style.width = w + 'px';
  game.renderer.view.style.height = h + 'px';
  game.renderer.resize(w, h);
};

window.addEventListener('load', onLoadWindow);
window.addEventListener('resize', onResize);

},{"./map":15,"./scenes":17,"./util":45,"./util/Assets.js":42}],12:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var TILE_SIZE = 64;

module.exports = {
  generate: function generate(mapData) {
    var tileX = 0;
    var tileY = 0;
    var width = 0;
    var height = 0;

    for (var i = 0; i < mapData.length; i++) {
      var key = mapData[i];

      if (key === '\n') {
        tileY++;
        tileX = 0;
      } else {
        width = Math.max(tileX, width);
        height = Math.max(tileX, height);

        tileX++;
      }
    }

    // Delay dependency invocation until runtil to prevent circular buffer
    var map = require('../map');
    return new map.Room(width, height, mapData);
  },

  addRoomToScene: function addRoomToScene(room, scene) {
    var tileX = 0;
    var tileY = 0;
    var offsetTileX = room.offsetTileX;
    var offsetTileY = room.offsetTileY;
    var mapData = room.mapData;
    var enemyData = [];

    for (var i = 0; i < mapData.length; i++) {
      var key = mapData[i];

      if (key === '\n') {
        tileY++;
        tileX = 0;
      } else {
        var x = TILE_SIZE * (tileX + offsetTileX);
        var y = TILE_SIZE * (tileY + offsetTileY);
        var entity = null;
        var entityLayer = 0;

        switch (key) {
          // Wall
          case 'X':
            entity = new entities.Wall();
            break;

          // Spawn point (player)
          case 'S':
            entity = new entities.Player();
            entity.rotate(Math.PI * 0.5); // Face down
            scene.player = entity;
            scene.camera.follow(entity);
            entityLayer = 3;
            break;

          // Left-facing enemy
          case 'L':
            enemyData.push({
              x: x,
              y: y,
              rotation: Math.PI
            });
            break;

          // Up-facing enemy
          case 'U':
            enemyData.push({
              x: x,
              y: y,
              rotation: Math.PI * 1.5
            });
            break;

          // Right-facing enemy
          case 'R':
            enemyData.push({
              x: x,
              y: y,
              rotation: 0
            });
            break;

          // Down-facing enemy
          case 'D':
            enemyData.push({
              x: x,
              y: y,
              rotation: Math.PI * 0.5
            });
            break;
        }

        if (entity) {
          entity.position.x = x;
          entity.position.y = y;
          scene.addGameObject(entity, entityLayer);
        }

        tileX++;
      }
    }

    // Add enemies now that the player has been added
    for (var i = 0; i < enemyData.length; i++) {
      var enemy = new entities.Enemy(scene.player, scene._quadtree);
      enemy.position.x = enemyData[i].x;
      enemy.position.y = enemyData[i].y;
      enemy.rotate(enemyData[i].rotation);
      scene.addGameObject(enemy, 1);
    }
  },

  addSectorToScene: function addSectorToScene(sector, scene) {
    var spawnRoom = sector.spawnRoom;

    // Add the spawn room first so the player exists
    this.addRoomToScene(spawnRoom, scene);

    for (var i = 0; i < sector.roomWidth; i++) {
      for (var j = 0; j < sector.roomHeight; j++) {
        var room = sector.roomLayout[i][j];

        // Add all other rooms besides the spawn room
        if (room && room !== spawnRoom) {
          this.addRoomToScene(room, scene);
        }
      }
    }
  }
};

},{"../entities":10,"../map":15}],13:[function(require,module,exports){
"use strict";

var MapParser = require('./MapParser');

var ALL_ROOMS = null;

var Room = function Room() {
  var tileWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var tileHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var mapData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  // If Room was created with (mapData) instead of (tileWidth, tileHeight)
  // then return a generated room
  if (tileWidth && typeof tileWidth !== 'number') {
    mapData = tileWidth;
    return Room.createRoom(mapData);
  }

  this.tileWidth = tileWidth;
  this.tileHeight = tileHeight;
  this.offsetTileX = 0;
  this.offsetTileY = 0;
  this.mapData = mapData;
};

Object.defineProperties(Room, {
  ROOM_TILE_WIDTH: {
    value: 12
  },

  ROOM_TILE_HEIGHT: {
    value: 12
  },

  setRooms: {
    value: function value(rooms) {
      var flattenedRooms = [];

      for (var i = 0; i < rooms.length; i++) {
        flattenedRooms.push(rooms[i].mapData.join('\n'));
      }

      ALL_ROOMS = flattenedRooms;
    }
  },

  createFrom: {
    value: function value(mapData) {
      return MapParser.generate(mapData);
    }
  },

  createRandom: {
    value: function value() {
      var roomIndex = Math.floor(ALL_ROOMS.length * Math.random());
      var mapData = ALL_ROOMS[roomIndex];
      return Room.createFrom(mapData);
    }
  }
});

Room.prototype = Object.create(Room.prototype, {
  setAsSpawnRoom: {
    value: function value() {
      this._replaceRandomEnemyWithSpawn();
      this._removeEnemies();
    }
  },

  _replaceRandomEnemyWithSpawn: {
    value: function value() {
      var enemyIndices = [];
      var mapData = this.mapData;

      for (var i = 0; i < mapData.length; i++) {
        var key = mapData[i];
        var isEnemy = key === 'L' || key === 'U' || key === 'R' || key === 'D';

        if (isEnemy) {
          enemyIndices.push(i);
        }
      }

      // Inject the player spawn point 'S' where an Enemy used to be
      var selectedEnemyIndex = Math.floor(Math.random() * enemyIndices.length);
      var enemyStringPos = enemyIndices[selectedEnemyIndex];
      var newMapData = mapData.substr(0, enemyStringPos) + 'S' + mapData.substr(enemyStringPos + 1);

      // Use the newly altered map data with the spawn point
      this.mapData = newMapData;
    }
  },

  _removeEnemies: {
    value: function value() {
      var mapData = this.mapData;
      var newMapData = '';

      for (var i = 0; i < mapData.length; i++) {
        var key = mapData[i];
        var isEnemy = key === 'L' || key === 'U' || key === 'R' || key === 'D';

        if (isEnemy) {
          newMapData += ' ';
        } else {
          newMapData += key;
        }
      }

      this.mapData = newMapData;
    }
  }
});

module.exports = Room;

},{"./MapParser":12}],14:[function(require,module,exports){
"use strict";

var Room = require('./Room');
var MapParser = require('./MapParser');

var Sector = function Sector() {
  var roomWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var roomHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  if (typeof roomWidth !== 'number' || roomWidth < 1) {
    roomWidth = 1;
  }

  if (typeof roomHeight !== 'number' || roomHeight < 1) {
    roomHeight = 1;
  }

  this.roomWidth = roomWidth;
  this.roomHeight = roomHeight;
  this.roomLayout = [];
  this.rooms = [];

  for (var i = 0; i < roomWidth; i++) {
    this.roomLayout.push([]);

    for (var j = 0; j < roomHeight; j++) {
      this.roomLayout[i].push(null);
    }
  }

  // Whether or not a spawn point for the player has been set yet
  this._playerSet = false;
};

Sector.prototype = Object.create(Sector.prototype, {
  /**
   * Adds a given room to the sector.
   *
   * Optional parameter (room):
   * If room is not defined, a random one will be generated
   *
   * Optional parameters (x, y):
   * (x, y) determine where in the sector the room lies, not pixel coordinates
   *
   * x and y must be non-negative integers
   */
  addRoom: {
    value: function value(room, x, y) {
      if (!(room instanceof Room)) {
        room = Room.createRandom();
      }

      if (typeof x !== 'number' || x < 0) {
        x = Math.random() * this.roomWidth;
      }

      if (typeof y !== 'number' || y < 0) {
        y = Math.random() * this.roomHeight;
      }

      x = Math.floor(x);
      y = Math.floor(y);

      if (!this.roomLayout[x][y]) {
        room.offsetTileX = Room.ROOM_TILE_WIDTH * x;
        room.offsetTileY = Room.ROOM_TILE_WIDTH * y;

        this.roomLayout[x][y] = room;
        this.rooms.push(room);
      }
    }
  },

  addToScene: {
    value: function value(scene) {
      if (!this._playerSet) {
        this._determinePlayerSpawn();
      }

      MapParser.addSectorToScene(this, scene);
    }
  },

  _determinePlayerSpawn: {
    value: function value() {
      var spawnRoomIndex = Math.floor(Math.random() * this.rooms.length);
      var spawnRoom = this.rooms[spawnRoomIndex];
      spawnRoom.setAsSpawnRoom();

      this.spawnRoom = spawnRoom;
      this._playerSet = true;
    }
  }
});

module.exports = Sector;

},{"./MapParser":12,"./Room":13}],15:[function(require,module,exports){
"use strict";

var MapParser = require('./MapParser.js');
var Room = require('./Room.js');
var Sector = require('./Sector.js');

module.exports = {
  MapParser: MapParser,
  Room: Room,
  Sector: Sector
};

},{"./MapParser.js":12,"./Room.js":13,"./Sector.js":14}],16:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../entities');
var map = require('../map');

var GameScene = function GameScene(canvas, PIXI) {
  Scene.call(this, canvas);

  this.PIXI = PIXI;

  this.mouseDownTime = 0;

  $(canvas).on('mousedown', this._onMouseDown.bind(this));
  $(canvas).on('mousemove', this._onMouseMove.bind(this));
  $(canvas).on('mouseup', this._onMouseUp.bind(this));

  this.sector = new map.Sector(3, 3);
  this.sector.addRoom();
  this.sector.addRoom();
  this.sector.addRoom();
  this.sector.addRoom();
  this.sector.addRoom();
  this.sector.addToScene(this);

  /*this.player = new entities.Player();
  this.addGameObject(this.player, 2);
  
  var wall = new entities.Wall();
  wall.position.y = -70;
  this.addGameObject(wall);
  var wall = new entities.Wall();
  wall.position.y = -134;
  this.addGameObject(wall);
  
  this.camera.follow(this.player);*/
};

Object.defineProperties(GameScene, {
  /*
  MY_CONST: {
    value: {
      foo: 0,
      bar: 1
    }
  }
  */
  FRICTION: {
    value: 0.9
  }
});

GameScene.prototype = Object.freeze(Object.create(Scene.prototype, {
  update: {
    value: function value(dt) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._nearbyGameObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;

          if (obj.health <= 0 || obj.customData.forceRemove) {
            this.removeGameObject(obj);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._handleInput();
      this._applyFriction();

      Scene.prototype.update.call(this, dt);
    }
  },

  _handleInput: {
    value: function value() {
      this.player.handleInput(this.keyboard);
    }
  },

  _applyFriction: {
    value: function value() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._nearbyGameObjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var obj = _step2.value;

          var fric = obj.customData.DEFAULT_FRICTION || GameScene.FRICTION;
          obj.acceleration.multiply(fric);
          obj.velocity.multiply(fric);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  },

  _onMouseDown: {
    value: function value(e) {
      if (e.which === 1) {
        this.mouseDownTime = Date.now();
        var mouseWorldPos = this._getMouseWorldPositionFromEvent(e);
      }
    }
  },

  _onMouseUp: {
    value: function value(e) {
      if (e.which === 1) {
        var dtMouseDownRaw = Date.now() - this.mouseDownTime;
        var dtMouseDown = dtMouseDownRaw < entities.Arrow.MAX_ARROW_CHARGE_TIME ? dtMouseDownRaw : entities.Arrow.MAX_ARROW_CHARGE_TIME;
        if (dtMouseDown < entities.Arrow.MIN_ARROW_CHARGE_TIME) {
          return;
        }

        // Create an arrow that is from the player
        var arrow = new entities.ArrowRicochet(this.player.customData.alliance);
        arrow.position.x = this.player.position.x;
        arrow.position.y = this.player.position.y;
        arrow.rotate(this.player.rotation);
        arrow.velocity.x = 40 * (dtMouseDown / 1000);
        arrow.velocity.rotate(arrow.rotation);
        this.addGameObject(arrow, 2);
      }
    }
  },

  _onMouseMove: {
    value: function value(e) {
      var mouseWorldPos = this._getMouseWorldPositionFromEvent(e);
      this.player.lookAt(mouseWorldPos);

      // Create an arrow that is from the player
      var dtMouseDownRaw = Date.now() - this.mouseDownTime;
      var dtMouseDown = dtMouseDownRaw < entities.Arrow.MAX_ARROW_CHARGE_TIME ? dtMouseDownRaw : entities.Arrow.MAX_ARROW_CHARGE_TIME;
      var arrow = new entities.ArrowRicochet(this.player.customData.alliance);
      arrow.position.x = this.player.position.x;
      arrow.position.y = this.player.position.y;
      arrow.rotate(this.player.rotation);
      arrow.velocity.x = 40 * (dtMouseDown / 1000);
      arrow.velocity.rotate(arrow.rotation);
      this.addGameObject(arrow, 2);
    }
  },

  /**
   * Returns the world position of where the mouse currently is based
   * on the given event data
   */
  _getMouseWorldPositionFromEvent: {
    value: function value(e) {
      var centerToMouse = new geom.Vec2(e.offsetX, e.offsetY);
      centerToMouse.x -= this.canvas.width * 0.5;
      centerToMouse.y -= this.canvas.height * 0.5;

      return new geom.Vec2(this.camera.position.x + centerToMouse.x / this.camera.zoom, this.camera.position.y + centerToMouse.y / this.camera.zoom);
    }
  }
}));

module.exports = GameScene;

},{"../entities":10,"../map":15}],17:[function(require,module,exports){
"use strict";

var GameScene = require('./GameScene.js');
var test = require('./test');

module.exports = {
  GameScene: GameScene,
  test: test
};

},{"./GameScene.js":16,"./test":41}],18:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene2 = require('./TestScene2');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 1 non-static - Vertical velocity does not gain horizontal component from collision", TestScene2);

  var wall = new entities.Wall();
  wall.restitution = 0.0;
  wall.friction = 0.8;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.y = 80;
  this.player.velocity.y = -5;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.timeout = window.setTimeout(function () {
    var velocity = _this.player.velocity;
    _this.onTestSuccess("(Timeout) Velocity: {" + velocity.x + ", " + velocity.y + "}");
  }, 500);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);

      var collisionDisplacement = this.player.collisionDisplacementSum;

      if (this.player.collisionDisplacementSum.getMagnitudeSquared() > 0) {
        var velocity = this.player.velocity;

        if (Math.abs(velocity.x) >= 0.0001) {
          window.clearTimeout(this.timeout);
          this.onTestFail("Velocity: {" + velocity.x + ", " + velocity.y + "}");
        } else {
          window.clearTimeout(this.timeout);
          this.onTestSuccess("Velocity: {" + velocity.x + ", " + velocity.y + "}");
        }
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene2":29,"./TestSceneBase":40}],19:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene11 = require('./TestScene11');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 2 non-static - 2 non-statics eventually stabilize and do not overlap", TestScene11);

  var platform = new entities.Platform();
  platform.restitution = 0.0;
  platform.friction = 0.8;
  this.addGameObject(platform);

  this.blocks = [];

  for (var i = 0; i < 2; i++) {
    var block = new entities.SmallBlock();
    block.position.y = -500 + 32 * i;
    block.velocity.y = 2;
    block.maxSpeed = 10;
    block.maxAcceleration = 20;
    this.addGameObject(block);

    this.blocks.push(block);
  }

  this.camera.position.y = -200;

  this.timeout = window.setTimeout(function () {
    for (var i = 0; i < _this.blocks.length; i++) {
      var b0 = _this.blocks[i];
      var p0 = b0.position;

      for (var j = i + 1; j < _this.blocks.length; j++) {
        var b1 = _this.blocks[j];
        var p1 = b1.position;
        var dist = geom.Vec2.subtract(p1, p0).getMagnitude();

        if (dist < 23) {
          _this.onTestFail("(Overlapping) Distance found between 2 overlapping = " + dist);
          return;
        }
      }
    }

    _this.onTestSuccess("No objects overlapping");
  }, 3000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      var gravity = new geom.Vec2(0, 3);

      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.addForce(gravity);
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene11":20,"./TestSceneBase":40}],20:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene12 = require('./TestScene12');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 3 non-static - 1 non-static eventually stabilize on 2 non-statics and do not overlap", TestScene12);

  var platform = new entities.Platform();
  platform.restitution = 0.0;
  platform.friction = 0.8;
  this.addGameObject(platform);

  this.blocks = [];

  var block0 = new entities.SmallBlock();
  block0.position.x = -12.1;
  block0.position.y = -200;
  block0.velocity.y = 2;
  block0.maxSpeed = 10;
  block0.maxAcceleration = 20;
  this.addGameObject(block0);
  this.blocks.push(block0);

  var block1 = new entities.SmallBlock();
  block1.position.x = 12.1;
  block1.position.y = -200;
  block1.velocity.y = 2;
  block1.maxSpeed = 10;
  block1.maxAcceleration = 20;
  this.addGameObject(block1);
  this.blocks.push(block1);

  var block2 = new entities.SmallBlock();
  block2.position.y = -250;
  block2.velocity.y = 2;
  block2.maxSpeed = 10;
  block2.maxAcceleration = 20;
  this.addGameObject(block2);
  this.blocks.push(block2);

  this.camera.position.y = -200;

  this.timeout = window.setTimeout(function () {
    for (var i = 0; i < _this.blocks.length; i++) {
      var b0 = _this.blocks[i];
      var p0 = b0.position;

      for (var j = i + 1; j < _this.blocks.length; j++) {
        var b1 = _this.blocks[j];
        var p1 = b1.position;
        var dist = geom.Vec2.subtract(p1, p0).getMagnitude();

        if (dist < 23) {
          _this.onTestFail("(Overlapping) Distance found between 2 overlapping = " + dist);
          return;
        } else if (dist > 35) {
          _this.onTestFail("(Separated) Distance found between 2 overlapping = " + dist);
          return;
        }
      }
    }

    if (block2.position.y < block0.position.y - 2) {
      _this.onTestSuccess("No objects overlapping & stabilized");
    } else {
      _this.onTestFail("No objects overlapping, but did not resolve collision correctly");
    }
  }, 3000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      var gravity = new geom.Vec2(0, 3);

      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.addForce(gravity);
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene12":21,"./TestSceneBase":40}],21:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene13 = require('./TestScene13');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 10 non-static - Non-static eventually stabilize and do not overlap", TestScene13);

  var platform = new entities.Platform();
  platform.restitution = 0.0;
  platform.friction = 0.8;
  this.addGameObject(platform);

  this.blocks = [];

  for (var i = 0; i < 10; i++) {
    var block = new entities.SmallBlock();
    block.position.y = -500 + 32 * i;
    block.velocity.y = 2;
    block.maxSpeed = 10;
    block.maxAcceleration = 20;
    this.addGameObject(block);

    this.blocks.push(block);
  }

  this.camera.position.y = -200;

  this.timeout = window.setTimeout(function () {
    for (var i = 0; i < _this.blocks.length; i++) {
      var b0 = _this.blocks[i];
      var p0 = b0.position;

      for (var j = i + 1; j < _this.blocks.length; j++) {
        var b1 = _this.blocks[j];
        var p1 = b1.position;
        var dist = geom.Vec2.subtract(p1, p0).getMagnitude();

        if (dist < 23) {
          _this.onTestFail("(Overlapping) Distance found between 2 overlapping = " + dist);
          return;
        }
      }
    }

    _this.onTestSuccess("No objects overlapping");
  }, 3000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      var gravity = new geom.Vec2(0, 3);

      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.addForce(gravity);
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene13":22,"./TestSceneBase":40}],22:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene14 = require('./TestScene14');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 6 non-static - Non-statics eventually stabilize on other non-statics and do not overlap", TestScene14);

  var platform = new entities.Platform();
  platform.restitution = 0.0;
  platform.friction = 0.8;
  this.addGameObject(platform);

  this.blocks = [];

  var block0 = new entities.SmallBlock();
  block0.position.x = -12.1;
  block0.position.y = -200;
  block0.velocity.y = 2;
  block0.maxSpeed = 10;
  block0.maxAcceleration = 20;
  this.addGameObject(block0);
  this.blocks.push(block0);

  var block1 = new entities.SmallBlock();
  block1.position.x = 12.1;
  block1.position.y = -200;
  block1.velocity.y = 2;
  block1.maxSpeed = 10;
  block1.maxAcceleration = 20;
  this.addGameObject(block1);
  this.blocks.push(block1);

  var block2 = new entities.SmallBlock();
  block2.position.x = 36.2;
  block2.position.y = -200;
  block2.velocity.y = 2;
  block2.maxSpeed = 10;
  block2.maxAcceleration = 20;
  this.addGameObject(block2);
  this.blocks.push(block2);

  var block3 = new entities.SmallBlock();
  block3.position.y = -250;
  block3.velocity.y = 2;
  block3.maxSpeed = 10;
  block3.maxAcceleration = 20;
  this.addGameObject(block3);
  this.blocks.push(block3);

  var block4 = new entities.SmallBlock();
  block4.position.x = 24.1;
  block4.position.y = -250;
  block4.velocity.y = 2;
  block4.maxSpeed = 10;
  block4.maxAcceleration = 20;
  this.addGameObject(block4);
  this.blocks.push(block4);

  var block5 = new entities.SmallBlock();
  block5.position.x = 12;
  block5.position.y = -300;
  block5.velocity.y = 2;
  block5.maxSpeed = 10;
  block5.maxAcceleration = 20;
  this.addGameObject(block5);
  this.blocks.push(block5);

  this.camera.position.y = -200;

  this.timeout = window.setTimeout(function () {
    for (var i = 0; i < _this.blocks.length; i++) {
      var b0 = _this.blocks[i];
      var p0 = b0.position;

      for (var j = i + 1; j < _this.blocks.length; j++) {
        var b1 = _this.blocks[j];
        var p1 = b1.position;
        var dist = geom.Vec2.subtract(p1, p0).getMagnitude();

        if (dist < 23) {
          _this.onTestFail("(Overlapping) Distance found between 2 overlapping = " + dist);
          return;
        }
      }
    }

    var avMiddleY = (block3.position.y + block4.position.y) / 2;
    var avTopY = block5.position.y;
    var avBottomY = (block0.position.y + block1.position.y + block2.position.y) / 3;

    var dy0 = Math.abs(avBottomY - block0.position.y);
    var dy1 = Math.abs(avBottomY - block1.position.y);
    var dy2 = Math.abs(avBottomY - block2.position.y);
    var dy3 = Math.abs(avMiddleY - block3.position.y);
    var dy4 = Math.abs(avMiddleY - block4.position.y);
    var dy5 = Math.abs(avTopY - block5.position.y);
    var dx0 = Math.abs(-12.1 - block0.position.x);
    var dx1 = Math.abs(12.1 - block1.position.x);
    var dx2 = Math.abs(36.3 - block2.position.x);
    var dx3 = Math.abs(0 - block3.position.x);
    var dx4 = Math.abs(24.1 - block4.position.x);
    var dx5 = Math.abs(12 - block5.position.x);

    var E = 1.5;

    var destabilized = dy0 > E || dy1 > E || dy2 > E || dy3 > E || dy4 > E || dy5 > E || dx0 > E || dx1 > E || dx2 > E || dx3 > E || dx4 > E || dx5 > E;

    if (destabilized) {
      _this.onTestFail("Objects destabilized");
    } else {
      _this.onTestSuccess("No objects overlapping");
    }
  }, 3000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      var gravity = new geom.Vec2(0, 3);

      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.addForce(gravity);
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene14":23,"./TestSceneBase":40}],23:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene15 = require('./TestScene15');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 2 non-static (rest=0.0, mass=100.0 & 100.0) - 2 objects of equal mass and NO restitution do NOT reflect off each other", TestScene15);

  this.blocks = [];

  var block0 = new entities.SmallBlock();
  block0.mass = 100;
  block0.position.x = -60;
  block0.position.y = -100;
  block0.velocity.x = 10;
  block0.velocity.y = -10;
  block0.acceleration.x = 1;
  block0.maxSpeed = 10;
  block0.maxAcceleration = 20;
  this.addGameObject(block0);
  this.blocks.push(block0);

  var block1 = new entities.SmallBlock();
  block1.mass = 100;
  block1.position.x = 60;
  block1.position.y = -110;
  block1.velocity.x = -10;
  block1.velocity.y = -10;
  block1.acceleration.x = -1;
  block1.maxSpeed = 10;
  block1.maxAcceleration = 20;
  this.addGameObject(block1);
  this.blocks.push(block1);

  this.timeout = window.setTimeout(function () {
    var v0 = block0.velocity;
    var v1 = block1.velocity;
    var xSpeed0 = Math.abs(v0.x);
    var xSpeed1 = Math.abs(v1.x);

    var MAX_ERROR_ALLOWANCE = 0.001;

    if (xSpeed0 > MAX_ERROR_ALLOWANCE || xSpeed1 > MAX_ERROR_ALLOWANCE) {
      _this.onTestFail("Objects bounced");
    } else {
      _this.onTestSuccess("Objects did not bounce");
    }
  }, 350);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.acceleration.y = 1;
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene15":24,"./TestSceneBase":40}],24:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene16 = require('./TestScene16');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 2 non-static (rest=1.0, mass=100.0 & 100.0) - 2 objects of equal mass and restitution DO reflect off each other", TestScene16);

  this.blocks = [];

  var block0 = new entities.SmallBlock();
  block0.mass = 100;
  block0.restitution = 1.0;
  block0.position.x = -60;
  block0.position.y = -100;
  block0.velocity.x = 10;
  block0.velocity.y = -10;
  block0.acceleration.x = 1;
  block0.maxSpeed = 10;
  block0.maxAcceleration = 20;
  this.addGameObject(block0);
  this.blocks.push(block0);

  var block1 = new entities.SmallBlock();
  block1.mass = 100;
  block1.restitution = 1.0;
  block1.position.x = 60;
  block1.position.y = -110;
  block1.velocity.x = -10;
  block1.velocity.y = -10;
  block1.acceleration.x = -1;
  block1.maxSpeed = 10;
  block1.maxAcceleration = 20;
  this.addGameObject(block1);
  this.blocks.push(block1);

  this.timeout = window.setTimeout(function () {
    var v0 = block0.velocity;
    var v1 = block1.velocity;
    var xSpeed0 = Math.abs(v0.x);
    var xSpeed1 = Math.abs(v1.x);
    var diff = xSpeed0 - xSpeed1;

    var MAX_ERROR_ALLOWANCE = 0.001;

    if (xSpeed0 > MAX_ERROR_ALLOWANCE || xSpeed1 > MAX_ERROR_ALLOWANCE) {
      if (diff > MAX_ERROR_ALLOWANCE) {
        _this.onTestFail("Objects bounced with different speeds: " + v0.x + " & " + v1.x);
      } else {
        _this.onTestSuccess("Objects bounced with equal speeds: " + v0.x + " & " + v1.x);
      }
    } else {
      _this.onTestFail("Objects did not bounce");
    }
  }, 350);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.acceleration.y = 1;
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene16":25,"./TestSceneBase":40}],25:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene17 = require('./TestScene17');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 2 non-static (rest=1.0, mass=1.0 & 1000.0) - 2 objects of different mass and restitution DO reflect off each other -- Heavier moves less", TestScene17);

  this.blocks = [];

  var block0 = new entities.SmallBlock();
  block0.mass = 1;
  block0.restitution = 1.0;
  block0.position.x = -60;
  block0.position.y = -100;
  block0.velocity.x = 10;
  block0.velocity.y = -10;
  block0.acceleration.x = 1;
  block0.maxSpeed = 10;
  block0.maxAcceleration = 20;
  this.addGameObject(block0);
  this.blocks.push(block0);

  var block1 = new entities.SmallBlock();
  block1.mass = 1000;
  block1.restitution = 1.0;
  block1.position.x = 60;
  block1.position.y = -110;
  block1.velocity.x = -10;
  block1.velocity.y = -10;
  block1.acceleration.x = -1;
  block1.maxSpeed = 10;
  block1.maxAcceleration = 20;
  this.addGameObject(block1);
  this.blocks.push(block1);

  this.timeout = window.setTimeout(function () {
    var v0 = block0.velocity;
    var v1 = block1.velocity;
    var xSpeed0 = Math.abs(v0.x);
    var xSpeed1 = Math.abs(v1.x);
    var diff = xSpeed0 - xSpeed1;

    var MAX_ERROR_ALLOWANCE = 0.001;

    if (xSpeed0 > MAX_ERROR_ALLOWANCE || xSpeed1 > MAX_ERROR_ALLOWANCE) {
      if (diff > MAX_ERROR_ALLOWANCE) {
        // If x-component of velocity is opposite, this test failed --
        // they should be going the same direction
        if (v0.x * v1.x < 0) {
          _this.onTestFail("Objects bounced with different speeds in opposite directions: " + v0.x + " & " + v1.x);
        } else {
          _this.onTestSuccess("Objects bounced with different speeds in the same direction: " + v0.x + " & " + v1.x);
        }
      } else {
        _this.onTestFail("Objects bounced with equal speeds: " + v0.x + " & " + v1.x);
      }
    } else {
      _this.onTestFail("Objects did not bounce");
    }
  }, 300);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.acceleration.y = 1;
      }

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene17":26,"./TestSceneBase":40}],26:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene18 = require('./TestScene18');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.0, rotation=PI/6), 1 non-static - Non-static slides down angled, static object", TestScene18);

  this.platform = new entities.Platform();
  this.platform.rotate(Math.PI / 6);
  this.platform.friction = 0;
  this.platform.restitution = 0;
  this.addGameObject(this.platform);

  this.blocks = [];

  this.storeHistory = false;

  var that = this;

  var Block = function Block() {
    entities.SmallBlock.call(this);
  };

  Block.prototype = Object.create(entities.SmallBlock.prototype, {
    onCollide: {
      value: function value(physObject) {
        that.storeHistory = true;
      }
    }
  });

  this.block0 = new Block();
  this.block0.rotate(Math.PI / 6);
  this.block0.position.y = -200;
  this.block0.velocity.y = 2;
  this.block0.maxSpeed = 10;
  this.block0.maxAcceleration = 20;
  this.blocks.push(this.block0);
  this.addGameObject(this.block0);

  this.prevPosition = new geom.Vec2();

  this.displacementHistory = [];

  this.timeout = window.setTimeout(function () {
    var avAngle = 0;

    for (var i = 0; i < _this.displacementHistory.length; i++) {
      avAngle += _this.displacementHistory[i].getAngle();
    }

    if (_this.displacementHistory.length > 0) {
      avAngle /= _this.displacementHistory.length;
    }

    var MAX_ERROR_ALLOWANCE = 0.1;
    var ANGLE = Math.PI / 6;

    if (avAngle + MAX_ERROR_ALLOWANCE > ANGLE && avAngle - MAX_ERROR_ALLOWANCE < ANGLE) {

      _this.onTestSuccess("Object's displacement angle (" + avAngle + ") is close to platform's rotation (" + Math.PI / 6 + ")");
    } else {
      _this.onTestFail("Object's displacement angle (" + avAngle + ") is not close to platform's rotation (" + Math.PI / 6 + ")");
    }
  }, 1000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.acceleration.y = 1;
      }

      this.prevPosition = this.block0.position.clone();

      TestSceneBase.prototype.update.call(this, dt);

      if (this.storeHistory) {
        var displacement = geom.Vec2.subtract(this.block0.position, this.prevPosition);
        this.displacementHistory.push(displacement);
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene18":27,"./TestSceneBase":40}],27:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene19 = require('./TestScene19');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=1.0, fric=0.8), 1 non-static (rotation=-PI/4) - Non-static ricochets (from -PI/4 to 3*PI/4)", TestScene19);

  var wall = new entities.Wall();
  wall.restitution = 1.0;
  wall.friction = 0.8;
  this.addGameObject(wall);

  this.arrow = new entities.ArrowRicochet();
  this.arrow.customData.alliance = 0;
  this.arrow.maxSpeed = 10;
  this.arrow.position.x = -70;
  this.arrow.position.y = -30;

  this.arrow.rotate(Math.PI * 0.25);

  var direction = this.arrow.forward.clone();

  this.arrow.velocity._x = direction._x * 10;
  this.arrow.velocity._y = direction._y * 10;

  this.addGameObject(this.arrow, 2);

  this.timeout = window.setTimeout(function () {
    var forward = _this.arrow.forward;
    var angle = forward.getAngle();

    var MAX_ERROR_ALLOWANCE = 0.01;
    var EXPECTED = 3 * Math.PI / 4;

    if (angle - MAX_ERROR_ALLOWANCE <= EXPECTED && angle + MAX_ERROR_ALLOWANCE >= EXPECTED) {

      _this.onTestSuccess("(Timeout) Ricochet angle expected: " + EXPECTED + ", Got: " + angle);
    } else {
      _this.onTestFail("(Timeout) Ricochet angle expected: " + EXPECTED + ", Got: " + angle);
    }
  }, 1000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene19":28,"./TestSceneBase":40}],28:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene20 = require('./TestScene20');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=1.0, fric=0.8), 1 non-static (rotation=-PI/3) - Non-static ricochets (from -PI/3 to 2*PI/3)", TestScene20);

  var wall = new entities.Wall();
  wall.restitution = 1.0;
  wall.friction = 0.8;
  this.addGameObject(wall);

  this.arrow = new entities.ArrowRicochet();
  this.arrow.customData.alliance = 0;
  this.arrow.maxSpeed = 15;
  this.arrow.position.x = -70;
  this.arrow.position.y = -40;

  this.arrow.rotate(Math.PI / 3);

  var direction = this.arrow.forward.clone();

  this.arrow.velocity._x = direction._x * 15;
  this.arrow.velocity._y = direction._y * 15;

  this.addGameObject(this.arrow, 2);

  this.timeout = window.setTimeout(function () {
    var forward = _this.arrow.forward;
    var angle = forward.getAngle();

    var MAX_ERROR_ALLOWANCE = 0.01;
    var EXPECTED = 2 * Math.PI / 3;

    if (angle - MAX_ERROR_ALLOWANCE <= EXPECTED && angle + MAX_ERROR_ALLOWANCE >= EXPECTED) {

      _this.onTestSuccess("(Timeout) Ricochet angle expected: " + EXPECTED + ", Got: " + angle);
    } else {
      _this.onTestFail("(Timeout) Ricochet angle expected: " + EXPECTED + ", Got: " + angle);
    }
  }, 1000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene20":30,"./TestSceneBase":40}],29:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene3 = require('./TestScene3');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 2 static (rest=0.0, fric=0.8), 1 non-static - Vertical velocity does not gain horizontal component from collision", TestScene3);

  var wall = new entities.Wall();
  wall.restitution = 0.0;
  wall.friction = 0.8;
  wall.position.x = -32;
  this.addGameObject(wall);

  var wall = new entities.Wall();
  wall.restitution = 0.0;
  wall.friction = 0.8;
  wall.position.x = 32;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.y = 80;
  this.player.velocity.y = -5;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.timeout = window.setTimeout(function () {
    var velocity = _this.player.velocity;
    _this.onTestSuccess("(Timeout) Velocity: {" + velocity.x + ", " + velocity.y + "}");
  }, 500);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);

      var collisionDisplacement = this.player.collisionDisplacementSum;

      if (this.player.collisionDisplacementSum.getMagnitudeSquared() > 0) {
        var velocity = this.player.velocity;

        if (Math.abs(velocity.x) >= 0.0001) {
          window.clearTimeout(this.timeout);
          this.onTestFail("Velocity: {" + velocity.x + ", " + velocity.y + "}");
        } else {
          window.clearTimeout(this.timeout);
          this.onTestSuccess("Velocity: {" + velocity.x + ", " + velocity.y + "}");
        }
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene3":33,"./TestSceneBase":40}],30:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;

var _require = require('../../entities'),
    Player = _require.Player,
    Enemy = _require.Enemy;

var _require2 = require('../../util'),
    Steer = _require2.Steer;

var TestSceneBase = require('./TestSceneBase');
var TestScene21 = require('./TestScene21');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Steering force: Basic enemy seek implementation towards player.", TestScene21);

  this.player = new Player();
  this.enemy = new Enemy(this.player, this._quadtree);
  this.enemy.maxSpeed = 5;
  this.enemy.maxAcceleration = 1;
  this.enemy.rotate(-Math.PI);

  this.player.position.x = 300;

  this.enemy.position.y = 200;
  this.enemy.velocity.y = -5;

  this.addGameObject(this.player);
  this.addGameObject(this.enemy);

  this.timeout = window.setTimeout(function () {
    if (_this.enemy.position.x !== 0 && _this.enemy.position.y !== 200) {
      _this.onTestSuccess("Enemy sought player.");
    } else {
      _this.onTestFail("Enemy did not seek player/did not move.");
    }
  }, 2000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      var SEEK_WEIGHT = 0.1;
      var seekSteerForce = Steer.seek(this.enemy, this.player);
      seekSteerForce.multiply(SEEK_WEIGHT);

      this.enemy.addForce(seekSteerForce);

      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"../../util":45,"./TestScene21":31,"./TestSceneBase":40}],31:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;

var _require = require('../../entities'),
    ArrowRicochet = _require.ArrowRicochet,
    Wall = _require.Wall;

var TestSceneBase = require('./TestSceneBase');
var TestScene22 = require('./TestScene22');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 1 non-static - Collision against multiple edges should resolve with the correct edge", TestScene22);

  this.wall = new Wall();
  this.wall.restitution = 0.0;
  this.wall.friction = 0.8;

  this.wall2 = new Wall();
  this.wall2.restitution = 0.0;
  this.wall2.friction = 0.8;
  this.wall2.position.x = 64;

  this.arrow = new ArrowRicochet();
  this.arrow.customData.alliance = 0;
  this.arrow.maxSpeed = 15;
  this.arrow.position.x = 33;
  this.arrow.position.y = 100;
  this.arrow.rotate(-Math.PI * 0.5);
  this.arrow.velocity.y = -15;

  var startPos = this.arrow.position.clone();

  this.addGameObject(this.wall);
  this.addGameObject(this.wall2);
  this.addGameObject(this.arrow);

  this.timeout = window.setTimeout(function () {
    if (_this.arrow.position.y > _this.wall.y && _this.arrow.velocity.y > 0) {
      _this.onTestSuccess("Reflected properly");
    } else {
      _this.onTestFail("Failed to reflect");
    }
  }, 500);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene22":32,"./TestSceneBase":40}],32:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;

var _require = require('../../entities'),
    ArrowRicochet = _require.ArrowRicochet,
    Wall = _require.Wall;

var TestSceneBase = require('./TestSceneBase');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 1 non-static (rotation=PI/4) - Collision against multiple edges should resolve with the correct edge");

  this.wall = new Wall();
  this.wall.restitution = 0.0;
  this.wall.friction = 0.8;

  this.wall2 = new Wall();
  this.wall2.restitution = 0.0;
  this.wall2.friction = 0.8;
  this.wall2.position.x = 64;

  var arrows = [];

  var startPos = new geom.Vec2(-29.5, 96);

  for (var i = 0; i < 9; i++) {
    var arrow = new ArrowRicochet();
    arrow.customData.alliance = 0;
    arrow.maxSpeed = 15;
    arrow.rotate(-Math.PI * 0.2499);
    arrow.position.x = startPos.x + i * 0.25;
    arrow.position.y = startPos.y;
    arrow.velocity = arrow.forward.clone().multiply(15);
    arrows.push(arrow);
    this.addGameObject(arrow);
  }

  this.addGameObject(this.wall);
  this.addGameObject(this.wall2);

  this.timeout = window.setTimeout(function () {
    var passed = true;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = arrows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var a = _step.value;

        if (!(a.position.y > _this.wall.y && a.velocity.y > -0.0001 && a.position.x > startPos.x && a.velocity.x > -0.0001)) {

          passed = false;
          break;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (passed) {
      _this.onTestSuccess("Reflected properly");
    } else {
      _this.onTestFail("Reflected against wrong edge");
    }
  }, 300);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestSceneBase":40}],33:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene4 = require('./TestScene4');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8), 1 non-static - Up-right velocity, never goes left or down", TestScene4);

  var wall = new entities.Wall();
  wall.restitution = 0.0;
  wall.friction = 0.8;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.restitution = 0.0;
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.x = -10;
  this.player.position.y = 80;
  this.player.velocity.x = 2;
  this.player.velocity.y = -2;
  this.player.acceleration.x = 1;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.velocityHistory = [];

  this.timeout = window.setTimeout(function () {
    var msg = "Velocities:";
    var right = new geom.Vec2(1, 0);
    var down = new geom.Vec2(0, 1);
    var leftProj = Infinity;
    var leftMost = _this.velocityHistory[0];
    var downProj = -Infinity;
    var downMost = _this.velocityHistory[0];

    for (var i = 0; i < _this.velocityHistory.length; i++) {
      var v = _this.velocityHistory[i];
      var projOnRight = geom.Vec2.dot(v, right);
      var projOnDown = geom.Vec2.dot(v, down);

      if (projOnRight < leftProj) {
        leftMost = v;
        leftProj = projOnRight;
      }
      if (projOnDown > downProj) {
        downMost = v;
        downProj = projOnDown;
      }
    }

    _this.onTestSuccess("(Timeout)\n\t" + "Left Most: {" + leftMost.x + ", " + leftMost.y + "}\n\t" + "Down Most: {" + downMost.x + ", " + downMost.y + "}");
  }, 1000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);

      var velocity = this.player.velocity;

      if (velocity.x < -0.0001 || velocity.y > 0.0001) {
        window.clearTimeout(this.timeout);
        this.onTestFail("Velocity: {" + velocity.x + ", " + velocity.y + "}");
      }

      this.velocityHistory.push(this.player.velocity.clone());
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene4":34,"./TestSceneBase":40}],34:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene5 = require('./TestScene5');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=1.0, fric=0.8), 1 non-static - Up-right velocity, should bounce and deflect down", TestScene5);

  var wall = new entities.Wall();
  wall.restitution = 1.0;
  wall.friction = 0.8;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.restitution = 1.0;
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.x = -40;
  this.player.position.y = 70;
  this.player.velocity.x = 2;
  this.player.velocity.y = -5;
  this.player.acceleration.x = 1;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.timeout = window.setTimeout(function () {
    _this.onTestFail("(Timeout) Never bounced");
  }, 1500);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      TestSceneBase.prototype.update.call(this, dt);

      var velocity = this.player.velocity;

      if (velocity.y >= 0.001) {
        window.clearTimeout(this.timeout);
        this.onTestSuccess("Velocity: {" + velocity.x + ", " + velocity.y + "}");
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene5":35,"./TestSceneBase":40}],35:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene6 = require('./TestScene6');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 2 static (rest=0.0, fric=0.0 & 1.0), 1 non-static - Up-right velocity, should be reduced from friction by 2nd static", TestScene6);

  var wall = new entities.Wall();
  wall.position.x = -32;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  var wall = new entities.Wall();
  wall.position.x = 32;
  wall.restitution = 0.0;
  wall.friction = 1.0;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.friction = 0;
  this.player.restitution = 0.0;
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.x = -64;
  this.player.position.y = 48;
  this.player.velocity.x = 2;
  this.player.velocity.y = -5;
  this.player.acceleration.x = 1;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.velocityHistoryFirstHalf = [];
  this.velocityHistorySecondHalf = [];

  this.timeout = window.setTimeout(function () {
    _this.onTestFail("(Timeout) Never reduced speed");
  }, 2000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      // Simulate moving up-right
      this.player.acceleration.x = 1;
      this.player.acceleration.y = -1;

      TestSceneBase.prototype.update.call(this, dt);

      if (this.player.position.x >= 64) {
        var speedSum0 = 0;
        var speedAverage0 = 0;
        var speedSum1 = 0;
        var speedAverage1 = 0;

        for (var i = 0; i < this.velocityHistoryFirstHalf.length; i++) {
          var v0 = this.velocityHistoryFirstHalf[i];
          speedSum0 += v0.getMagnitude();
        }

        for (var i = 0; i < this.velocityHistorySecondHalf.length; i++) {
          var v0 = this.velocityHistorySecondHalf[i];
          speedSum1 += v0.getMagnitude();
        }

        speedAverage0 = speedSum0 / this.velocityHistoryFirstHalf.length;
        speedAverage1 = speedSum1 / this.velocityHistorySecondHalf.length;

        window.clearTimeout(this.timeout);

        if (speedAverage1 < speedAverage0) {
          this.onTestSuccess("Reduced speed: First half = " + speedAverage0 + ", Second half = " + speedAverage1);
        } else {
          this.onTestFail("Never reduced speed: First half = " + speedAverage0 + ", Second half = " + speedAverage1);
        }
      } else {
        if (this.player.position.x < 0) {
          this.velocityHistoryFirstHalf.push(this.player.velocity.clone());
        } else {
          this.velocityHistorySecondHalf.push(this.player.velocity.clone());
        }
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene6":36,"./TestSceneBase":40}],36:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene7 = require('./TestScene7');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 3 static (rest=0.0, fric=0.0), 1 non-static - Up-right velocity, should NOT be reduced from friction by 2nd or 3rd static", TestScene7);

  var wall = new entities.Wall();
  wall.position.x = -32;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  var wall = new entities.Wall();
  wall.position.x = 32;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  var wall = new entities.Wall();
  wall.position.x = 96;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.friction = 0;
  this.player.restitution = 0.0;
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.x = -64;
  this.player.position.y = 48;
  this.player.velocity.x = 5;
  this.player.velocity.y = -5;
  this.player.acceleration.x = 1;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.velocityHistoryFirst = [];
  this.velocityHistorySecond = [];
  this.velocityHistoryThird = [];

  this.timeout = window.setTimeout(function () {
    _this.onTestFail("(Timeout) Inconclusive");
  }, 3000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      // Simulate moving up-right
      this.player.acceleration.x = 1;
      this.player.acceleration.y = -1;

      TestSceneBase.prototype.update.call(this, dt);

      if (this.player.position.x >= 128) {
        var speedSum0 = 0;
        var speedAverage0 = 0;
        var speedSum1 = 0;
        var speedAverage1 = 0;
        var speedSum2 = 0;
        var speedAverage2 = 0;

        for (var i = 0; i < this.velocityHistoryFirst.length; i++) {
          var v0 = this.velocityHistoryFirst[i];
          speedSum0 += v0.getMagnitude();
        }

        for (var i = 0; i < this.velocityHistorySecond.length; i++) {
          var v0 = this.velocityHistorySecond[i];
          speedSum1 += v0.getMagnitude();
        }

        for (var i = 0; i < this.velocityHistoryThird.length; i++) {
          var v0 = this.velocityHistoryThird[i];
          speedSum2 += v0.getMagnitude();
        }

        speedAverage0 = speedSum0 / this.velocityHistoryFirst.length;
        speedAverage1 = speedSum1 / this.velocityHistorySecond.length;
        speedAverage2 = speedSum2 / this.velocityHistoryThird.length;

        var d0 = speedAverage1 - speedAverage0;
        var d1 = speedAverage2 - speedAverage1;
        var dSpeedAverage = (d0 + d1) / 2;

        window.clearTimeout(this.timeout);

        var MAX_ERROR_ALLOWANCE = 0.1;

        if (Math.abs(dSpeedAverage) >= MAX_ERROR_ALLOWANCE) {
          this.onTestFail("Reduced speed: " + speedAverage0 + " " + speedAverage1 + " " + speedAverage2);
        } else {
          this.onTestSuccess("Never reduced speed");
        }
      } else {
        if (this.player.position.x < 0) {
          this.velocityHistoryFirst.push(this.player.velocity.clone());
        } else if (this.player.position.x < 64) {
          this.velocityHistorySecond.push(this.player.velocity.clone());
        } else {
          this.velocityHistoryThird.push(this.player.velocity.clone());
        }
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene7":37,"./TestSceneBase":40}],37:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene8 = require('./TestScene8');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 3 static (rest=0.0, fric=0.0), 1 non-static - Up-right velocity, position should always be moving right (and usually up)", TestScene8);

  var wall = new entities.Wall();
  wall.position.x = -32;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  var wall = new entities.Wall();
  wall.position.x = 32;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  var wall = new entities.Wall();
  wall.position.x = 96;
  wall.restitution = 0.0;
  wall.friction = 0.0;
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.friction = 0;
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.x = -64;
  this.player.position.y = 48;
  this.player.velocity.x = 2;
  this.player.velocity.y = -5;
  this.player.acceleration.x = 1;
  this.player.acceleration.y = -1;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.prevSpeed = 0;

  this.timeout = window.setTimeout(function () {
    _this.onTestSuccess("Never pushed left or down");
  }, 1000);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      var pos0 = this.player.position.clone();

      // Simulate moving up-right
      this.player.acceleration.x = 1;
      this.player.acceleration.y = -1;

      TestSceneBase.prototype.update.call(this, dt);

      var pos1 = this.player.position.clone();
      var displacement = pos1.subtract(pos0);

      var MAX_ERROR_ALLOWANCE = 3;

      if (displacement.x <= -MAX_ERROR_ALLOWANCE || displacement.y >= MAX_ERROR_ALLOWANCE) {

        window.clearTimeout(this.timeout);
        this.onTestFail("Displacement: {" + displacement.x + ", " + displacement.y + "}");
      }
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene8":38,"./TestSceneBase":40}],38:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene9 = require('./TestScene9');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 1 static (rest=0.0, fric=0.8, rotation=PI/4), 1 non-static - Can move along angled edges", TestScene9);

  var wall = new entities.Wall();
  wall.restitution = 0.0;
  wall.friction = 0.8;
  wall.position.x = -32;
  wall.rotate(Math.PI * 0.25);
  this.addGameObject(wall);

  this.player = new entities.Player();
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.y = 80;
  this.player.velocity.y = -5;
  this.player.acceleration.y = -5;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.velocityHistory = [];

  this.timeout = window.setTimeout(function () {
    window.clearTimeout(_this.timeout);
    var msg = "Velocities:";
    var right = new geom.Vec2(1, 0);
    var down = new geom.Vec2(0, 1);
    var leftProj = Infinity;
    var leftMost = _this.velocityHistory[0];
    var downProj = -Infinity;
    var downMost = _this.velocityHistory[0];

    for (var i = 0; i < _this.velocityHistory.length; i++) {
      var v = _this.velocityHistory[i];
      var projOnRight = geom.Vec2.dot(v, right);
      var projOnDown = geom.Vec2.dot(v, down);

      if (projOnRight < leftProj) {
        leftMost = v;
        leftProj = projOnRight;
      }
      if (projOnDown > downProj) {
        downMost = v;
        downProj = projOnDown;
      }
    }

    _this.onTestSuccess("Left Most: {" + leftMost.x + ", " + leftMost.y + "}\n\t" + "Down Most: {" + downMost.x + ", " + downMost.y + "}");
  }, 500);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      this.player.acceleration.y = -1;

      TestSceneBase.prototype.update.call(this, dt);

      var velocity = this.player.velocity;

      if (velocity.x < 0 || velocity.y >= 0.0001) {
        window.clearTimeout(this.timeout);
        this.onTestFail("Velocity: {" + velocity.x + ", " + velocity.y + "}");
      }

      this.velocityHistory.push(this.player.velocity.clone());
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene9":39,"./TestSceneBase":40}],39:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var Scene = wfl.display.Scene;
var geom = wfl.geom;
var entities = require('../../entities');

var TestSceneBase = require('./TestSceneBase');
var TestScene10 = require('./TestScene10');

var TestScene = function TestScene(canvas) {
  var _this = this;

  TestSceneBase.call(this, canvas, "Collision: 3 static (rest=0.0, fric=0.8, rotation=PI/4), 1 non-static - Can move along adjacent angled edges", TestScene10);

  var angle = Math.PI * 0.25;
  for (var i = 0; i < 3; i++) {
    var radius = 64 * i;
    var x = radius * Math.cos(angle);
    var y = -radius * Math.sin(angle);
    var wall = new entities.Wall();
    wall.restitution = 0.0;
    wall.friction = 0.8;
    wall.position.x = x;
    wall.position.y = y;
    wall.rotate(angle);
    this.addGameObject(wall);
  }

  this.player = new entities.Player();
  this.player.maxSpeed = 5;
  this.player.maxAcceleration = 10;
  this.player.position.x = 25;
  this.player.position.y = 70;
  this.player.velocity.y = -5;
  this.addGameObject(this.player, 2);

  this.camera.follow(this.player);

  this.velocityHistory = [];

  this.timeout = window.setTimeout(function () {
    var msg = "Velocities:";
    var right = new geom.Vec2(1, 0);
    var down = new geom.Vec2(0, 1);
    var leftProj = Infinity;
    var leftMost = _this.velocityHistory[0];
    var downProj = -Infinity;
    var downMost = _this.velocityHistory[0];

    for (var i = 0; i < _this.velocityHistory.length; i++) {
      var v = _this.velocityHistory[i];
      var projOnRight = geom.Vec2.dot(v, right);
      var projOnDown = geom.Vec2.dot(v, down);

      if (projOnRight < leftProj) {
        leftMost = v;
        leftProj = projOnRight;
      }
      if (projOnDown > downProj) {
        downMost = v;
        downProj = projOnDown;
      }
    }

    _this.onTestSuccess("Left Most: {" + leftMost.x + ", " + leftMost.y + "}\n\t" + "Down Most: {" + downMost.x + ", " + downMost.y + "}");
  }, 1600);
};

TestScene.prototype = Object.freeze(Object.create(TestSceneBase.prototype, {
  update: {
    value: function value(dt) {
      this.player.acceleration.y = -1;

      TestSceneBase.prototype.update.call(this, dt);

      var collisionDisplacement = this.player.collisionDisplacementSum;

      if (this.player.collisionDisplacementSum.getMagnitudeSquared() > 0) {
        var velocity = this.player.velocity;

        if (velocity.x < 0 || velocity.y >= 0.0001) {
          window.clearTimeout(this.timeout);
          this.onTestFail("Velocity: {" + velocity.x + ", " + velocity.y + "}");
        }
      }

      this.velocityHistory.push(this.player.velocity.clone());
    }
  }
}));

module.exports = TestScene;

},{"../../entities":10,"./TestScene10":19,"./TestSceneBase":40}],40:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var GameScene = require('../GameScene');

var TestSceneBase = function TestSceneBase(canvas) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "NO NAME ENTERED FOR TEST";
  var nextScene = arguments[2];


  Scene.call(this, canvas);

  this.name = "<" + name + ">";
  this._upcomingScene = nextScene;
};

Object.defineProperties(TestSceneBase, {
  FRICTION: {
    value: 0.9
  },

  hideMessages: {
    value: function value() {
      TestSceneBase._messageIsVisible = false;
    }
  },

  showMessages: {
    value: function value() {
      TestSceneBase._messageIsVisible = true;
    }
  },

  _messageIsVisible: {
    value: true,
    writable: true
  }
});

TestSceneBase.prototype = Object.freeze(Object.create(Scene.prototype, {
  update: {
    value: function value(dt) {
      var gos = this.getGameObjects();

      // GameObject update loop
      for (var i = 0; i < gos.length; i++) {
        if (gos[i].health <= 0) {
          this.removeGameObject(gos[i]);
        } else if (gos[i].customData.forceRemove) {
          this.removeGameObject(gos[i]);
        }
      }

      this._applyFriction();

      Scene.prototype.update.call(this, dt);
    }
  },

  onTestSuccess: {
    value: function value(msg) {
      console.log("%cPassed: " + this.name, "color: green;");
      if (TestSceneBase._messageIsVisible && msg) console.log('\t' + msg);
      if (!this._upcomingScene) this._upcomingScene = GameScene;
      this.change(new this._upcomingScene(this.canvas));
    }
  },

  onTestFail: {
    value: function value(msg) {
      console.log("%c" + "Failed: " + this.name, "color: red;");
      if (TestSceneBase._messageIsVisible && msg) console.log('\t' + msg);
      if (!this._upcomingScene) this._upcomingScene = GameScene;
      this.change(new this._upcomingScene(this.canvas));
    }
  },

  _applyFriction: {
    value: function value() {
      var gos = this.getGameObjects();

      for (var i = 0; i < gos.length; i++) {
        gos[i].acceleration.multiply(TestSceneBase.FRICTION);
        gos[i].velocity.multiply(TestSceneBase.FRICTION);
      }
    }
  }
}));

module.exports = TestSceneBase;

},{"../GameScene":16}],41:[function(require,module,exports){
"use strict";

var TestSceneBase = require('./TestSceneBase');
var TestScene1 = require('./TestScene1');
var TestScene2 = require('./TestScene2');
var TestScene3 = require('./TestScene3');
var TestScene4 = require('./TestScene4');
var TestScene5 = require('./TestScene5');
var TestScene6 = require('./TestScene6');
var TestScene7 = require('./TestScene7');
var TestScene8 = require('./TestScene8');
var TestScene9 = require('./TestScene9');
var TestScene10 = require('./TestScene10');
var TestScene11 = require('./TestScene11');
var TestScene12 = require('./TestScene12');
var TestScene13 = require('./TestScene13');
var TestScene14 = require('./TestScene14');
var TestScene15 = require('./TestScene15');
var TestScene16 = require('./TestScene16');
var TestScene17 = require('./TestScene17');
var TestScene18 = require('./TestScene18');
var TestScene19 = require('./TestScene19');
var TestScene20 = require('./TestScene20');
var TestScene21 = require('./TestScene21');
var TestScene22 = require('./TestScene22');

module.exports = {
  TestSceneBase: TestSceneBase,
  TestScene1: TestScene1,
  TestScene2: TestScene2,
  TestScene3: TestScene3,
  TestScene4: TestScene4,
  TestScene5: TestScene5,
  TestScene6: TestScene6,
  TestScene7: TestScene7,
  TestScene8: TestScene8,
  TestScene9: TestScene9,
  TestScene10: TestScene10,
  TestScene11: TestScene11,
  TestScene12: TestScene12,
  TestScene13: TestScene13,
  TestScene14: TestScene14,
  TestScene15: TestScene15,
  TestScene16: TestScene16,
  TestScene17: TestScene17,
  TestScene18: TestScene18,
  TestScene19: TestScene19,
  TestScene20: TestScene20,
  TestScene21: TestScene21,
  TestScene22: TestScene22
};

},{"./TestScene1":18,"./TestScene10":19,"./TestScene11":20,"./TestScene12":21,"./TestScene13":22,"./TestScene14":23,"./TestScene15":24,"./TestScene16":25,"./TestScene17":26,"./TestScene18":27,"./TestScene19":28,"./TestScene2":29,"./TestScene20":30,"./TestScene21":31,"./TestScene22":32,"./TestScene3":33,"./TestScene4":34,"./TestScene5":35,"./TestScene6":36,"./TestScene7":37,"./TestScene8":38,"./TestScene9":39,"./TestSceneBase":40}],42:[function(require,module,exports){
"use strict";

module.exports = {
  PLAYER: "./assets/img/player.png",
  ENEMY: "./assets/img/enemy.png",
  ARROW: "./assets/img/arrow.png",
  WALL: "./assets/img/wall.png",

  SMALL_BLOCK: "./assets/img/small_block.png",
  PLATFORM: "./assets/img/platform.png",

  MAP1: "./assets/map/map1.json",

  // Preloader.js will replace getter with appropriate definition
  get: function get(path) {}
};

},{}],43:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');

var Preloader = function Preloader(onComplete) {
    // Set up preloader
    this.queue = new createjs.LoadQueue(false);
    this.queue.installPlugin(createjs.Sound);

    // Replace definition of Asset getter to use the data from the queue
    Assets.get = this.queue.getResult.bind(this.queue);

    // Once everything has been preloaded, start the application
    if (onComplete) {
        this.queue.on("complete", onComplete);
    }

    var needToLoad = [];

    // Prepare to load assets
    for (var asset in Assets) {
        var assetObj = {
            id: asset,
            src: Assets[asset]
        };

        needToLoad.push(assetObj);
    }

    this.queue.loadManifest(needToLoad);
};

module.exports = Preloader;

},{"./Assets.js":42}],44:[function(require,module,exports){
"use strict";

var Vec2 = wfl.geom.Vec2;


var Steer = {
  seek: function seek(source, target) {
    var endVelocity = Vec2.subtract(target.position, source.position).normalize().multiply(source.maxSpeed);

    var steerForce = endVelocity.subtract(source.velocity);
    steerForce.limit(source.mass * source.maxAcceleration);
    return steerForce;
  }
};

module.exports = Steer;

},{}],45:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');
var Steer = require('./Steer.js');

module.exports = {
  Assets: Assets,
  Preloader: Preloader,
  Steer: Steer
};

},{"./Assets.js":42,"./Preloader.js":43,"./Steer.js":44}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlbnRpdGllc1xcQXJyb3cuanMiLCJlbnRpdGllc1xcQXJyb3dSaWNvY2hldC5qcyIsImVudGl0aWVzXFxFbmVteS5qcyIsImVudGl0aWVzXFxMaXZpbmdPYmplY3QuanMiLCJlbnRpdGllc1xcUGxhdGZvcm0uanMiLCJlbnRpdGllc1xcUGxheWVyLmpzIiwiZW50aXRpZXNcXFNlZ21lbnQuanMiLCJlbnRpdGllc1xcU21hbGxCbG9jay5qcyIsImVudGl0aWVzXFxXYWxsLmpzIiwiZW50aXRpZXNcXGluZGV4LmpzIiwiaW5kZXguanMiLCJtYXBcXE1hcFBhcnNlci5qcyIsIm1hcFxcUm9vbS5qcyIsIm1hcFxcU2VjdG9yLmpzIiwibWFwXFxpbmRleC5qcyIsInNjZW5lc1xcR2FtZVNjZW5lLmpzIiwic2NlbmVzXFxpbmRleC5qcyIsInNjZW5lc1xcdGVzdFxcVGVzdFNjZW5lMS5qcyIsInNjZW5lc1xcdGVzdFxcVGVzdFNjZW5lMTAuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTExLmpzIiwic2NlbmVzXFx0ZXN0XFxUZXN0U2NlbmUxMi5qcyIsInNjZW5lc1xcdGVzdFxcVGVzdFNjZW5lMTMuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTE0LmpzIiwic2NlbmVzXFx0ZXN0XFxUZXN0U2NlbmUxNS5qcyIsInNjZW5lc1xcdGVzdFxcVGVzdFNjZW5lMTYuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTE3LmpzIiwic2NlbmVzXFx0ZXN0XFxUZXN0U2NlbmUxOC5qcyIsInNjZW5lc1xcdGVzdFxcVGVzdFNjZW5lMTkuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTIuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTIwLmpzIiwic2NlbmVzXFx0ZXN0XFxUZXN0U2NlbmUyMS5qcyIsInNjZW5lc1xcdGVzdFxcVGVzdFNjZW5lMjIuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTMuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTQuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTUuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTYuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTcuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTguanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZTkuanMiLCJzY2VuZXNcXHRlc3RcXFRlc3RTY2VuZUJhc2UuanMiLCJzY2VuZXNcXHRlc3RcXGluZGV4LmpzIiwidXRpbFxcQXNzZXRzLmpzIiwidXRpbFxcUHJlbG9hZGVyLmpzIiwidXRpbFxcU3RlZXIuanMiLCJ1dGlsXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLElBQUksT0FBZ0IsSUFBSSxJQUF4QjtBQUNBLElBQUksT0FBZ0IsUUFBUSxTQUFSLENBQXBCO0FBQ0EsSUFBSSxTQUFnQixLQUFLLE1BQXpCO0FBQ0EsSUFBSSxhQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLFVBQXRDO0FBQ0EsSUFBSSxnQkFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixhQUF0QztBQUNBLElBQUksZUFBZ0IsUUFBUSxnQkFBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsUUFBUSxVQUFSLENBQXBCOztBQUVBLElBQUksUUFBUSxTQUFSLEtBQVEsQ0FBVSxRQUFWLEVBQW9CO0FBQzlCLGdCQUFjLElBQWQsQ0FBbUIsSUFBbkI7O0FBRUE7QUFDQSxPQUFLLFlBQUwsR0FBb0IsT0FBTyxHQUFQLENBQVcsT0FBTyxLQUFsQixFQUF5QixPQUE3Qzs7QUFFQSxPQUFLLGlCQUFMLEdBQXlCLEtBQXpCOztBQUVBO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxFQUFsQjtBQUNBLE9BQUssTUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxZQUE1QixDQUFsQjtBQUNBLE9BQUssVUFBTCxDQUFnQixRQUFoQixDQUF5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QUFQLEdBQWlCO0FBQ2YsVUFBVyxNQURJO0FBRWYsYUFBVyxTQUZJO0FBR2YsU0FBVztBQUhJLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ICA9IHJlcXVpcmUoJy4vTGl2aW5nT2JqZWN0Jyk7XHJcbnZhciBQbGF5ZXIgICAgICAgID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcclxuXHJcbnZhciBBcnJvdyA9IGZ1bmN0aW9uIChhbGxpYW5jZSkge1xyXG4gIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgdGhpcy5hcnJvd0dyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5BUlJPVykudGV4dHVyZTtcclxuICBcclxuICB0aGlzLmRlYWx0SW1wYWN0RGFtYWdlID0gZmFsc2U7XHJcblxyXG4gIC8vIENyZWF0ZSBzdGF0ZVxyXG4gIHRoaXMuc3RhdGVCYXNpYyA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICB0aGlzLmZyYW1lMSAgICAgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMuYXJyb3dHcmFwaGljKTtcclxuICB0aGlzLnN0YXRlQmFzaWMuYWRkRnJhbWUodGhpcy5mcmFtZTEpO1xyXG5cclxuICAvLyBBZGQgc3RhdGVzXHJcbiAgdGhpcy5hZGRTdGF0ZShBcnJvdy5TVEFURS5CQVNJQywgdGhpcy5zdGF0ZUJhc2ljKTtcclxuXHJcbiAgLy8gU2V0IGNvbnN0YW50c1xyXG4gIHRoaXMubWF4U3BlZWQgICAgICAgID0gQXJyb3cuTUFYX1NQRUVEO1xyXG4gIHRoaXMubWF4QWNjZWxlcmF0aW9uID0gQXJyb3cuTUFYX0FDQ0VMRVJBVElPTjtcclxuICBcclxuICAvLyBDdXN0b20gZGF0YVxyXG4gIHRoaXMuY3VzdG9tRGF0YS5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gIHRoaXMuY3VzdG9tRGF0YS5ERUZBVUxUX0ZSSUNUSU9OID0gQXJyb3cuREVGQVVMVF9GUklDVElPTjtcclxuICBcclxuICB0aGlzLnJlc3RpdHV0aW9uID0gMC44O1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQXJyb3csIHtcclxuICBNQVhfU1BFRUQ6IHtcclxuICAgIHZhbHVlOiA1MFxyXG4gIH0sXHJcbiAgXHJcbiAgTUFYX0FDQ0VMRVJBVElPTjoge1xyXG4gICAgdmFsdWU6IDhcclxuICB9LFxyXG4gIFxyXG4gIE1BWF9EQU1BR0U6IHtcclxuICAgIHZhbHVlOiAxMDBcclxuICB9LFxyXG4gIFxyXG4gIEtOT0NLQkFDS19TQ0FMQVI6IHtcclxuICAgIHZhbHVlOiAxMDAwXHJcbiAgfSxcclxuICBcclxuICBEQU1BR0VfTUFHTklUVURFX1NDQUxBUjoge1xyXG4gICAgdmFsdWU6IDAuNVxyXG4gIH0sXHJcbiAgXHJcbiAgTUlOX0FSUk9XX0NIQVJHRV9USU1FOiB7XHJcbiAgICB2YWx1ZTogMjAwXHJcbiAgfSxcclxuICBcclxuICBNQVhfQVJST1dfQ0hBUkdFX1RJTUU6IHtcclxuICAgIHZhbHVlOiA1MDBcclxuICB9LFxyXG4gIFxyXG4gIERFRkFVTFRfRlJJQ1RJT046IHtcclxuICAgIHZhbHVlOiAwLjk4NVxyXG4gIH0sXHJcblxyXG4gIFNUQVRFOiB7XHJcbiAgICB2YWx1ZToge1xyXG4gICAgICBCQVNJQzogXCJCQVNJQ1wiXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbkFycm93LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBJZiB0aGUgYXJyb3cgaXMgZ29pbmcgdG9vIHNsb3csIGl0IGNhbiBubyBsb25nZXIgZGVhbCBkYW1hZ2VcclxuICAgICAgaWYgKHRoaXMudmVsb2NpdHkuZ2V0TWFnbml0dWRlU3F1YXJlZCgpIDwgMC4wMDEpIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgcmVzb2x2ZUNvbGxpc2lvbnM6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnJlc29sdmVDb2xsaXNpb25zLmNhbGwodGhpcyk7XHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHRpcGx5KDApO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5Lm11bHRpcGx5KDApO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgICBcclxuICAvLyBFeHRlbmQgcGxheWVyIHN0dWZmIGhlcmUgXHJcbiAgb25Db2xsaWRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgaWYgKHBoeXNPYmogaW5zdGFuY2VvZiBMaXZpbmdPYmplY3QgJiYgIXRoaXMuZGVhbHRJbXBhY3REYW1hZ2UpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbURhdGEuZm9yY2VSZW1vdmUgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIERhbWFnZSBhcyBhIGZ1bmN0aW9uIG9mIGFycm93IHZlbG9jaXR5XHJcbiAgICAgICAgdmFyIGRhbWFnZSA9IHRoaXMudmVsb2NpdHkuY2xvbmUoKS5tdWx0aXBseShBcnJvdy5EQU1BR0VfTUFHTklUVURFX1NDQUxBUikuZ2V0TWFnbml0dWRlU3F1YXJlZCgpO1xyXG4gICAgICAgIC8vIFNldCBhIG1heCBkYW1hZ2UgLSB0byBiZSBjaGFuZ2VkIGJ5IGl0ZW0gcGlja3Vwc1xyXG4gICAgICAgIGlmIChkYW1hZ2UgPiBBcnJvdy5NQVhfREFNQUdFKSB7XHJcbiAgICAgICAgICBkYW1hZ2UgPSBBcnJvdy5NQVhfREFNQUdFO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUYWtlIGRhbWFnZVxyXG4gICAgICAgIHBoeXNPYmoudGFrZURhbWFnZShkYW1hZ2UpO1xyXG4gICAgICAgIC8vIEFkZCBrbm9ja2JhY2sgdG8gdGhlIGl0ZW0gaXQgaGl0XHJcbiAgICAgICAgcGh5c09iai5hZGRJbXB1bHNlKHRoaXMudmVsb2NpdHkuY2xvbmUoKS5tdWx0aXBseShBcnJvdy5LTk9DS0JBQ0tfU0NBTEFSKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcGh5c09iai5hdHRhY2hPYmplY3QodGhpcyk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFVzZSBjdXN0b20gY29sbGlzaW9uIHJlc29sdXRpb25cclxuICAgICAgaWYgKHBoeXNPYmouc29saWQpIHtcclxuICAgICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS5vbkNvbGxpZGUuY2FsbCh0aGlzLCBwaHlzT2JqLCBjb2xsaXNpb25EYXRhKTtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgY2FuQ29sbGlkZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChwaHlzT2JqKSB7XHJcbiAgICAgIC8vIElnbm9yZSBjb2xsaXNpb25zIHdpdGggZW50aXRpZXMgdGhhdCBhcmUgdGhlIHNhbWUgYWxsaWFuY2VcclxuICAgICAgcmV0dXJuIHBoeXNPYmouY3VzdG9tRGF0YS5hbGxpYW5jZSAhPT0gdGhpcy5jdXN0b21EYXRhLmFsbGlhbmNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgbG9va0F0OiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKHBvaW50KSB7XHJcbiAgICAgIHZhciBkaXNwbGFjZW1lbnQgPSBnZW9tLlZlYzIuc3VidHJhY3QocG9pbnQsIHRoaXMucG9zaXRpb24pO1xyXG4gICAgICB2YXIgYW5nbGUgICAgICAgID0gZGlzcGxhY2VtZW50LmdldEFuZ2xlKCk7XHJcbiAgICAgIHRoaXMucm90YXRlKGFuZ2xlIC0gdGhpcy5yb3RhdGlvbik7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBzdG9wOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vdGhpcy5hY2NlbGVyYXRpb24ubXVsdGlwbHkoMCk7XHJcbiAgICAgIC8vdGhpcy52ZWxvY2l0eS5tdWx0aXBseSgwKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc29saWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5maXhlZCA9IHRydWU7XHJcblxyXG4gICAgICAvLyBPbmNlIHRoZSBhcnJvdyBoYXMgaGl0IHNvbWV0aGluZyBzb2xpZCwgaXQgY2FuIG5vIGxvbmdlciBkZWFsIGRhbWFnZVxyXG4gICAgICB0aGlzLmRlYWx0SW1wYWN0RGFtYWdlID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoQXJyb3cpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBcnJvdzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnZW9tICAgICAgICAgID0gd2ZsLmdlb207XHJcbnZhciB1dGlsICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzICAgICAgICA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCAgICA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIExpdmluZ09iamVjdCAgPSByZXF1aXJlKCcuL0xpdmluZ09iamVjdCcpO1xyXG52YXIgUGxheWVyICAgICAgICA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBBcnJvdyAgICAgICAgID0gcmVxdWlyZSgnLi9BcnJvdycpO1xyXG5cclxudmFyIEFycm93Umljb2NoZXQgPSBmdW5jdGlvbiAoYWxsaWFuY2UpIHtcclxuICBBcnJvdy5jYWxsKHRoaXMsIGFsbGlhbmNlKTtcclxuICBcclxuICB0aGlzLmxhc3RIaXQgPSBudWxsO1xyXG4gIFxyXG4gIHRoaXMucmVzdGl0dXRpb24gPSAxO1xyXG5cclxuICAvLyAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvLyB0aGlzLmFycm93R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkFSUk9XKS50ZXh0dXJlO1xyXG4gIFxyXG4gIC8vIHRoaXMuZGVhbHRJbXBhY3REYW1hZ2UgPSBmYWxzZTtcclxuXHJcbiAgLy8gLy8gQ3JlYXRlIHN0YXRlXHJcbiAgLy8gdGhpcy5zdGF0ZUJhc2ljID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIC8vIHRoaXMuZnJhbWUxICAgICA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5hcnJvd0dyYXBoaWMpO1xyXG4gIC8vIHRoaXMuc3RhdGVCYXNpYy5hZGRGcmFtZSh0aGlzLmZyYW1lMSk7XHJcblxyXG4gIC8vIC8vIEFkZCBzdGF0ZXNcclxuICAvLyB0aGlzLmFkZFN0YXRlKEFycm93LlNUQVRFLkJBU0lDLCB0aGlzLnN0YXRlQmFzaWMpO1xyXG5cclxuICAvLyAvLyBTZXQgY29uc3RhbnRzXHJcbiAgLy8gdGhpcy5tYXhTcGVlZCAgICAgICAgPSBBcnJvdy5NQVhfU1BFRUQ7XHJcbiAgLy8gdGhpcy5tYXhBY2NlbGVyYXRpb24gPSBBcnJvdy5NQVhfQUNDRUxFUkFUSU9OO1xyXG4gIFxyXG4gIC8vIC8vIEN1c3RvbSBkYXRhXHJcbiAgLy8gdGhpcy5jdXN0b21EYXRhLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgLy8gdGhpcy5jdXN0b21EYXRhLkRFRkFVTFRfRlJJQ1RJT04gPSBBcnJvdy5ERUZBVUxUX0ZSSUNUSU9OO1xyXG4gIFxyXG4gIC8vIHRoaXMucmVzdGl0dXRpb24gPSAwLjg7XHJcbiAgXHJcbiAgdGhpcy5wcmV2Q29sbGlzaW9ucyA9IHt9O1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQXJyb3dSaWNvY2hldCwge1xyXG4gIC8vIE1BWF9TUEVFRDoge1xyXG4gICAgLy8gdmFsdWU6IDUwXHJcbiAgLy8gfSxcclxuICBcclxuICAvLyBNQVhfQUNDRUxFUkFUSU9OOiB7XHJcbiAgICAvLyB2YWx1ZTogOFxyXG4gIC8vIH0sXHJcbiAgXHJcbiAgLy8gTUFYX0RBTUFHRToge1xyXG4gICAgLy8gdmFsdWU6IDEwMFxyXG4gIC8vIH0sXHJcbiAgXHJcbiAgLy8gS05PQ0tCQUNLX1NDQUxBUjoge1xyXG4gICAgLy8gdmFsdWU6IDEwMDBcclxuICAvLyB9LFxyXG4gIFxyXG4gIC8vIERBTUFHRV9NQUdOSVRVREVfU0NBTEFSOiB7XHJcbiAgICAvLyB2YWx1ZTogMC41XHJcbiAgLy8gfSxcclxuICBcclxuICAvLyBNSU5fQVJST1dfQ0hBUkdFX1RJTUU6IHtcclxuICAgIC8vIHZhbHVlOiAyMDBcclxuICAvLyB9LFxyXG4gIFxyXG4gIC8vIE1BWF9BUlJPV19DSEFSR0VfVElNRToge1xyXG4gICAgLy8gdmFsdWU6IDUwMFxyXG4gIC8vIH0sXHJcbiAgXHJcbiAgLy8gREVGQVVMVF9GUklDVElPTjoge1xyXG4gICAgLy8gdmFsdWU6IDAuOTg1XHJcbiAgLy8gfSxcclxuXHJcbiAgU1RBVEU6IHtcclxuICAgIHZhbHVlOiB7XHJcbiAgICAgIEJBU0lDOiBcIkJBU0lDXCJcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIE1BWF9PQkpFQ1RfQ09MTElTSU9OX1RJTUVSOiB7XHJcbiAgICB2YWx1ZTogM1xyXG4gIH0sXHJcbiAgXHJcbiAgV0FMTF9GUklDVElPTjoge1xyXG4gICAgdmFsdWU6IDAuOFxyXG4gIH0sXHJcbiAgXHJcbiAgLy8gVGhlIHNwZWVkIHRoZSBhcnJvdyBtdXN0IGJlIHRyYXZlbGluZyBiZWZvcmUgaXRzIHZlbG9jaXR5IGN1dHMgaGFyZFxyXG4gIE1JTl9OT1JNQUxfU1BFRUQ6IHtcclxuICAgIHZhbHVlOiAxXHJcbiAgfSxcclxuICBcclxuICBNSU5fU1BFRUQ6IHtcclxuICAgIHZhbHVlOiAwLjAxXHJcbiAgfSxcclxuICBcclxuICBGSU5BTF9TTE9XSU5HX1JBVEU6IHtcclxuICAgIHZhbHVlOiAwLjlcclxuICB9XHJcbn0pO1xyXG5cclxuQXJyb3dSaWNvY2hldC5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoQXJyb3cucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEFycm93LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMucHJldkNvbGxpc2lvbnMpO1xyXG4gICAgICBcclxuICAgICAgZm9yIChsZXQga2V5IG9mIGtleXMpIHtcclxuICAgICAgICB2YXIge29iaiwgcHJldlBvc2l0aW9uLCBwcmV2VmVsb2NpdHl9ID0gdGhpcy5wcmV2Q29sbGlzaW9uc1trZXldO1xyXG4gICAgICAgIHZhciBkaXNwbGFjZW1lbnQgICAgID0gZ2VvbS5WZWMyLnN1YnRyYWN0KG9iai5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbik7XHJcbiAgICAgICAgdmFyIHByZXZEaXNwbGFjZW1lbnQgPSBnZW9tLlZlYzIuc3VidHJhY3Qob2JqLnBvc2l0aW9uLCBwcmV2UG9zaXRpb24pO1xyXG5cclxuICAgICAgICAvLyBJZiBpdCBpcyBub3cgb24gdGhlIG90aGVyIHNpZGUgb2YgdGhlIG9iamVjdCwgaXQgaGFzIHBoYXNlZFxyXG4gICAgICAgIC8vIHRocm91Z2ggaXQsIHNvIGl0IHNob3VsZCB1bmRvIGl0cyBtb3ZlbWVudHMgYmFjayB1bnRpbCBpdCBzdGFydGVkXHJcbiAgICAgICAgLy8gY29sbGlkaW5nIHdpdGggdGhlIG9iamVjdFxyXG4gICAgICAgIGlmIChnZW9tLlZlYzIuZG90KHByZXZEaXNwbGFjZW1lbnQsIGRpc3BsYWNlbWVudCkgPCAwKSB7XHJcbiAgICAgICAgICBwcmV2UG9zaXRpb24gPSB0aGlzLnByZXZDb2xsaXNpb25zW2tleV0ucHJldlBvc2l0aW9uO1xyXG4gICAgICAgICAgcHJldlZlbG9jaXR5ID0gdGhpcy5wcmV2Q29sbGlzaW9uc1trZXldLnByZXZWZWxvY2l0eTtcclxuICAgICAgICAgIHRoaXMudmVsb2NpdHkuX3ggPSAtcHJldlZlbG9jaXR5Ll94O1xyXG4gICAgICAgICAgdGhpcy52ZWxvY2l0eS5feSA9IC1wcmV2VmVsb2NpdHkuX3k7XHJcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLl94ID0gcHJldlBvc2l0aW9uLl94ICsgdGhpcy52ZWxvY2l0eS5feCAqIDI7XHJcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLl95ID0gcHJldlBvc2l0aW9uLl95ICsgdGhpcy52ZWxvY2l0eS5feSAqIDI7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZSh0aGlzLnZlbG9jaXR5LmdldEFuZ2xlKCkgLSB0aGlzLnJvdGF0aW9uKTtcclxuICAgICAgICAgIHRoaXMuY29sbGlzaW9uRGlzcGxhY2VtZW50U3VtLl94ID0gMDtcclxuICAgICAgICAgIHRoaXMuY29sbGlzaW9uRGlzcGxhY2VtZW50U3VtLl95ID0gMDtcclxuICAgICAgICAgIHRoaXMuY2FjaGVDYWxjdWxhdGlvbnMoKTtcclxuICAgICAgICAgIGRlbGV0ZSB0aGlzLnByZXZDb2xsaXNpb25zW2tleV07XHJcbiAgICAgICAgICBcclxuICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXZDb2xsaXNpb25zW2tleV0uY29sbGlzaW9uVGltZXIgPj0gXHJcbiAgICAgICAgICAgICAgQXJyb3dSaWNvY2hldC5NQVhfT0JKRUNUX0NPTExJU0lPTl9USU1FUikge1xyXG5cclxuICAgICAgICAgIGRlbGV0ZSB0aGlzLnByZXZDb2xsaXNpb25zW2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucHJldkNvbGxpc2lvbnNba2V5XS5jb2xsaXNpb25UaW1lcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdmFyIG1pbk5vcm1hbFNwZWVkID0gQXJyb3dSaWNvY2hldC5NSU5fTk9STUFMX1NQRUVEO1xyXG4gICAgICB2YXIgbWluU3BlZWQgICAgICAgPSBBcnJvd1JpY29jaGV0Lk1JTl9TUEVFRDtcclxuICAgICAgaWYgKHRoaXMudmVsb2NpdHkuZ2V0TWFnbml0dWRlU3F1YXJlZCgpIDwgbWluTm9ybWFsU3BlZWQgKiBtaW5Ob3JtYWxTcGVlZCkge1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdGlwbHkoQXJyb3dSaWNvY2hldC5GSU5BTF9TTE9XSU5HX1JBVEUpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiAodGhpcy52ZWxvY2l0eS5nZXRNYWduaXR1ZGVTcXVhcmVkKCkgPCBtaW5TcGVlZCAqIG1pblNwZWVkKSB7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0aXBseSgwKTtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgcmVzb2x2ZUNvbGxpc2lvbnM6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIFNuYXAgdG8gdGhlIG5leHQgaW50ZWdlciBzbyB0aGF0IG9iamVjdHMgY2FuIG1vdmUgc21vb3RobHkgYWZ0ZXJcclxuICAgICAgLy8gY29sbGlkaW5nXHJcbiAgICAgIHZhciBkeCA9IHRoaXMuY29sbGlzaW9uRGlzcGxhY2VtZW50U3VtLl94O1xyXG4gICAgICB2YXIgZHkgPSB0aGlzLmNvbGxpc2lvbkRpc3BsYWNlbWVudFN1bS5feTtcclxuICAgICAgXHJcbiAgICAgIGlmIChkeCA8IDApIGR4ID0gTWF0aC5mbG9vcihkeCk7XHJcbiAgICAgIGVsc2UgICAgICAgIGR4ID0gTWF0aC5jZWlsKGR4KTtcclxuICAgICAgaWYgKGR5IDwgMCkgZHkgPSBNYXRoLmZsb29yKGR5KTtcclxuICAgICAgZWxzZSAgICAgICAgZHkgPSBNYXRoLmNlaWwoZHkpO1xyXG5cclxuICAgICAgdGhpcy50cmFuc2Zvcm0ucG9zaXRpb24uX3ggKz0gZHg7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRpb25DYWNoZS54ICs9IGR4O1xyXG5cclxuICAgICAgdGhpcy50cmFuc2Zvcm0ucG9zaXRpb24uX3kgKz0gZHk7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRpb25DYWNoZS55ICs9IGR5O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgICBcclxuICAvLyBFeHRlbmQgcGxheWVyIHN0dWZmIGhlcmUgXHJcbiAgb25Db2xsaWRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgdmFyIGhpdExpdmluZ09iamVjdCA9IGZhbHNlO1xyXG4gICAgICB2YXIgcHJldlZlbG9jaXR5ICAgID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpO1xyXG4gICAgICB2YXIgcHJldlBvc2l0aW9uICAgID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICBcclxuICAgICAgaWYgKHRoaXMubGFzdEhpdCA9PT0gcGh5c09iaikgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgaWYgKHBoeXNPYmogaW5zdGFuY2VvZiBMaXZpbmdPYmplY3QgJiYgIXRoaXMuZGVhbHRJbXBhY3REYW1hZ2UpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbURhdGEuZm9yY2VSZW1vdmUgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIERhbWFnZSBhcyBhIGZ1bmN0aW9uIG9mIGFycm93IHZlbG9jaXR5XHJcbiAgICAgICAgdmFyIGRhbWFnZSA9IHRoaXMudmVsb2NpdHkuY2xvbmUoKS5tdWx0aXBseShBcnJvdy5EQU1BR0VfTUFHTklUVURFX1NDQUxBUikuZ2V0TWFnbml0dWRlU3F1YXJlZCgpO1xyXG4gICAgICAgIC8vIFNldCBhIG1heCBkYW1hZ2UgLSB0byBiZSBjaGFuZ2VkIGJ5IGl0ZW0gcGlja3Vwc1xyXG4gICAgICAgIGlmIChkYW1hZ2UgPiBBcnJvdy5NQVhfREFNQUdFKSB7XHJcbiAgICAgICAgICBkYW1hZ2UgPSBBcnJvdy5NQVhfREFNQUdFO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUYWtlIGRhbWFnZVxyXG4gICAgICAgIHBoeXNPYmoudGFrZURhbWFnZShkYW1hZ2UpO1xyXG4gICAgICAgIC8vIEFkZCBrbm9ja2JhY2sgdG8gdGhlIGl0ZW0gaXQgaGl0XHJcbiAgICAgICAgcGh5c09iai5hZGRJbXB1bHNlKHRoaXMudmVsb2NpdHkuY2xvbmUoKS5tdWx0aXBseShBcnJvdy5LTk9DS0JBQ0tfU0NBTEFSKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcGh5c09iai5hdHRhY2hPYmplY3QodGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaGl0TGl2aW5nT2JqZWN0ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gVXNlIGN1c3RvbSBjb2xsaXNpb24gcmVzb2x1dGlvblxyXG4gICAgICBpZiAocGh5c09iai5zb2xpZCkge1xyXG4gICAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLm9uQ29sbGlkZS5jYWxsKHRoaXMsIHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBSdW4gY2FsY3VsYXRpb25zIGZvciBib3VuY2luZyBvbmx5IGlmIGl0J3MgYW4gb2JqZWN0IHRoZSBhcnJvdyBjYW5cclxuICAgICAgLy8gYm91bmNlIG9mZiBvZlxyXG4gICAgICBpZiAoIWhpdExpdmluZ09iamVjdCkge1xyXG4gICAgICAgIHZhciBwcmV2Rm9yd2FyZCA9IHtcclxuICAgICAgICAgIHg6IHRoaXMuZm9yd2FyZC5feCxcclxuICAgICAgICAgIHk6IHRoaXMuZm9yd2FyZC5feVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYW4gZWRnZSwgZGVmbGVjdCBvZmYgaXRcclxuICAgICAgICBpZiAoY29sbGlzaW9uRGF0YS5lZGdlRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICB2YXIgcmlnaHQgPSB7XHJcbiAgICAgICAgICAgIHg6IC10aGlzLmZvcndhcmQuX3ksXHJcbiAgICAgICAgICAgIHk6IHRoaXMuZm9yd2FyZC5feFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHZhciBmb3J3YXJkRG90RWRnZSA9XHJcbiAgICAgICAgICAgICAgdGhpcy5mb3J3YXJkLl94ICogY29sbGlzaW9uRGF0YS5lZGdlRGlyZWN0aW9uLnggK1xyXG4gICAgICAgICAgICAgIHRoaXMuZm9yd2FyZC5feSAqIGNvbGxpc2lvbkRhdGEuZWRnZURpcmVjdGlvbi55O1xyXG4gICAgICAgICAgdmFyIHJpZ2h0RG90RWRnZSA9XHJcbiAgICAgICAgICAgICAgcmlnaHQueCAqIGNvbGxpc2lvbkRhdGEuZWRnZURpcmVjdGlvbi54ICtcclxuICAgICAgICAgICAgICByaWdodC55ICogY29sbGlzaW9uRGF0YS5lZGdlRGlyZWN0aW9uLnk7XHJcbiAgICAgICAgICB2YXIgdGhldGEgPSBNYXRoLmFjb3MoZm9yd2FyZERvdEVkZ2UpO1xyXG5cclxuICAgICAgICAgIGlmIChyaWdodERvdEVkZ2UgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm90YXRlKC0yICogdGhldGEpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGUoMiAqIHRoZXRhKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLnZlbG9jaXR5LnNldEFuZ2xlKHRoaXMucm90YXRpb24pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwgcmVmbGVjdCBiYWNrd2FyZHMgZnJvbSB0aGUgcG9pbnQgb2YgY29sbGlzaW9uXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlKE1hdGguUEkpO1xyXG4gICAgICAgICAgdGhpcy52ZWxvY2l0eS5feCAqPSAtMTtcclxuICAgICAgICAgIHRoaXMudmVsb2NpdHkuX3kgKj0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcnkgdG8gbW92ZSB0aGUgYXJyb3cgb3V0IG9mIHRoZSBvYmplY3RcclxuICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHRoaXMuX2NhY2hlZEhlaWdodCAqIDAuNTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLl94ICs9IHByZXZGb3J3YXJkLnggKiBoYWxmSGVpZ2h0ICsgdGhpcy5mb3J3YXJkLl94ICogaGFsZkhlaWdodDtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLl95ICs9IHByZXZGb3J3YXJkLnkgKiBoYWxmSGVpZ2h0ICsgdGhpcy5mb3J3YXJkLl95ICogaGFsZkhlaWdodDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiB0aGlzIGFycm93IGhhcyBiZWVuIGNvbGxpZGluZyB3aXRoIGEgc3BlY2lmaWMgb2JqZWN0IGZvciBhIHdoaWxlLFxyXG4gICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgZGF0YSB0byBlbnN1cmUgaXQgZG9lc24ndCBwaGFzZSB0aHJvdWdoIGl0XHJcbiAgICAgICAgaWYgKHRoaXMucHJldkNvbGxpc2lvbnNbcGh5c09iai53ZmxJZF0pIHtcclxuICAgICAgICAgIHRoaXMucHJldkNvbGxpc2lvbnNbcGh5c09iai53ZmxJZF0gPSB7XHJcbiAgICAgICAgICAgIG9iajogICAgICAgICAgICBwaHlzT2JqLFxyXG4gICAgICAgICAgICBwcmV2UG9zaXRpb246ICAgdGhpcy5wcmV2Q29sbGlzaW9uc1twaHlzT2JqLndmbElkXS5wcmV2UG9zaXRpb24sXHJcbiAgICAgICAgICAgIHByZXZWZWxvY2l0eTogICB0aGlzLnByZXZDb2xsaXNpb25zW3BoeXNPYmoud2ZsSWRdLnByZXZWZWxvY2l0eSxcclxuICAgICAgICAgICAgY29sbGlzaW9uVGltZXI6IDBcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucHJldkNvbGxpc2lvbnNbcGh5c09iai53ZmxJZF0gPSB7XHJcbiAgICAgICAgICAgIG9iajogICAgICAgICAgICBwaHlzT2JqLFxyXG4gICAgICAgICAgICBwcmV2UG9zaXRpb246ICAgcHJldlBvc2l0aW9uLFxyXG4gICAgICAgICAgICBwcmV2VmVsb2NpdHk6ICAgcHJldlZlbG9jaXR5LFxyXG4gICAgICAgICAgICBjb2xsaXNpb25UaW1lcjogMFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGZyaWN0aW9uIGZyb20gd2FsbFxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkubXVsdGlwbHkoQXJyb3dSaWNvY2hldC5XQUxMX0ZSSUNUSU9OKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShBcnJvd1JpY29jaGV0KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXJyb3dSaWNvY2hldDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnZW9tICAgICAgICAgID0gd2ZsLmdlb207XHJcbnZhciB1dGlsICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzICAgICAgICA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCAgICA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIExpdmluZ09iamVjdCAgPSByZXF1aXJlKCcuL0xpdmluZ09iamVjdCcpO1xyXG52YXIgU2VnbWVudCAgICAgICA9IHJlcXVpcmUoJy4vU2VnbWVudCcpO1xyXG52YXIgUGxheWVyICAgICAgICA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcblxyXG52YXIgRW5lbXkgPSBmdW5jdGlvbiAocGxheWVyLCBxdWFkdHJlZSkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgIFxyXG4gICAgdGhpcy5xdWFkdHJlZSA9IHF1YWR0cmVlO1xyXG4gICAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgICB0aGlzLmVuZW15R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkVORU1ZKS50ZXh0dXJlO1xyXG4gICAgXHJcbiAgICAvLyBDcmVhdGUgc3RhdGVcclxuICAgIHRoaXMuc3RhdGVCYXNpYyA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZnJhbWUxICAgICA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5lbmVteUdyYXBoaWMpO1xyXG4gICAgdGhpcy5zdGF0ZUJhc2ljLmFkZEZyYW1lKHRoaXMuZnJhbWUxKTtcclxuICAgIFxyXG4gICAgLy8gQWRkIHN0YXRlc1xyXG4gICAgdGhpcy5hZGRTdGF0ZShFbmVteS5TVEFURS5CQVNJQywgdGhpcy5zdGF0ZUJhc2ljKTtcclxuICAgIFxyXG4gICAgLy8gU2V0IGNvbnN0YW50c1xyXG4gICAgdGhpcy5tYXhTcGVlZCAgICAgICAgPSBFbmVteS5NQVhfU1BFRUQ7XHJcbiAgICB0aGlzLm1heEFjY2VsZXJhdGlvbiA9IEVuZW15Lk1BWF9BQ0NFTEVSQVRJT047XHJcbiAgICBcclxuICAgIHRoaXMucmF5cyA9IFtdO1xyXG4gIFxyXG4gIHRoaXMubWFzcyA9IDE7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhFbmVteSwge1xyXG4gIE1BWF9TUEVFRCA6IHtcclxuICAgIHZhbHVlIDogMVxyXG4gIH0sXHJcbiAgXHJcbiAgTUFYX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgIHZhbHVlIDogNFxyXG4gIH0sXHJcbiAgXHJcbiAgU1BSSU5UX01BWF9TUEVFRCA6IHtcclxuICAgIHZhbHVlIDogMlxyXG4gIH0sXHJcbiAgXHJcbiAgU1BSSU5UX0JPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgIHZhbHVlIDogNlxyXG4gIH0sXHJcblxyXG4gIEJPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgIHZhbHVlIDogLjVcclxuICB9LFxyXG4gIFxyXG4gIFZJRVdfTElNSVQgOiB7XHJcbiAgICAvLyBTb21lIGFyYml0cmFyeSBudW1iZXIgZm9yIG5vd1xyXG4gICAgdmFsdWUgOiAyNTZcclxuICB9LFxyXG4gIFxyXG4gIFZJRVdfU0VHTUVOVFM6IHtcclxuICAgIHZhbHVlOiAxMVxyXG4gIH0sXHJcbiAgXHJcbiAgVklFV19BTkdMRV9MSU1JVDoge1xyXG4gICAgdmFsdWU6IE1hdGguUEkgKiAwLjVcclxuICB9LFxyXG4gIFxyXG4gIEFMTElBTkNFIDoge1xyXG4gICAgdmFsdWUgOiAyXHJcbiAgfSxcclxuICBcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBCQVNJQyA6IFwiQkFTSUNcIixcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuRW5lbXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKExpdmluZ09iamVjdC5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBMaXZpbmdPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIElmIHBsYXllciBpcyBpbiByYW5nZSB0byBiZSBzZWVuXHJcbiAgICAgIGlmIChnZW9tLlZlYzIuc3VidHJhY3QodGhpcy5wbGF5ZXIucG9zaXRpb24sIHRoaXMucG9zaXRpb24pLmdldE1hZ25pdHVkZSgpIDwgRW5lbXkuVklFV19MSU1JVCArIDIwKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlVmlld2luZygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgLy8gVE9ETzogUG9pbnQgZW5lbXkgaW4gZGlyZWN0aW9uIG9mIHRoZSBzZWVrIGZvcmNlIHZlY3Rvciwgbm90XHJcbiAgICAgICAgLy8gdmVsb2NpdHlcclxuICAgICAgICAvLyBQb2ludCB0aGUgZW5lbXkgdG93YXJkcyBpdHMgc2VlayBmb3JjZSB2ZWN0b3JcclxuICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS5nZXRNYWduaXR1ZGVTcXVhcmVkKCkgPiAwLjAwMDEpIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlKHRoaXMudmVsb2NpdHkuZ2V0QW5nbGUoKSAtIHRoaXMuZm9yd2FyZC5nZXRBbmdsZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgdGFrZURhbWFnZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGRhbWFnZSkge1xyXG4gICAgICB0aGlzLmhlYWx0aCAtPSBkYW1hZ2U7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfaGFuZGxlVmlld2luZzoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGluY3JlbWVudCA9IEVuZW15LlZJRVdfQU5HTEVfTElNSVQgLyAoRW5lbXkuVklFV19TRUdNRU5UUyAtIDEpO1xyXG4gICAgICB0aGlzLnJheXMgPSBbXTtcclxuICAgICAgdmFyIHYgPSBuZXcgZ2VvbS5WZWMyLmZyb21BbmdsZSh0aGlzLnJvdGF0aW9uIC0gKEVuZW15LlZJRVdfQU5HTEVfTElNSVQgKiAwLjUpKS5tdWx0aXBseShFbmVteS5WSUVXX0xJTUlUKTtcclxuICAgICAgdmFyIHYxID0gdi5jbG9uZSgpLm11bHRpcGx5KC0uNSk7XHJcbiAgICAgIHZhciB2MiA9IHYuY2xvbmUoKS5tdWx0aXBseSguNSk7XHJcbiAgICAgIHZhciBzZWcgPSBuZXcgU2VnbWVudChFbmVteS5WSUVXX0xJTUlULCB2LmdldEFuZ2xlKCksIHYxLCB2Mik7XHJcbiAgICAgIHNlZy5wb3NpdGlvbi5hZGQodGhpcy5wb3NpdGlvbik7XHJcbiAgICAgIHNlZy5wb3NpdGlvbi5hZGQodjIpO1xyXG4gICAgICBzZWcudXBkYXRlKCk7XHJcbiAgICAgIHRoaXMucmF5cy5wdXNoKHNlZyk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IEVuZW15LlZJRVdfU0VHTUVOVFM7IGkrKykge1xyXG4gICAgICAgIHYucm90YXRlKGluY3JlbWVudCk7XHJcbiAgICAgICAgdjEgPSB2LmNsb25lKCkubXVsdGlwbHkoLS41KTtcclxuICAgICAgICB2MiA9IHYuY2xvbmUoKS5tdWx0aXBseSguNSk7XHJcbiAgICAgICAgc2VnID0gbmV3IFNlZ21lbnQoRW5lbXkuVklFV19MSU1JVCwgdi5nZXRBbmdsZSgpLCB2MSwgdjIpO1xyXG4gICAgICAgIHNlZy5wb3NpdGlvbi5hZGQodGhpcy5wb3NpdGlvbik7XHJcbiAgICAgICAgc2VnLnBvc2l0aW9uLmFkZCh2Mik7XHJcbiAgICAgICAgc2VnLnVwZGF0ZSgpO1xyXG4gICAgICAgIHRoaXMucmF5cy5wdXNoKHNlZyk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8qXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yYXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5yYXlzW2ldLmRyYXdEZWJ1Z1ZlcnRpY2VzKCk7XHJcbiAgICAgIH1cclxuICAgICAgKi9cclxuXHJcbiAgICAgIHZhciBnb3MgPSBbXTtcclxuICAgICAgdmFyIGNvbGxpc2lvbnMgPSBbXTtcclxuICAgICAgdmFyIGRvY2hlY2sgPSBmYWxzZTtcclxuICAgICAgdmFyIHNlZW50ID0gZmFsc2U7XHJcbiAgICAgIHZhciBjb2xsaXNpb25EYXQsIG1pbiwgbWluT2JqLCBkaXN0O1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmF5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGdvcyA9IFtdO1xyXG4gICAgICAgIGNvbGxpc2lvbnMgPSBbXTtcclxuICAgICAgICBkb2NoZWNrID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5xdWFkdHJlZS5yZXRyaWV2ZShnb3MsIHRoaXMucmF5c1tpXSk7XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBnb3MubGVuZ3RoOyB4KyspIHtcclxuICAgICAgICAgIGNvbGxpc2lvbkRhdCA9IHRoaXMucmF5c1tpXS5jaGVja0NvbGxpc2lvbihnb3NbeF0pO1xyXG4gICAgICAgICAgaWYgKGNvbGxpc2lvbkRhdC5jb2xsaWRpbmcpIHtcclxuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKGdvc1t4XSk7XHJcbiAgICAgICAgICAgIGlmIChnb3NbeF0gaW5zdGFuY2VvZiBQbGF5ZXIpIHtcclxuICAgICAgICAgICAgICBkb2NoZWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG9jaGVjaykge1xyXG4gICAgICAgICAgbWluID0gSW5maW5pdHk7XHJcbiAgICAgICAgICBtaW5PYmogPSAtMTtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29sbGlzaW9ucy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoIShjb2xsaXNpb25zW2pdIGluc3RhbmNlb2YgRW5lbXkpKSB7XHJcbiAgICAgICAgICAgICAgZGlzdCA9IGdlb20uVmVjMi5zdWJ0cmFjdCh0aGlzLnBvc2l0aW9uLCBjb2xsaXNpb25zW2pdLnBvc2l0aW9uKS5nZXRNYWduaXR1ZGVTcXVhcmVkKCk7XHJcbiAgICAgICAgICAgICAgaWYgKGRpc3QgPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgIG1pbiA9IGRpc3Q7XHJcbiAgICAgICAgICAgICAgICBtaW5PYmogPSBqO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGNvbGxpc2lvbnNbbWluT2JqXSBpbnN0YW5jZW9mIFBsYXllcikge1xyXG4gICAgICAgICAgICAgIHNlZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jaGVjayA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IFxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShFbmVteSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxudmFyIExpdmluZ09iamVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcbiAgXHJcbiAgdGhpcy5oZWFsdGggPSBMaXZpbmdPYmplY3QuREVGQVVMVF9NQVhfSEVBTFRIO1xyXG4gIHRoaXMubWF4SGVhbHRoID0gTGl2aW5nT2JqZWN0LkRFRkFVTFRfTUFYX0hFQUxUSDtcclxuICBcclxuICB0aGlzLmZyaWN0aW9uID0gMC4yO1xyXG4gIHRoaXMucmVzdGl0dXRpb24gPSAwLjg7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhMaXZpbmdPYmplY3QsIHtcclxuICBERUZBVUxUX01BWF9IRUFMVEggOiB7XHJcbiAgICB2YWx1ZSA6IDEwMFxyXG4gIH1cclxufSk7XHJcblxyXG5MaXZpbmdPYmplY3QucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgUGh5c2ljc09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgYXR0YWNoT2JqZWN0IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICAgIG9iai5zb2xpZCA9IGZhbHNlO1xyXG4gICAgICBvYmouc3RhdGljID0gdHJ1ZTtcclxuICAgICAgdGhpcy5hZGRDaGlsZChvYmopO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgbG9va0F0IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAocG9pbnQpIHtcclxuICAgICAgdmFyIGRpc3BsYWNlbWVudCA9IGdlb20uVmVjMi5zdWJ0cmFjdChwb2ludCwgdGhpcy5wb3NpdGlvbik7XHJcbiAgICAgIHZhciBhbmdsZSAgICAgICAgPSBkaXNwbGFjZW1lbnQuZ2V0QW5nbGUoKTtcclxuICAgICAgdGhpcy5yb3RhdGUoYW5nbGUgLSB0aGlzLnJvdGF0aW9uKTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTGl2aW5nT2JqZWN0KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGl2aW5nT2JqZWN0OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxudmFyIFBsYXRmb3JtID0gZnVuY3Rpb24gKCkge1xyXG4gIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgdGhpcy5wbGF0Zm9ybUdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5QTEFURk9STSkudGV4dHVyZTtcclxuXHJcbiAgLy8gQ3JlYXRlIHN0YXRlXHJcbiAgdGhpcy5zdGF0ZUJhc2ljID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWUxICAgICA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5wbGF0Zm9ybUdyYXBoaWMpO1xyXG4gIHRoaXMuc3RhdGVCYXNpYy5hZGRGcmFtZSh0aGlzLmZyYW1lMSk7XHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICB0aGlzLmFkZFN0YXRlKFBsYXRmb3JtLlNUQVRFLkJBU0lDLCB0aGlzLnN0YXRlQmFzaWMpO1xyXG4gIFxyXG4gIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gIHRoaXMuc29saWQgPSB0cnVlXHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF0Zm9ybSwge1xyXG4gIFNUQVRFOiB7XHJcbiAgICB2YWx1ZToge1xyXG4gICAgICBCQVNJQzogXCJCQVNJQ1wiXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblBsYXRmb3JtLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXRmb3JtOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ICA9IHJlcXVpcmUoJy4vTGl2aW5nT2JqZWN0Jyk7XHJcblxyXG52YXIgUGxheWVyID0gZnVuY3Rpb24gKCkge1xyXG4gIExpdmluZ09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICB0aGlzLnBsYXllckdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5QTEFZRVIpLnRleHR1cmU7XHJcblxyXG4gIC8vIENyZWF0ZSBzdGF0ZVxyXG4gIHRoaXMuc3RhdGVCYXNpYyA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICB0aGlzLmZyYW1lMSAgICAgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMucGxheWVyR3JhcGhpYyk7XHJcbiAgdGhpcy5zdGF0ZUJhc2ljLmFkZEZyYW1lKHRoaXMuZnJhbWUxKTtcclxuXHJcbiAgLy8gQWRkIHN0YXRlc1xyXG4gIHRoaXMuYWRkU3RhdGUoUGxheWVyLlNUQVRFLkJBU0lDLCB0aGlzLnN0YXRlQmFzaWMpO1xyXG5cclxuICAvLyBTZXQgY29uc3RhbnRzXHJcbiAgdGhpcy5tYXhTcGVlZCAgICAgICAgPSBQbGF5ZXIuTUFYX1NQRUVEO1xyXG4gIHRoaXMubWF4QWNjZWxlcmF0aW9uID0gUGxheWVyLk1BWF9BQ0NFTEVSQVRJT047XHJcbiAgXHJcbiAgLy8gQ3VzdG9tIGRhdGFcclxuICB0aGlzLmN1c3RvbURhdGEuYWxsaWFuY2UgPSBQbGF5ZXIuQUxMSUFOQ0U7XHJcblxyXG4gIC8vIFRoZSB0b3Agb2YgdGhlIHN0YWNrIGRldGVybWluZXMgd2hpY2ggZGlyZWN0aW9uIHRoZSBwbGF5ZXIgZmFjZXNcclxuICB0aGlzLl93YWxrRGlyZWN0aW9uU3RhY2sgPSBbXTtcclxuICBcclxuICAvLyBFbnN1cmUgYm91bmRpbmcgYm94IGRvZXNuJ3Qgcm90YXRlXHJcbiAgdGhpcy5hbGxvd1ZlcnRleFJvdGF0aW9uID0gZmFsc2U7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF5ZXIsIHtcclxuICBNQVhfU1BFRUQ6IHtcclxuICAgIHZhbHVlOiAyXHJcbiAgfSxcclxuICBcclxuICBNQVhfQUNDRUxFUkFUSU9OOiB7XHJcbiAgICB2YWx1ZTogLjVcclxuICB9LFxyXG4gIFxyXG4gIFNQUklOVF9NQVhfU1BFRUQ6IHtcclxuICAgIHZhbHVlOiA0XHJcbiAgfSxcclxuICBcclxuICBTUFJJTlRfQk9PU1RfQUNDRUxFUkFUSU9OOiB7XHJcbiAgICB2YWx1ZTogMVxyXG4gIH0sXHJcblxyXG4gIEJPT1NUX0FDQ0VMRVJBVElPTjoge1xyXG4gICAgdmFsdWU6IC41XHJcbiAgfSxcclxuICBcclxuICBTVEFURToge1xyXG4gICAgdmFsdWU6IHtcclxuICAgICAgQkFTSUM6IFwiQkFTSUNcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgQUxMSUFOQ0U6IHtcclxuICAgIHZhbHVlOiAxXHJcbiAgfVxyXG59KTtcclxuXHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBMaXZpbmdPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgIH1cclxuICB9LFxyXG4gICAgXHJcbiAgY2FuQ29sbGlkZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChwaHlzT2JqKSB7XHJcbiAgICAgIC8vIElnbm9yZSBjb2xsaXNpb25zIHdpdGggZW50aXRpZXMgdGhhdCBhcmUgdGhlIHNhbWUgYWxsaWFuY2VcclxuICAgICAgcmV0dXJuIHBoeXNPYmouY3VzdG9tRGF0YS5hbGxpYW5jZSAhPT0gdGhpcy5jdXN0b21EYXRhLmFsbGlhbmNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgbG9va0F0OiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKHBvaW50KSB7XHJcbiAgICAgIHZhciBkaXNwbGFjZW1lbnQgPSBnZW9tLlZlYzIuc3VidHJhY3QocG9pbnQsIHRoaXMucG9zaXRpb24pO1xyXG4gICAgICB2YXIgYW5nbGUgICAgICAgID0gZGlzcGxhY2VtZW50LmdldEFuZ2xlKCk7XHJcbiAgICAgIHRoaXMucm90YXRlKGFuZ2xlIC0gdGhpcy5yb3RhdGlvbik7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBoYW5kbGVJbnB1dDoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChrZXlib2FyZCkge1xyXG4gICAgICB2YXIgc3ByaW50aW5nICAgICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5TSElGVCk7XHJcbiAgICAgIHZhciBsYXN0UHJlc3NlZCAgID0ga2V5Ym9hcmQuZ2V0S2V5SnVzdFByZXNzZWQoKTtcclxuICAgICAgdmFyIGxlZnRQcmlvcml0eSAgPSAtMTtcclxuICAgICAgdmFyIHJpZ2h0UHJpb3JpdHkgPSAtMTtcclxuICAgICAgdmFyIHVwUHJpb3JpdHkgICAgPSAtMTtcclxuICAgICAgdmFyIGRvd25Qcmlvcml0eSAgPSAtMTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB2YWx1ZXMgdGhhdCBzaG91bGRuJ3QgYmUgaW4gdGhlIHN0YWNrXHJcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLl93YWxrRGlyZWN0aW9uU3RhY2subGVuZ3RoOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGlmICgha2V5Ym9hcmQuaXNQcmVzc2VkKHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFja1tpXSkpIHtcclxuICAgICAgICAgIHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFjay5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGN1cnJlbnQgZGlyZWN0aW9uIG9mIG1vdmVtZW50IHRvIHRoZSBzdGFjayAoaWYgYW55KVxyXG4gICAgICBpZiAobGFzdFByZXNzZWQgPiAtMSkge1xyXG4gICAgICAgIHN3aXRjaCAobGFzdFByZXNzZWQpIHtcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuQTpcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuRDpcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuVzpcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuUzpcclxuICAgICAgICAgICAgdGhpcy5fd2Fsa0RpcmVjdGlvblN0YWNrLnB1c2gobGFzdFByZXNzZWQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERldGVybWluZSB0aGUgcHJpb3JpdGllcyBvZiB0aGUgZGlyZWN0aW9uc1xyXG4gICAgICB2YXIgcHJpb3JpdHlDb3VudGVyID0gMDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl93YWxrRGlyZWN0aW9uU3RhY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFja1tpXSkge1xyXG4gICAgICAgICAgY2FzZSBrZXlib2FyZC5BOlxyXG4gICAgICAgICAgICBsZWZ0UHJpb3JpdHkgPSBwcmlvcml0eUNvdW50ZXI7XHJcbiAgICAgICAgICAgIHByaW9yaXR5Q291bnRlcisrO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuRDpcclxuICAgICAgICAgICAgcmlnaHRQcmlvcml0eSA9IHByaW9yaXR5Q291bnRlcjtcclxuICAgICAgICAgICAgcHJpb3JpdHlDb3VudGVyKys7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBrZXlib2FyZC5XOlxyXG4gICAgICAgICAgICB1cFByaW9yaXR5ID0gcHJpb3JpdHlDb3VudGVyO1xyXG4gICAgICAgICAgICBwcmlvcml0eUNvdW50ZXIrKztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIGtleWJvYXJkLlM6XHJcbiAgICAgICAgICAgIGRvd25Qcmlvcml0eSA9IHByaW9yaXR5Q291bnRlcjtcclxuICAgICAgICAgICAgcHJpb3JpdHlDb3VudGVyKys7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIGhvdyBmYXN0IHRoZSBwbGF5ZXIgc2hvdWxkIGJlIG1vdmluZ1xyXG4gICAgICB2YXIgYm9vc3Q7XHJcbiAgICAgIGlmIChzcHJpbnRpbmcpIHtcclxuICAgICAgICBib29zdCA9IFBsYXllci5TUFJJTlRfQk9PU1RfQUNDRUxFUkFUSU9OO1xyXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSBQbGF5ZXIuU1BSSU5UX01BWF9TUEVFRDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBib29zdCA9IFBsYXllci5CT09TVF9BQ0NFTEVSQVRJT047XHJcbiAgICAgICAgdGhpcy5tYXhTcGVlZCA9IFBsYXllci5NQVhfU1BFRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1vdmUgdGhlIHBsYXllciBpbiB0aGUgYXBwcm9wcmlhdGUgZGlyZWN0aW9uXHJcbiAgICAgIGlmIChsZWZ0UHJpb3JpdHkgPiByaWdodFByaW9yaXR5KSB7XHJcbiAgICAgICAgdmFyIG1vdmVtZW50Rm9yY2UgPSBuZXcgZ2VvbS5WZWMyKC0xLCAwKTtcclxuICAgICAgICBtb3ZlbWVudEZvcmNlLm11bHRpcGx5KFxyXG4gICAgICAgICAgYm9vc3QgKiB0aGlzLm1hc3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZvcmNlKG1vdmVtZW50Rm9yY2UpO1xyXG4gICAgICB9IFxyXG4gICAgICBpZiAocmlnaHRQcmlvcml0eSA+IGxlZnRQcmlvcml0eSkge1xyXG4gICAgICAgIHZhciBtb3ZlbWVudEZvcmNlID0gbmV3IGdlb20uVmVjMigxLCAwKTtcclxuICAgICAgICBtb3ZlbWVudEZvcmNlLm11bHRpcGx5KFxyXG4gICAgICAgICAgYm9vc3QgKiB0aGlzLm1hc3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZvcmNlKG1vdmVtZW50Rm9yY2UpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHVwUHJpb3JpdHkgPiBkb3duUHJpb3JpdHkpIHtcclxuICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IG5ldyBnZW9tLlZlYzIoMCwgLTEpO1xyXG4gICAgICAgIG1vdmVtZW50Rm9yY2UubXVsdGlwbHkoXHJcbiAgICAgICAgICBib29zdCAqIHRoaXMubWFzc1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkRm9yY2UobW92ZW1lbnRGb3JjZSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRvd25Qcmlvcml0eSA+IHVwUHJpb3JpdHkpIHtcclxuICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IG5ldyBnZW9tLlZlYzIoMCwgMSk7XHJcbiAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgIGJvb3N0ICogdGhpcy5tYXNzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBMaXZpbmdPYmplY3QgID0gcmVxdWlyZSgnLi9MaXZpbmdPYmplY3QnKTtcclxudmFyIFBsYXllciAgICAgICAgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgRW5lbXkgICAgICAgICA9IHJlcXVpcmUoJy4vRW5lbXknKTtcclxuXHJcbnZhciBTZWdtZW50ID0gZnVuY3Rpb24gKHdpZHRoLCByb3RhdGlvbiwgdjEsIHYyKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG4gIHRoaXMudmVydGljZXMgPSBbXTtcclxuICB0aGlzLnZlcnRpY2VzLnB1c2godjEuY2xvbmUoKSk7XHJcbiAgdGhpcy52ZXJ0aWNlcy5wdXNoKHYyLmNsb25lKCkpO1xyXG4gIHZhciB3aWR0aCA9IHdpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSAxO1xyXG4gIHZhciBhYnNDb3NSb3RhdGlvbiA9IE1hdGguYWJzKE1hdGguY29zKHJvdGF0aW9uKSk7XHJcbiAgdmFyIGFic1NpblJvdGF0aW9uID0gTWF0aC5hYnMoTWF0aC5zaW4ocm90YXRpb24pKTtcclxuICBcclxuICB2YXIgYWJXaWQgPSBhYnNDb3NSb3RhdGlvbiAqIHdpZHRoICsgYWJzU2luUm90YXRpb24gKiBoZWlnaHQ7XHJcbiAgdmFyIGFiSGd0ID0gYWJzQ29zUm90YXRpb24gKiBoZWlnaHQgKyBhYnNTaW5Sb3RhdGlvbiAqIHdpZHRoO1xyXG4gIFxyXG4gIHRoaXMuY2FsY3VsYXRpb25DYWNoZSA9IHtcclxuICAgIHg6IHRoaXMucG9zaXRpb24ueCxcclxuICAgIHk6IHRoaXMucG9zaXRpb24ueSwgXHJcbiAgICB3aWR0aDogd2lkdGgsXHJcbiAgICBoZWlnaHQ6IDEsXHJcbiAgICBhYWJiV2lkdGg6IGFiV2lkLFxyXG4gICAgYWFiYkhlaWdodDogYWJIZ3QsXHJcbiAgICBhYWJiSGFsZldpZHRoOiBhYldpZCAqIDAuNSxcclxuICAgIGFhYmJIYWxmSGVpZ2h0OiBhYkhndCAqIDAuNVxyXG4gIH07XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhTZWdtZW50LCB7XHJcbiAgU1RBVEU6IHtcclxuICAgIHZhbHVlOiB7XHJcbiAgICAgIEJBU0lDOiBcIkJBU0lDXCJcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuU2VnbWVudC5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIDApO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5jYWxjdWxhdGlvbkNhY2hlLnggPSB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRpb25DYWNoZS55ID0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgcmVzb2x2ZUNvbGxpc2lvbnM6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7fVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShTZWdtZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VnbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnZW9tICAgICAgICAgID0gd2ZsLmdlb207XHJcbnZhciB1dGlsICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzICAgICAgICA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCAgICA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxuXHJcbnZhciBTbWFsbEJsb2NrID0gZnVuY3Rpb24gKCkge1xyXG4gIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgdGhpcy5zbWFsbEJsb2NrR3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLlNNQUxMX0JMT0NLKS50ZXh0dXJlO1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICB0aGlzLnN0YXRlQmFzaWMgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZTEgICAgID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLnNtYWxsQmxvY2tHcmFwaGljKTtcclxuICB0aGlzLnN0YXRlQmFzaWMuYWRkRnJhbWUodGhpcy5mcmFtZTEpO1xyXG5cclxuICAvLyBBZGQgc3RhdGVzXHJcbiAgdGhpcy5hZGRTdGF0ZShTbWFsbEJsb2NrLlNUQVRFLkJBU0lDLCB0aGlzLnN0YXRlQmFzaWMpO1xyXG4gIFxyXG4gIHRoaXMuc29saWQgPSB0cnVlXHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhTbWFsbEJsb2NrLCB7XHJcbiAgU1RBVEU6IHtcclxuICAgIHZhbHVlOiB7XHJcbiAgICAgIEJBU0lDOiBcIkJBU0lDXCJcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuU21hbGxCbG9jay5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTbWFsbEJsb2NrOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxudmFyIFdhbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICB0aGlzLndhbGxHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuV0FMTCkudGV4dHVyZTtcclxuXHJcbiAgLy8gQ3JlYXRlIHN0YXRlXHJcbiAgdGhpcy5zdGF0ZUJhc2ljID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWUxICAgICA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy53YWxsR3JhcGhpYyk7XHJcbiAgdGhpcy5zdGF0ZUJhc2ljLmFkZEZyYW1lKHRoaXMuZnJhbWUxKTtcclxuXHJcbiAgLy8gQWRkIHN0YXRlc1xyXG4gIHRoaXMuYWRkU3RhdGUoV2FsbC5TVEFURS5CQVNJQywgdGhpcy5zdGF0ZUJhc2ljKTtcclxuICBcclxuICB0aGlzLmZpeGVkID0gdHJ1ZTtcclxuICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuICBcclxuICB0aGlzLnJlc3RpdHV0aW9uID0gMC44O1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoV2FsbCwge1xyXG4gIFNUQVRFOiB7XHJcbiAgICB2YWx1ZToge1xyXG4gICAgICBCQVNJQzogXCJCQVNJQ1wiXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbldhbGwucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoV2FsbCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdhbGw7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXIuanMnKTtcclxudmFyIEVuZW15ICA9IHJlcXVpcmUoJy4vRW5lbXkuanMnKTtcclxudmFyIEFycm93ICA9IHJlcXVpcmUoJy4vQXJyb3cuanMnKTtcclxudmFyIEFycm93Umljb2NoZXQgID0gcmVxdWlyZSgnLi9BcnJvd1JpY29jaGV0LmpzJyk7XHJcbnZhciBXYWxsICAgPSByZXF1aXJlKCcuL1dhbGwuanMnKTtcclxudmFyIExpdmluZ09iamVjdCA9IHJlcXVpcmUoJy4vTGl2aW5nT2JqZWN0LmpzJyk7XHJcblxyXG52YXIgUGxhdGZvcm0gPSByZXF1aXJlKCcuL1BsYXRmb3JtLmpzJyk7XHJcbnZhciBTbWFsbEJsb2NrID0gcmVxdWlyZSgnLi9TbWFsbEJsb2NrLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBMaXZpbmdPYmplY3QgOiAgTGl2aW5nT2JqZWN0LFxyXG4gIFBsYXllcjogICAgICAgICBQbGF5ZXIsXHJcbiAgRW5lbXk6ICAgICAgICAgIEVuZW15LFxyXG4gIEFycm93OiAgICAgICAgICBBcnJvdyxcclxuICBXYWxsOiAgICAgICAgICAgV2FsbCxcclxuICBBcnJvd1JpY29jaGV0OiAgQXJyb3dSaWNvY2hldCxcclxuICBcclxuICBQbGF0Zm9ybTogUGxhdGZvcm0sXHJcbiAgU21hbGxCbG9jazogU21hbGxCbG9ja1xyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgICA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXMnKTtcclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vdXRpbC9Bc3NldHMuanMnKTtcclxudmFyIG1hcCAgICA9IHJlcXVpcmUoJy4vbWFwJyk7XHJcblxyXG4vLyBDcmVhdGUgZ2FtZVxyXG52YXIgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWNhbnZhc1wiKTtcclxudmFyIGdhbWUgICA9IHdmbC5jcmVhdGUoY2FudmFzKTtcclxuLy9nYW1lLmRlYnVnID0gdHJ1ZTsvL3t2ZXJ0aWNlczogdHJ1ZX07XHJcblxyXG52YXIgb25Mb2FkV2luZG93ID0gZnVuY3Rpb24gKCkge1xyXG4gIHZhciBsID0gZ2FtZS5sb2FkZXI7XHJcblxyXG4gIC8vIFByZXBhcmUgdG8gbG9hZCBhc3NldHNcclxuICBmb3IgKHZhciBhc3NldCBpbiBBc3NldHMpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGwgPSBsLmFkZChBc3NldHNbYXNzZXRdKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGwubG9hZChvbkxvYWRBc3NldHMpO1xyXG4gIHJlc2l6ZSgpO1xyXG59O1xyXG5cclxudmFyIG9uTG9hZEFzc2V0cyA9IGZ1bmN0aW9uICgpIHtcclxuICBBc3NldHMuZ2V0ID0gZnVuY3Rpb24gKHBhdGgpIHsgcmV0dXJuIFBJWEkubG9hZGVyLnJlc291cmNlc1twYXRoXTsgfTtcclxuXHJcbiAgLy8gU2VuZCBhIHJlcXVlc3QgZm9yIGFsbCBtYXAgZGF0YVxyXG4gIHdmbC5qcXVlcnkuZ2V0SlNPTihBc3NldHMuTUFQMSwgb25Mb2FkTWFwKTtcclxufTtcclxuXHJcbnZhciBvbkxvYWRNYXAgPSBmdW5jdGlvbiAobWFwRGF0YSkge1xyXG4gIG1hcC5Sb29tLnNldFJvb21zKG1hcERhdGEubWFwcyk7XHJcbiAgXHJcbiAgLy8gTG9hZCBzY2VuZSBoZXJlXHJcbiAgdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZVNjZW5lKGNhbnZhcywgZ2FtZS5waXhpKTtcclxuICAvL3NjZW5lcy50ZXN0LlRlc3RTY2VuZUJhc2UuaGlkZU1lc3NhZ2VzKCk7XHJcbiAgLy8gdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMudGVzdC5UZXN0U2NlbmUxKGNhbnZhcywgZ2FtZS5waXhpKTtcclxuICBcclxuICBnYW1lLnNldFNjZW5lKGdhbWVTY2VuZSk7XHJcbiAgXHJcbiAgLy92YXIgbWFwUGFyc2VyID0gbmV3IG1hcC5NYXBQYXJzZXIoZ2FtZVNjZW5lLCBtYXBEYXRhKTtcclxufTtcclxuXHJcbnZhciBvblJlc2l6ZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgcmVzaXplKCk7XHJcbn07XHJcblxyXG52YXIgcmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gIC8vIFVzZSB0aGUgY29tbWVudGVkIGNvZGUgaWYgeW91IHdhbnQgdG8gbGltaXQgdGhlIGNhbnZhcyBzaXplXHJcbiAgLy8gdmFyIE1BWF9XSURUSCAgPSAxMzY2O1xyXG4gIC8vIHZhciBNQVhfSEVJR0hUID0gNzY4O1xyXG4gIHZhciB3ID0gd2luZG93LmlubmVyV2lkdGg7ICAvLyBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCwgIE1BWF9XSURUSCk7XHJcbiAgdmFyIGggPSB3aW5kb3cuaW5uZXJIZWlnaHQ7IC8vIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCwgTUFYX0hFSUdIVCk7XHJcbiAgXHJcbiAgY2FudmFzLndpZHRoICA9IHc7XHJcbiAgY2FudmFzLmhlaWdodCA9IGg7XHJcbiAgZ2FtZS5yZW5kZXJlci52aWV3LnN0eWxlLndpZHRoICA9IHcgKyAncHgnO1xyXG4gIGdhbWUucmVuZGVyZXIudmlldy5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4JztcclxuICBnYW1lLnJlbmRlcmVyLnJlc2l6ZSh3LCBoKTtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWRXaW5kb3cpO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25SZXNpemUpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUSUxFX1NJWkUgPSA2NDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGdlbmVyYXRlOiBmdW5jdGlvbiAobWFwRGF0YSkge1xyXG4gICAgdmFyIHRpbGVYICAgICA9IDA7XHJcbiAgICB2YXIgdGlsZVkgICAgID0gMDtcclxuICAgIHZhciB3aWR0aCAgICAgPSAwO1xyXG4gICAgdmFyIGhlaWdodCAgICA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXBEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBrZXkgPSBtYXBEYXRhW2ldO1xyXG5cclxuICAgICAgaWYgKGtleSA9PT0gJ1xcbicpIHtcclxuICAgICAgICB0aWxlWSsrO1xyXG4gICAgICAgIHRpbGVYID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB3aWR0aCAgPSBNYXRoLm1heCh0aWxlWCwgd2lkdGgpO1xyXG4gICAgICAgIGhlaWdodCA9IE1hdGgubWF4KHRpbGVYLCBoZWlnaHQpO1xyXG5cclxuICAgICAgICB0aWxlWCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIERlbGF5IGRlcGVuZGVuY3kgaW52b2NhdGlvbiB1bnRpbCBydW50aWwgdG8gcHJldmVudCBjaXJjdWxhciBidWZmZXJcclxuICAgIHZhciBtYXAgPSByZXF1aXJlKCcuLi9tYXAnKTtcclxuICAgIHJldHVybiBuZXcgbWFwLlJvb20od2lkdGgsIGhlaWdodCwgbWFwRGF0YSk7XHJcbiAgfSxcclxuICBcclxuICBhZGRSb29tVG9TY2VuZTogZnVuY3Rpb24ocm9vbSwgc2NlbmUpIHtcclxuICAgIHZhciB0aWxlWCAgICAgICA9IDA7XHJcbiAgICB2YXIgdGlsZVkgICAgICAgPSAwO1xyXG4gICAgdmFyIG9mZnNldFRpbGVYID0gcm9vbS5vZmZzZXRUaWxlWDtcclxuICAgIHZhciBvZmZzZXRUaWxlWSA9IHJvb20ub2Zmc2V0VGlsZVk7XHJcbiAgICB2YXIgbWFwRGF0YSAgICAgPSByb29tLm1hcERhdGE7XHJcbiAgICB2YXIgZW5lbXlEYXRhICAgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcERhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGtleSA9IG1hcERhdGFbaV07XHJcblxyXG4gICAgICBpZiAoa2V5ID09PSAnXFxuJykge1xyXG4gICAgICAgIHRpbGVZKys7XHJcbiAgICAgICAgdGlsZVggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB4ID0gVElMRV9TSVpFICogKHRpbGVYICsgb2Zmc2V0VGlsZVgpO1xyXG4gICAgICAgIHZhciB5ID0gVElMRV9TSVpFICogKHRpbGVZICsgb2Zmc2V0VGlsZVkpO1xyXG4gICAgICAgIHZhciBlbnRpdHkgPSBudWxsO1xyXG4gICAgICAgIHZhciBlbnRpdHlMYXllciA9IDA7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgICAvLyBXYWxsXHJcbiAgICAgICAgICBjYXNlICdYJzpcclxuICAgICAgICAgICAgZW50aXR5ID0gbmV3IGVudGl0aWVzLldhbGwoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgLy8gU3Bhd24gcG9pbnQgKHBsYXllcilcclxuICAgICAgICAgIGNhc2UgJ1MnOlxyXG4gICAgICAgICAgICBlbnRpdHkgPSBuZXcgZW50aXRpZXMuUGxheWVyKCk7XHJcbiAgICAgICAgICAgIGVudGl0eS5yb3RhdGUoTWF0aC5QSSAqIDAuNSk7IC8vIEZhY2UgZG93blxyXG4gICAgICAgICAgICBzY2VuZS5wbGF5ZXIgPSBlbnRpdHk7XHJcbiAgICAgICAgICAgIHNjZW5lLmNhbWVyYS5mb2xsb3coZW50aXR5KTtcclxuICAgICAgICAgICAgZW50aXR5TGF5ZXIgPSAzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAvLyBMZWZ0LWZhY2luZyBlbmVteVxyXG4gICAgICAgICAgY2FzZSAnTCc6XHJcbiAgICAgICAgICAgIGVuZW15RGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICAgICAgcm90YXRpb246IE1hdGguUElcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgIC8vIFVwLWZhY2luZyBlbmVteVxyXG4gICAgICAgICAgY2FzZSAnVSc6XHJcbiAgICAgICAgICAgIGVuZW15RGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICAgICAgcm90YXRpb246IE1hdGguUEkgKiAxLjVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgIC8vIFJpZ2h0LWZhY2luZyBlbmVteVxyXG4gICAgICAgICAgY2FzZSAnUic6XHJcbiAgICAgICAgICAgIGVuZW15RGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICAgICAgcm90YXRpb246IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgIC8vIERvd24tZmFjaW5nIGVuZW15XHJcbiAgICAgICAgICBjYXNlICdEJzpcclxuICAgICAgICAgICAgZW5lbXlEYXRhLnB1c2goe1xyXG4gICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgeTogeSxcclxuICAgICAgICAgICAgICByb3RhdGlvbjogTWF0aC5QSSAqIDAuNVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZW50aXR5KSB7XHJcbiAgICAgICAgICBlbnRpdHkucG9zaXRpb24ueCA9IHg7XHJcbiAgICAgICAgICBlbnRpdHkucG9zaXRpb24ueSA9IHk7XHJcbiAgICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KGVudGl0eSwgZW50aXR5TGF5ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGlsZVgrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBlbmVtaWVzIG5vdyB0aGF0IHRoZSBwbGF5ZXIgaGFzIGJlZW4gYWRkZWRcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW5lbXlEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlbmVteSA9IG5ldyBlbnRpdGllcy5FbmVteShzY2VuZS5wbGF5ZXIsIHNjZW5lLl9xdWFkdHJlZSk7XHJcbiAgICAgIGVuZW15LnBvc2l0aW9uLnggPSBlbmVteURhdGFbaV0ueDtcclxuICAgICAgZW5lbXkucG9zaXRpb24ueSA9IGVuZW15RGF0YVtpXS55O1xyXG4gICAgICBlbmVteS5yb3RhdGUoZW5lbXlEYXRhW2ldLnJvdGF0aW9uKTtcclxuICAgICAgc2NlbmUuYWRkR2FtZU9iamVjdChlbmVteSwgMSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBhZGRTZWN0b3JUb1NjZW5lOiBmdW5jdGlvbiAoc2VjdG9yLCBzY2VuZSkge1xyXG4gICAgdmFyIHNwYXduUm9vbSA9IHNlY3Rvci5zcGF3blJvb207XHJcbiAgICBcclxuICAgIC8vIEFkZCB0aGUgc3Bhd24gcm9vbSBmaXJzdCBzbyB0aGUgcGxheWVyIGV4aXN0c1xyXG4gICAgdGhpcy5hZGRSb29tVG9TY2VuZShzcGF3blJvb20sIHNjZW5lKTtcclxuICAgIFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWN0b3Iucm9vbVdpZHRoOyBpKyspIHtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZWN0b3Iucm9vbUhlaWdodDsgaisrKSB7XHJcbiAgICAgICAgdmFyIHJvb20gPSBzZWN0b3Iucm9vbUxheW91dFtpXVtqXTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBBZGQgYWxsIG90aGVyIHJvb21zIGJlc2lkZXMgdGhlIHNwYXduIHJvb21cclxuICAgICAgICBpZiAocm9vbSAmJiByb29tICE9PSBzcGF3blJvb20pIHtcclxuICAgICAgICAgIHRoaXMuYWRkUm9vbVRvU2NlbmUocm9vbSwgc2NlbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTWFwUGFyc2VyID0gcmVxdWlyZSgnLi9NYXBQYXJzZXInKTtcclxuXHJcbnZhciBBTExfUk9PTVMgPSBudWxsO1xyXG5cclxudmFyIFJvb20gPSBmdW5jdGlvbih0aWxlV2lkdGggPSAwLCB0aWxlSGVpZ2h0ID0gMCwgbWFwRGF0YSA9IG51bGwpIHtcclxuICAvLyBJZiBSb29tIHdhcyBjcmVhdGVkIHdpdGggKG1hcERhdGEpIGluc3RlYWQgb2YgKHRpbGVXaWR0aCwgdGlsZUhlaWdodClcclxuICAvLyB0aGVuIHJldHVybiBhIGdlbmVyYXRlZCByb29tXHJcbiAgaWYgKHRpbGVXaWR0aCAmJiB0eXBlb2YgdGlsZVdpZHRoICE9PSAnbnVtYmVyJykge1xyXG4gICAgbWFwRGF0YSA9IHRpbGVXaWR0aDtcclxuICAgIHJldHVybiBSb29tLmNyZWF0ZVJvb20obWFwRGF0YSk7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMudGlsZVdpZHRoICAgPSB0aWxlV2lkdGg7XHJcbiAgdGhpcy50aWxlSGVpZ2h0ICA9IHRpbGVIZWlnaHQ7XHJcbiAgdGhpcy5vZmZzZXRUaWxlWCA9IDA7XHJcbiAgdGhpcy5vZmZzZXRUaWxlWSA9IDA7XHJcbiAgdGhpcy5tYXBEYXRhICAgICA9IG1hcERhdGE7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhSb29tLCB7XHJcbiAgUk9PTV9USUxFX1dJRFRIOiB7XHJcbiAgICB2YWx1ZTogMTJcclxuICB9LFxyXG4gIFxyXG4gIFJPT01fVElMRV9IRUlHSFQ6IHtcclxuICAgIHZhbHVlOiAxMiBcclxuICB9LFxyXG4gIFxyXG4gIHNldFJvb21zOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24ocm9vbXMpIHtcclxuICAgICAgdmFyIGZsYXR0ZW5lZFJvb21zID0gW107XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb21zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZmxhdHRlbmVkUm9vbXMucHVzaChyb29tc1tpXS5tYXBEYXRhLmpvaW4oJ1xcbicpKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgQUxMX1JPT01TID0gZmxhdHRlbmVkUm9vbXM7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBjcmVhdGVGcm9tOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24obWFwRGF0YSkge1xyXG4gICAgICByZXR1cm4gTWFwUGFyc2VyLmdlbmVyYXRlKG1hcERhdGEpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgY3JlYXRlUmFuZG9tOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciByb29tSW5kZXggPSBNYXRoLmZsb29yKEFMTF9ST09NUy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKTtcclxuICAgICAgdmFyIG1hcERhdGEgICA9IEFMTF9ST09NU1tyb29tSW5kZXhdO1xyXG4gICAgICByZXR1cm4gUm9vbS5jcmVhdGVGcm9tKG1hcERhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5Sb29tLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUm9vbS5wcm90b3R5cGUsIHtcclxuICBzZXRBc1NwYXduUm9vbSA6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuX3JlcGxhY2VSYW5kb21FbmVteVdpdGhTcGF3bigpO1xyXG4gICAgICB0aGlzLl9yZW1vdmVFbmVtaWVzKCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfcmVwbGFjZVJhbmRvbUVuZW15V2l0aFNwYXduOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgZW5lbXlJbmRpY2VzID0gW107XHJcbiAgICAgIHZhciBtYXBEYXRhID0gdGhpcy5tYXBEYXRhO1xyXG4gICAgICBcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXBEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IG1hcERhdGFbaV07XHJcbiAgICAgICAgdmFyIGlzRW5lbXkgPSAoa2V5ID09PSAnTCcgfHwga2V5ID09PSAnVScgfHwga2V5ID09PSAnUicgfHwga2V5ID09PSAnRCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChpc0VuZW15KSB7XHJcbiAgICAgICAgICBlbmVteUluZGljZXMucHVzaChpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIEluamVjdCB0aGUgcGxheWVyIHNwYXduIHBvaW50ICdTJyB3aGVyZSBhbiBFbmVteSB1c2VkIHRvIGJlXHJcbiAgICAgIHZhciBzZWxlY3RlZEVuZW15SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBlbmVteUluZGljZXMubGVuZ3RoKTtcclxuICAgICAgdmFyIGVuZW15U3RyaW5nUG9zICAgICA9IGVuZW15SW5kaWNlc1tzZWxlY3RlZEVuZW15SW5kZXhdO1xyXG4gICAgICB2YXIgbmV3TWFwRGF0YSA9XHJcbiAgICAgICAgbWFwRGF0YS5zdWJzdHIoMCwgZW5lbXlTdHJpbmdQb3MpICtcclxuICAgICAgICAnUycgK1xyXG4gICAgICAgIG1hcERhdGEuc3Vic3RyKGVuZW15U3RyaW5nUG9zICsgMSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBVc2UgdGhlIG5ld2x5IGFsdGVyZWQgbWFwIGRhdGEgd2l0aCB0aGUgc3Bhd24gcG9pbnRcclxuICAgICAgdGhpcy5tYXBEYXRhID0gbmV3TWFwRGF0YTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9yZW1vdmVFbmVtaWVzOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgbWFwRGF0YSA9IHRoaXMubWFwRGF0YTtcclxuICAgICAgdmFyIG5ld01hcERhdGEgPSAnJztcclxuICAgICAgXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFwRGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBrZXkgPSBtYXBEYXRhW2ldO1xyXG4gICAgICAgIHZhciBpc0VuZW15ID0gKGtleSA9PT0gJ0wnIHx8IGtleSA9PT0gJ1UnIHx8IGtleSA9PT0gJ1InIHx8IGtleSA9PT0gJ0QnKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoaXNFbmVteSkge1xyXG4gICAgICAgICAgbmV3TWFwRGF0YSArPSAnICc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld01hcERhdGEgKz0ga2V5O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5tYXBEYXRhID0gbmV3TWFwRGF0YTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSb29tOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJvb20gPSByZXF1aXJlKCcuL1Jvb20nKTtcclxudmFyIE1hcFBhcnNlciA9IHJlcXVpcmUoJy4vTWFwUGFyc2VyJyk7XHJcblxyXG52YXIgU2VjdG9yID0gZnVuY3Rpb24gKHJvb21XaWR0aCA9IDEsIHJvb21IZWlnaHQgPSAxKSB7XHJcbiAgaWYgKHR5cGVvZiByb29tV2lkdGggIT09ICdudW1iZXInIHx8IHJvb21XaWR0aCA8IDEpIHtcclxuICAgIHJvb21XaWR0aCA9IDE7XHJcbiAgfVxyXG4gIFxyXG4gIGlmICh0eXBlb2Ygcm9vbUhlaWdodCAhPT0gJ251bWJlcicgfHwgcm9vbUhlaWdodCA8IDEpIHtcclxuICAgIHJvb21IZWlnaHQgPSAxO1xyXG4gIH1cclxuICBcclxuICB0aGlzLnJvb21XaWR0aCAgPSByb29tV2lkdGg7XHJcbiAgdGhpcy5yb29tSGVpZ2h0ID0gcm9vbUhlaWdodDtcclxuICB0aGlzLnJvb21MYXlvdXQgPSBbXTtcclxuICB0aGlzLnJvb21zICAgICAgPSBbXTtcclxuICBcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb21XaWR0aDsgaSsrKSB7XHJcbiAgICB0aGlzLnJvb21MYXlvdXQucHVzaChbXSk7XHJcbiAgICBcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcm9vbUhlaWdodDsgaisrKSB7XHJcbiAgICAgIHRoaXMucm9vbUxheW91dFtpXS5wdXNoKG51bGwpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLyBXaGV0aGVyIG9yIG5vdCBhIHNwYXduIHBvaW50IGZvciB0aGUgcGxheWVyIGhhcyBiZWVuIHNldCB5ZXRcclxuICB0aGlzLl9wbGF5ZXJTZXQgPSBmYWxzZTtcclxufTtcclxuXHJcblNlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNlY3Rvci5wcm90b3R5cGUsIHtcclxuICAvKipcclxuICAgKiBBZGRzIGEgZ2l2ZW4gcm9vbSB0byB0aGUgc2VjdG9yLlxyXG4gICAqXHJcbiAgICogT3B0aW9uYWwgcGFyYW1ldGVyIChyb29tKTpcclxuICAgKiBJZiByb29tIGlzIG5vdCBkZWZpbmVkLCBhIHJhbmRvbSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWRcclxuICAgKlxyXG4gICAqIE9wdGlvbmFsIHBhcmFtZXRlcnMgKHgsIHkpOlxyXG4gICAqICh4LCB5KSBkZXRlcm1pbmUgd2hlcmUgaW4gdGhlIHNlY3RvciB0aGUgcm9vbSBsaWVzLCBub3QgcGl4ZWwgY29vcmRpbmF0ZXNcclxuICAgKlxyXG4gICAqIHggYW5kIHkgbXVzdCBiZSBub24tbmVnYXRpdmUgaW50ZWdlcnNcclxuICAgKi9cclxuICBhZGRSb29tOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKHJvb20sIHgsIHkpIHtcclxuICAgICAgaWYgKCEocm9vbSBpbnN0YW5jZW9mIFJvb20pKSB7XHJcbiAgICAgICAgcm9vbSA9IFJvb20uY3JlYXRlUmFuZG9tKCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmICh0eXBlb2YgeCAhPT0gJ251bWJlcicgfHwgeCA8IDApIHtcclxuICAgICAgICB4ID0gTWF0aC5yYW5kb20oKSAqIHRoaXMucm9vbVdpZHRoO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiAodHlwZW9mIHkgIT09ICdudW1iZXInIHx8IHkgPCAwKSB7XHJcbiAgICAgICAgeSA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLnJvb21IZWlnaHQ7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xyXG4gICAgICB5ID0gTWF0aC5mbG9vcih5KTtcclxuICAgICAgXHJcbiAgICAgIGlmICghdGhpcy5yb29tTGF5b3V0W3hdW3ldKSB7XHJcbiAgICAgICAgcm9vbS5vZmZzZXRUaWxlWCA9IFJvb20uUk9PTV9USUxFX1dJRFRIICogeDtcclxuICAgICAgICByb29tLm9mZnNldFRpbGVZID0gUm9vbS5ST09NX1RJTEVfV0lEVEggKiB5O1xyXG4gICAgICBcclxuICAgICAgICB0aGlzLnJvb21MYXlvdXRbeF1beV0gPSByb29tO1xyXG4gICAgICAgIHRoaXMucm9vbXMucHVzaChyb29tKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgYWRkVG9TY2VuZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChzY2VuZSkge1xyXG4gICAgICBpZiAoIXRoaXMuX3BsYXllclNldCkge1xyXG4gICAgICAgIHRoaXMuX2RldGVybWluZVBsYXllclNwYXduKCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIE1hcFBhcnNlci5hZGRTZWN0b3JUb1NjZW5lKHRoaXMsIHNjZW5lKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9kZXRlcm1pbmVQbGF5ZXJTcGF3bjoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgc3Bhd25Sb29tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnJvb21zLmxlbmd0aCk7XHJcbiAgICAgIHZhciBzcGF3blJvb20gICAgICA9IHRoaXMucm9vbXNbc3Bhd25Sb29tSW5kZXhdO1xyXG4gICAgICBzcGF3blJvb20uc2V0QXNTcGF3blJvb20oKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3Bhd25Sb29tICA9IHNwYXduUm9vbTtcclxuICAgICAgdGhpcy5fcGxheWVyU2V0ID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTWFwUGFyc2VyID0gcmVxdWlyZSgnLi9NYXBQYXJzZXIuanMnKTtcclxudmFyIFJvb20gICAgICA9IHJlcXVpcmUoJy4vUm9vbS5qcycpO1xyXG52YXIgU2VjdG9yICAgID0gcmVxdWlyZSgnLi9TZWN0b3IuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIE1hcFBhcnNlcjogTWFwUGFyc2VyLFxyXG4gIFJvb206ICAgICAgUm9vbSxcclxuICBTZWN0b3I6ICAgIFNlY3RvclxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG52YXIgbWFwICAgICAgPSByZXF1aXJlKCcuLi9tYXAnKTtcclxuXHJcbnZhciBHYW1lU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCBQSVhJKSB7XHJcbiAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gIFxyXG4gIHRoaXMuUElYSSA9IFBJWEk7XHJcbiAgXHJcbiAgdGhpcy5tb3VzZURvd25UaW1lID0gMDtcclxuICBcclxuICAkKGNhbnZhcykub24oJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcykpO1xyXG4gICQoY2FudmFzKS5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XHJcbiAgJChjYW52YXMpLm9uKCdtb3VzZXVwJywgICB0aGlzLl9vbk1vdXNlVXAuYmluZCh0aGlzKSk7XHJcbiAgXHJcbiAgdGhpcy5zZWN0b3IgPSBuZXcgbWFwLlNlY3RvcigzLCAzKTtcclxuICB0aGlzLnNlY3Rvci5hZGRSb29tKCk7XHJcbiAgdGhpcy5zZWN0b3IuYWRkUm9vbSgpO1xyXG4gIHRoaXMuc2VjdG9yLmFkZFJvb20oKTtcclxuICB0aGlzLnNlY3Rvci5hZGRSb29tKCk7XHJcbiAgdGhpcy5zZWN0b3IuYWRkUm9vbSgpO1xyXG4gIHRoaXMuc2VjdG9yLmFkZFRvU2NlbmUodGhpcyk7XHJcbiAgXHJcbiAgXHJcbiAgLyp0aGlzLnBsYXllciA9IG5ldyBlbnRpdGllcy5QbGF5ZXIoKTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG4gIFxyXG4gIHZhciB3YWxsID0gbmV3IGVudGl0aWVzLldhbGwoKTtcclxuICB3YWxsLnBvc2l0aW9uLnkgPSAtNzA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHdhbGwpO1xyXG4gIHZhciB3YWxsID0gbmV3IGVudGl0aWVzLldhbGwoKTtcclxuICB3YWxsLnBvc2l0aW9uLnkgPSAtMTM0O1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh3YWxsKTtcclxuICBcclxuICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpOyovXHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAvKlxyXG4gIE1ZX0NPTlNUOiB7XHJcbiAgICB2YWx1ZToge1xyXG4gICAgICBmb286IDAsXHJcbiAgICAgIGJhcjogMVxyXG4gICAgfVxyXG4gIH1cclxuICAqL1xyXG4gIEZSSUNUSU9OOiB7XHJcbiAgICB2YWx1ZTogMC45XHJcbiAgfVxyXG59KTtcclxuXHJcbkdhbWVTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgZm9yIChsZXQgb2JqIG9mIHRoaXMuX25lYXJieUdhbWVPYmplY3RzKSB7XHJcbiAgICAgICAgaWYgKG9iai5oZWFsdGggPD0gMCB8fCBvYmouY3VzdG9tRGF0YS5mb3JjZVJlbW92ZSkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dCgpO1xyXG4gICAgICB0aGlzLl9hcHBseUZyaWN0aW9uKCk7XHJcbiAgICAgIFxyXG4gICAgICBTY2VuZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgX2hhbmRsZUlucHV0IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMucGxheWVyLmhhbmRsZUlucHV0KHRoaXMua2V5Ym9hcmQpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgX2FwcGx5RnJpY3Rpb24gOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICBmb3IgKGxldCBvYmogb2YgdGhpcy5fbmVhcmJ5R2FtZU9iamVjdHMpIHtcclxuICAgICAgICB2YXIgZnJpYyA9IG9iai5jdXN0b21EYXRhLkRFRkFVTFRfRlJJQ1RJT04gfHwgR2FtZVNjZW5lLkZSSUNUSU9OO1xyXG4gICAgICAgIG9iai5hY2NlbGVyYXRpb24ubXVsdGlwbHkoZnJpYyk7XHJcbiAgICAgICAgb2JqLnZlbG9jaXR5Lm11bHRpcGx5KGZyaWMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfb25Nb3VzZURvd246IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMubW91c2VEb3duVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgdmFyIG1vdXNlV29ybGRQb3MgPSB0aGlzLl9nZXRNb3VzZVdvcmxkUG9zaXRpb25Gcm9tRXZlbnQoZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9vbk1vdXNlVXA6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHZhciBkdE1vdXNlRG93blJhdyA9IERhdGUubm93KCkgLSB0aGlzLm1vdXNlRG93blRpbWVcclxuICAgICAgICB2YXIgZHRNb3VzZURvd24gPSAoZHRNb3VzZURvd25SYXcpIDwgZW50aXRpZXMuQXJyb3cuTUFYX0FSUk9XX0NIQVJHRV9USU1FID8gZHRNb3VzZURvd25SYXcgOiBlbnRpdGllcy5BcnJvdy5NQVhfQVJST1dfQ0hBUkdFX1RJTUU7XHJcbiAgICAgICAgaWYgKGR0TW91c2VEb3duIDwgZW50aXRpZXMuQXJyb3cuTUlOX0FSUk9XX0NIQVJHRV9USU1FKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJvdyB0aGF0IGlzIGZyb20gdGhlIHBsYXllclxyXG4gICAgICAgIHZhciBhcnJvdyA9IG5ldyBlbnRpdGllcy5BcnJvd1JpY29jaGV0KHRoaXMucGxheWVyLmN1c3RvbURhdGEuYWxsaWFuY2UpO1xyXG4gICAgICAgIGFycm93LnBvc2l0aW9uLnggPSB0aGlzLnBsYXllci5wb3NpdGlvbi54O1xyXG4gICAgICAgIGFycm93LnBvc2l0aW9uLnkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi55O1xyXG4gICAgICAgIGFycm93LnJvdGF0ZSh0aGlzLnBsYXllci5yb3RhdGlvbik7XHJcbiAgICAgICAgYXJyb3cudmVsb2NpdHkueCA9IDQwICogKGR0TW91c2VEb3duIC8gMTAwMCk7XHJcbiAgICAgICAgYXJyb3cudmVsb2NpdHkucm90YXRlKGFycm93LnJvdGF0aW9uKTtcclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoYXJyb3csIDIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfb25Nb3VzZU1vdmU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgbW91c2VXb3JsZFBvcyA9IHRoaXMuX2dldE1vdXNlV29ybGRQb3NpdGlvbkZyb21FdmVudChlKTtcclxuICAgICAgdGhpcy5wbGF5ZXIubG9va0F0KG1vdXNlV29ybGRQb3MpO1xyXG4gICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvLyBDcmVhdGUgYW4gYXJyb3cgdGhhdCBpcyBmcm9tIHRoZSBwbGF5ZXJcclxuICAgICAgICB2YXIgZHRNb3VzZURvd25SYXcgPSBEYXRlLm5vdygpIC0gdGhpcy5tb3VzZURvd25UaW1lXHJcbiAgICAgICAgdmFyIGR0TW91c2VEb3duID0gKGR0TW91c2VEb3duUmF3KSA8IGVudGl0aWVzLkFycm93Lk1BWF9BUlJPV19DSEFSR0VfVElNRSA/IGR0TW91c2VEb3duUmF3IDogZW50aXRpZXMuQXJyb3cuTUFYX0FSUk9XX0NIQVJHRV9USU1FO1xyXG4gICAgICAgIHZhciBhcnJvdyA9IG5ldyBlbnRpdGllcy5BcnJvd1JpY29jaGV0KHRoaXMucGxheWVyLmN1c3RvbURhdGEuYWxsaWFuY2UpO1xyXG4gICAgICAgIGFycm93LnBvc2l0aW9uLnggPSB0aGlzLnBsYXllci5wb3NpdGlvbi54O1xyXG4gICAgICAgIGFycm93LnBvc2l0aW9uLnkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi55O1xyXG4gICAgICAgIGFycm93LnJvdGF0ZSh0aGlzLnBsYXllci5yb3RhdGlvbik7XHJcbiAgICAgICAgYXJyb3cudmVsb2NpdHkueCA9IDQwICogKGR0TW91c2VEb3duIC8gMTAwMCk7XHJcbiAgICAgICAgYXJyb3cudmVsb2NpdHkucm90YXRlKGFycm93LnJvdGF0aW9uKTtcclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoYXJyb3csIDIpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgd29ybGQgcG9zaXRpb24gb2Ygd2hlcmUgdGhlIG1vdXNlIGN1cnJlbnRseSBpcyBiYXNlZFxyXG4gICAqIG9uIHRoZSBnaXZlbiBldmVudCBkYXRhXHJcbiAgICovXHJcbiAgX2dldE1vdXNlV29ybGRQb3NpdGlvbkZyb21FdmVudDoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBjZW50ZXJUb01vdXNlID0gbmV3IGdlb20uVmVjMihcclxuICAgICAgICBlLm9mZnNldFgsXHJcbiAgICAgICAgZS5vZmZzZXRZXHJcbiAgICAgICk7XHJcbiAgICAgIGNlbnRlclRvTW91c2UueCAtPSB0aGlzLmNhbnZhcy53aWR0aCAgKiAwLjU7XHJcbiAgICAgIGNlbnRlclRvTW91c2UueSAtPSB0aGlzLmNhbnZhcy5oZWlnaHQgKiAwLjU7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IGdlb20uVmVjMihcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi54ICsgY2VudGVyVG9Nb3VzZS54IC8gdGhpcy5jYW1lcmEuem9vbSxcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ICsgY2VudGVyVG9Nb3VzZS55IC8gdGhpcy5jYW1lcmEuem9vbVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgR2FtZVNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU2NlbmUuanMnKTtcclxudmFyIHRlc3QgICAgICA9IHJlcXVpcmUoJy4vdGVzdCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgR2FtZVNjZW5lOiBHYW1lU2NlbmUsXHJcbiAgdGVzdDogICAgICB0ZXN0XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMiA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMicpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDEgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjgpLCAxIG5vbi1zdGF0aWMgLSBWZXJ0aWNhbCB2ZWxvY2l0eSBkb2VzIG5vdCBnYWluIGhvcml6b250YWwgY29tcG9uZW50IGZyb20gY29sbGlzaW9uXCIsXHJcbiAgICBUZXN0U2NlbmUyXHJcbiAgKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDAuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC44O1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh3YWxsKTtcclxuICBcclxuICB0aGlzLnBsYXllciA9IG5ldyBlbnRpdGllcy5QbGF5ZXIoKTtcclxuICB0aGlzLnBsYXllci5tYXhTcGVlZCA9IDU7XHJcbiAgdGhpcy5wbGF5ZXIubWF4QWNjZWxlcmF0aW9uID0gMTA7XHJcbiAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueSA9IDgwO1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnkgPSAtNTtcclxuICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueSA9IC0xO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXllciwgMik7XHJcbiAgXHJcbiAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgdmFyIHZlbG9jaXR5ID0gdGhpcy5wbGF5ZXIudmVsb2NpdHk7XHJcbiAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICBcIihUaW1lb3V0KSBWZWxvY2l0eToge1wiICsgdmVsb2NpdHkueCArIFwiLCBcIiArIHZlbG9jaXR5LnkgKyBcIn1cIlxyXG4gICAgICApO1xyXG4gICAgfSxcclxuICAgIDUwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIHZhciBjb2xsaXNpb25EaXNwbGFjZW1lbnQgPSB0aGlzLnBsYXllci5jb2xsaXNpb25EaXNwbGFjZW1lbnRTdW07XHJcbiAgICAgIFxyXG4gICAgICBpZiAodGhpcy5wbGF5ZXIuY29sbGlzaW9uRGlzcGxhY2VtZW50U3VtLmdldE1hZ25pdHVkZVNxdWFyZWQoKSA+IDApIHtcclxuICAgICAgICB2YXIgdmVsb2NpdHkgPSB0aGlzLnBsYXllci52ZWxvY2l0eTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoTWF0aC5hYnModmVsb2NpdHkueCkgPj0gMC4wMDAxKSB7XHJcbiAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgIFwiVmVsb2NpdHk6IHtcIiArIHZlbG9jaXR5LnggKyBcIiwgXCIgKyB2ZWxvY2l0eS55ICsgXCJ9XCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICAgICAgXCJWZWxvY2l0eToge1wiICsgdmVsb2NpdHkueCArIFwiLCBcIiArIHZlbG9jaXR5LnkgKyBcIn1cIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi8uLi9lbnRpdGllcycpO1xyXG5cclxudmFyIFRlc3RTY2VuZUJhc2UgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZUJhc2UnKTtcclxudmFyIFRlc3RTY2VuZTExID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUxMScpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDEgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjgpLCAyIG5vbi1zdGF0aWMgLSAyIG5vbi1zdGF0aWNzIGV2ZW50dWFsbHkgc3RhYmlsaXplIGFuZCBkbyBub3Qgb3ZlcmxhcFwiLFxyXG4gICAgVGVzdFNjZW5lMTFcclxuICApO1xyXG4gIFxyXG4gIHZhciBwbGF0Zm9ybSA9IG5ldyBlbnRpdGllcy5QbGF0Zm9ybSgpO1xyXG4gIHBsYXRmb3JtLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHBsYXRmb3JtLmZyaWN0aW9uID0gMC44O1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChwbGF0Zm9ybSk7XHJcbiAgXHJcbiAgdGhpcy5ibG9ja3MgPSBbXTtcclxuICBcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IDI7IGkrKykge1xyXG4gICAgdmFyIGJsb2NrID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICAgIGJsb2NrLnBvc2l0aW9uLnkgPSAtNTAwICsgMzIgKiBpO1xyXG4gICAgYmxvY2sudmVsb2NpdHkueSA9IDI7XHJcbiAgICBibG9jay5tYXhTcGVlZCA9IDEwO1xyXG4gICAgYmxvY2subWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2spO1xyXG5cclxuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gLTIwMDtcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBiMCA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIHZhciBwMCA9IGIwLnBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICB2YXIgYjEgPSB0aGlzLmJsb2Nrc1tqXTtcclxuICAgICAgICAgIHZhciBwMSA9IGIxLnBvc2l0aW9uO1xyXG4gICAgICAgICAgdmFyIGRpc3QgPSBnZW9tLlZlYzIuc3VidHJhY3QocDEsIHAwKS5nZXRNYWduaXR1ZGUoKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKGRpc3QgPCAyMykge1xyXG4gICAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgICAgXCIoT3ZlcmxhcHBpbmcpIERpc3RhbmNlIGZvdW5kIGJldHdlZW4gMiBvdmVybGFwcGluZyA9IFwiICsgZGlzdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgXCJObyBvYmplY3RzIG92ZXJsYXBwaW5nXCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICAzMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgdmFyIGdyYXZpdHkgPSBuZXcgZ2VvbS5WZWMyKDAsIDMpO1xyXG4gICAgICBcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBiID0gdGhpcy5ibG9ja3NbaV07XHJcbiAgICAgICAgYi5hZGRGb3JjZShncmF2aXR5KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMTIgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTEyJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gIFRlc3RTY2VuZUJhc2UuY2FsbChcclxuICAgIHRoaXMsXHJcbiAgICBjYW52YXMsXHJcbiAgICBcIkNvbGxpc2lvbjogMSBzdGF0aWMgKHJlc3Q9MC4wLCBmcmljPTAuOCksIDMgbm9uLXN0YXRpYyAtIDEgbm9uLXN0YXRpYyBldmVudHVhbGx5IHN0YWJpbGl6ZSBvbiAyIG5vbi1zdGF0aWNzIGFuZCBkbyBub3Qgb3ZlcmxhcFwiLFxyXG4gICAgVGVzdFNjZW5lMTJcclxuICApO1xyXG4gIFxyXG4gIHZhciBwbGF0Zm9ybSA9IG5ldyBlbnRpdGllcy5QbGF0Zm9ybSgpO1xyXG4gIHBsYXRmb3JtLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHBsYXRmb3JtLmZyaWN0aW9uID0gMC44O1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChwbGF0Zm9ybSk7XHJcbiAgXHJcbiAgdGhpcy5ibG9ja3MgPSBbXTtcclxuICBcclxuICB2YXIgYmxvY2swID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICBibG9jazAucG9zaXRpb24ueCA9IC0xMi4xO1xyXG4gIGJsb2NrMC5wb3NpdGlvbi55ID0gLTIwMDtcclxuICBibG9jazAudmVsb2NpdHkueSA9IDI7XHJcbiAgYmxvY2swLm1heFNwZWVkID0gMTA7XHJcbiAgYmxvY2swLm1heEFjY2VsZXJhdGlvbiA9IDIwO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChibG9jazApO1xyXG4gIHRoaXMuYmxvY2tzLnB1c2goYmxvY2swKTtcclxuICBcclxuICB2YXIgYmxvY2sxID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICBibG9jazEucG9zaXRpb24ueCA9IDEyLjE7XHJcbiAgYmxvY2sxLnBvc2l0aW9uLnkgPSAtMjAwO1xyXG4gIGJsb2NrMS52ZWxvY2l0eS55ID0gMjtcclxuICBibG9jazEubWF4U3BlZWQgPSAxMDtcclxuICBibG9jazEubWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KGJsb2NrMSk7XHJcbiAgdGhpcy5ibG9ja3MucHVzaChibG9jazEpO1xyXG4gIFxyXG4gIHZhciBibG9jazIgPSBuZXcgZW50aXRpZXMuU21hbGxCbG9jaygpO1xyXG4gIGJsb2NrMi5wb3NpdGlvbi55ID0gLTI1MDtcclxuICBibG9jazIudmVsb2NpdHkueSA9IDI7XHJcbiAgYmxvY2syLm1heFNwZWVkID0gMTA7XHJcbiAgYmxvY2syLm1heEFjY2VsZXJhdGlvbiA9IDIwO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChibG9jazIpO1xyXG4gIHRoaXMuYmxvY2tzLnB1c2goYmxvY2syKTtcclxuICBcclxuICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gLTIwMDtcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBiMCA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIHZhciBwMCA9IGIwLnBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICB2YXIgYjEgPSB0aGlzLmJsb2Nrc1tqXTtcclxuICAgICAgICAgIHZhciBwMSA9IGIxLnBvc2l0aW9uO1xyXG4gICAgICAgICAgdmFyIGRpc3QgPSBnZW9tLlZlYzIuc3VidHJhY3QocDEsIHAwKS5nZXRNYWduaXR1ZGUoKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKGRpc3QgPCAyMykge1xyXG4gICAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgICAgXCIoT3ZlcmxhcHBpbmcpIERpc3RhbmNlIGZvdW5kIGJldHdlZW4gMiBvdmVybGFwcGluZyA9IFwiICsgZGlzdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGRpc3QgPiAzNSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgICAgXCIoU2VwYXJhdGVkKSBEaXN0YW5jZSBmb3VuZCBiZXR3ZWVuIDIgb3ZlcmxhcHBpbmcgPSBcIiArIGRpc3RcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKGJsb2NrMi5wb3NpdGlvbi55IDwgYmxvY2swLnBvc2l0aW9uLnkgLSAyKSB7XHJcbiAgICAgICAgdGhpcy5vblRlc3RTdWNjZXNzKFxyXG4gICAgICAgICAgXCJObyBvYmplY3RzIG92ZXJsYXBwaW5nICYgc3RhYmlsaXplZFwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICBcIk5vIG9iamVjdHMgb3ZlcmxhcHBpbmcsIGJ1dCBkaWQgbm90IHJlc29sdmUgY29sbGlzaW9uIGNvcnJlY3RseVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIDMwMDBcclxuICApO1xyXG59O1xyXG5cclxuVGVzdFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShUZXN0U2NlbmVCYXNlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICB2YXIgZ3Jhdml0eSA9IG5ldyBnZW9tLlZlYzIoMCwgMyk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGIgPSB0aGlzLmJsb2Nrc1tpXTtcclxuICAgICAgICBiLmFkZEZvcmNlKGdyYXZpdHkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmVCYXNlID0gcmVxdWlyZSgnLi9UZXN0U2NlbmVCYXNlJyk7XHJcbnZhciBUZXN0U2NlbmUxMyA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAxIHN0YXRpYyAocmVzdD0wLjAsIGZyaWM9MC44KSwgMTAgbm9uLXN0YXRpYyAtIE5vbi1zdGF0aWMgZXZlbnR1YWxseSBzdGFiaWxpemUgYW5kIGRvIG5vdCBvdmVybGFwXCIsXHJcbiAgICBUZXN0U2NlbmUxM1xyXG4gICk7XHJcbiAgXHJcbiAgdmFyIHBsYXRmb3JtID0gbmV3IGVudGl0aWVzLlBsYXRmb3JtKCk7XHJcbiAgcGxhdGZvcm0ucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgcGxhdGZvcm0uZnJpY3Rpb24gPSAwLjg7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHBsYXRmb3JtKTtcclxuICBcclxuICB0aGlzLmJsb2NrcyA9IFtdO1xyXG4gIFxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xyXG4gICAgdmFyIGJsb2NrID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICAgIGJsb2NrLnBvc2l0aW9uLnkgPSAtNTAwICsgMzIgKiBpO1xyXG4gICAgYmxvY2sudmVsb2NpdHkueSA9IDI7XHJcbiAgICBibG9jay5tYXhTcGVlZCA9IDEwO1xyXG4gICAgYmxvY2subWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2spO1xyXG5cclxuICAgIHRoaXMuYmxvY2tzLnB1c2goYmxvY2spO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gLTIwMDtcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBiMCA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIHZhciBwMCA9IGIwLnBvc2l0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICB2YXIgYjEgPSB0aGlzLmJsb2Nrc1tqXTtcclxuICAgICAgICAgIHZhciBwMSA9IGIxLnBvc2l0aW9uO1xyXG4gICAgICAgICAgdmFyIGRpc3QgPSBnZW9tLlZlYzIuc3VidHJhY3QocDEsIHAwKS5nZXRNYWduaXR1ZGUoKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKGRpc3QgPCAyMykge1xyXG4gICAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgICAgXCIoT3ZlcmxhcHBpbmcpIERpc3RhbmNlIGZvdW5kIGJldHdlZW4gMiBvdmVybGFwcGluZyA9IFwiICsgZGlzdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgXCJObyBvYmplY3RzIG92ZXJsYXBwaW5nXCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICAzMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgdmFyIGdyYXZpdHkgPSBuZXcgZ2VvbS5WZWMyKDAsIDMpO1xyXG4gICAgICBcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBiID0gdGhpcy5ibG9ja3NbaV07XHJcbiAgICAgICAgYi5hZGRGb3JjZShncmF2aXR5KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMTQgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTE0Jyk7XHJcblxyXG52YXIgVGVzdFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gIFRlc3RTY2VuZUJhc2UuY2FsbChcclxuICAgIHRoaXMsXHJcbiAgICBjYW52YXMsXHJcbiAgICBcIkNvbGxpc2lvbjogMSBzdGF0aWMgKHJlc3Q9MC4wLCBmcmljPTAuOCksIDYgbm9uLXN0YXRpYyAtIE5vbi1zdGF0aWNzIGV2ZW50dWFsbHkgc3RhYmlsaXplIG9uIG90aGVyIG5vbi1zdGF0aWNzIGFuZCBkbyBub3Qgb3ZlcmxhcFwiLFxyXG4gICAgVGVzdFNjZW5lMTRcclxuICApO1xyXG4gIFxyXG4gIHZhciBwbGF0Zm9ybSA9IG5ldyBlbnRpdGllcy5QbGF0Zm9ybSgpO1xyXG4gIHBsYXRmb3JtLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHBsYXRmb3JtLmZyaWN0aW9uID0gMC44O1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChwbGF0Zm9ybSk7XHJcbiAgXHJcbiAgdGhpcy5ibG9ja3MgPSBbXTtcclxuICBcclxuICB2YXIgYmxvY2swID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICBibG9jazAucG9zaXRpb24ueCA9IC0xMi4xO1xyXG4gIGJsb2NrMC5wb3NpdGlvbi55ID0gLTIwMDtcclxuICBibG9jazAudmVsb2NpdHkueSA9IDI7XHJcbiAgYmxvY2swLm1heFNwZWVkID0gMTA7XHJcbiAgYmxvY2swLm1heEFjY2VsZXJhdGlvbiA9IDIwO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChibG9jazApO1xyXG4gIHRoaXMuYmxvY2tzLnB1c2goYmxvY2swKTtcclxuICBcclxuICB2YXIgYmxvY2sxID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICBibG9jazEucG9zaXRpb24ueCA9IDEyLjE7XHJcbiAgYmxvY2sxLnBvc2l0aW9uLnkgPSAtMjAwO1xyXG4gIGJsb2NrMS52ZWxvY2l0eS55ID0gMjtcclxuICBibG9jazEubWF4U3BlZWQgPSAxMDtcclxuICBibG9jazEubWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KGJsb2NrMSk7XHJcbiAgdGhpcy5ibG9ja3MucHVzaChibG9jazEpO1xyXG4gIFxyXG4gIHZhciBibG9jazIgPSBuZXcgZW50aXRpZXMuU21hbGxCbG9jaygpO1xyXG4gIGJsb2NrMi5wb3NpdGlvbi54ID0gMzYuMjtcclxuICBibG9jazIucG9zaXRpb24ueSA9IC0yMDA7XHJcbiAgYmxvY2syLnZlbG9jaXR5LnkgPSAyO1xyXG4gIGJsb2NrMi5tYXhTcGVlZCA9IDEwO1xyXG4gIGJsb2NrMi5tYXhBY2NlbGVyYXRpb24gPSAyMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2syKTtcclxuICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrMik7XHJcbiAgXHJcbiAgdmFyIGJsb2NrMyA9IG5ldyBlbnRpdGllcy5TbWFsbEJsb2NrKCk7XHJcbiAgYmxvY2szLnBvc2l0aW9uLnkgPSAtMjUwO1xyXG4gIGJsb2NrMy52ZWxvY2l0eS55ID0gMjtcclxuICBibG9jazMubWF4U3BlZWQgPSAxMDtcclxuICBibG9jazMubWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KGJsb2NrMyk7XHJcbiAgdGhpcy5ibG9ja3MucHVzaChibG9jazMpO1xyXG4gIFxyXG4gIHZhciBibG9jazQgPSBuZXcgZW50aXRpZXMuU21hbGxCbG9jaygpO1xyXG4gIGJsb2NrNC5wb3NpdGlvbi54ID0gMjQuMTtcclxuICBibG9jazQucG9zaXRpb24ueSA9IC0yNTA7XHJcbiAgYmxvY2s0LnZlbG9jaXR5LnkgPSAyO1xyXG4gIGJsb2NrNC5tYXhTcGVlZCA9IDEwO1xyXG4gIGJsb2NrNC5tYXhBY2NlbGVyYXRpb24gPSAyMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2s0KTtcclxuICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrNCk7XHJcbiAgXHJcbiAgdmFyIGJsb2NrNSA9IG5ldyBlbnRpdGllcy5TbWFsbEJsb2NrKCk7XHJcbiAgYmxvY2s1LnBvc2l0aW9uLnggPSAxMjtcclxuICBibG9jazUucG9zaXRpb24ueSA9IC0zMDA7XHJcbiAgYmxvY2s1LnZlbG9jaXR5LnkgPSAyO1xyXG4gIGJsb2NrNS5tYXhTcGVlZCA9IDEwO1xyXG4gIGJsb2NrNS5tYXhBY2NlbGVyYXRpb24gPSAyMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2s1KTtcclxuICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrNSk7XHJcbiAgXHJcbiAgdGhpcy5jYW1lcmEucG9zaXRpb24ueSA9IC0yMDA7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYjAgPSB0aGlzLmJsb2Nrc1tpXTtcclxuICAgICAgICB2YXIgcDAgPSBiMC5wb3NpdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgdmFyIGIxID0gdGhpcy5ibG9ja3Nbal07XHJcbiAgICAgICAgICB2YXIgcDEgPSBiMS5wb3NpdGlvbjtcclxuICAgICAgICAgIHZhciBkaXN0ID0gZ2VvbS5WZWMyLnN1YnRyYWN0KHAxLCBwMCkuZ2V0TWFnbml0dWRlKCk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChkaXN0IDwgMjMpIHtcclxuICAgICAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgICAgIFwiKE92ZXJsYXBwaW5nKSBEaXN0YW5jZSBmb3VuZCBiZXR3ZWVuIDIgb3ZlcmxhcHBpbmcgPSBcIiArIGRpc3RcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdmFyIGF2TWlkZGxlWSA9IChibG9jazMucG9zaXRpb24ueSArIGJsb2NrNC5wb3NpdGlvbi55KSAvIDI7XHJcbiAgICAgIHZhciBhdlRvcFkgICAgPSBibG9jazUucG9zaXRpb24ueTtcclxuICAgICAgdmFyIGF2Qm90dG9tWSA9XHJcbiAgICAgICAgICAoYmxvY2swLnBvc2l0aW9uLnkgKyBibG9jazEucG9zaXRpb24ueSArIGJsb2NrMi5wb3NpdGlvbi55KSAvIDM7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgZHkwID0gTWF0aC5hYnMoYXZCb3R0b21ZIC0gYmxvY2swLnBvc2l0aW9uLnkpO1xyXG4gICAgICB2YXIgZHkxID0gTWF0aC5hYnMoYXZCb3R0b21ZIC0gYmxvY2sxLnBvc2l0aW9uLnkpO1xyXG4gICAgICB2YXIgZHkyID0gTWF0aC5hYnMoYXZCb3R0b21ZIC0gYmxvY2syLnBvc2l0aW9uLnkpO1xyXG4gICAgICB2YXIgZHkzID0gTWF0aC5hYnMoYXZNaWRkbGVZIC0gYmxvY2szLnBvc2l0aW9uLnkpO1xyXG4gICAgICB2YXIgZHk0ID0gTWF0aC5hYnMoYXZNaWRkbGVZIC0gYmxvY2s0LnBvc2l0aW9uLnkpO1xyXG4gICAgICB2YXIgZHk1ID0gTWF0aC5hYnMoYXZUb3BZICAgIC0gYmxvY2s1LnBvc2l0aW9uLnkpO1xyXG4gICAgICB2YXIgZHgwID0gTWF0aC5hYnMoLTEyLjEgLSBibG9jazAucG9zaXRpb24ueCk7XHJcbiAgICAgIHZhciBkeDEgPSBNYXRoLmFicyggMTIuMSAtIGJsb2NrMS5wb3NpdGlvbi54KTtcclxuICAgICAgdmFyIGR4MiA9IE1hdGguYWJzKCAzNi4zIC0gYmxvY2syLnBvc2l0aW9uLngpO1xyXG4gICAgICB2YXIgZHgzID0gTWF0aC5hYnMoICAgIDAgLSBibG9jazMucG9zaXRpb24ueCk7XHJcbiAgICAgIHZhciBkeDQgPSBNYXRoLmFicyggMjQuMSAtIGJsb2NrNC5wb3NpdGlvbi54KTtcclxuICAgICAgdmFyIGR4NSA9IE1hdGguYWJzKCAgIDEyIC0gYmxvY2s1LnBvc2l0aW9uLngpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgRSA9IDEuNTtcclxuICAgICAgXHJcbiAgICAgIHZhciBkZXN0YWJpbGl6ZWQgPVxyXG4gICAgICAgICAgZHkwID4gRSB8fCBkeTEgPiBFIHx8IGR5MiA+IEUgfHwgZHkzID4gRSB8fCBkeTQgPiBFIHx8IGR5NSA+IEUgfHxcclxuICAgICAgICAgIGR4MCA+IEUgfHwgZHgxID4gRSB8fCBkeDIgPiBFIHx8IGR4MyA+IEUgfHwgZHg0ID4gRSB8fCBkeDUgPiBFO1xyXG4gICAgICBcclxuICAgICAgaWYgKGRlc3RhYmlsaXplZCkge1xyXG4gICAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICAgIFwiT2JqZWN0cyBkZXN0YWJpbGl6ZWRcIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vblRlc3RTdWNjZXNzKFxyXG4gICAgICAgICAgXCJObyBvYmplY3RzIG92ZXJsYXBwaW5nXCJcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgMzAwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIHZhciBncmF2aXR5ID0gbmV3IGdlb20uVmVjMigwLCAzKTtcclxuICAgICAgXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYiA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIGIuYWRkRm9yY2UoZ3Jhdml0eSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi8uLi9lbnRpdGllcycpO1xyXG5cclxudmFyIFRlc3RTY2VuZUJhc2UgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZUJhc2UnKTtcclxudmFyIFRlc3RTY2VuZTE1ID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUxNScpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDIgbm9uLXN0YXRpYyAocmVzdD0wLjAsIG1hc3M9MTAwLjAgJiAxMDAuMCkgLSAyIG9iamVjdHMgb2YgZXF1YWwgbWFzcyBhbmQgTk8gcmVzdGl0dXRpb24gZG8gTk9UIHJlZmxlY3Qgb2ZmIGVhY2ggb3RoZXJcIixcclxuICAgIFRlc3RTY2VuZTE1XHJcbiAgKTtcclxuICBcclxuICB0aGlzLmJsb2NrcyA9IFtdO1xyXG4gIFxyXG4gIHZhciBibG9jazAgPSBuZXcgZW50aXRpZXMuU21hbGxCbG9jaygpO1xyXG4gIGJsb2NrMC5tYXNzID0gMTAwO1xyXG4gIGJsb2NrMC5wb3NpdGlvbi54ID0gLTYwO1xyXG4gIGJsb2NrMC5wb3NpdGlvbi55ID0gLTEwMDtcclxuICBibG9jazAudmVsb2NpdHkueCA9IDEwO1xyXG4gIGJsb2NrMC52ZWxvY2l0eS55ID0gLTEwO1xyXG4gIGJsb2NrMC5hY2NlbGVyYXRpb24ueCA9IDE7XHJcbiAgYmxvY2swLm1heFNwZWVkID0gMTA7XHJcbiAgYmxvY2swLm1heEFjY2VsZXJhdGlvbiA9IDIwO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdChibG9jazApO1xyXG4gIHRoaXMuYmxvY2tzLnB1c2goYmxvY2swKTtcclxuICBcclxuICB2YXIgYmxvY2sxID0gbmV3IGVudGl0aWVzLlNtYWxsQmxvY2soKTtcclxuICBibG9jazEubWFzcyA9IDEwMDtcclxuICBibG9jazEucG9zaXRpb24ueCA9IDYwO1xyXG4gIGJsb2NrMS5wb3NpdGlvbi55ID0gLTExMDtcclxuICBibG9jazEudmVsb2NpdHkueCA9IC0xMDtcclxuICBibG9jazEudmVsb2NpdHkueSA9IC0xMDtcclxuICBibG9jazEuYWNjZWxlcmF0aW9uLnggPSAtMTtcclxuICBibG9jazEubWF4U3BlZWQgPSAxMDtcclxuICBibG9jazEubWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KGJsb2NrMSk7XHJcbiAgdGhpcy5ibG9ja3MucHVzaChibG9jazEpO1xyXG4gIFxyXG4gIHRoaXMudGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KFxyXG4gICAgKCkgPT4ge1xyXG4gICAgICB2YXIgdjAgPSBibG9jazAudmVsb2NpdHk7XHJcbiAgICAgIHZhciB2MSA9IGJsb2NrMS52ZWxvY2l0eTtcclxuICAgICAgdmFyIHhTcGVlZDAgPSBNYXRoLmFicyh2MC54KTtcclxuICAgICAgdmFyIHhTcGVlZDEgPSBNYXRoLmFicyh2MS54KTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IE1BWF9FUlJPUl9BTExPV0FOQ0UgPSAwLjAwMTtcclxuICAgICAgXHJcbiAgICAgIGlmICh4U3BlZWQwID4gTUFYX0VSUk9SX0FMTE9XQU5DRSB8fCB4U3BlZWQxID4gTUFYX0VSUk9SX0FMTE9XQU5DRSkge1xyXG4gICAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICAgIFwiT2JqZWN0cyBib3VuY2VkXCJcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICAgIFwiT2JqZWN0cyBkaWQgbm90IGJvdW5jZVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIDM1MFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYiA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIGIuYWNjZWxlcmF0aW9uLnkgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmVCYXNlID0gcmVxdWlyZSgnLi9UZXN0U2NlbmVCYXNlJyk7XHJcbnZhciBUZXN0U2NlbmUxNiA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTYnKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAyIG5vbi1zdGF0aWMgKHJlc3Q9MS4wLCBtYXNzPTEwMC4wICYgMTAwLjApIC0gMiBvYmplY3RzIG9mIGVxdWFsIG1hc3MgYW5kIHJlc3RpdHV0aW9uIERPIHJlZmxlY3Qgb2ZmIGVhY2ggb3RoZXJcIixcclxuICAgIFRlc3RTY2VuZTE2XHJcbiAgKTtcclxuICBcclxuICB0aGlzLmJsb2NrcyA9IFtdO1xyXG4gIFxyXG4gIHZhciBibG9jazAgPSBuZXcgZW50aXRpZXMuU21hbGxCbG9jaygpO1xyXG4gIGJsb2NrMC5tYXNzID0gMTAwO1xyXG4gIGJsb2NrMC5yZXN0aXR1dGlvbiA9IDEuMDtcclxuICBibG9jazAucG9zaXRpb24ueCA9IC02MDtcclxuICBibG9jazAucG9zaXRpb24ueSA9IC0xMDA7XHJcbiAgYmxvY2swLnZlbG9jaXR5LnggPSAxMDtcclxuICBibG9jazAudmVsb2NpdHkueSA9IC0xMDtcclxuICBibG9jazAuYWNjZWxlcmF0aW9uLnggPSAxO1xyXG4gIGJsb2NrMC5tYXhTcGVlZCA9IDEwO1xyXG4gIGJsb2NrMC5tYXhBY2NlbGVyYXRpb24gPSAyMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2swKTtcclxuICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrMCk7XHJcbiAgXHJcbiAgdmFyIGJsb2NrMSA9IG5ldyBlbnRpdGllcy5TbWFsbEJsb2NrKCk7XHJcbiAgYmxvY2sxLm1hc3MgPSAxMDA7XHJcbiAgYmxvY2sxLnJlc3RpdHV0aW9uID0gMS4wO1xyXG4gIGJsb2NrMS5wb3NpdGlvbi54ID0gNjA7XHJcbiAgYmxvY2sxLnBvc2l0aW9uLnkgPSAtMTEwO1xyXG4gIGJsb2NrMS52ZWxvY2l0eS54ID0gLTEwO1xyXG4gIGJsb2NrMS52ZWxvY2l0eS55ID0gLTEwO1xyXG4gIGJsb2NrMS5hY2NlbGVyYXRpb24ueCA9IC0xO1xyXG4gIGJsb2NrMS5tYXhTcGVlZCA9IDEwO1xyXG4gIGJsb2NrMS5tYXhBY2NlbGVyYXRpb24gPSAyMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2sxKTtcclxuICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrMSk7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHZhciB2MCA9IGJsb2NrMC52ZWxvY2l0eTtcclxuICAgICAgdmFyIHYxID0gYmxvY2sxLnZlbG9jaXR5O1xyXG4gICAgICB2YXIgeFNwZWVkMCA9IE1hdGguYWJzKHYwLngpO1xyXG4gICAgICB2YXIgeFNwZWVkMSA9IE1hdGguYWJzKHYxLngpO1xyXG4gICAgICB2YXIgZGlmZiA9IHhTcGVlZDAgLSB4U3BlZWQxO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgTUFYX0VSUk9SX0FMTE9XQU5DRSA9IDAuMDAxO1xyXG4gICAgICBcclxuICAgICAgaWYgKHhTcGVlZDAgPiBNQVhfRVJST1JfQUxMT1dBTkNFIHx8IHhTcGVlZDEgPiBNQVhfRVJST1JfQUxMT1dBTkNFKSB7XHJcbiAgICAgICAgaWYgKGRpZmYgPiBNQVhfRVJST1JfQUxMT1dBTkNFKSB7XHJcbiAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgIFwiT2JqZWN0cyBib3VuY2VkIHdpdGggZGlmZmVyZW50IHNwZWVkczogXCIgKyB2MC54ICsgXCIgJiBcIiArIHYxLnhcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICAgICAgXCJPYmplY3RzIGJvdW5jZWQgd2l0aCBlcXVhbCBzcGVlZHM6IFwiICsgdjAueCArIFwiICYgXCIgKyB2MS54XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICBcIk9iamVjdHMgZGlkIG5vdCBib3VuY2VcIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAzNTBcclxuICApO1xyXG59O1xyXG5cclxuVGVzdFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShUZXN0U2NlbmVCYXNlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGIgPSB0aGlzLmJsb2Nrc1tpXTtcclxuICAgICAgICBiLmFjY2VsZXJhdGlvbi55ID0gMTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMTcgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTE3Jyk7XHJcblxyXG52YXIgVGVzdFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gIFRlc3RTY2VuZUJhc2UuY2FsbChcclxuICAgIHRoaXMsXHJcbiAgICBjYW52YXMsXHJcbiAgICBcIkNvbGxpc2lvbjogMiBub24tc3RhdGljIChyZXN0PTEuMCwgbWFzcz0xLjAgJiAxMDAwLjApIC0gMiBvYmplY3RzIG9mIGRpZmZlcmVudCBtYXNzIGFuZCByZXN0aXR1dGlvbiBETyByZWZsZWN0IG9mZiBlYWNoIG90aGVyIC0tIEhlYXZpZXIgbW92ZXMgbGVzc1wiLFxyXG4gICAgVGVzdFNjZW5lMTdcclxuICApO1xyXG4gIFxyXG4gIHRoaXMuYmxvY2tzID0gW107XHJcbiAgXHJcbiAgdmFyIGJsb2NrMCA9IG5ldyBlbnRpdGllcy5TbWFsbEJsb2NrKCk7XHJcbiAgYmxvY2swLm1hc3MgPSAxO1xyXG4gIGJsb2NrMC5yZXN0aXR1dGlvbiA9IDEuMDtcclxuICBibG9jazAucG9zaXRpb24ueCA9IC02MDtcclxuICBibG9jazAucG9zaXRpb24ueSA9IC0xMDA7XHJcbiAgYmxvY2swLnZlbG9jaXR5LnggPSAxMDtcclxuICBibG9jazAudmVsb2NpdHkueSA9IC0xMDtcclxuICBibG9jazAuYWNjZWxlcmF0aW9uLnggPSAxO1xyXG4gIGJsb2NrMC5tYXhTcGVlZCA9IDEwO1xyXG4gIGJsb2NrMC5tYXhBY2NlbGVyYXRpb24gPSAyMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QoYmxvY2swKTtcclxuICB0aGlzLmJsb2Nrcy5wdXNoKGJsb2NrMCk7XHJcbiAgXHJcbiAgdmFyIGJsb2NrMSA9IG5ldyBlbnRpdGllcy5TbWFsbEJsb2NrKCk7XHJcbiAgYmxvY2sxLm1hc3MgPSAxMDAwO1xyXG4gIGJsb2NrMS5yZXN0aXR1dGlvbiA9IDEuMDtcclxuICBibG9jazEucG9zaXRpb24ueCA9IDYwO1xyXG4gIGJsb2NrMS5wb3NpdGlvbi55ID0gLTExMDtcclxuICBibG9jazEudmVsb2NpdHkueCA9IC0xMDtcclxuICBibG9jazEudmVsb2NpdHkueSA9IC0xMDtcclxuICBibG9jazEuYWNjZWxlcmF0aW9uLnggPSAtMTtcclxuICBibG9jazEubWF4U3BlZWQgPSAxMDtcclxuICBibG9jazEubWF4QWNjZWxlcmF0aW9uID0gMjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KGJsb2NrMSk7XHJcbiAgdGhpcy5ibG9ja3MucHVzaChibG9jazEpO1xyXG4gIFxyXG4gIHRoaXMudGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KFxyXG4gICAgKCkgPT4ge1xyXG4gICAgICB2YXIgdjAgPSBibG9jazAudmVsb2NpdHk7XHJcbiAgICAgIHZhciB2MSA9IGJsb2NrMS52ZWxvY2l0eTtcclxuICAgICAgdmFyIHhTcGVlZDAgPSBNYXRoLmFicyh2MC54KTtcclxuICAgICAgdmFyIHhTcGVlZDEgPSBNYXRoLmFicyh2MS54KTtcclxuICAgICAgdmFyIGRpZmYgPSB4U3BlZWQwIC0geFNwZWVkMTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IE1BWF9FUlJPUl9BTExPV0FOQ0UgPSAwLjAwMTtcclxuICAgICAgXHJcbiAgICAgIGlmICh4U3BlZWQwID4gTUFYX0VSUk9SX0FMTE9XQU5DRSB8fCB4U3BlZWQxID4gTUFYX0VSUk9SX0FMTE9XQU5DRSkge1xyXG4gICAgICAgIGlmIChkaWZmID4gTUFYX0VSUk9SX0FMTE9XQU5DRSkge1xyXG4gICAgICAgICAgLy8gSWYgeC1jb21wb25lbnQgb2YgdmVsb2NpdHkgaXMgb3Bwb3NpdGUsIHRoaXMgdGVzdCBmYWlsZWQgLS1cclxuICAgICAgICAgIC8vIHRoZXkgc2hvdWxkIGJlIGdvaW5nIHRoZSBzYW1lIGRpcmVjdGlvblxyXG4gICAgICAgICAgaWYgKHYwLnggKiB2MS54IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgICAgXCJPYmplY3RzIGJvdW5jZWQgd2l0aCBkaWZmZXJlbnQgc3BlZWRzIGluIG9wcG9zaXRlIGRpcmVjdGlvbnM6IFwiICsgdjAueCArIFwiICYgXCIgKyB2MS54XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICAgICAgXCJPYmplY3RzIGJvdW5jZWQgd2l0aCBkaWZmZXJlbnQgc3BlZWRzIGluIHRoZSBzYW1lIGRpcmVjdGlvbjogXCIgKyB2MC54ICsgXCIgJiBcIiArIHYxLnhcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgICBcIk9iamVjdHMgYm91bmNlZCB3aXRoIGVxdWFsIHNwZWVkczogXCIgKyB2MC54ICsgXCIgJiBcIiArIHYxLnhcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICAgIFwiT2JqZWN0cyBkaWQgbm90IGJvdW5jZVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIDMwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYiA9IHRoaXMuYmxvY2tzW2ldO1xyXG4gICAgICAgIGIuYWNjZWxlcmF0aW9uLnkgPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmVCYXNlID0gcmVxdWlyZSgnLi9UZXN0U2NlbmVCYXNlJyk7XHJcbnZhciBUZXN0U2NlbmUxOCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTgnKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAxIHN0YXRpYyAocmVzdD0wLjAsIGZyaWM9MC4wLCByb3RhdGlvbj1QSS82KSwgMSBub24tc3RhdGljIC0gTm9uLXN0YXRpYyBzbGlkZXMgZG93biBhbmdsZWQsIHN0YXRpYyBvYmplY3RcIixcclxuICAgIFRlc3RTY2VuZTE4XHJcbiAgKTtcclxuICBcclxuICB0aGlzLnBsYXRmb3JtID0gbmV3IGVudGl0aWVzLlBsYXRmb3JtKCk7XHJcbiAgdGhpcy5wbGF0Zm9ybS5yb3RhdGUoTWF0aC5QSSAvIDYpO1xyXG4gIHRoaXMucGxhdGZvcm0uZnJpY3Rpb24gPSAwO1xyXG4gIHRoaXMucGxhdGZvcm0ucmVzdGl0dXRpb24gPSAwO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXRmb3JtKTtcclxuICBcclxuICB0aGlzLmJsb2NrcyA9IFtdO1xyXG4gIFxyXG4gIHRoaXMuc3RvcmVIaXN0b3J5ID0gZmFsc2U7XHJcbiAgXHJcbiAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gIFxyXG4gIHZhciBCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGVudGl0aWVzLlNtYWxsQmxvY2suY2FsbCh0aGlzKTtcclxuICB9XHJcbiAgXHJcbiAgQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShlbnRpdGllcy5TbWFsbEJsb2NrLnByb3RvdHlwZSwge1xyXG4gICAgb25Db2xsaWRlOiB7XHJcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiAocGh5c09iamVjdCkge1xyXG4gICAgICAgIHRoYXQuc3RvcmVIaXN0b3J5ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIHRoaXMuYmxvY2swID0gbmV3IEJsb2NrKCk7XHJcbiAgdGhpcy5ibG9jazAucm90YXRlKE1hdGguUEkgLyA2KTtcclxuICB0aGlzLmJsb2NrMC5wb3NpdGlvbi55ID0gLTIwMDtcclxuICB0aGlzLmJsb2NrMC52ZWxvY2l0eS55ID0gMjtcclxuICB0aGlzLmJsb2NrMC5tYXhTcGVlZCA9IDEwO1xyXG4gIHRoaXMuYmxvY2swLm1heEFjY2VsZXJhdGlvbiA9IDIwO1xyXG4gIHRoaXMuYmxvY2tzLnB1c2godGhpcy5ibG9jazApO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLmJsb2NrMCk7XHJcbiAgXHJcbiAgdGhpcy5wcmV2UG9zaXRpb24gPSBuZXcgZ2VvbS5WZWMyKCk7XHJcbiAgXHJcbiAgdGhpcy5kaXNwbGFjZW1lbnRIaXN0b3J5ID0gW107XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHZhciBhdkFuZ2xlID0gMDtcclxuICAgICAgXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXNwbGFjZW1lbnRIaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYXZBbmdsZSArPSB0aGlzLmRpc3BsYWNlbWVudEhpc3RvcnlbaV0uZ2V0QW5nbGUoKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKHRoaXMuZGlzcGxhY2VtZW50SGlzdG9yeS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgYXZBbmdsZSAvPSB0aGlzLmRpc3BsYWNlbWVudEhpc3RvcnkubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBNQVhfRVJST1JfQUxMT1dBTkNFID0gMC4xO1xyXG4gICAgICBjb25zdCBBTkdMRSA9IE1hdGguUEkgLyA2O1xyXG4gICAgICBcclxuICAgICAgaWYgKGF2QW5nbGUgKyBNQVhfRVJST1JfQUxMT1dBTkNFID4gQU5HTEUgJiZcclxuICAgICAgICAgIGF2QW5nbGUgLSBNQVhfRVJST1JfQUxMT1dBTkNFIDwgQU5HTEUpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICBcIk9iamVjdCdzIGRpc3BsYWNlbWVudCBhbmdsZSAoXCIgKyBhdkFuZ2xlICsgXCIpIGlzIGNsb3NlIHRvIHBsYXRmb3JtJ3Mgcm90YXRpb24gKFwiICsgKE1hdGguUEkgLyA2KSArIFwiKVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICBcIk9iamVjdCdzIGRpc3BsYWNlbWVudCBhbmdsZSAoXCIgKyBhdkFuZ2xlICsgXCIpIGlzIG5vdCBjbG9zZSB0byBwbGF0Zm9ybSdzIHJvdGF0aW9uIChcIiArIChNYXRoLlBJIC8gNikgKyBcIilcIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAxMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBiID0gdGhpcy5ibG9ja3NbaV07XHJcbiAgICAgICAgYi5hY2NlbGVyYXRpb24ueSA9IDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMucHJldlBvc2l0aW9uID0gdGhpcy5ibG9jazAucG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgXHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIGlmICh0aGlzLnN0b3JlSGlzdG9yeSkge1xyXG4gICAgICAgIHZhciBkaXNwbGFjZW1lbnQgPSBnZW9tLlZlYzIuc3VidHJhY3QoXHJcbiAgICAgICAgICB0aGlzLmJsb2NrMC5wb3NpdGlvbixcclxuICAgICAgICAgIHRoaXMucHJldlBvc2l0aW9uXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLmRpc3BsYWNlbWVudEhpc3RvcnkucHVzaChkaXNwbGFjZW1lbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmVCYXNlID0gcmVxdWlyZSgnLi9UZXN0U2NlbmVCYXNlJyk7XHJcbnZhciBUZXN0U2NlbmUxOSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTknKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAxIHN0YXRpYyAocmVzdD0xLjAsIGZyaWM9MC44KSwgMSBub24tc3RhdGljIChyb3RhdGlvbj0tUEkvNCkgLSBOb24tc3RhdGljIHJpY29jaGV0cyAoZnJvbSAtUEkvNCB0byAzKlBJLzQpXCIsXHJcbiAgICBUZXN0U2NlbmUxOVxyXG4gICk7XHJcbiAgXHJcbiAgdmFyIHdhbGwgPSBuZXcgZW50aXRpZXMuV2FsbCgpO1xyXG4gIHdhbGwucmVzdGl0dXRpb24gPSAxLjA7XHJcbiAgd2FsbC5mcmljdGlvbiA9IDAuODtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdGhpcy5hcnJvdyA9IG5ldyBlbnRpdGllcy5BcnJvd1JpY29jaGV0KCk7XHJcbiAgdGhpcy5hcnJvdy5jdXN0b21EYXRhLmFsbGlhbmNlID0gMDtcclxuICB0aGlzLmFycm93Lm1heFNwZWVkID0gMTA7XHJcbiAgdGhpcy5hcnJvdy5wb3NpdGlvbi54ID0gLTcwO1xyXG4gIHRoaXMuYXJyb3cucG9zaXRpb24ueSA9IC0zMDtcclxuICBcclxuICB0aGlzLmFycm93LnJvdGF0ZShNYXRoLlBJICogMC4yNSk7XHJcbiAgXHJcbiAgdmFyIGRpcmVjdGlvbiA9IHRoaXMuYXJyb3cuZm9yd2FyZC5jbG9uZSgpO1xyXG4gIFxyXG4gIHRoaXMuYXJyb3cudmVsb2NpdHkuX3ggPSBkaXJlY3Rpb24uX3ggKiAxMDtcclxuICB0aGlzLmFycm93LnZlbG9jaXR5Ll95ID0gZGlyZWN0aW9uLl95ICogMTA7XHJcbiAgXHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMuYXJyb3csIDIpO1xyXG4gIFxyXG4gIHRoaXMudGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KFxyXG4gICAgKCkgPT4ge1xyXG4gICAgICB2YXIgZm9yd2FyZCA9IHRoaXMuYXJyb3cuZm9yd2FyZDtcclxuICAgICAgdmFyIGFuZ2xlID0gZm9yd2FyZC5nZXRBbmdsZSgpO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgTUFYX0VSUk9SX0FMTE9XQU5DRSA9IDAuMDE7XHJcbiAgICAgIGNvbnN0IEVYUEVDVEVEID0gMyAqIE1hdGguUEkgLyA0O1xyXG4gICAgICBcclxuICAgICAgaWYgKGFuZ2xlIC0gTUFYX0VSUk9SX0FMTE9XQU5DRSA8PSBFWFBFQ1RFRCAmJlxyXG4gICAgICAgICAgYW5nbGUgKyBNQVhfRVJST1JfQUxMT1dBTkNFID49IEVYUEVDVEVEKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vblRlc3RTdWNjZXNzKFxyXG4gICAgICAgICAgXCIoVGltZW91dCkgUmljb2NoZXQgYW5nbGUgZXhwZWN0ZWQ6IFwiICsgRVhQRUNURUQgKyBcIiwgR290OiBcIiArIGFuZ2xlXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICBcIihUaW1lb3V0KSBSaWNvY2hldCBhbmdsZSBleHBlY3RlZDogXCIgKyBFWFBFQ1RFRCArIFwiLCBHb3Q6IFwiICsgYW5nbGVcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgMTAwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi8uLi9lbnRpdGllcycpO1xyXG5cclxudmFyIFRlc3RTY2VuZUJhc2UgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZUJhc2UnKTtcclxudmFyIFRlc3RTY2VuZTIwID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUyMCcpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDEgc3RhdGljIChyZXN0PTEuMCwgZnJpYz0wLjgpLCAxIG5vbi1zdGF0aWMgKHJvdGF0aW9uPS1QSS8zKSAtIE5vbi1zdGF0aWMgcmljb2NoZXRzIChmcm9tIC1QSS8zIHRvIDIqUEkvMylcIixcclxuICAgIFRlc3RTY2VuZTIwXHJcbiAgKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDEuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC44O1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh3YWxsKTtcclxuICBcclxuICB0aGlzLmFycm93ID0gbmV3IGVudGl0aWVzLkFycm93Umljb2NoZXQoKTtcclxuICB0aGlzLmFycm93LmN1c3RvbURhdGEuYWxsaWFuY2UgPSAwO1xyXG4gIHRoaXMuYXJyb3cubWF4U3BlZWQgPSAxNTtcclxuICB0aGlzLmFycm93LnBvc2l0aW9uLnggPSAtNzA7XHJcbiAgdGhpcy5hcnJvdy5wb3NpdGlvbi55ID0gLTQwO1xyXG4gIFxyXG4gIHRoaXMuYXJyb3cucm90YXRlKE1hdGguUEkgLyAzKTtcclxuICBcclxuICB2YXIgZGlyZWN0aW9uID0gdGhpcy5hcnJvdy5mb3J3YXJkLmNsb25lKCk7XHJcbiAgXHJcbiAgdGhpcy5hcnJvdy52ZWxvY2l0eS5feCA9IGRpcmVjdGlvbi5feCAqIDE1O1xyXG4gIHRoaXMuYXJyb3cudmVsb2NpdHkuX3kgPSBkaXJlY3Rpb24uX3kgKiAxNTtcclxuICBcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5hcnJvdywgMik7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHZhciBmb3J3YXJkID0gdGhpcy5hcnJvdy5mb3J3YXJkO1xyXG4gICAgICB2YXIgYW5nbGUgPSBmb3J3YXJkLmdldEFuZ2xlKCk7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBNQVhfRVJST1JfQUxMT1dBTkNFID0gMC4wMTtcclxuICAgICAgY29uc3QgRVhQRUNURUQgPSAyICogTWF0aC5QSSAvIDM7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoYW5nbGUgLSBNQVhfRVJST1JfQUxMT1dBTkNFIDw9IEVYUEVDVEVEICYmXHJcbiAgICAgICAgICBhbmdsZSArIE1BWF9FUlJPUl9BTExPV0FOQ0UgPj0gRVhQRUNURUQpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICBcIihUaW1lb3V0KSBSaWNvY2hldCBhbmdsZSBleHBlY3RlZDogXCIgKyBFWFBFQ1RFRCArIFwiLCBHb3Q6IFwiICsgYW5nbGVcclxuICAgICAgICApO1xyXG4gICAgICAgIFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICAgIFwiKFRpbWVvdXQpIFJpY29jaGV0IGFuZ2xlIGV4cGVjdGVkOiBcIiArIEVYUEVDVEVEICsgXCIsIEdvdDogXCIgKyBhbmdsZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAxMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMyA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMycpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDIgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjgpLCAxIG5vbi1zdGF0aWMgLSBWZXJ0aWNhbCB2ZWxvY2l0eSBkb2VzIG5vdCBnYWluIGhvcml6b250YWwgY29tcG9uZW50IGZyb20gY29sbGlzaW9uXCIsXHJcbiAgICBUZXN0U2NlbmUzXHJcbiAgKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDAuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC44O1xyXG4gIHdhbGwucG9zaXRpb24ueCA9IC0zMjtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdmFyIHdhbGwgPSBuZXcgZW50aXRpZXMuV2FsbCgpO1xyXG4gIHdhbGwucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgd2FsbC5mcmljdGlvbiA9IDAuODtcclxuICB3YWxsLnBvc2l0aW9uLnggPSAzMjtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgZW50aXRpZXMuUGxheWVyKCk7XHJcbiAgdGhpcy5wbGF5ZXIubWF4U3BlZWQgPSA1O1xyXG4gIHRoaXMucGxheWVyLm1heEFjY2VsZXJhdGlvbiA9IDEwO1xyXG4gIHRoaXMucGxheWVyLnBvc2l0aW9uLnkgPSA4MDtcclxuICB0aGlzLnBsYXllci52ZWxvY2l0eS55ID0gLTU7XHJcbiAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnkgPSAtMTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG4gIFxyXG4gIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHZhciB2ZWxvY2l0eSA9IHRoaXMucGxheWVyLnZlbG9jaXR5O1xyXG4gICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgXCIoVGltZW91dCkgVmVsb2NpdHk6IHtcIiArIHZlbG9jaXR5LnggKyBcIiwgXCIgKyB2ZWxvY2l0eS55ICsgXCJ9XCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICA1MDBcclxuICApO1xyXG59O1xyXG5cclxuVGVzdFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShUZXN0U2NlbmVCYXNlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgY29sbGlzaW9uRGlzcGxhY2VtZW50ID0gdGhpcy5wbGF5ZXIuY29sbGlzaW9uRGlzcGxhY2VtZW50U3VtO1xyXG4gICAgICBcclxuICAgICAgaWYgKHRoaXMucGxheWVyLmNvbGxpc2lvbkRpc3BsYWNlbWVudFN1bS5nZXRNYWduaXR1ZGVTcXVhcmVkKCkgPiAwKSB7XHJcbiAgICAgICAgdmFyIHZlbG9jaXR5ID0gdGhpcy5wbGF5ZXIudmVsb2NpdHk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKE1hdGguYWJzKHZlbG9jaXR5LngpID49IDAuMDAwMSkge1xyXG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgICBcIlZlbG9jaXR5OiB7XCIgKyB2ZWxvY2l0eS54ICsgXCIsIFwiICsgdmVsb2NpdHkueSArIFwifVwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICAgIFwiVmVsb2NpdHk6IHtcIiArIHZlbG9jaXR5LnggKyBcIiwgXCIgKyB2ZWxvY2l0eS55ICsgXCJ9XCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHtQbGF5ZXIsIEVuZW15fSA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcbnZhciB7U3RlZXJ9ICAgICAgICAgPSByZXF1aXJlKCcuLi8uLi91dGlsJyk7XHJcbnZhciBUZXN0U2NlbmVCYXNlICAgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZUJhc2UnKTtcclxudmFyIFRlc3RTY2VuZTIxID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUyMScpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJTdGVlcmluZyBmb3JjZTogQmFzaWMgZW5lbXkgc2VlayBpbXBsZW1lbnRhdGlvbiB0b3dhcmRzIHBsYXllci5cIixcclxuICAgIFRlc3RTY2VuZTIxXHJcbiAgKTtcclxuICBcclxuICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoKTtcclxuICB0aGlzLmVuZW15ID0gbmV3IEVuZW15KHRoaXMucGxheWVyLCB0aGlzLl9xdWFkdHJlZSk7XHJcbiAgdGhpcy5lbmVteS5tYXhTcGVlZCA9IDU7XHJcbiAgdGhpcy5lbmVteS5tYXhBY2NlbGVyYXRpb24gPSAxO1xyXG4gIHRoaXMuZW5lbXkucm90YXRlKC1NYXRoLlBJKTtcclxuICBcclxuICB0aGlzLnBsYXllci5wb3NpdGlvbi54ID0gMzAwO1xyXG4gIFxyXG4gIHRoaXMuZW5lbXkucG9zaXRpb24ueSA9IDIwMDtcclxuICB0aGlzLmVuZW15LnZlbG9jaXR5LnkgPSAtNTtcclxuICBcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIpO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLmVuZW15KTtcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZW5lbXkucG9zaXRpb24ueCAhPT0gMCAmJiB0aGlzLmVuZW15LnBvc2l0aW9uLnkgIT09IDIwMCkgeyAgICAgIFxyXG4gICAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICAgIFwiRW5lbXkgc291Z2h0IHBsYXllci5cIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgXCJFbmVteSBkaWQgbm90IHNlZWsgcGxheWVyL2RpZCBub3QgbW92ZS5cIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAyMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgY29uc3QgU0VFS19XRUlHSFQgPSAwLjE7XHJcbiAgICAgIGxldCBzZWVrU3RlZXJGb3JjZSA9IFN0ZWVyLnNlZWsodGhpcy5lbmVteSwgdGhpcy5wbGF5ZXIpO1xyXG4gICAgICBzZWVrU3RlZXJGb3JjZS5tdWx0aXBseShTRUVLX1dFSUdIVCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmVuZW15LmFkZEZvcmNlKHNlZWtTdGVlckZvcmNlKTtcclxuICAgICAgXHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIge0Fycm93Umljb2NoZXQsIFdhbGx9ID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxudmFyIFRlc3RTY2VuZUJhc2UgICA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMjIgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTIyJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gIFRlc3RTY2VuZUJhc2UuY2FsbChcclxuICAgIHRoaXMsXHJcbiAgICBjYW52YXMsXHJcbiAgICBcIkNvbGxpc2lvbjogMSBzdGF0aWMgKHJlc3Q9MC4wLCBmcmljPTAuOCksIDEgbm9uLXN0YXRpYyAtIENvbGxpc2lvbiBhZ2FpbnN0IG11bHRpcGxlIGVkZ2VzIHNob3VsZCByZXNvbHZlIHdpdGggdGhlIGNvcnJlY3QgZWRnZVwiLFxyXG4gICAgVGVzdFNjZW5lMjJcclxuICApO1xyXG4gIFxyXG4gIHRoaXMud2FsbCA9IG5ldyBXYWxsKCk7XHJcbiAgdGhpcy53YWxsLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHRoaXMud2FsbC5mcmljdGlvbiA9IDAuODtcclxuICBcclxuICB0aGlzLndhbGwyID0gbmV3IFdhbGwoKTtcclxuICB0aGlzLndhbGwyLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHRoaXMud2FsbDIuZnJpY3Rpb24gPSAwLjg7XHJcbiAgdGhpcy53YWxsMi5wb3NpdGlvbi54ID0gNjQ7XHJcbiAgXHJcbiAgdGhpcy5hcnJvdyA9IG5ldyBBcnJvd1JpY29jaGV0KCk7XHJcbiAgdGhpcy5hcnJvdy5jdXN0b21EYXRhLmFsbGlhbmNlID0gMDtcclxuICB0aGlzLmFycm93Lm1heFNwZWVkID0gMTU7XHJcbiAgdGhpcy5hcnJvdy5wb3NpdGlvbi54ID0gMzM7XHJcbiAgdGhpcy5hcnJvdy5wb3NpdGlvbi55ID0gMTAwO1xyXG4gIHRoaXMuYXJyb3cucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxuICB0aGlzLmFycm93LnZlbG9jaXR5LnkgPSAtMTU7XHJcbiAgXHJcbiAgdmFyIHN0YXJ0UG9zID0gdGhpcy5hcnJvdy5wb3NpdGlvbi5jbG9uZSgpO1xyXG4gIFxyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLndhbGwpO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLndhbGwyKTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5hcnJvdyk7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmFycm93LnBvc2l0aW9uLnkgPiB0aGlzLndhbGwueSAmJiB0aGlzLmFycm93LnZlbG9jaXR5LnkgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5vblRlc3RTdWNjZXNzKFxyXG4gICAgICAgICAgXCJSZWZsZWN0ZWQgcHJvcGVybHlcIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgXCJGYWlsZWQgdG8gcmVmbGVjdFwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIDUwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIge0Fycm93Umljb2NoZXQsIFdhbGx9ID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxudmFyIFRlc3RTY2VuZUJhc2UgICA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDEgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjgpLCAxIG5vbi1zdGF0aWMgKHJvdGF0aW9uPVBJLzQpIC0gQ29sbGlzaW9uIGFnYWluc3QgbXVsdGlwbGUgZWRnZXMgc2hvdWxkIHJlc29sdmUgd2l0aCB0aGUgY29ycmVjdCBlZGdlXCJcclxuICApO1xyXG4gIFxyXG4gIHRoaXMud2FsbCA9IG5ldyBXYWxsKCk7XHJcbiAgdGhpcy53YWxsLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHRoaXMud2FsbC5mcmljdGlvbiA9IDAuODtcclxuICBcclxuICB0aGlzLndhbGwyID0gbmV3IFdhbGwoKTtcclxuICB0aGlzLndhbGwyLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHRoaXMud2FsbDIuZnJpY3Rpb24gPSAwLjg7XHJcbiAgdGhpcy53YWxsMi5wb3NpdGlvbi54ID0gNjQ7XHJcbiAgXHJcbiAgdmFyIGFycm93cyA9IFtdO1xyXG4gIFxyXG4gIHZhciBzdGFydFBvcyA9IG5ldyBnZW9tLlZlYzIoLTI5LjUsIDk2KTtcclxuICBcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IDk7IGkrKykge1xyXG4gICAgdmFyIGFycm93ID0gbmV3IEFycm93Umljb2NoZXQoKTtcclxuICAgIGFycm93LmN1c3RvbURhdGEuYWxsaWFuY2UgPSAwO1xyXG4gICAgYXJyb3cubWF4U3BlZWQgPSAxNTtcclxuICAgIGFycm93LnJvdGF0ZSgtTWF0aC5QSSAqIDAuMjQ5OSk7XHJcbiAgICBhcnJvdy5wb3NpdGlvbi54ID0gc3RhcnRQb3MueCArIGkgKiAwLjI1O1xyXG4gICAgYXJyb3cucG9zaXRpb24ueSA9IHN0YXJ0UG9zLnk7XHJcbiAgICBhcnJvdy52ZWxvY2l0eSA9IGFycm93LmZvcndhcmQuY2xvbmUoKS5tdWx0aXBseSgxNSk7XHJcbiAgICBhcnJvd3MucHVzaChhcnJvdyk7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoYXJyb3cpO1xyXG4gIH1cclxuICBcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy53YWxsKTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy53YWxsMik7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHZhciBwYXNzZWQgPSB0cnVlO1xyXG4gICAgICBcclxuICAgICAgZm9yIChsZXQgYSBvZiBhcnJvd3MpIHtcclxuICAgICAgICBpZiAoIShhLnBvc2l0aW9uLnkgPiB0aGlzLndhbGwueSAmJiBhLnZlbG9jaXR5LnkgPiAtMC4wMDAxICYmXHJcbiAgICAgICAgICAgICAgYS5wb3NpdGlvbi54ID4gc3RhcnRQb3MueCAgJiYgYS52ZWxvY2l0eS54ID4gLTAuMDAwMSkpIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgcGFzc2VkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmIChwYXNzZWQpIHtcclxuICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICBcIlJlZmxlY3RlZCBwcm9wZXJseVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICBcIlJlZmxlY3RlZCBhZ2FpbnN0IHdyb25nIGVkZ2VcIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAzMDBcclxuICApO1xyXG59O1xyXG5cclxuVGVzdFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShUZXN0U2NlbmVCYXNlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmVCYXNlID0gcmVxdWlyZSgnLi9UZXN0U2NlbmVCYXNlJyk7XHJcbnZhciBUZXN0U2NlbmU0ID0gcmVxdWlyZSgnLi9UZXN0U2NlbmU0Jyk7XHJcblxyXG52YXIgVGVzdFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gIFRlc3RTY2VuZUJhc2UuY2FsbChcclxuICAgIHRoaXMsXHJcbiAgICBjYW52YXMsXHJcbiAgICBcIkNvbGxpc2lvbjogMSBzdGF0aWMgKHJlc3Q9MC4wLCBmcmljPTAuOCksIDEgbm9uLXN0YXRpYyAtIFVwLXJpZ2h0IHZlbG9jaXR5LCBuZXZlciBnb2VzIGxlZnQgb3IgZG93blwiLFxyXG4gICAgVGVzdFNjZW5lNFxyXG4gICk7XHJcbiAgXHJcbiAgdmFyIHdhbGwgPSBuZXcgZW50aXRpZXMuV2FsbCgpO1xyXG4gIHdhbGwucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgd2FsbC5mcmljdGlvbiA9IDAuODtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgZW50aXRpZXMuUGxheWVyKCk7XHJcbiAgdGhpcy5wbGF5ZXIucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgdGhpcy5wbGF5ZXIubWF4U3BlZWQgPSA1O1xyXG4gIHRoaXMucGxheWVyLm1heEFjY2VsZXJhdGlvbiA9IDEwO1xyXG4gIHRoaXMucGxheWVyLnBvc2l0aW9uLnggPSAtMTA7XHJcbiAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueSA9IDgwO1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnggPSAyO1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnkgPSAtMjtcclxuICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueCA9IDE7XHJcbiAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnkgPSAtMTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG4gIFxyXG4gIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbiAgXHJcbiAgdGhpcy52ZWxvY2l0eUhpc3RvcnkgPSBbXTtcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgdmFyIG1zZyA9IFwiVmVsb2NpdGllczpcIjtcclxuICAgICAgdmFyIHJpZ2h0ID0gbmV3IGdlb20uVmVjMigxLCAwKTtcclxuICAgICAgdmFyIGRvd24gPSBuZXcgZ2VvbS5WZWMyKDAsIDEpO1xyXG4gICAgICB2YXIgbGVmdFByb2ogPSBJbmZpbml0eTtcclxuICAgICAgdmFyIGxlZnRNb3N0ID0gdGhpcy52ZWxvY2l0eUhpc3RvcnlbMF07XHJcbiAgICAgIHZhciBkb3duUHJvaiA9IC1JbmZpbml0eTtcclxuICAgICAgdmFyIGRvd25Nb3N0ID0gdGhpcy52ZWxvY2l0eUhpc3RvcnlbMF07XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVsb2NpdHlIaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHYgPSB0aGlzLnZlbG9jaXR5SGlzdG9yeVtpXTtcclxuICAgICAgICB2YXIgcHJvak9uUmlnaHQgPSBnZW9tLlZlYzIuZG90KHYsIHJpZ2h0KTtcclxuICAgICAgICB2YXIgcHJvak9uRG93biA9IGdlb20uVmVjMi5kb3QodiwgZG93bik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHByb2pPblJpZ2h0IDwgbGVmdFByb2opIHtcclxuICAgICAgICAgIGxlZnRNb3N0ID0gdjtcclxuICAgICAgICAgIGxlZnRQcm9qID0gcHJvak9uUmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9qT25Eb3duID4gZG93blByb2opIHtcclxuICAgICAgICAgIGRvd25Nb3N0ID0gdjtcclxuICAgICAgICAgIGRvd25Qcm9qID0gcHJvak9uRG93bjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICBcIihUaW1lb3V0KVxcblxcdFwiICtcclxuICAgICAgICBcIkxlZnQgTW9zdDoge1wiICsgbGVmdE1vc3QueCArIFwiLCBcIiArIGxlZnRNb3N0LnkgKyBcIn1cXG5cXHRcIiArXHJcbiAgICAgICAgXCJEb3duIE1vc3Q6IHtcIiArIGRvd25Nb3N0LnggKyBcIiwgXCIgKyBkb3duTW9zdC55ICsgXCJ9XCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICAxMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgdmFyIHZlbG9jaXR5ID0gdGhpcy5wbGF5ZXIudmVsb2NpdHk7XHJcblxyXG4gICAgICBpZiAodmVsb2NpdHkueCA8IC0wLjAwMDEgfHwgdmVsb2NpdHkueSA+IDAuMDAwMSkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICBcIlZlbG9jaXR5OiB7XCIgKyB2ZWxvY2l0eS54ICsgXCIsIFwiICsgdmVsb2NpdHkueSArIFwifVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy52ZWxvY2l0eUhpc3RvcnkucHVzaCh0aGlzLnBsYXllci52ZWxvY2l0eS5jbG9uZSgpKTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi8uLi9lbnRpdGllcycpO1xyXG5cclxudmFyIFRlc3RTY2VuZUJhc2UgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZUJhc2UnKTtcclxudmFyIFRlc3RTY2VuZTUgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTUnKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAxIHN0YXRpYyAocmVzdD0xLjAsIGZyaWM9MC44KSwgMSBub24tc3RhdGljIC0gVXAtcmlnaHQgdmVsb2NpdHksIHNob3VsZCBib3VuY2UgYW5kIGRlZmxlY3QgZG93blwiLFxyXG4gICAgVGVzdFNjZW5lNVxyXG4gICk7XHJcbiAgXHJcbiAgdmFyIHdhbGwgPSBuZXcgZW50aXRpZXMuV2FsbCgpO1xyXG4gIHdhbGwucmVzdGl0dXRpb24gPSAxLjA7XHJcbiAgd2FsbC5mcmljdGlvbiA9IDAuODtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgZW50aXRpZXMuUGxheWVyKCk7XHJcbiAgdGhpcy5wbGF5ZXIucmVzdGl0dXRpb24gPSAxLjA7XHJcbiAgdGhpcy5wbGF5ZXIubWF4U3BlZWQgPSA1O1xyXG4gIHRoaXMucGxheWVyLm1heEFjY2VsZXJhdGlvbiA9IDEwO1xyXG4gIHRoaXMucGxheWVyLnBvc2l0aW9uLnggPSAtNDA7XHJcbiAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueSA9IDcwO1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnggPSAyO1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnkgPSAtNTtcclxuICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueCA9IDE7XHJcbiAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnkgPSAtMTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG4gIFxyXG4gIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICBcIihUaW1lb3V0KSBOZXZlciBib3VuY2VkXCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICAxNTAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgdmFyIHZlbG9jaXR5ID0gdGhpcy5wbGF5ZXIudmVsb2NpdHk7XHJcblxyXG4gICAgICBpZiAodmVsb2NpdHkueSA+PSAwLjAwMSkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICBcIlZlbG9jaXR5OiB7XCIgKyB2ZWxvY2l0eS54ICsgXCIsIFwiICsgdmVsb2NpdHkueSArIFwifVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lNiA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lNicpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDIgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjAgJiAxLjApLCAxIG5vbi1zdGF0aWMgLSBVcC1yaWdodCB2ZWxvY2l0eSwgc2hvdWxkIGJlIHJlZHVjZWQgZnJvbSBmcmljdGlvbiBieSAybmQgc3RhdGljXCIsXHJcbiAgICBUZXN0U2NlbmU2XHJcbiAgKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5wb3NpdGlvbi54ID0gLTMyO1xyXG4gIHdhbGwucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgd2FsbC5mcmljdGlvbiA9IDAuMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdmFyIHdhbGwgPSBuZXcgZW50aXRpZXMuV2FsbCgpO1xyXG4gIHdhbGwucG9zaXRpb24ueCA9IDMyO1xyXG4gIHdhbGwucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgd2FsbC5mcmljdGlvbiA9IDEuMDtcclxuICB0aGlzLmFkZEdhbWVPYmplY3Qod2FsbCk7XHJcbiAgXHJcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgZW50aXRpZXMuUGxheWVyKCk7XHJcbiAgdGhpcy5wbGF5ZXIuZnJpY3Rpb24gPSAwO1xyXG4gIHRoaXMucGxheWVyLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHRoaXMucGxheWVyLm1heFNwZWVkID0gNTtcclxuICB0aGlzLnBsYXllci5tYXhBY2NlbGVyYXRpb24gPSAxMDtcclxuICB0aGlzLnBsYXllci5wb3NpdGlvbi54ID0gLTY0O1xyXG4gIHRoaXMucGxheWVyLnBvc2l0aW9uLnkgPSA0ODtcclxuICB0aGlzLnBsYXllci52ZWxvY2l0eS54ID0gMjtcclxuICB0aGlzLnBsYXllci52ZWxvY2l0eS55ID0gLTU7XHJcbiAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnggPSAxO1xyXG4gIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi55ID0gLTE7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMucGxheWVyLCAyKTtcclxuICBcclxuICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xyXG4gIFxyXG4gIHRoaXMudmVsb2NpdHlIaXN0b3J5Rmlyc3RIYWxmID0gW107XHJcbiAgdGhpcy52ZWxvY2l0eUhpc3RvcnlTZWNvbmRIYWxmID0gW107XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICBcIihUaW1lb3V0KSBOZXZlciByZWR1Y2VkIHNwZWVkXCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICAyMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgLy8gU2ltdWxhdGUgbW92aW5nIHVwLXJpZ2h0XHJcbiAgICAgIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi54ID0gMTtcclxuICAgICAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnkgPSAtMTtcclxuXHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIGlmICh0aGlzLnBsYXllci5wb3NpdGlvbi54ID49IDY0KSB7XHJcbiAgICAgICAgdmFyIHNwZWVkU3VtMCAgICAgPSAwO1xyXG4gICAgICAgIHZhciBzcGVlZEF2ZXJhZ2UwID0gMDtcclxuICAgICAgICB2YXIgc3BlZWRTdW0xICAgICA9IDA7XHJcbiAgICAgICAgdmFyIHNwZWVkQXZlcmFnZTEgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVsb2NpdHlIaXN0b3J5Rmlyc3RIYWxmLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgdjAgPSB0aGlzLnZlbG9jaXR5SGlzdG9yeUZpcnN0SGFsZltpXTtcclxuICAgICAgICAgIHNwZWVkU3VtMCArPSB2MC5nZXRNYWduaXR1ZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZlbG9jaXR5SGlzdG9yeVNlY29uZEhhbGYubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciB2MCA9IHRoaXMudmVsb2NpdHlIaXN0b3J5U2Vjb25kSGFsZltpXTtcclxuICAgICAgICAgIHNwZWVkU3VtMSArPSB2MC5nZXRNYWduaXR1ZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNwZWVkQXZlcmFnZTAgPSBzcGVlZFN1bTAgLyB0aGlzLnZlbG9jaXR5SGlzdG9yeUZpcnN0SGFsZi5sZW5ndGg7XHJcbiAgICAgICAgc3BlZWRBdmVyYWdlMSA9IHNwZWVkU3VtMSAvIHRoaXMudmVsb2NpdHlIaXN0b3J5U2Vjb25kSGFsZi5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChzcGVlZEF2ZXJhZ2UxIDwgc3BlZWRBdmVyYWdlMCkge1xyXG4gICAgICAgICAgdGhpcy5vblRlc3RTdWNjZXNzKFxyXG4gICAgICAgICAgICBcIlJlZHVjZWQgc3BlZWQ6IEZpcnN0IGhhbGYgPSBcIiArIHNwZWVkQXZlcmFnZTAgKyBcIiwgU2Vjb25kIGhhbGYgPSBcIiArIHNwZWVkQXZlcmFnZTFcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMub25UZXN0RmFpbChcclxuICAgICAgICAgICAgXCJOZXZlciByZWR1Y2VkIHNwZWVkOiBGaXJzdCBoYWxmID0gXCIgKyBzcGVlZEF2ZXJhZ2UwICsgXCIsIFNlY29uZCBoYWxmID0gXCIgKyBzcGVlZEF2ZXJhZ2UxXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXIucG9zaXRpb24ueCA8IDApIHtcclxuICAgICAgICAgIHRoaXMudmVsb2NpdHlIaXN0b3J5Rmlyc3RIYWxmLnB1c2godGhpcy5wbGF5ZXIudmVsb2NpdHkuY2xvbmUoKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMudmVsb2NpdHlIaXN0b3J5U2Vjb25kSGFsZi5wdXNoKHRoaXMucGxheWVyLnZlbG9jaXR5LmNsb25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lNyA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lNycpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDMgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjApLCAxIG5vbi1zdGF0aWMgLSBVcC1yaWdodCB2ZWxvY2l0eSwgc2hvdWxkIE5PVCBiZSByZWR1Y2VkIGZyb20gZnJpY3Rpb24gYnkgMm5kIG9yIDNyZCBzdGF0aWNcIixcclxuICAgIFRlc3RTY2VuZTdcclxuICApO1xyXG4gIFxyXG4gIHZhciB3YWxsID0gbmV3IGVudGl0aWVzLldhbGwoKTtcclxuICB3YWxsLnBvc2l0aW9uLnggPSAtMzI7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDAuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC4wO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh3YWxsKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5wb3NpdGlvbi54ID0gMzI7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDAuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC4wO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh3YWxsKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5wb3NpdGlvbi54ID0gOTY7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDAuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC4wO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh3YWxsKTtcclxuICBcclxuICB0aGlzLnBsYXllciA9IG5ldyBlbnRpdGllcy5QbGF5ZXIoKTtcclxuICB0aGlzLnBsYXllci5mcmljdGlvbiA9IDA7XHJcbiAgdGhpcy5wbGF5ZXIucmVzdGl0dXRpb24gPSAwLjA7XHJcbiAgdGhpcy5wbGF5ZXIubWF4U3BlZWQgPSA1O1xyXG4gIHRoaXMucGxheWVyLm1heEFjY2VsZXJhdGlvbiA9IDEwO1xyXG4gIHRoaXMucGxheWVyLnBvc2l0aW9uLnggPSAtNjQ7XHJcbiAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueSA9IDQ4O1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnggPSA1O1xyXG4gIHRoaXMucGxheWVyLnZlbG9jaXR5LnkgPSAtNTtcclxuICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueCA9IDE7XHJcbiAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnkgPSAtMTtcclxuICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG4gIFxyXG4gIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbiAgXHJcbiAgdGhpcy52ZWxvY2l0eUhpc3RvcnlGaXJzdCA9IFtdO1xyXG4gIHRoaXMudmVsb2NpdHlIaXN0b3J5U2Vjb25kID0gW107XHJcbiAgdGhpcy52ZWxvY2l0eUhpc3RvcnlUaGlyZCA9IFtdO1xyXG4gIFxyXG4gIHRoaXMudGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KFxyXG4gICAgKCkgPT4ge1xyXG4gICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgXCIoVGltZW91dCkgSW5jb25jbHVzaXZlXCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICAzMDAwXHJcbiAgKTtcclxufTtcclxuXHJcblRlc3RTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgLy8gU2ltdWxhdGUgbW92aW5nIHVwLXJpZ2h0XHJcbiAgICAgIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi54ID0gMTtcclxuICAgICAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLnkgPSAtMTtcclxuXHJcbiAgICAgIFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIGlmICh0aGlzLnBsYXllci5wb3NpdGlvbi54ID49IDEyOCkge1xyXG4gICAgICAgIHZhciBzcGVlZFN1bTAgICAgID0gMDtcclxuICAgICAgICB2YXIgc3BlZWRBdmVyYWdlMCA9IDA7XHJcbiAgICAgICAgdmFyIHNwZWVkU3VtMSAgICAgPSAwO1xyXG4gICAgICAgIHZhciBzcGVlZEF2ZXJhZ2UxID0gMDtcclxuICAgICAgICB2YXIgc3BlZWRTdW0yICAgICA9IDA7XHJcbiAgICAgICAgdmFyIHNwZWVkQXZlcmFnZTIgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVsb2NpdHlIaXN0b3J5Rmlyc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciB2MCA9IHRoaXMudmVsb2NpdHlIaXN0b3J5Rmlyc3RbaV07XHJcbiAgICAgICAgICBzcGVlZFN1bTAgKz0gdjAuZ2V0TWFnbml0dWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52ZWxvY2l0eUhpc3RvcnlTZWNvbmQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciB2MCA9IHRoaXMudmVsb2NpdHlIaXN0b3J5U2Vjb25kW2ldO1xyXG4gICAgICAgICAgc3BlZWRTdW0xICs9IHYwLmdldE1hZ25pdHVkZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVsb2NpdHlIaXN0b3J5VGhpcmQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciB2MCA9IHRoaXMudmVsb2NpdHlIaXN0b3J5VGhpcmRbaV07XHJcbiAgICAgICAgICBzcGVlZFN1bTIgKz0gdjAuZ2V0TWFnbml0dWRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzcGVlZEF2ZXJhZ2UwID0gc3BlZWRTdW0wIC8gdGhpcy52ZWxvY2l0eUhpc3RvcnlGaXJzdC5sZW5ndGg7XHJcbiAgICAgICAgc3BlZWRBdmVyYWdlMSA9IHNwZWVkU3VtMSAvIHRoaXMudmVsb2NpdHlIaXN0b3J5U2Vjb25kLmxlbmd0aDtcclxuICAgICAgICBzcGVlZEF2ZXJhZ2UyID0gc3BlZWRTdW0yIC8gdGhpcy52ZWxvY2l0eUhpc3RvcnlUaGlyZC5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGQwID0gc3BlZWRBdmVyYWdlMSAtIHNwZWVkQXZlcmFnZTA7XHJcbiAgICAgICAgdmFyIGQxID0gc3BlZWRBdmVyYWdlMiAtIHNwZWVkQXZlcmFnZTE7XHJcbiAgICAgICAgdmFyIGRTcGVlZEF2ZXJhZ2UgPSAoZDAgKyBkMSkgLyAyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBNQVhfRVJST1JfQUxMT1dBTkNFID0gMC4xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChNYXRoLmFicyhkU3BlZWRBdmVyYWdlKSA+PSBNQVhfRVJST1JfQUxMT1dBTkNFKSB7XHJcbiAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgIFwiUmVkdWNlZCBzcGVlZDogXCIgK1xyXG4gICAgICAgICAgICBzcGVlZEF2ZXJhZ2UwICsgXCIgXCIgKyBzcGVlZEF2ZXJhZ2UxICsgXCIgXCIgKyBzcGVlZEF2ZXJhZ2UyXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgICAgIFwiTmV2ZXIgcmVkdWNlZCBzcGVlZFwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXIucG9zaXRpb24ueCA8IDApIHtcclxuICAgICAgICAgIHRoaXMudmVsb2NpdHlIaXN0b3J5Rmlyc3QucHVzaCh0aGlzLnBsYXllci52ZWxvY2l0eS5jbG9uZSgpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGxheWVyLnBvc2l0aW9uLnggPCA2NCkge1xyXG4gICAgICAgICAgdGhpcy52ZWxvY2l0eUhpc3RvcnlTZWNvbmQucHVzaCh0aGlzLnBsYXllci52ZWxvY2l0eS5jbG9uZSgpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy52ZWxvY2l0eUhpc3RvcnlUaGlyZC5wdXNoKHRoaXMucGxheWVyLnZlbG9jaXR5LmNsb25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgPSB3ZmwuanF1ZXJ5O1xyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIGdlb20gICAgID0gd2ZsLmdlb207XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uLy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lOCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lOCcpO1xyXG5cclxudmFyIFRlc3RTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICBUZXN0U2NlbmVCYXNlLmNhbGwoXHJcbiAgICB0aGlzLFxyXG4gICAgY2FudmFzLFxyXG4gICAgXCJDb2xsaXNpb246IDMgc3RhdGljIChyZXN0PTAuMCwgZnJpYz0wLjApLCAxIG5vbi1zdGF0aWMgLSBVcC1yaWdodCB2ZWxvY2l0eSwgcG9zaXRpb24gc2hvdWxkIGFsd2F5cyBiZSBtb3ZpbmcgcmlnaHQgKGFuZCB1c3VhbGx5IHVwKVwiLFxyXG4gICAgVGVzdFNjZW5lOFxyXG4gICk7XHJcbiAgXHJcbiAgdmFyIHdhbGwgPSBuZXcgZW50aXRpZXMuV2FsbCgpO1xyXG4gIHdhbGwucG9zaXRpb24ueCA9IC0zMjtcclxuICB3YWxsLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHdhbGwuZnJpY3Rpb24gPSAwLjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHdhbGwpO1xyXG4gIFxyXG4gIHZhciB3YWxsID0gbmV3IGVudGl0aWVzLldhbGwoKTtcclxuICB3YWxsLnBvc2l0aW9uLnggPSAzMjtcclxuICB3YWxsLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHdhbGwuZnJpY3Rpb24gPSAwLjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHdhbGwpO1xyXG4gIFxyXG4gIHZhciB3YWxsID0gbmV3IGVudGl0aWVzLldhbGwoKTtcclxuICB3YWxsLnBvc2l0aW9uLnggPSA5NjtcclxuICB3YWxsLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gIHdhbGwuZnJpY3Rpb24gPSAwLjA7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHdhbGwpO1xyXG4gIFxyXG4gIHRoaXMucGxheWVyID0gbmV3IGVudGl0aWVzLlBsYXllcigpO1xyXG4gIHRoaXMucGxheWVyLmZyaWN0aW9uID0gMDtcclxuICB0aGlzLnBsYXllci5tYXhTcGVlZCA9IDU7XHJcbiAgdGhpcy5wbGF5ZXIubWF4QWNjZWxlcmF0aW9uID0gMTA7XHJcbiAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueCA9IC02NDtcclxuICB0aGlzLnBsYXllci5wb3NpdGlvbi55ID0gNDg7XHJcbiAgdGhpcy5wbGF5ZXIudmVsb2NpdHkueCA9IDI7XHJcbiAgdGhpcy5wbGF5ZXIudmVsb2NpdHkueSA9IC01O1xyXG4gIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi54ID0gMTtcclxuICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueSA9IC0xO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXllciwgMik7XHJcbiAgXHJcbiAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcclxuICBcclxuICB0aGlzLnByZXZTcGVlZCA9IDA7ICBcclxuICBcclxuICB0aGlzLnRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcclxuICAgICgpID0+IHtcclxuICAgICAgdGhpcy5vblRlc3RTdWNjZXNzKFxyXG4gICAgICAgIFwiTmV2ZXIgcHVzaGVkIGxlZnQgb3IgZG93blwiXHJcbiAgICAgICk7XHJcbiAgICB9LFxyXG4gICAgMTAwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIHZhciBwb3MwID0gdGhpcy5wbGF5ZXIucG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFNpbXVsYXRlIG1vdmluZyB1cC1yaWdodFxyXG4gICAgICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueCA9IDE7XHJcbiAgICAgIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi55ID0gLTE7XHJcblxyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgcG9zMSA9IHRoaXMucGxheWVyLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgIHZhciBkaXNwbGFjZW1lbnQgPSBwb3MxLnN1YnRyYWN0KHBvczApO1xyXG4gICAgICBcclxuICAgICAgY29uc3QgTUFYX0VSUk9SX0FMTE9XQU5DRSA9IDM7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoZGlzcGxhY2VtZW50LnggPD0gLU1BWF9FUlJPUl9BTExPV0FOQ0UgfHxcclxuICAgICAgICAgIGRpc3BsYWNlbWVudC55ID49IE1BWF9FUlJPUl9BTExPV0FOQ0UpIHtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgXCJEaXNwbGFjZW1lbnQ6IHtcIiArIGRpc3BsYWNlbWVudC54ICsgXCIsIFwiICsgZGlzcGxhY2VtZW50LnkgKyBcIn1cIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVzdFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyICQgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIFNjZW5lICAgID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBnZW9tICAgICA9IHdmbC5nZW9tO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi8uLi9lbnRpdGllcycpO1xyXG5cclxudmFyIFRlc3RTY2VuZUJhc2UgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZUJhc2UnKTtcclxudmFyIFRlc3RTY2VuZTkgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTknKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAxIHN0YXRpYyAocmVzdD0wLjAsIGZyaWM9MC44LCByb3RhdGlvbj1QSS80KSwgMSBub24tc3RhdGljIC0gQ2FuIG1vdmUgYWxvbmcgYW5nbGVkIGVkZ2VzXCIsXHJcbiAgICBUZXN0U2NlbmU5XHJcbiAgKTtcclxuICBcclxuICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgd2FsbC5yZXN0aXR1dGlvbiA9IDAuMDtcclxuICB3YWxsLmZyaWN0aW9uID0gMC44O1xyXG4gIHdhbGwucG9zaXRpb24ueCA9IC0zMjtcclxuICB3YWxsLnJvdGF0ZShNYXRoLlBJICogMC4yNSk7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHdhbGwpO1xyXG4gIFxyXG4gIHRoaXMucGxheWVyID0gbmV3IGVudGl0aWVzLlBsYXllcigpO1xyXG4gIHRoaXMucGxheWVyLm1heFNwZWVkID0gNTtcclxuICB0aGlzLnBsYXllci5tYXhBY2NlbGVyYXRpb24gPSAxMDtcclxuICB0aGlzLnBsYXllci5wb3NpdGlvbi55ID0gODA7XHJcbiAgdGhpcy5wbGF5ZXIudmVsb2NpdHkueSA9IC01O1xyXG4gIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi55ID0gLTU7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMucGxheWVyLCAyKTtcclxuICBcclxuICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xyXG4gIFxyXG4gIFxyXG4gIHRoaXMudmVsb2NpdHlIaXN0b3J5ID0gW107XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgdmFyIG1zZyA9IFwiVmVsb2NpdGllczpcIjtcclxuICAgICAgdmFyIHJpZ2h0ID0gbmV3IGdlb20uVmVjMigxLCAwKTtcclxuICAgICAgdmFyIGRvd24gPSBuZXcgZ2VvbS5WZWMyKDAsIDEpO1xyXG4gICAgICB2YXIgbGVmdFByb2ogPSBJbmZpbml0eTtcclxuICAgICAgdmFyIGxlZnRNb3N0ID0gdGhpcy52ZWxvY2l0eUhpc3RvcnlbMF07XHJcbiAgICAgIHZhciBkb3duUHJvaiA9IC1JbmZpbml0eTtcclxuICAgICAgdmFyIGRvd25Nb3N0ID0gdGhpcy52ZWxvY2l0eUhpc3RvcnlbMF07XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVsb2NpdHlIaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHYgPSB0aGlzLnZlbG9jaXR5SGlzdG9yeVtpXTtcclxuICAgICAgICB2YXIgcHJvak9uUmlnaHQgPSBnZW9tLlZlYzIuZG90KHYsIHJpZ2h0KTtcclxuICAgICAgICB2YXIgcHJvak9uRG93biA9IGdlb20uVmVjMi5kb3QodiwgZG93bik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHByb2pPblJpZ2h0IDwgbGVmdFByb2opIHtcclxuICAgICAgICAgIGxlZnRNb3N0ID0gdjtcclxuICAgICAgICAgIGxlZnRQcm9qID0gcHJvak9uUmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9qT25Eb3duID4gZG93blByb2opIHtcclxuICAgICAgICAgIGRvd25Nb3N0ID0gdjtcclxuICAgICAgICAgIGRvd25Qcm9qID0gcHJvak9uRG93bjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMub25UZXN0U3VjY2VzcyhcclxuICAgICAgICBcIkxlZnQgTW9zdDoge1wiICsgbGVmdE1vc3QueCArIFwiLCBcIiArIGxlZnRNb3N0LnkgKyBcIn1cXG5cXHRcIiArXHJcbiAgICAgICAgXCJEb3duIE1vc3Q6IHtcIiArIGRvd25Nb3N0LnggKyBcIiwgXCIgKyBkb3duTW9zdC55ICsgXCJ9XCJcclxuICAgICAgKTtcclxuICAgIH0sXHJcbiAgICA1MDBcclxuICApO1xyXG59O1xyXG5cclxuVGVzdFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShUZXN0U2NlbmVCYXNlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICB0aGlzLnBsYXllci5hY2NlbGVyYXRpb24ueSA9IC0xO1xyXG4gICAgICBcclxuICAgICAgVGVzdFNjZW5lQmFzZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgdmFyIHZlbG9jaXR5ID0gdGhpcy5wbGF5ZXIudmVsb2NpdHk7XHJcblxyXG4gICAgICBpZiAodmVsb2NpdHkueCA8IDAgfHwgdmVsb2NpdHkueSA+PSAwLjAwMDEpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgdGhpcy5vblRlc3RGYWlsKFxyXG4gICAgICAgICAgXCJWZWxvY2l0eToge1wiICsgdmVsb2NpdHkueCArIFwiLCBcIiArIHZlbG9jaXR5LnkgKyBcIn1cIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMudmVsb2NpdHlIaXN0b3J5LnB1c2godGhpcy5wbGF5ZXIudmVsb2NpdHkuY2xvbmUoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBTY2VuZSAgICA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgZ2VvbSAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBUZXN0U2NlbmVCYXNlID0gcmVxdWlyZSgnLi9UZXN0U2NlbmVCYXNlJyk7XHJcbnZhciBUZXN0U2NlbmUxMCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTAnKTtcclxuXHJcbnZhciBUZXN0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgVGVzdFNjZW5lQmFzZS5jYWxsKFxyXG4gICAgdGhpcyxcclxuICAgIGNhbnZhcyxcclxuICAgIFwiQ29sbGlzaW9uOiAzIHN0YXRpYyAocmVzdD0wLjAsIGZyaWM9MC44LCByb3RhdGlvbj1QSS80KSwgMSBub24tc3RhdGljIC0gQ2FuIG1vdmUgYWxvbmcgYWRqYWNlbnQgYW5nbGVkIGVkZ2VzXCIsXHJcbiAgICBUZXN0U2NlbmUxMFxyXG4gICk7XHJcbiAgXHJcbiAgdmFyIGFuZ2xlID0gTWF0aC5QSSAqIDAuMjU7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgIHZhciByYWRpdXMgPSA2NCAqIGk7XHJcbiAgICB2YXIgeCA9ICByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XHJcbiAgICB2YXIgeSA9IC1yYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XHJcbiAgICB2YXIgd2FsbCA9IG5ldyBlbnRpdGllcy5XYWxsKCk7XHJcbiAgICB3YWxsLnJlc3RpdHV0aW9uID0gMC4wO1xyXG4gICAgd2FsbC5mcmljdGlvbiA9IDAuODtcclxuICAgIHdhbGwucG9zaXRpb24ueCA9IHg7XHJcbiAgICB3YWxsLnBvc2l0aW9uLnkgPSB5O1xyXG4gICAgd2FsbC5yb3RhdGUoYW5nbGUpO1xyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KHdhbGwpO1xyXG4gIH1cclxuICBcclxuICB0aGlzLnBsYXllciA9IG5ldyBlbnRpdGllcy5QbGF5ZXIoKTtcclxuICB0aGlzLnBsYXllci5tYXhTcGVlZCA9IDU7XHJcbiAgdGhpcy5wbGF5ZXIubWF4QWNjZWxlcmF0aW9uID0gMTA7XHJcbiAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueCA9IDI1O1xyXG4gIHRoaXMucGxheWVyLnBvc2l0aW9uLnkgPSA3MDtcclxuICB0aGlzLnBsYXllci52ZWxvY2l0eS55ID0gLTU7XHJcbiAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMucGxheWVyLCAyKTtcclxuICBcclxuICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xyXG4gIFxyXG4gIFxyXG4gIHRoaXMudmVsb2NpdHlIaXN0b3J5ID0gW107XHJcbiAgXHJcbiAgdGhpcy50aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXHJcbiAgICAoKSA9PiB7XHJcbiAgICAgIHZhciBtc2cgPSBcIlZlbG9jaXRpZXM6XCI7XHJcbiAgICAgIHZhciByaWdodCA9IG5ldyBnZW9tLlZlYzIoMSwgMCk7XHJcbiAgICAgIHZhciBkb3duID0gbmV3IGdlb20uVmVjMigwLCAxKTtcclxuICAgICAgdmFyIGxlZnRQcm9qID0gSW5maW5pdHk7XHJcbiAgICAgIHZhciBsZWZ0TW9zdCA9IHRoaXMudmVsb2NpdHlIaXN0b3J5WzBdO1xyXG4gICAgICB2YXIgZG93blByb2ogPSAtSW5maW5pdHk7XHJcbiAgICAgIHZhciBkb3duTW9zdCA9IHRoaXMudmVsb2NpdHlIaXN0b3J5WzBdO1xyXG4gICAgICBcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZlbG9jaXR5SGlzdG9yeS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciB2ID0gdGhpcy52ZWxvY2l0eUhpc3RvcnlbaV07XHJcbiAgICAgICAgdmFyIHByb2pPblJpZ2h0ID0gZ2VvbS5WZWMyLmRvdCh2LCByaWdodCk7XHJcbiAgICAgICAgdmFyIHByb2pPbkRvd24gPSBnZW9tLlZlYzIuZG90KHYsIGRvd24pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChwcm9qT25SaWdodCA8IGxlZnRQcm9qKSB7XHJcbiAgICAgICAgICBsZWZ0TW9zdCA9IHY7XHJcbiAgICAgICAgICBsZWZ0UHJvaiA9IHByb2pPblJpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvak9uRG93biA+IGRvd25Qcm9qKSB7XHJcbiAgICAgICAgICBkb3duTW9zdCA9IHY7XHJcbiAgICAgICAgICBkb3duUHJvaiA9IHByb2pPbkRvd247XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLm9uVGVzdFN1Y2Nlc3MoXHJcbiAgICAgICAgXCJMZWZ0IE1vc3Q6IHtcIiArIGxlZnRNb3N0LnggKyBcIiwgXCIgKyBsZWZ0TW9zdC55ICsgXCJ9XFxuXFx0XCIgK1xyXG4gICAgICAgIFwiRG93biBNb3N0OiB7XCIgKyBkb3duTW9zdC54ICsgXCIsIFwiICsgZG93bk1vc3QueSArIFwifVwiXHJcbiAgICAgICk7XHJcbiAgICB9LFxyXG4gICAgMTYwMFxyXG4gICk7XHJcbn07XHJcblxyXG5UZXN0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFRlc3RTY2VuZUJhc2UucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIHRoaXMucGxheWVyLmFjY2VsZXJhdGlvbi55ID0gLTE7XHJcblxyXG4gICAgICBUZXN0U2NlbmVCYXNlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgY29sbGlzaW9uRGlzcGxhY2VtZW50ID0gdGhpcy5wbGF5ZXIuY29sbGlzaW9uRGlzcGxhY2VtZW50U3VtO1xyXG4gICAgICBcclxuICAgICAgaWYgKHRoaXMucGxheWVyLmNvbGxpc2lvbkRpc3BsYWNlbWVudFN1bS5nZXRNYWduaXR1ZGVTcXVhcmVkKCkgPiAwKSB7XHJcbiAgICAgICAgdmFyIHZlbG9jaXR5ID0gdGhpcy5wbGF5ZXIudmVsb2NpdHk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHZlbG9jaXR5LnggPCAwIHx8IHZlbG9jaXR5LnkgPj0gMC4wMDAxKSB7XHJcbiAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgICB0aGlzLm9uVGVzdEZhaWwoXHJcbiAgICAgICAgICAgIFwiVmVsb2NpdHk6IHtcIiArIHZlbG9jaXR5LnggKyBcIiwgXCIgKyB2ZWxvY2l0eS55ICsgXCJ9XCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnZlbG9jaXR5SGlzdG9yeS5wdXNoKHRoaXMucGxheWVyLnZlbG9jaXR5LmNsb25lKCkpO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXN0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgICAgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIEdhbWVTY2VuZSA9IHJlcXVpcmUoJy4uL0dhbWVTY2VuZScpO1xyXG5cclxudmFyIFRlc3RTY2VuZUJhc2UgPSBmdW5jdGlvbiAoXHJcbiAgY2FudmFzLCBuYW1lID0gXCJOTyBOQU1FIEVOVEVSRUQgRk9SIFRFU1RcIiwgbmV4dFNjZW5lKSB7XHJcbiAgXHJcbiAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gIFxyXG4gIHRoaXMubmFtZSA9IFwiPFwiICsgbmFtZSArIFwiPlwiO1xyXG4gIHRoaXMuX3VwY29taW5nU2NlbmUgPSBuZXh0U2NlbmU7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhUZXN0U2NlbmVCYXNlLCB7XHJcbiAgRlJJQ1RJT046IHtcclxuICAgIHZhbHVlOiAwLjlcclxuICB9LFxyXG4gIFxyXG4gIGhpZGVNZXNzYWdlczoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgVGVzdFNjZW5lQmFzZS5fbWVzc2FnZUlzVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgc2hvd01lc3NhZ2VzOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICBUZXN0U2NlbmVCYXNlLl9tZXNzYWdlSXNWaXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9tZXNzYWdlSXNWaXNpYmxlOiB7XHJcbiAgICB2YWx1ZTogdHJ1ZSxcclxuICAgIHdyaXRhYmxlOiB0cnVlXHJcbiAgfVxyXG59KTtcclxuXHJcblRlc3RTY2VuZUJhc2UucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIHZhciBnb3MgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBHYW1lT2JqZWN0IHVwZGF0ZSBsb29wXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ29zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGdvc1tpXS5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KGdvc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGdvc1tpXS5jdXN0b21EYXRhLmZvcmNlUmVtb3ZlKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3QoZ29zW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMuX2FwcGx5RnJpY3Rpb24oKTtcclxuICAgICAgXHJcbiAgICAgIFNjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBvblRlc3RTdWNjZXNzIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAobXNnKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgIFwiJWNQYXNzZWQ6IFwiICsgdGhpcy5uYW1lLFxyXG4gICAgICAgIFwiY29sb3I6IGdyZWVuO1wiXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChUZXN0U2NlbmVCYXNlLl9tZXNzYWdlSXNWaXNpYmxlICYmIG1zZykgY29uc29sZS5sb2coJ1xcdCcgKyBtc2cpO1xyXG4gICAgICBpZiAoIXRoaXMuX3VwY29taW5nU2NlbmUpXHJcbiAgICAgICAgdGhpcy5fdXBjb21pbmdTY2VuZSA9IEdhbWVTY2VuZTtcclxuICAgICAgdGhpcy5jaGFuZ2UobmV3IHRoaXMuX3VwY29taW5nU2NlbmUodGhpcy5jYW52YXMpKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIG9uVGVzdEZhaWwgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChtc2cpIHtcclxuICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgXCIlY1wiICsgXCJGYWlsZWQ6IFwiICsgdGhpcy5uYW1lLFxyXG4gICAgICAgIFwiY29sb3I6IHJlZDtcIlxyXG4gICAgICApO1xyXG4gICAgICBpZiAoVGVzdFNjZW5lQmFzZS5fbWVzc2FnZUlzVmlzaWJsZSAmJiBtc2cpIGNvbnNvbGUubG9nKCdcXHQnICsgbXNnKTtcclxuICAgICAgaWYgKCF0aGlzLl91cGNvbWluZ1NjZW5lKVxyXG4gICAgICAgIHRoaXMuX3VwY29taW5nU2NlbmUgPSBHYW1lU2NlbmU7XHJcbiAgICAgIHRoaXMuY2hhbmdlKG5ldyB0aGlzLl91cGNvbWluZ1NjZW5lKHRoaXMuY2FudmFzKSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfYXBwbHlGcmljdGlvbiA6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBnb3MgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGdvc1tpXS5hY2NlbGVyYXRpb24ubXVsdGlwbHkoVGVzdFNjZW5lQmFzZS5GUklDVElPTik7XHJcbiAgICAgICAgZ29zW2ldLnZlbG9jaXR5Lm11bHRpcGx5KFRlc3RTY2VuZUJhc2UuRlJJQ1RJT04pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTY2VuZUJhc2U7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVGVzdFNjZW5lQmFzZSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lQmFzZScpO1xyXG52YXIgVGVzdFNjZW5lMSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMScpO1xyXG52YXIgVGVzdFNjZW5lMiA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMicpO1xyXG52YXIgVGVzdFNjZW5lMyA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMycpO1xyXG52YXIgVGVzdFNjZW5lNCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lNCcpO1xyXG52YXIgVGVzdFNjZW5lNSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lNScpO1xyXG52YXIgVGVzdFNjZW5lNiA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lNicpO1xyXG52YXIgVGVzdFNjZW5lNyA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lNycpO1xyXG52YXIgVGVzdFNjZW5lOCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lOCcpO1xyXG52YXIgVGVzdFNjZW5lOSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lOScpO1xyXG52YXIgVGVzdFNjZW5lMTAgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTEwJyk7XHJcbnZhciBUZXN0U2NlbmUxMSA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTEnKTtcclxudmFyIFRlc3RTY2VuZTEyID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUxMicpO1xyXG52YXIgVGVzdFNjZW5lMTMgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTEzJyk7XHJcbnZhciBUZXN0U2NlbmUxNCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTQnKTtcclxudmFyIFRlc3RTY2VuZTE1ID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUxNScpO1xyXG52YXIgVGVzdFNjZW5lMTYgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTE2Jyk7XHJcbnZhciBUZXN0U2NlbmUxNyA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMTcnKTtcclxudmFyIFRlc3RTY2VuZTE4ID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUxOCcpO1xyXG52YXIgVGVzdFNjZW5lMTkgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTE5Jyk7XHJcbnZhciBUZXN0U2NlbmUyMCA9IHJlcXVpcmUoJy4vVGVzdFNjZW5lMjAnKTtcclxudmFyIFRlc3RTY2VuZTIxID0gcmVxdWlyZSgnLi9UZXN0U2NlbmUyMScpO1xyXG52YXIgVGVzdFNjZW5lMjIgPSByZXF1aXJlKCcuL1Rlc3RTY2VuZTIyJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBUZXN0U2NlbmVCYXNlOiBUZXN0U2NlbmVCYXNlLFxyXG4gIFRlc3RTY2VuZTE6IFRlc3RTY2VuZTEsXHJcbiAgVGVzdFNjZW5lMjogVGVzdFNjZW5lMixcclxuICBUZXN0U2NlbmUzOiBUZXN0U2NlbmUzLFxyXG4gIFRlc3RTY2VuZTQ6IFRlc3RTY2VuZTQsXHJcbiAgVGVzdFNjZW5lNTogVGVzdFNjZW5lNSxcclxuICBUZXN0U2NlbmU2OiBUZXN0U2NlbmU2LFxyXG4gIFRlc3RTY2VuZTc6IFRlc3RTY2VuZTcsXHJcbiAgVGVzdFNjZW5lODogVGVzdFNjZW5lOCxcclxuICBUZXN0U2NlbmU5OiBUZXN0U2NlbmU5LFxyXG4gIFRlc3RTY2VuZTEwOiBUZXN0U2NlbmUxMCxcclxuICBUZXN0U2NlbmUxMTogVGVzdFNjZW5lMTEsXHJcbiAgVGVzdFNjZW5lMTI6IFRlc3RTY2VuZTEyLFxyXG4gIFRlc3RTY2VuZTEzOiBUZXN0U2NlbmUxMyxcclxuICBUZXN0U2NlbmUxNDogVGVzdFNjZW5lMTQsXHJcbiAgVGVzdFNjZW5lMTU6IFRlc3RTY2VuZTE1LFxyXG4gIFRlc3RTY2VuZTE2OiBUZXN0U2NlbmUxNixcclxuICBUZXN0U2NlbmUxNzogVGVzdFNjZW5lMTcsXHJcbiAgVGVzdFNjZW5lMTg6IFRlc3RTY2VuZTE4LFxyXG4gIFRlc3RTY2VuZTE5OiBUZXN0U2NlbmUxOSxcclxuICBUZXN0U2NlbmUyMDogVGVzdFNjZW5lMjAsXHJcbiAgVGVzdFNjZW5lMjE6IFRlc3RTY2VuZTIxLFxyXG4gIFRlc3RTY2VuZTIyOiBUZXN0U2NlbmUyMixcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIFBMQVlFUjogXCIuL2Fzc2V0cy9pbWcvcGxheWVyLnBuZ1wiLFxyXG4gIEVORU1ZOiBcIi4vYXNzZXRzL2ltZy9lbmVteS5wbmdcIixcclxuICBBUlJPVzogXCIuL2Fzc2V0cy9pbWcvYXJyb3cucG5nXCIsXHJcbiAgV0FMTDogXCIuL2Fzc2V0cy9pbWcvd2FsbC5wbmdcIixcclxuICBcclxuICBTTUFMTF9CTE9DSzogXCIuL2Fzc2V0cy9pbWcvc21hbGxfYmxvY2sucG5nXCIsXHJcbiAgUExBVEZPUk06IFwiLi9hc3NldHMvaW1nL3BsYXRmb3JtLnBuZ1wiLFxyXG5cclxuICBNQVAxOiBcIi4vYXNzZXRzL21hcC9tYXAxLmpzb25cIixcclxuXHJcbiAgLy8gUHJlbG9hZGVyLmpzIHdpbGwgcmVwbGFjZSBnZXR0ZXIgd2l0aCBhcHByb3ByaWF0ZSBkZWZpbml0aW9uXHJcbiAgZ2V0ICAgICAgICA6IGZ1bmN0aW9uIChwYXRoKSB7IH1cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG5cclxudmFyIFByZWxvYWRlciA9IGZ1bmN0aW9uIChvbkNvbXBsZXRlKSB7XHJcbiAgICAvLyBTZXQgdXAgcHJlbG9hZGVyXHJcblx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cdHRoaXMucXVldWUuaW5zdGFsbFBsdWdpbihjcmVhdGVqcy5Tb3VuZCk7XHJcblxyXG4gICAgLy8gUmVwbGFjZSBkZWZpbml0aW9uIG9mIEFzc2V0IGdldHRlciB0byB1c2UgdGhlIGRhdGEgZnJvbSB0aGUgcXVldWVcclxuICAgIEFzc2V0cy5nZXQgPSB0aGlzLnF1ZXVlLmdldFJlc3VsdC5iaW5kKHRoaXMucXVldWUpO1xyXG5cclxuICAgIC8vIE9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBwcmVsb2FkZWQsIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgaWYgKG9uQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgb25Db21wbGV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb0xvYWQgPSBbXTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRvIGxvYWQgYXNzZXRzXHJcbiAgICBmb3IgKHZhciBhc3NldCBpbiBBc3NldHMpIHtcclxuICAgICAgICB2YXIgYXNzZXRPYmogPSB7XHJcbiAgICAgICAgICAgIGlkIDogYXNzZXQsXHJcbiAgICAgICAgICAgIHNyYyA6IEFzc2V0c1thc3NldF1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5lZWRUb0xvYWQucHVzaChhc3NldE9iaik7XHJcbiAgICB9XHJcblxyXG5cdHRoaXMucXVldWUubG9hZE1hbmlmZXN0KG5lZWRUb0xvYWQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcmVsb2FkZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCB7VmVjMn0gPSB3ZmwuZ2VvbTtcclxuXHJcbmNvbnN0IFN0ZWVyID0ge1xyXG4gIHNlZWs6IChzb3VyY2UsIHRhcmdldCkgPT4ge1xyXG4gICAgbGV0IGVuZFZlbG9jaXR5ID0gVmVjMi5zdWJ0cmFjdCh0YXJnZXQucG9zaXRpb24sIHNvdXJjZS5wb3NpdGlvbilcclxuICAgICAgLm5vcm1hbGl6ZSgpXHJcbiAgICAgIC5tdWx0aXBseShzb3VyY2UubWF4U3BlZWQpO1xyXG4gICAgXHJcbiAgICBsZXQgc3RlZXJGb3JjZSA9IGVuZFZlbG9jaXR5LnN1YnRyYWN0KHNvdXJjZS52ZWxvY2l0eSk7XHJcbiAgICBzdGVlckZvcmNlLmxpbWl0KHNvdXJjZS5tYXNzICogc291cmNlLm1heEFjY2VsZXJhdGlvbik7XHJcbiAgICByZXR1cm4gc3RlZXJGb3JjZTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZWVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyAgICA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcbnZhciBQcmVsb2FkZXIgPSByZXF1aXJlKCcuL1ByZWxvYWRlci5qcycpO1xyXG52YXIgU3RlZXIgICAgID0gcmVxdWlyZSgnLi9TdGVlci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgQXNzZXRzOiAgICBBc3NldHMsXHJcbiAgUHJlbG9hZGVyOiBQcmVsb2FkZXIsXHJcbiAgU3RlZXI6ICAgICBTdGVlcixcclxufTsiXX0=
