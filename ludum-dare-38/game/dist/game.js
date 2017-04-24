(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = {
  // Jeremy
  jtalk: "0",
  jtalk2: "0",
  jend: "0",

  // Darell
  dtalk: "0",

  // Maxy
  mtalk: "0",

  gameover: "false",

  map: "map0"
};

},{}],2:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');

var BlockFull = function BlockFull() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.BLOCK).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(BlockFull.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(BlockFull.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(BlockFull, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

BlockFull.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case BlockFull.STATE.UP_WALK:
          this.setState(BlockFull.STATE.UP_IDLE);
        break;
        case BlockFull.STATE.DOWN_WALK:
          this.setState(BlockFull.STATE.DOWN_IDLE);
        break;
        case BlockFull.STATE.LEFT_WALK:
          this.setState(BlockFull.STATE.LEFT_IDLE);
        break;
        case BlockFull.STATE.RIGHT_WALK:
          this.setState(BlockFull.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(BlockFull);

module.exports = BlockFull;

},{"../util":32,"./HexTile":4}],3:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var Player = require('./Player');

var EventBounds = function EventBounds() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.EVENT_BOUNDS).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(EventBounds.STATE.IDLE, this.stateIdle);

  this.visible = false;

  this.solid = false;
  this.fixed = true;
};

Object.defineProperties(EventBounds, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

EventBounds.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case EventBounds.STATE.UP_WALK:
          this.setState(EventBounds.STATE.UP_IDLE);
        break;
        case EventBounds.STATE.DOWN_WALK:
          this.setState(EventBounds.STATE.DOWN_IDLE);
        break;
        case EventBounds.STATE.LEFT_WALK:
          this.setState(EventBounds.STATE.LEFT_IDLE);
        break;
        case EventBounds.STATE.RIGHT_WALK:
          this.setState(EventBounds.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(EventBounds);

module.exports = EventBounds;

},{"../util":32,"./Player":11}],4:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var EventBounds = require('./EventBounds');
var Player = require('./Player');

var HexTile = function HexTile() {
  PhysicsObject.call(this);

  this.hexVertices = [];

  for (var i = 0; i < 6; i++) {
    var x = HexTile.WIDTH * 0.5 * Math.cos(i / 6 * Math.PI * 2);
    var y = HexTile.WIDTH * 0.5 * Math.sin(i / 6 * Math.PI * 2);
    this.hexVertices.push(new geom.Vec2(x, y));
  }

  this.solid = false;
  this.fixed = true;
  this.prevSprite = null;

  this.claimingGraphic = null;
  this.claimedGraphic = null;

  this.claimTransition = 0;
  this.eventBounds = null;
  this.player = null;

  this.PIXI = null;
};

Object.defineProperties(HexTile, {
  WIDTH: {
    value: 168
  },
  HEIGHT: {
    value: 144
  },
  STATE: {
    value: {
      CLAIMING: "CLAIMING",
      CLAIMING_PROGRESS: "CLAIMING_PROGRESS",
      CLAIMED: "CLAIMED"
    }
  },
  CLAIM_RATE: {
    value: 0.03
  }
});

HexTile.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      var stateName = this.currentState.name;

      switch (stateName) {
        case HexTile.STATE.CLAIMING:
          if (this.children.indexOf(this.claimingGraphic) < 0) {
            this.addChild(this.claimedGraphic);
            this.addChild(this.claimingGraphic);
            this.claimedGraphic.alpha = 0;
          }

          this.claimTransition += HexTile.CLAIM_RATE;
          this.claimingGraphic.alpha = this.claimTransition;

          if (this.claimTransition >= 1) {
            this.claimTransition = 1;
            this.claimingGraphic.alpha = 1;
            this.claimedGraphic.alpha = 1;
            this.currentState.name = HexTile.STATE.CLAIMING_PROGRESS;
          }
          break;

        case HexTile.STATE.CLAIMING_PROGRESS:
          this.claimTransition -= HexTile.CLAIM_RATE;
          this.claimingGraphic.alpha = this.claimTransition;

          if (this.claimTransition <= 0) {
            this.claimTransition = 0;
            this.currentState.name = HexTile.STATE.CLAIMED;
          }
          break;

        case HexTile.STATE.CLAIMED:
          this.children = [this.claimedGraphic];
          break;

        default:
          PhysicsObject.prototype.update.call(this, dt);
      }
    }
  },

  findReferences: {
    value: function value(gameObjects, PIXI) {
      var _this = this;

      this.PIXI = PIXI;

      this.claimingGraphic = new PIXI.Sprite.fromImage(Assets.TILE_CLAIMING);
      this.claimedGraphic = new PIXI.Sprite.fromImage(Assets.TILE_CLAIMED);

      var offsetX = this.width * 0.5;
      var offsetY = this.height * 0.5;

      this.claimingGraphic.x -= offsetX;
      this.claimingGraphic.y -= offsetY;
      this.claimedGraphic.x -= offsetX;
      this.claimedGraphic.y -= offsetY;

      this.claimingGraphic.alpha = 0;

      var eventBounds = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = gameObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var g = _step.value;

          if (g instanceof EventBounds) {
            eventBounds.push(g);
          } else if (g instanceof Player) {
            this.player = g;
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

      eventBounds.sort(function (a, b) {
        var d0 = geom.Vec2.subtract(a.position, _this.position).getMagnitudeSquared();
        var d1 = geom.Vec2.subtract(_this.position, b.position).getMagnitudeSquared();

        return d0 - d1;
      });

      if (eventBounds.length > 0) {
        if (this.checkBroadPhaseCollision(eventBounds[0])) {
          this.eventBounds = eventBounds[0];
        }
      }
    }
  }
}));

Object.freeze(HexTile);

module.exports = HexTile;

},{"../util":32,"./EventBounds":3,"./Player":11}],5:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HoleCover = require('./HoleCover');
var TileOldJeremy = require('./TileOldJeremy');
var EventBounds = require('./EventBounds');
var HexTile = require('./HexTile');
var Conditions = require('../Conditions');

var Hole = function Hole() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.HOLE).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(Hole.STATE.IDLE, this.stateIdle);

  this.solid = true;
  this.fixed = true;

  this.holeCover = null;
  this.filled = false;
  this.tile = null;
  this.eventBounds = null;
};

Object.defineProperties(Hole, {
  STATE: {
    value: {
      IDLE: "IDLE",
      FILLED: "FILLED",
      COMPLETE: "COMPLETE"
    }
  }
});

Hole.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      var stateName = this.currentState.name;

      switch (stateName) {
        case Hole.STATE.IDLE:
          if (this.holeCover) {
            var displacement = geom.Vec2.subtract(this.position, this.holeCover.position);

            if (displacement.getMagnitudeSquared() > 2) {
              var impulse = displacement.clone().multiply(0.035);
              this.holeCover.position.add(impulse);
            } else {
              this.filled = true;
              this.currentState.name = Hole.STATE.FILLED;
            }
          }
          break;

        case Hole.STATE.FILLED:
          if (this.alpha > 0) {
            this.alpha -= 0.1;
            this.holeCover.alpha -= 0.1;
          } else {
            this.alpha = 0;
            this.holeCover.alpha = 0;
            this.currentState.name = Hole.STATE.COMPLETE;
            this.tile.currentState.name = HexTile.STATE.CLAIMING;
          }
          break;

        case Hole.STATE.COMPLETE:
          if (this.eventBounds) {
            var props = this.eventBounds.customData.props;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var p = _step.value;

                if (p.key !== "tileClaim") continue;

                var args = p.value.split('|');

                var conditions = args.length;
                var eventSets = [];

                for (var i = 0; i < conditions; i += 2) {
                  var cond = args[i];
                  var newVal = args[i + 1];

                  eventSets.push({
                    condition: cond,
                    newValue: newVal
                  });
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = eventSets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var set = _step2.value;
                    var condition = set.condition,
                        newValue = set.newValue;

                    Conditions[condition] = newValue;
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
          }

          this.customData.retired = true;
          this.holeCover.customData.retired = true;
          break;
      }

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case Hole.STATE.UP_WALK:
          this.setState(Hole.STATE.UP_IDLE);
        break;
        case Hole.STATE.DOWN_WALK:
          this.setState(Hole.STATE.DOWN_IDLE);
        break;
        case Hole.STATE.LEFT_WALK:
          this.setState(Hole.STATE.LEFT_IDLE);
        break;
        case Hole.STATE.RIGHT_WALK:
          this.setState(Hole.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  },

  findReferences: {
    value: function value(gameObjects) {
      var _this = this;

      var oldJeremyTiles = [];
      var eventBounds = [];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = gameObjects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var g = _step3.value;

          if (g instanceof TileOldJeremy) {
            oldJeremyTiles.push(g);
          } else if (g instanceof EventBounds) {
            eventBounds.push(g);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      oldJeremyTiles.sort(function (a, b) {
        var d0 = geom.Vec2.subtract(a.position, _this.position).getMagnitudeSquared();
        var d1 = geom.Vec2.subtract(_this.position, b.position).getMagnitudeSquared();

        return d0 - d1;
      });

      eventBounds.sort(function (a, b) {
        var d0 = geom.Vec2.subtract(a.position, _this.position).getMagnitudeSquared();
        var d1 = geom.Vec2.subtract(_this.position, b.position).getMagnitudeSquared();

        return d0 - d1;
      });

      if (oldJeremyTiles.length > 0) {
        if (this.checkBroadPhaseCollision(oldJeremyTiles[0])) {
          this.tile = oldJeremyTiles[0];
        }
      }

      if (eventBounds.length > 0) {
        if (this.checkBroadPhaseCollision(eventBounds[0])) {
          this.eventBounds = eventBounds[0];
        }
      }
    }
  },

  canCollide: {
    value: function value(obj) {
      return !(obj instanceof HoleCover);
    }
  },

  onCollide: {
    value: function value(obj) {
      if (obj instanceof HoleCover) {
        var distSquared = geom.Vec2.subtract(obj.position, this.position).getMagnitudeSquared();

        if (distSquared < this.width * this.width * 0.75 * 0.75) {
          this.holeCover = obj;
          this.holeCover.ignorePlayer = true;
          this.holeCover.mass = Infinity;
        }
      }
    }
  }
}));

Object.freeze(Hole);

module.exports = Hole;

},{"../Conditions":1,"../util":32,"./EventBounds":3,"./HexTile":4,"./HoleCover":6,"./TileOldJeremy":16}],6:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var Player = require('./Player');

var HoleCover = function HoleCover() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.HOLE_COVER).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(HoleCover.STATE.IDLE, this.stateIdle);

  this.solid = true;

  // Set constants
  this.maxSpeed = HoleCover.MAX_SPEED;
  this.maxAcceleration = HoleCover.MAX_ACCELERATION;

  this.mass = 0.1;
  this.restitution = 0.5;
  this.friction = 0.0;

  this.ignorePlayer = false;
};

Object.defineProperties(HoleCover, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  },

  MAX_SPEED: {
    value: 15
  },

  MAX_ACCELERATION: {
    value: 10
  }
});

HoleCover.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case HoleCover.STATE.UP_WALK:
          this.setState(HoleCover.STATE.UP_IDLE);
        break;
        case HoleCover.STATE.DOWN_WALK:
          this.setState(HoleCover.STATE.DOWN_IDLE);
        break;
        case HoleCover.STATE.LEFT_WALK:
          this.setState(HoleCover.STATE.LEFT_IDLE);
        break;
        case HoleCover.STATE.RIGHT_WALK:
          this.setState(HoleCover.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }

  /*canCollide: {
    value: function (obj) {
      if (this.ignorePlayer && (obj instanceof Player)) {
        return false;
      }
      
      return true;
    }
  }*/
}));

Object.freeze(HoleCover);

module.exports = HoleCover;

},{"../util":32,"./Player":11}],7:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var Jeremy = function Jeremy() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.JEREMY0).texture;
  this.myGraphic2 = Assets.get(Assets.JEREMY1).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 30);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 30);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  this.addState(Jeremy.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(Jeremy.STATE.IDLE, this.stateIdle);
  */

  this.solid = false;
  this.fixed = true;
};

Object.defineProperties(Jeremy, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

Jeremy.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case Jeremy.STATE.UP_WALK:
          this.setState(Jeremy.STATE.UP_IDLE);
        break;
        case Jeremy.STATE.DOWN_WALK:
          this.setState(Jeremy.STATE.DOWN_IDLE);
        break;
        case Jeremy.STATE.LEFT_WALK:
          this.setState(Jeremy.STATE.LEFT_IDLE);
        break;
        case Jeremy.STATE.RIGHT_WALK:
          this.setState(Jeremy.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(Jeremy);

module.exports = Jeremy;

},{"../util":32}],8:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var NPCA = function NPCA() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.NPC_A0).texture;
  this.myGraphic2 = Assets.get(Assets.NPC_A1).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 18);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 17);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  this.addState(NPCA.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(NPCA.STATE.IDLE, this.stateIdle);
  */

  this.solid = false;
  this.fixed = true;
};

Object.defineProperties(NPCA, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

NPCA.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case NPCA.STATE.UP_WALK:
          this.setState(NPCA.STATE.UP_IDLE);
        break;
        case NPCA.STATE.DOWN_WALK:
          this.setState(NPCA.STATE.DOWN_IDLE);
        break;
        case NPCA.STATE.LEFT_WALK:
          this.setState(NPCA.STATE.LEFT_IDLE);
        break;
        case NPCA.STATE.RIGHT_WALK:
          this.setState(NPCA.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(NPCA);

module.exports = NPCA;

},{"../util":32}],9:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var NPCB = function NPCB() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.NPC_B0).texture;
  this.myGraphic2 = Assets.get(Assets.NPC_B1).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 30);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 30);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  this.addState(NPCB.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(NPCB.STATE.IDLE, this.stateIdle);
  */

  this.solid = false;
  this.fixed = true;
};

Object.defineProperties(NPCB, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});
NPCB.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case NPCB.STATE.UP_WALK:
          this.setState(NPCB.STATE.UP_IDLE);
        break;
        case NPCB.STATE.DOWN_WALK:
          this.setState(NPCB.STATE.DOWN_IDLE);
        break;
        case NPCB.STATE.LEFT_WALK:
          this.setState(NPCB.STATE.LEFT_IDLE);
        break;
        case NPCB.STATE.RIGHT_WALK:
          this.setState(NPCB.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(NPCB);

module.exports = NPCB;

},{"../util":32}],10:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var NPCC = function NPCC() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.NPC_C0).texture;
  this.myGraphic2 = Assets.get(Assets.NPC_C1).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 45);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 45);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  this.addState(NPCC.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(NPCC.STATE.IDLE, this.stateIdle);
  */

  this.solid = false;
  this.fixed = true;
};

Object.defineProperties(NPCC, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

NPCC.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case NPCC.STATE.UP_WALK:
          this.setState(NPCC.STATE.UP_IDLE);
        break;
        case NPCC.STATE.DOWN_WALK:
          this.setState(NPCC.STATE.DOWN_IDLE);
        break;
        case NPCC.STATE.LEFT_WALK:
          this.setState(NPCC.STATE.LEFT_IDLE);
        break;
        case NPCC.STATE.RIGHT_WALK:
          this.setState(NPCC.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(NPCC);

module.exports = NPCC;

},{"../util":32}],11:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var Player = function Player() {
  PhysicsObject.call(this);

  var verts = [new geom.Vec2(-32, -32), new geom.Vec2(32, -32), new geom.Vec2(32, 32), new geom.Vec2(-32, 32)];

  this.myGraphic1 = Assets.get(Assets.PLAYER_L0).texture;
  this.myGraphic2 = Assets.get(Assets.PLAYER_L1).texture;
  this.myGraphic3 = Assets.get(Assets.PLAYER_R0).texture;
  this.myGraphic4 = Assets.get(Assets.PLAYER_R1).texture;

  this.stateLeft = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 30, verts);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 30, verts);
  this.frameIdle1.y -= 28;
  this.frameIdle2.y -= 28;
  this.stateLeft.addFrame(this.frameIdle1);
  this.stateLeft.addFrame(this.frameIdle2);
  this.addState(Player.STATE.LEFT, this.stateLeft);

  this.stateRight = GameObject.createState();
  this.frameIdle3 = GameObject.createFrame(this.myGraphic3, 30, verts);
  this.frameIdle4 = GameObject.createFrame(this.myGraphic4, 30, verts);
  this.frameIdle3.y -= 28;
  this.frameIdle4.y -= 28;
  this.stateRight.addFrame(this.frameIdle3);
  this.stateRight.addFrame(this.frameIdle4);
  this.addState(Player.STATE.RIGHT, this.stateRight);

  // The top of the stack determines which direction the player faces
  this._walkDirectionStack = [];

  // Set constants
  this.maxSpeed = Player.MAX_SPEED;
  this.maxAcceleration = Player.MAX_ACCELERATION;

  this.movementLock = 0;

  this.mass = 10;
  this.restitution = 0.8;
  this.friction = 1;
};

Object.defineProperties(Player, {
  MAX_SPEED: {
    value: 3
  },

  MAX_ACCELERATION: {
    value: .55
  },

  SPRINT_MAX_SPEED: {
    value: 6.5
  },

  SPRINT_BOOST_ACCELERATION: {
    value: .1
  },

  BOOST_ACCELERATION: {
    value: .05
  },
  STATE: {
    value: {
      LEFT: "LEFT",
      RIGHT: "RIGHT"
    }
  }
});

Player.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      PhysicsObject.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case Player.STATE.UP_WALK:
          this.setState(Player.STATE.UP_IDLE);
        break;
        case Player.STATE.DOWN_WALK:
          this.setState(Player.STATE.DOWN_IDLE);
        break;
        case Player.STATE.LEFT_WALK:
          this.setState(Player.STATE.LEFT_IDLE);
        break;
        case Player.STATE.RIGHT_WALK:
          this.setState(Player.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  },

  handleInput: {
    value: function value(keyboard) {
      if (this.movementLock > 0) return;

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
          case keyboard.LEFT:
          case keyboard.RIGHT:
          case keyboard.UP:
          case keyboard.DOWN:
            this._walkDirectionStack.push(lastPressed);
            break;
        }
      }

      // Determine the priorities of the directions
      var priorityCounter = 0;
      for (var i = 0; i < this._walkDirectionStack.length; i++) {
        switch (this._walkDirectionStack[i]) {
          case keyboard.LEFT:
            leftPriority = priorityCounter;
            priorityCounter++;
            break;
          case keyboard.RIGHT:
            rightPriority = priorityCounter;
            priorityCounter++;
            break;
          case keyboard.UP:
            upPriority = priorityCounter;
            priorityCounter++;
            break;
          case keyboard.DOWN:
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
        this.setState(Player.STATE.LEFT);
      }
      if (rightPriority > leftPriority) {
        var movementForce = new geom.Vec2(1, 0);
        movementForce.multiply(boost * this.mass);

        this.addForce(movementForce);
        this.setState(Player.STATE.RIGHT);
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

},{"../util":32}],12:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var TextBox = function TextBox(PIXI, keyboard, player) {
  var text = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
  var displaySpeed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 25;

  PhysicsObject.call(this);

  this.fullString = text;
  this.timeElapsed = 0;
  this.displaySpeed = displaySpeed;

  this.keyboard = keyboard;

  this.bgGraphic = new PIXI.Sprite.fromImage(Assets.TEXT_BOX);
  this.bgGraphicNext = new PIXI.Sprite.fromImage(Assets.TEXT_BOX_NEXT);
  this.textChild = new PIXI.extras.BitmapText("", { font: "18px ld38" });

  // Idk why multiply padding by 4
  this.textChild.maxWidth = this.bgGraphic.width - TextBox.PADDING * 4;

  var offsetX = this.bgGraphic.width * 0.5;
  var offsetY = this.bgGraphic.height * 0.5;

  this.bgGraphic.x -= offsetX;
  this.bgGraphic.y -= offsetY;
  this.bgGraphicNext.x -= offsetX;
  this.bgGraphicNext.y -= offsetY;
  this.textChild.x -= offsetX - TextBox.PADDING;
  this.textChild.y -= offsetY - TextBox.PADDING;

  this.solid = false;
  this.fixed = true;

  this.addChild(this.bgGraphic);
  this.addChild(this.textChild);

  this.alpha = 0.95;

  this.player = player;

  this.hasNext = false;
};

Object.defineProperties(TextBox, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  },

  // Characters / Second
  CHARS_PER_SECOND: {
    value: 1 / 60
  },

  PADDING: {
    value: 5
  },

  RUSH_SPEED: {
    value: 1.5
  }
});

TextBox.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
  update: {
    value: function value(dt) {
      // Snap to correct pixels for crisp text and graphic
      this.textChild.x = Math.floor(this.textChild.x) + 0.5;
      this.textChild.y = Math.floor(this.textChild.y) + 0.5;
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      if (this.children.indexOf(this.bgGraphic) >= 0) {
        this.bgGraphic.x = Math.floor(this.bgGraphic.x) + 0.5;
        this.bgGraphic.y = Math.floor(this.bgGraphic.y) + 0.5;
      } else {
        this.bgGraphicNext.x = Math.floor(this.bgGraphicNext.x) + 0.5;
        this.bgGraphicNext.y = Math.floor(this.bgGraphicNext.y) + 0.5;
      }

      this.timeElapsed += dt;
      var charsToShow = Math.floor(Math.min(this.timeElapsed * this.displaySpeed * TextBox.CHARS_PER_SECOND, this.fullString.length));

      this.textChild.text = this.fullString.substr(0, charsToShow);

      if (charsToShow === this.fullString.length) {
        if (this.hasNext) {
          if (this.children.indexOf(this.bgGraphic) >= 0) {
            this.removeChild(this.bgGraphic);
            this.addChildAt(this.bgGraphicNext, 0);
          }

          this.handleInput();
        }
      } else {
        var keys = this.keyboard;

        if (keys.isPressed(keys.SPACEBAR)) {
          this.timeElapsed *= TextBox.RUSH_SPEED;
        }
      }
    }
  },

  onCollide: {
    value: function value(obj) {}
  },

  handleInput: {
    value: function value() {
      var keys = this.keyboard;

      if (keys.justPressed(keys.SPACEBAR)) {
        this.hasNext = false;
        $(this).trigger("next-text");
      }
    }
  }
}));

Object.freeze(TextBox);

module.exports = TextBox;

},{"../util":32}],13:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');

var TileFree = function TileFree() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_FREE0).texture;
  this.myGraphic2 = Assets.get(Assets.TILE_FREE1).texture;
  this.myGraphic3 = Assets.get(Assets.TILE_FREE2).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 4, this.hexVertices);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 4, this.hexVertices);
  this.frameIdle3 = GameObject.createFrame(this.myGraphic3, 4, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  this.stateIdle.addFrame(this.frameIdle3);
  this.addState(TileFree.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileFree.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(TileFree, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileFree.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      var stateName = this.currentState.name;

      if (stateName === TileFree.STATE.IDLE) {
        this._handlePlayer();
      }
    }
  },

  _handlePlayer: {
    value: function value() {
      if (this.player.checkNarrowPhaseCollision(this, {})) {
        this.currentState.name = HexTile.STATE.CLAIMING;
      }
    }
  }
}));

Object.freeze(TileFree);

module.exports = TileFree;

},{"../util":32,"./HexTile":4}],14:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');
var Player = require('./Player');

var TileGrass = function TileGrass() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_GRASS).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(TileGrass.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileGrass.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(TileGrass, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileGrass.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case TileGrass.STATE.UP_WALK:
          this.setState(TileGrass.STATE.UP_IDLE);
        break;
        case TileGrass.STATE.DOWN_WALK:
          this.setState(TileGrass.STATE.DOWN_IDLE);
        break;
        case TileGrass.STATE.LEFT_WALK:
          this.setState(TileGrass.STATE.LEFT_IDLE);
        break;
        case TileGrass.STATE.RIGHT_WALK:
          this.setState(TileGrass.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  },

  canCollide: {
    value: function value(obj) {
      return obj instanceof Player;
    }
  }
}));

Object.freeze(TileGrass);

module.exports = TileGrass;

},{"../util":32,"./HexTile":4,"./Player":11}],15:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');
var Player = require('./Player');

var TileJeremy = function TileJeremy() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_JEREMY).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(TileJeremy.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileJeremy.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(TileJeremy, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileJeremy.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case TileJeremy.STATE.UP_WALK:
          this.setState(TileJeremy.STATE.UP_IDLE);
        break;
        case TileJeremy.STATE.DOWN_WALK:
          this.setState(TileJeremy.STATE.DOWN_IDLE);
        break;
        case TileJeremy.STATE.LEFT_WALK:
          this.setState(TileJeremy.STATE.LEFT_IDLE);
        break;
        case TileJeremy.STATE.RIGHT_WALK:
          this.setState(TileJeremy.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  },

  canCollide: {
    value: function value(obj) {
      return obj instanceof Player;
    }
  }
}));

Object.freeze(TileJeremy);

module.exports = TileJeremy;

},{"../util":32,"./HexTile":4,"./Player":11}],16:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');
var Player = require('./Player');

var TileOldJeremy = function TileOldJeremy() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_OLD_JEREMY).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(TileOldJeremy.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileOldJeremy.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(TileOldJeremy, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileOldJeremy.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case TileOldJeremy.STATE.UP_WALK:
          this.setState(TileOldJeremy.STATE.UP_IDLE);
        break;
        case TileOldJeremy.STATE.DOWN_WALK:
          this.setState(TileOldJeremy.STATE.DOWN_IDLE);
        break;
        case TileOldJeremy.STATE.LEFT_WALK:
          this.setState(TileOldJeremy.STATE.LEFT_IDLE);
        break;
        case TileOldJeremy.STATE.RIGHT_WALK:
          this.setState(TileOldJeremy.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(TileOldJeremy);

module.exports = TileOldJeremy;

},{"../util":32,"./HexTile":4,"./Player":11}],17:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');

var TileSand = function TileSand() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_SAND).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(TileSand.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileSand.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(TileSand, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileSand.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case TileSand.STATE.UP_WALK:
          this.setState(TileSand.STATE.UP_IDLE);
        break;
        case TileSand.STATE.DOWN_WALK:
          this.setState(TileSand.STATE.DOWN_IDLE);
        break;
        case TileSand.STATE.LEFT_WALK:
          this.setState(TileSand.STATE.LEFT_IDLE);
        break;
        case TileSand.STATE.RIGHT_WALK:
          this.setState(TileSand.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(TileSand);

module.exports = TileSand;

},{"../util":32,"./HexTile":4}],18:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');
var Player = require('./Player');

var TileVoid = function TileVoid() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_VOID).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(TileVoid.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileVoid.STATE.IDLE, this.stateIdle);
  */

  this.solid = true;
};

Object.defineProperties(TileVoid, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileVoid.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case TileVoid.STATE.UP_WALK:
          this.setState(TileVoid.STATE.UP_IDLE);
        break;
        case TileVoid.STATE.DOWN_WALK:
          this.setState(TileVoid.STATE.DOWN_IDLE);
        break;
        case TileVoid.STATE.LEFT_WALK:
          this.setState(TileVoid.STATE.LEFT_IDLE);
        break;
        case TileVoid.STATE.RIGHT_WALK:
          this.setState(TileVoid.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  },

  canCollide: {
    value: function value(obj) {
      return obj instanceof Player;
    }
  }
}));

Object.freeze(TileVoid);

module.exports = TileVoid;

},{"../util":32,"./HexTile":4,"./Player":11}],19:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var HexTile = require('./HexTile');
var Player = require('./Player');

var TileWater = function TileWater() {
  HexTile.call(this);

  this.myGraphic1 = Assets.get(Assets.TILE_WATER).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.addState(TileWater.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(TileWater.STATE.IDLE, this.stateIdle);
  */

  this.solid = true;
};

Object.defineProperties(TileWater, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

TileWater.prototype = Object.freeze(Object.create(HexTile.prototype, {
  update: {
    value: function value(dt) {
      HexTile.prototype.update.call(this, dt);

      // Handle state
      /*
      var stateName = this.currentState.name;
        switch (stateName) {
        case TileWater.STATE.UP_WALK:
          this.setState(TileWater.STATE.UP_IDLE);
        break;
        case TileWater.STATE.DOWN_WALK:
          this.setState(TileWater.STATE.DOWN_IDLE);
        break;
        case TileWater.STATE.LEFT_WALK:
          this.setState(TileWater.STATE.LEFT_IDLE);
        break;
        case TileWater.STATE.RIGHT_WALK:
          this.setState(TileWater.STATE.RIGHT_IDLE);
        break;
      }
      */
    }
  }
}));

Object.freeze(TileWater);

module.exports = TileWater;

},{"../util":32,"./HexTile":4,"./Player":11}],20:[function(require,module,exports){
"use strict";

var geom = wfl.geom;
var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

var Title = function Title() {
  PhysicsObject.call(this);

  this.myGraphic1 = Assets.get(Assets.TITLE0).texture;
  this.myGraphic2 = Assets.get(Assets.TITLE1).texture;
  this.myGraphic3 = Assets.get(Assets.TITLE2).texture;
  this.stateIdle = GameObject.createState();
  this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 4, this.hexVertices);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 4, this.hexVertices);
  this.frameIdle3 = GameObject.createFrame(this.myGraphic3, 4, this.hexVertices);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  this.stateIdle.addFrame(this.frameIdle3);
  this.addState(Title.STATE.IDLE, this.stateIdle);
  // Reference graphics
  /*
  this.myGraphic1 = Assets.get(Assets.MY_GRAPHIC).texture;
  this.myGraphic2 = Assets.get(Assets.MY_GRAPHIC).texture;
  */

  // Create state
  /*
  this.stateIdle = GameObject.createState();
    this.frameIdle1 = GameObject.createFrame(this.myGraphic1, 15);
  this.frameIdle2 = GameObject.createFrame(this.myGraphic2, 15);
  this.stateIdle.addFrame(this.frameIdle1);
  this.stateIdle.addFrame(this.frameIdle2);
  */

  // Add states
  /*
  this.addState(Title.STATE.IDLE, this.stateIdle);
  */
};

Object.defineProperties(Title, {
  STATE: {
    value: {
      IDLE: "IDLE"
    }
  }
});

Title.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {}));

Object.freeze(Title);

module.exports = Title;

},{"../util":32}],21:[function(require,module,exports){
"use strict";

var Player = require('./Player.js');
var BlockFull = require('./BlockFull.js');
var HexTile = require('./HexTile.js');
var TileWater = require('./TileWater.js');
var TileJeremy = require('./TileJeremy.js');
var TileOldJeremy = require('./TileOldJeremy.js');
var TileGrass = require('./TileGrass.js');
var TileSand = require('./TileSand.js');
var TileFree = require('./TileFree.js');
var TileVoid = require('./TileVoid.js');

var Title = require('./Title.js');

var Hole = require('./Hole.js');
var HoleCover = require('./HoleCover.js');

var EventBounds = require('./EventBounds.js');

var TextBox = require('./TextBox.js');

var Jeremy = require('./Jeremy.js');

var NPCA = require('./NPCA.js');
var NPCB = require('./NPCB.js');
var NPCC = require('./NPCC.js');

module.exports = {
  Player: Player,
  BlockFull: BlockFull,
  HexTile: HexTile,
  TileWater: TileWater,
  TileJeremy: TileJeremy,
  TileOldJeremy: TileOldJeremy,
  TileGrass: TileGrass,
  TileSand: TileSand,
  TileFree: TileFree,
  TileVoid: TileVoid,

  Title: Title,

  Hole: Hole,
  HoleCover: HoleCover,

  EventBounds: EventBounds,

  TextBox: TextBox,

  // Characters
  Jeremy: Jeremy,
  NPCA: NPCA,
  NPCB: NPCB,
  NPCC: NPCC
};

},{"./BlockFull.js":2,"./EventBounds.js":3,"./HexTile.js":4,"./Hole.js":5,"./HoleCover.js":6,"./Jeremy.js":7,"./NPCA.js":8,"./NPCB.js":9,"./NPCC.js":10,"./Player.js":11,"./TextBox.js":12,"./TileFree.js":13,"./TileGrass.js":14,"./TileJeremy.js":15,"./TileOldJeremy.js":16,"./TileSand.js":17,"./TileVoid.js":18,"./TileWater.js":19,"./Title.js":20}],22:[function(require,module,exports){
"use strict";

var util = require('./util');
var scenes = require('./scenes');
var Assets = require('./util/Assets.js');
var map = require('./map');

// Create game
var canvas = document.querySelector("#game-canvas");
var game = wfl.create(canvas);
game.renderer.backgroundColor = 0x000000;

//game.debug = {vectors: true};

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

  loadMaps();
};

var loadMaps = function loadMaps() {
  var maps = Assets.maps;

  var _loop = function _loop(_map) {
    wfl.jquery.getJSON(_map.path, function (data) {
      return onLoadMap(_map.key, data);
    });
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = maps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _map = _step.value;

      _loop(_map);
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
};

var loadCounter = 0;
var onLoadMap = function onLoadMap(key, data) {
  loadCounter++;

  map.MapPool.store(key, data);

  if (loadCounter === Assets.maps.length) {
    // Load scene here
    var gameScene = new scenes.TitleScene(canvas, game.pixi);
    game.setScene(gameScene);
  }
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

window.onload = onLoadWindow;
window.onresize = onResize;

},{"./map":25,"./scenes":29,"./util":32,"./util/Assets.js":30}],23:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var EntityBuilder = {
  build: function build(gameObjectData, scene) {
    var g = null;
    var entity = gameObjectData.entity;
    var entityName = entity.name;
    var className = null;

    if (entityName === "SpawnPoint") {
      className = entities["Player"];
    } else {
      // Remove numbers from entityNames
      entityName = entityName.replace(/[0-9]/g, '');

      className = entities[entityName];
    }

    if (className) {
      g = new className();
      g.position.x = gameObjectData.x;
      g.position.y = gameObjectData.y;
      g.rotation = gameObjectData.rotation;
      g.customData.props = gameObjectData.props;

      // Get int from string ("layer0" -> 0)
      g.layer = gameObjectData.layer.match(/\d+/)[0];
    }

    if (g) {
      if (entityName === "SpawnPoint") {
        scene.player = g;
        scene.camera.follow(g);
      }

      return g;
    }

    throw entity.name + " doesn't exist";
  }
};

module.exports = EntityBuilder;

},{"../entities":21}],24:[function(require,module,exports){
"use strict";

var maps = {};

var MapPool = {
  store: function store(key, data) {
    maps[key] = data;
  },

  get: function get(key) {
    return maps[key];
  }
};

module.exports = MapPool;

},{}],25:[function(require,module,exports){
"use strict";

var MapPool = require('./MapPool.js');
var EntityBuilder = require('./EntityBuilder.js');

module.exports = {
  MapPool: MapPool,
  EntityBuilder: EntityBuilder
};

},{"./EntityBuilder.js":23,"./MapPool.js":24}],26:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var geom = wfl.geom;
var Scene = wfl.display.Scene;
var map = require('../map');
var Assets = require('../util/Assets.js');
var entities = require('../entities');
var TitleScene = require('./TitleScene');

var Conditions = require('../Conditions.js');

var GameOverScene = function GameOverScene(canvas, PIXI) {
  Scene.call(this, canvas, PIXI);

  this.PIXI = PIXI;

  this.blackBox = new PIXI.Sprite.fromImage(Assets.BLACK_BOX);
  this.blackBox.alpha = 1;

  this.player = new entities.Jeremy();
  this.camera.follow(this.player);
  this.addGameObject(this.player);

  this.text = null;
};

Object.defineProperties(GameOverScene, {});

GameOverScene.prototype = Object.freeze(Object.create(Scene.prototype, {
  update: {
    value: function value(dt) {
      var _this = this;

      Scene.prototype.update.call(this, dt);

      if (this.text === null) {
        this.text = new entities.TextBox(PIXI, this.keyboard, this.player, "Keep on claiming.");
        this.text.y = -100.5;
        this.text.hasNext = true;

        $(this.text).on('next-text', function () {
          var newScene = new TitleScene(_this.canvas, _this.PIXI);
          _this.change(newScene);
          _this.reset();
        });

        this.addGameObject(this.text, 5);
      }
    }
  },

  /**
   * (Adapted from wfl.Scene.js) Draws the scene and all game objects in it
   */
  draw: {
    value: function value(renderer) {
      if (this.blackBox.alpha > 0) {
        this.blackBox.width = window.innerWidth;
        this.blackBox.height = window.innerHeight;
        this.blackBox.x = this.camera.position.x - window.innerWidth * 0.5;
        this.blackBox.y = this.camera.position.y - window.innerHeight * 0.5;
        this._stage.addChild(this.blackBox);
      }

      // Clear all children then add only the ones that can be seen
      this._stage.children.length = 0;
      this._lastDrawnGameObjects = this._findSurroundingGameObjects(this.camera, 2).sort(function (a, b) {
        // Sort objects on the same layer by their bottom Y-coordinate
        if (a.layer === b.layer) {
          return a.transform.position._y + a.calculationCache.height * 0.5 - (b.transform.position._y + b.calculationCache.height * 0.5);

          // Otherwise, sort them by layer
        } else {
          return a.layer - b.layer;
        }
      });

      // This seems to perform faster than using filter()
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._lastDrawnGameObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;

          if (this.canSee(obj)) {
            this._stage.addChild(obj);
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
    }
  },

  _handleInput: {
    value: function value() {
      var keys = this.keyboard;
    }
  }
}));

module.exports = GameOverScene;

},{"../Conditions.js":1,"../entities":21,"../map":25,"../util/Assets.js":30,"./TitleScene":28}],27:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var geom = wfl.geom;
var Scene = wfl.display.Scene;
var map = require('../map');
var Assets = require('../util/Assets.js');
var entities = require('../entities');

var Conditions = require('../Conditions.js');

var GameScene = function GameScene(canvas, PIXI) {
  Scene.call(this, canvas, PIXI);

  this.map = null;
  this.touchEventBounds = [];
  this.autoEventBounds = [];
  this.voidTiles = [];
  this.holeCovers = [];

  this.PIXI = PIXI;

  this.blackBox = new PIXI.Sprite.fromImage(Assets.BLACK_BOX);
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
  },

  FADE_RATE: {
    value: 0.002
  },

  PropertyTag: {
    value: {
      COLLISION: "collision",
      AUTO: "auto",
      TILE_CLAIM: "tileClaim"
    }
  }
});

GameScene.prototype = Object.freeze(Object.create(Scene.prototype, {
  update: {
    value: function value(dt) {
      this._removeRetiredGameObjects();
      this._applyFriction();
      this._handleInput();

      Scene.prototype.update.call(this, dt);

      this.checkAutoEvents();
      this._handleConditions();
    }
  },

  /**
   * (Adapted from wfl.Scene.js) Draws the scene and all game objects in it
   */
  draw: {
    value: function value(renderer) {
      // Clear all children then add only the ones that can be seen
      this._stage.children.length = 0;
      this._lastDrawnGameObjects = this._findSurroundingGameObjects(this.camera, 2).sort(function (a, b) {
        // Sort objects on the same layer by their bottom Y-coordinate
        if (a.layer === b.layer) {
          return a.transform.position._y + a.calculationCache.height * 0.5 - (b.transform.position._y + b.calculationCache.height * 0.5);

          // Otherwise, sort them by layer
        } else {
          return a.layer - b.layer;
        }
      });

      // This seems to perform faster than using filter()
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._lastDrawnGameObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;

          if (this.canSee(obj)) {
            this._stage.addChild(obj);
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

      if (this.blackBox.alpha > 0) {
        this.blackBox.width = window.innerWidth;
        this.blackBox.height = window.innerHeight;
        this.blackBox.x = this.camera.position.x - window.innerWidth * 0.5;
        this.blackBox.y = this.camera.position.y - window.innerHeight * 0.5;
        this._stage.addChild(this.blackBox);
      }
    }
  },

  setMap: {
    value: function value(key) {
      this.map = key;
    }
  },

  loadMap: {
    value: function value() {
      var mapData = map.MapPool.get(this.map);
      var levelData = mapData.level;
      var gameObjects = levelData.gameObjects;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {

        for (var _iterator2 = gameObjects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var g = _step2.value;

          var obj = map.EntityBuilder.build(g, this);
          this.addGameObject(obj, obj.layer);

          if (obj.customData.props) {
            this.parseProperties(obj);
          }
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

      var all = this.getGameObjects();

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = all[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var added = _step3.value;

          if (added.findReferences) {
            added.findReferences(all, this.PIXI);
          }

          if (added instanceof entities.TileVoid) {
            this.voidTiles.push(added);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this._fadeInMap();
    }
  },

  linkTouchEvent: {
    value: function value(obj, data) {
      this.touchEventBounds.push({
        obj: obj,
        data: data,
        active: false,
        textBox: null
      });
    }
  },

  setupAutoEvent: {
    value: function value(obj, data) {
      this.autoEventBounds.push({
        obj: obj,
        data: data
      });
    }
  },

  parseProperties: {
    value: function value(obj) {
      var props = obj.customData.props;

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = props[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var prop = _step4.value;

          var key = prop.key;
          var value = prop.value;

          if (key === GameScene.PropertyTag.COLLISION) {
            this.linkTouchEvent(obj, value);
          } else if (key === GameScene.PropertyTag.AUTO) {
            this.setupAutoEvent(obj, value);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  },

  checkAutoEvents: {
    value: function value() {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.autoEventBounds[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var ev = _step5.value;

          var data = ev.data;
          var args = data.split('|');

          var condition1 = args[0];
          var expected = args[1];
          var conditions = args.length - 2;
          var eventSets = [];

          for (var i = 0; i < conditions; i += 2) {
            var cond = args[2 + i];
            var newVal = args[2 + i + 1];

            eventSets.push({
              condition: cond,
              newValue: newVal
            });
          }

          if (Conditions[condition1] === expected) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = eventSets[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var set = _step6.value;
                var condition = set.condition,
                    newValue = set.newValue;


                if (condition === "spawn" && newValue === "HoleCover") {
                  var obj = ev.obj;
                  var e = new entities.HoleCover();
                  e.position.x = obj.x;
                  e.position.y = obj.y;
                  this.addGameObject(e, 1);
                  this.holeCovers.push(e);
                } else {
                  Conditions[condition] = newValue;
                }
              }
            } catch (err) {
              _didIteratorError6 = true;
              _iteratorError6 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }
              } finally {
                if (_didIteratorError6) {
                  throw _iteratorError6;
                }
              }
            }

            this.autoEventBounds.splice(this.autoEventBounds.indexOf(ev), 1);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  },

  checkTouchEvents: {
    value: function value() {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.touchEventBounds[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var ev = _step7.value;

          if (this.player.checkBroadPhaseCollision(ev.obj)) {
            if (!ev.active) {
              var data = ev.data;
              var args = data.split('|');

              // 0: Condition
              // 1: Expected value
              // 2: String
              if (args.length === 3) {
                var condition = args[0];
                var expected = args[1];

                if (Conditions[condition] === expected) {
                  this.showEventText(ev, args[2]);
                }

                // 0: Condition1
                // 1: Expected value
                // 2: Condition2 to change after SPACE is pressed
                // 3: Value to set Condition2 to
                // Even numbers: ConditionX to change after SPACE is pressed
                // Odd numbers: Value to set ConditionX to
                // n: String
              } else if (args.length > 4) {
                var condition1 = args[0];
                var expected = args[1];
                var string = args[args.length - 1];

                // -3 for arg0, 1, and 2
                var conditions = args.length - 3;
                var eventSets = [];

                for (var i = 0; i < conditions; i += 2) {
                  var cond = args[2 + i];
                  var newVal = args[2 + i + 1];

                  eventSets.push({
                    condition: cond,
                    newValue: newVal
                  });
                }

                if (Conditions[condition1] === expected) {
                  this.showEventProgressText(ev, eventSets, string);
                }
              } else {
                this.showEventText(ev, ev.data);
              }
            }
          } else {
            if (ev.active) {
              this.hideEventText(ev);
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  },

  showEventText: {
    value: function value(event) {
      var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      event.active = true;
      var textBox = new entities.TextBox(this.PIXI, this.keyboard, this.player, string);

      textBox.x = event.obj.x;
      textBox.y = event.obj.y - 75;

      // Layer 5 for higher objects like text boxes
      this.addGameObject(textBox, 5);
      event.textBox = textBox;
      this.camera.follow(this.player);
    }
  },

  showEventProgressText: {
    value: function value(event, eventSets) {
      var _this = this;

      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

      event.active = true;
      var textBox = new entities.TextBox(this.PIXI, this.keyboard, this.player, string);
      textBox.hasNext = true;
      this.camera.follow(event.obj);

      textBox.x = event.obj.x;
      textBox.y = event.obj.y - 75;

      this.player.movementLock++;
      this.player.acceleration.multiply(0);
      this.player.velocity.multiply(0);

      // Layer 5 for higher objects like text boxes
      this.addGameObject(textBox, 5);
      event.textBox = textBox;

      $(textBox).on('next-text', function (e) {
        $(textBox).off();

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = eventSets[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var set = _step8.value;
            var condition = set.condition,
                newValue = set.newValue;

            Conditions[condition] = newValue;
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        _this.player.movementLock--;

        _this.hideEventText(event);
      });
    }
  },

  hideEventText: {
    value: function value(event) {
      //this.removeGameObject(event.textBox);
      event.textBox.customData.retired = true;
      event.active = false;
      event.textBox = null;
    }
  },

  _removeRetiredGameObjects: {
    value: function value() {
      var gos = this.getGameObjects();

      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = gos[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var g = _step9.value;

          if (g.customData.retired === true) {
            this.removeGameObject(g);
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }
    }
  },

  _applyFriction: {
    value: function value() {
      var gos = this.getGameObjects();

      for (var i = 0; i < gos.length; i++) {
        gos[i].acceleration.multiply(GameScene.FRICTION);
        gos[i].velocity.multiply(GameScene.FRICTION);
      }
    }
  },

  _handleInput: {
    value: function value() {
      var keys = this.keyboard;

      if (this.player) {
        this.player.handleInput(keys);
      }
    }
  },

  _handleCollisions: {
    value: function value(gameObjects) {
      this.checkTouchEvents();

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.holeCovers[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var cover = _step10.value;
          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {

            for (var _iterator11 = this.voidTiles[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var t = _step11.value;

              if (this.holeCovers.indexOf(cover) < 0) continue;
              if (this.voidTiles.indexOf(t) < 0) continue;

              if (cover.checkNarrowPhaseCollision(t, {})) {
                t.currentState.name = entities.HexTile.STATE.CLAIMING;
                this.voidTiles.splice(this.voidTiles.indexOf(t), 1);
                this.holeCovers.splice(this.holeCovers.indexOf(cover), 1);
                cover.customData.retired = true;
                t.solid = false;
              }
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11.return) {
                _iterator11.return();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      Scene.prototype._handleCollisions.call(this, gameObjects);
    }
  },

  _handleConditions: {
    value: function value() {
      var _this2 = this;

      if (this.blackBox.alpha === 0) {
        if (Conditions.map !== this.map) {
          this._fadeOutMap(function () {
            var newScene = new GameScene(_this2.canvas, _this2.PIXI);
            newScene.setMap(Conditions.map);
            newScene.loadMap();
            _this2.change(newScene);

            _this2.reset();
          });
        }

        if (Conditions.gameover === "true") {
          this._fadeOutMap(function () {
            var GameOverScene = require('./GameOverScene');
            var newScene = new GameOverScene(_this2.canvas, _this2.PIXI);
            _this2.change(newScene);
            _this2.reset();
          });
        }
      }
    }
  },

  _fadeInMap: {
    value: function value(callback) {
      var _this3 = this;

      this.blackBox.alpha = 1;
      this.player.movementLock++;

      var id = window.setInterval(function () {
        _this3.blackBox.alpha -= GameScene.FADE_RATE;
        _this3.blackBox.alpha *= 0.9;

        if (_this3.blackBox.alpha <= 0) {
          window.clearInterval(id);
          _this3.blackBox.alpha = 0;
          _this3.player.movementLock--;
          _this3._stage.removeChild(_this3.blackBox);

          if (callback) {
            callback();
          }
        }
      }, 1);
    }
  },

  _fadeOutMap: {
    value: function value(callback) {
      var _this4 = this;

      this.blackBox.alpha = 0;
      this.player.movementLock++;

      var id = window.setInterval(function () {
        _this4.blackBox.alpha += GameScene.FADE_RATE;
        _this4.blackBox.alpha *= 1.05;

        if (_this4.blackBox.alpha >= 1) {
          window.clearInterval(id);
          _this4.blackBox.alpha = 1;
          _this4.player.movementLock--;

          if (callback) {
            callback();
          }
        }
      }, 1);
    }
  }
}));

module.exports = GameScene;

},{"../Conditions.js":1,"../entities":21,"../map":25,"../util/Assets.js":30,"./GameOverScene":26}],28:[function(require,module,exports){
"use strict";

var $ = wfl.jquery;
var geom = wfl.geom;
var Scene = wfl.display.Scene;
var map = require('../map');
var Assets = require('../util/Assets.js');
var entities = require('../entities');
var GameScene = require('./GameScene');

var Conditions = require('../Conditions.js');

var TitleScene = function TitleScene(canvas, PIXI) {
  Scene.call(this, canvas, PIXI);

  this.PIXI = PIXI;

  this.blackBox = new PIXI.Sprite.fromImage(Assets.BLACK_BOX);
  this.blackBox.alpha = 1;

  this.player = new entities.Title();
  this.player.y = -100;
  this.addGameObject(this.player);

  this.text = null;

  Conditions.jtalk = "0";
  Conditions.jtalk2 = "0";
  Conditions.jend = "0";
  Conditions.dtalk = "0";
  Conditions.mtalk = "0";
  Conditions.gameover = "false";
  Conditions.map = "map0";
};

Object.defineProperties(TitleScene, {});

TitleScene.prototype = Object.freeze(Object.create(Scene.prototype, {
  update: {
    value: function value(dt) {
      var _this = this;

      Scene.prototype.update.call(this, dt);

      if (this.text === null) {
        this.text = new entities.TextBox(PIXI, this.keyboard, this.player, "What have you claimed...?");
        this.text.hasNext = true;

        $(this.text).on('next-text', function () {
          var newScene = new GameScene(_this.canvas, _this.PIXI);
          newScene.setMap(Assets.maps[0].key);
          newScene.loadMap();
          _this.change(newScene);
          _this.reset();
        });

        this.addGameObject(this.text, 5);
      }
    }
  },

  /**
   * (Adapted from wfl.Scene.js) Draws the scene and all game objects in it
   */
  draw: {
    value: function value(renderer) {
      if (this.blackBox.alpha > 0) {
        this.blackBox.width = window.innerWidth;
        this.blackBox.height = window.innerHeight;
        this.blackBox.x = this.camera.position.x - window.innerWidth * 0.5;
        this.blackBox.y = this.camera.position.y - window.innerHeight * 0.5;
        this._stage.addChild(this.blackBox);
      }

      // Clear all children then add only the ones that can be seen
      this._stage.children.length = 0;
      this._lastDrawnGameObjects = this._findSurroundingGameObjects(this.camera, 2).sort(function (a, b) {
        // Sort objects on the same layer by their bottom Y-coordinate
        if (a.layer === b.layer) {
          return a.transform.position._y + a.calculationCache.height * 0.5 - (b.transform.position._y + b.calculationCache.height * 0.5);

          // Otherwise, sort them by layer
        } else {
          return a.layer - b.layer;
        }
      });

      // This seems to perform faster than using filter()
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._lastDrawnGameObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;

          if (this.canSee(obj)) {
            this._stage.addChild(obj);
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
    }
  },

  _handleInput: {
    value: function value() {
      var keys = this.keyboard;
    }
  }
}));

module.exports = TitleScene;

},{"../Conditions.js":1,"../entities":21,"../map":25,"../util/Assets.js":30,"./GameScene":27}],29:[function(require,module,exports){
"use strict";

var GameScene = require('./GameScene.js');
var GameOverScene = require('./GameOverScene.js');
var TitleScene = require('./TitleScene.js');

module.exports = {
    GameScene: GameScene,
    GameOverScene: GameOverScene,
    TitleScene: TitleScene
};

},{"./GameOverScene.js":26,"./GameScene.js":27,"./TitleScene.js":28}],30:[function(require,module,exports){
"use strict";

module.exports = {
  maps: [{ key: 'map0', path: './assets/maps/map0.json' }, { key: 'map1', path: './assets/maps/map1.json' }],

  // MY_GRAPHIC: "./assets/img/MY_GRAPHIC.png",
  BLOCK: "./assets/img/BlockFull.png",
  TILE_WATER: "./assets/img/TileWater.png",
  TILE_JEREMY: "./assets/img/TileJeremy.png",
  TILE_OLD_JEREMY: "./assets/img/TileOldJeremy.png",
  TILE_GRASS: "./assets/img/TileGrass.png",
  TILE_SAND: "./assets/img/TileSand.png",
  TILE_FREE0: "./assets/img/TileFree0.png",
  TILE_FREE1: "./assets/img/TileFree1.png",
  TILE_FREE2: "./assets/img/TileFree2.png",
  TILE_VOID: "./assets/img/TileVoid.png",
  TILE_CLAIMING: "./assets/img/TileClaiming.png",
  TILE_CLAIMED: "./assets/img/TileClaimed.png",

  HOLE: "./assets/img/Hole.png",
  HOLE_COVER: "./assets/img/HoleCover.png",

  BLACK_BOX: "./assets/img/BlackBox.png",

  TITLE0: "./assets/img/Title0.png",
  TITLE1: "./assets/img/Title1.png",
  TITLE2: "./assets/img/Title2.png",

  PLAYER: "./assets/img/Player.png",
  PLAYER_L0: "./assets/img/PlayerL0.png",
  PLAYER_L1: "./assets/img/PlayerL1.png",
  PLAYER_R0: "./assets/img/PlayerR0.png",
  PLAYER_R1: "./assets/img/PlayerR1.png",

  TEXT_BOX: "./assets/img/TextBox.png",
  TEXT_BOX_NEXT: "./assets/img/TextBoxNext.png",
  EVENT_BOUNDS: "./assets/img/EventBounds.png",

  JEREMY0: "./assets/img/Jeremy0.png",
  JEREMY1: "./assets/img/Jeremy1.png",

  NPC_A0: "./assets/img/NPCA0.png",
  NPC_A1: "./assets/img/NPCA1.png",

  NPC_B0: "./assets/img/NPCB0.png",
  NPC_B1: "./assets/img/NPCB1.png",

  NPC_C0: "./assets/img/NPCC0.png",
  NPC_C1: "./assets/img/NPCC1.png",

  // Fonts
  //FONT_TEXTURE: "./assets/font/ld38.png",
  FONT: "./assets/font/ld38.xml",

  // Preloader.js will replace getter with appropriate definition
  get: function get(path) {}
};

},{}],31:[function(require,module,exports){
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

},{"./Assets.js":30}],32:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
	Assets: Assets,
	Preloader: Preloader
};

},{"./Assets.js":30,"./Preloader.js":31}]},{},[22])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25kaXRpb25zLmpzIiwiZW50aXRpZXNcXEJsb2NrRnVsbC5qcyIsImVudGl0aWVzXFxFdmVudEJvdW5kcy5qcyIsImVudGl0aWVzXFxIZXhUaWxlLmpzIiwiZW50aXRpZXNcXEhvbGUuanMiLCJlbnRpdGllc1xcSG9sZUNvdmVyLmpzIiwiZW50aXRpZXNcXEplcmVteS5qcyIsImVudGl0aWVzXFxOUENBLmpzIiwiZW50aXRpZXNcXE5QQ0IuanMiLCJlbnRpdGllc1xcTlBDQy5qcyIsImVudGl0aWVzXFxQbGF5ZXIuanMiLCJlbnRpdGllc1xcVGV4dEJveC5qcyIsImVudGl0aWVzXFxUaWxlRnJlZS5qcyIsImVudGl0aWVzXFxUaWxlR3Jhc3MuanMiLCJlbnRpdGllc1xcVGlsZUplcmVteS5qcyIsImVudGl0aWVzXFxUaWxlT2xkSmVyZW15LmpzIiwiZW50aXRpZXNcXFRpbGVTYW5kLmpzIiwiZW50aXRpZXNcXFRpbGVWb2lkLmpzIiwiZW50aXRpZXNcXFRpbGVXYXRlci5qcyIsImVudGl0aWVzXFxUaXRsZS5qcyIsImVudGl0aWVzXFxpbmRleC5qcyIsImluZGV4LmpzIiwibWFwXFxFbnRpdHlCdWlsZGVyLmpzIiwibWFwXFxNYXBQb29sLmpzIiwibWFwXFxpbmRleC5qcyIsInNjZW5lc1xcR2FtZU92ZXJTY2VuZS5qcyIsInNjZW5lc1xcR2FtZVNjZW5lLmpzIiwic2NlbmVzXFxUaXRsZVNjZW5lLmpzIiwic2NlbmVzXFxpbmRleC5qcyIsInV0aWxcXEFzc2V0cy5qcyIsInV0aWxcXFByZWxvYWRlci5qcyIsInV0aWxcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBaUI7QUFDZjtBQUNBLFNBQU8sR0FGUTtBQUdmLFVBQVEsR0FITztBQUlmLFFBQU0sR0FKUzs7QUFNZjtBQUNBLFNBQU8sR0FQUTs7QUFTZjtBQUNBLFNBQU8sR0FWUTs7QUFZZixZQUFVLE9BWks7O0FBY2YsT0FBSztBQWRVLENBQWpCOzs7QUNBQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7QUFDQSxJQUFJLFVBQVUsUUFBUSxXQUFSLENBQWQ7O0FBRUEsSUFBSSxZQUFZLFNBQVosU0FBWSxHQUFZO0FBQzFCLFVBQVEsSUFBUixDQUFhLElBQWI7O0FBRUEsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sS0FBbEIsRUFBeUIsT0FBM0M7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLEVBQTRDLEtBQUssV0FBakQsQ0FBbEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxVQUFVLEtBQVYsQ0FBZ0IsSUFBOUIsRUFBb0MsS0FBSyxTQUF6QztBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTs7Ozs7Ozs7QUFTQTtBQUNBOzs7QUFJRCxDQTdCRDs7QUErQkEsT0FBTyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQztBQUNqQyxTQUFRO0FBQ04sV0FBUTtBQUNOLFlBQU87QUFERDtBQURGO0FBRHlCLENBQW5DOztBQVFBLFVBQVUsU0FBVixHQUFzQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxRQUFRLFNBQXRCLEVBQWlDO0FBQ25FLFVBQVM7QUFDUCxXQUFRLGVBQVUsRUFBVixFQUFjO0FBQ3BCLGNBQVEsU0FBUixDQUFrQixNQUFsQixDQUF5QixJQUF6QixDQUE4QixJQUE5QixFQUFvQyxFQUFwQzs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQWtCRDtBQXZCTTtBQUQwRCxDQUFqQyxDQUFkLENBQXRCOztBQTRCQSxPQUFPLE1BQVAsQ0FBYyxTQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7O0FDOUVBOztBQUVBLElBQUksT0FBZ0IsSUFBSSxJQUF4QjtBQUNBLElBQUksT0FBZ0IsUUFBUSxTQUFSLENBQXBCO0FBQ0EsSUFBSSxTQUFnQixLQUFLLE1BQXpCO0FBQ0EsSUFBSSxhQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLFVBQXRDO0FBQ0EsSUFBSSxnQkFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixhQUF0QztBQUNBLElBQUksU0FBUyxRQUFRLFVBQVIsQ0FBYjs7QUFFQSxJQUFJLGNBQWMsU0FBZCxXQUFjLEdBQVk7QUFDNUIsZ0JBQWMsSUFBZCxDQUFtQixJQUFuQjs7QUFFQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxZQUFsQixFQUFnQyxPQUFsRDtBQUNBLE9BQUssU0FBTCxHQUFpQixXQUFXLFdBQVgsRUFBakI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsQ0FBbEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxZQUFZLEtBQVosQ0FBa0IsSUFBaEMsRUFBc0MsS0FBSyxTQUEzQzs7QUFFQSxPQUFLLE9BQUwsR0FBZSxLQUFmOztBQUVBLE9BQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxPQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0QsQ0FiRDs7QUFlQSxPQUFPLGdCQUFQLENBQXdCLFdBQXhCLEVBQXFDO0FBQ25DLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEMkIsQ0FBckM7O0FBUUEsWUFBWSxTQUFaLEdBQXdCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLGNBQWMsU0FBNUIsRUFBdUM7QUFDM0UsVUFBUztBQUNQLFdBQVEsZUFBVSxFQUFWLEVBQWM7QUFDcEIsb0JBQWMsU0FBZCxDQUF3QixNQUF4QixDQUErQixJQUEvQixDQUFvQyxJQUFwQyxFQUEwQyxFQUExQzs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQWtCRDtBQXZCTTtBQURrRSxDQUF2QyxDQUFkLENBQXhCOztBQTRCQSxPQUFPLE1BQVAsQ0FBYyxXQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixXQUFqQjs7O0FDOURBOztBQUVBLElBQUksT0FBZ0IsSUFBSSxJQUF4QjtBQUNBLElBQUksT0FBZ0IsUUFBUSxTQUFSLENBQXBCO0FBQ0EsSUFBSSxTQUFnQixLQUFLLE1BQXpCO0FBQ0EsSUFBSSxhQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLFVBQXRDO0FBQ0EsSUFBSSxnQkFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixhQUF0QztBQUNBLElBQUksY0FBYyxRQUFRLGVBQVIsQ0FBbEI7QUFDQSxJQUFJLFNBQVMsUUFBUSxVQUFSLENBQWI7O0FBRUEsSUFBSSxVQUFVLFNBQVYsT0FBVSxHQUFZO0FBQ3hCLGdCQUFjLElBQWQsQ0FBbUIsSUFBbkI7O0FBRUEsT0FBSyxXQUFMLEdBQW1CLEVBQW5COztBQUVBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxDQUFwQixFQUF1QixHQUF2QixFQUE0QjtBQUMxQixRQUFJLElBQUksUUFBUSxLQUFSLEdBQWdCLEdBQWhCLEdBQXNCLEtBQUssR0FBTCxDQUFVLElBQUksQ0FBTCxHQUFVLEtBQUssRUFBZixHQUFvQixDQUE3QixDQUE5QjtBQUNBLFFBQUksSUFBSSxRQUFRLEtBQVIsR0FBZ0IsR0FBaEIsR0FBc0IsS0FBSyxHQUFMLENBQVUsSUFBSSxDQUFMLEdBQVUsS0FBSyxFQUFmLEdBQW9CLENBQTdCLENBQTlCO0FBQ0EsU0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLElBQUksS0FBSyxJQUFULENBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUF0QjtBQUNEOztBQUVELE9BQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxPQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLElBQWxCOztBQUVBLE9BQUssZUFBTCxHQUF1QixJQUF2QjtBQUNBLE9BQUssY0FBTCxHQUFzQixJQUF0Qjs7QUFFQSxPQUFLLGVBQUwsR0FBdUIsQ0FBdkI7QUFDQSxPQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDQSxPQUFLLE1BQUwsR0FBYyxJQUFkOztBQUVBLE9BQUssSUFBTCxHQUFZLElBQVo7QUFDRCxDQXZCRDs7QUF5QkEsT0FBTyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQztBQUMvQixTQUFPO0FBQ0wsV0FBTztBQURGLEdBRHdCO0FBSS9CLFVBQVE7QUFDTixXQUFPO0FBREQsR0FKdUI7QUFPL0IsU0FBTztBQUNMLFdBQU87QUFDTCxnQkFBVSxVQURMO0FBRUwseUJBQW1CLG1CQUZkO0FBR0wsZUFBUztBQUhKO0FBREYsR0FQd0I7QUFjL0IsY0FBWTtBQUNWLFdBQU87QUFERztBQWRtQixDQUFqQzs7QUFtQkEsUUFBUSxTQUFSLEdBQW9CLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLGNBQWMsU0FBNUIsRUFBdUM7QUFDdkUsVUFBUTtBQUNOLFdBQU8sZUFBVSxFQUFWLEVBQWM7QUFDbkIsVUFBSSxZQUFZLEtBQUssWUFBTCxDQUFrQixJQUFsQzs7QUFFQSxjQUFRLFNBQVI7QUFDRSxhQUFLLFFBQVEsS0FBUixDQUFjLFFBQW5CO0FBQ0UsY0FBSSxLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLEtBQUssZUFBM0IsSUFBOEMsQ0FBbEQsRUFBcUQ7QUFDbkQsaUJBQUssUUFBTCxDQUFjLEtBQUssY0FBbkI7QUFDQSxpQkFBSyxRQUFMLENBQWMsS0FBSyxlQUFuQjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsS0FBcEIsR0FBNEIsQ0FBNUI7QUFDRDs7QUFFRCxlQUFLLGVBQUwsSUFBd0IsUUFBUSxVQUFoQztBQUNBLGVBQUssZUFBTCxDQUFxQixLQUFyQixHQUE2QixLQUFLLGVBQWxDOztBQUVBLGNBQUksS0FBSyxlQUFMLElBQXdCLENBQTVCLEVBQStCO0FBQzdCLGlCQUFLLGVBQUwsR0FBdUIsQ0FBdkI7QUFDQSxpQkFBSyxlQUFMLENBQXFCLEtBQXJCLEdBQTZCLENBQTdCO0FBQ0EsaUJBQUssY0FBTCxDQUFvQixLQUFwQixHQUE0QixDQUE1QjtBQUNBLGlCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsR0FBeUIsUUFBUSxLQUFSLENBQWMsaUJBQXZDO0FBQ0Q7QUFDRDs7QUFFRixhQUFLLFFBQVEsS0FBUixDQUFjLGlCQUFuQjtBQUNFLGVBQUssZUFBTCxJQUF3QixRQUFRLFVBQWhDO0FBQ0EsZUFBSyxlQUFMLENBQXFCLEtBQXJCLEdBQTZCLEtBQUssZUFBbEM7O0FBRUEsY0FBSSxLQUFLLGVBQUwsSUFBd0IsQ0FBNUIsRUFBK0I7QUFDN0IsaUJBQUssZUFBTCxHQUF1QixDQUF2QjtBQUNBLGlCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsR0FBeUIsUUFBUSxLQUFSLENBQWMsT0FBdkM7QUFDRDtBQUNEOztBQUVGLGFBQUssUUFBUSxLQUFSLENBQWMsT0FBbkI7QUFDRSxlQUFLLFFBQUwsR0FBZ0IsQ0FBQyxLQUFLLGNBQU4sQ0FBaEI7QUFDQTs7QUFFRjtBQUNFLHdCQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsRUFBMEMsRUFBMUM7QUFsQ0o7QUFvQ0Q7QUF4Q0ssR0FEK0Q7O0FBNEN2RSxrQkFBZ0I7QUFDZCxXQUFPLGVBQVUsV0FBVixFQUF1QixJQUF2QixFQUE2QjtBQUFBOztBQUNsQyxXQUFLLElBQUwsR0FBWSxJQUFaOztBQUVBLFdBQUssZUFBTCxHQUF1QixJQUFJLEtBQUssTUFBTCxDQUFZLFNBQWhCLENBQTBCLE9BQU8sYUFBakMsQ0FBdkI7QUFDQSxXQUFLLGNBQUwsR0FBc0IsSUFBSSxLQUFLLE1BQUwsQ0FBWSxTQUFoQixDQUEwQixPQUFPLFlBQWpDLENBQXRCOztBQUVBLFVBQUksVUFBVSxLQUFLLEtBQUwsR0FBYSxHQUEzQjtBQUNBLFVBQUksVUFBVSxLQUFLLE1BQUwsR0FBYyxHQUE1Qjs7QUFFQSxXQUFLLGVBQUwsQ0FBcUIsQ0FBckIsSUFBMEIsT0FBMUI7QUFDQSxXQUFLLGVBQUwsQ0FBcUIsQ0FBckIsSUFBMEIsT0FBMUI7QUFDQSxXQUFLLGNBQUwsQ0FBb0IsQ0FBcEIsSUFBeUIsT0FBekI7QUFDQSxXQUFLLGNBQUwsQ0FBb0IsQ0FBcEIsSUFBeUIsT0FBekI7O0FBRUEsV0FBSyxlQUFMLENBQXFCLEtBQXJCLEdBQTZCLENBQTdCOztBQUlBLFVBQUksY0FBYyxFQUFsQjs7QUFsQmtDO0FBQUE7QUFBQTs7QUFBQTtBQW9CbEMsNkJBQWdCLFdBQWhCLDhIQUE2QjtBQUFBLGNBQWxCLENBQWtCOztBQUMzQixjQUFJLGFBQWEsV0FBakIsRUFBOEI7QUFDNUIsd0JBQVksSUFBWixDQUFpQixDQUFqQjtBQUNELFdBRkQsTUFFTyxJQUFJLGFBQWEsTUFBakIsRUFBeUI7QUFDOUIsaUJBQUssTUFBTCxHQUFjLENBQWQ7QUFDRDtBQUNGO0FBMUJpQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTRCbEMsa0JBQVksSUFBWixDQUFpQixVQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDekIsWUFBSSxLQUFLLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FDUCxFQUFFLFFBREssRUFFUCxNQUFLLFFBRkUsRUFHUCxtQkFITyxFQUFUO0FBSUEsWUFBSSxLQUFLLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FDUCxNQUFLLFFBREUsRUFFUCxFQUFFLFFBRkssRUFHUCxtQkFITyxFQUFUOztBQUtBLGVBQU8sS0FBSyxFQUFaO0FBQ0QsT0FYRDs7QUFhQSxVQUFJLFlBQVksTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUMxQixZQUFJLEtBQUssd0JBQUwsQ0FBOEIsWUFBWSxDQUFaLENBQTlCLENBQUosRUFBbUQ7QUFDakQsZUFBSyxXQUFMLEdBQW1CLFlBQVksQ0FBWixDQUFuQjtBQUNEO0FBQ0Y7QUFDRjtBQS9DYTtBQTVDdUQsQ0FBdkMsQ0FBZCxDQUFwQjs7QUErRkEsT0FBTyxNQUFQLENBQWMsT0FBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsT0FBakI7OztBQ3ZKQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7QUFDQSxJQUFJLFlBQVksUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSSxnQkFBZ0IsUUFBUSxpQkFBUixDQUFwQjtBQUNBLElBQUksY0FBYyxRQUFRLGVBQVIsQ0FBbEI7QUFDQSxJQUFJLFVBQVUsUUFBUSxXQUFSLENBQWQ7QUFDQSxJQUFJLGFBQWEsUUFBUSxlQUFSLENBQWpCOztBQUVBLElBQUksT0FBTyxTQUFQLElBQU8sR0FBWTtBQUNyQixnQkFBYyxJQUFkLENBQW1CLElBQW5COztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLElBQWxCLEVBQXdCLE9BQTFDO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLFdBQVcsV0FBWCxFQUFqQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixDQUFsQjtBQUNBLE9BQUssU0FBTCxDQUFlLFFBQWYsQ0FBd0IsS0FBSyxVQUE3QjtBQUNBLE9BQUssUUFBTCxDQUFjLEtBQUssS0FBTCxDQUFXLElBQXpCLEVBQStCLEtBQUssU0FBcEM7O0FBRUEsT0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNBLE9BQUssS0FBTCxHQUFhLElBQWI7O0FBRUEsT0FBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsT0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNBLE9BQUssSUFBTCxHQUFZLElBQVo7QUFDQSxPQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDRCxDQWhCRDs7QUFrQkEsT0FBTyxnQkFBUCxDQUF3QixJQUF4QixFQUE4QjtBQUM1QixTQUFRO0FBQ04sV0FBUTtBQUNOLFlBQU8sTUFERDtBQUVOLGNBQVEsUUFGRjtBQUdOLGdCQUFVO0FBSEo7QUFERjtBQURvQixDQUE5Qjs7QUFVQSxLQUFLLFNBQUwsR0FBaUIsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsY0FBYyxTQUE1QixFQUF1QztBQUNwRSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQixvQkFBYyxTQUFkLENBQXdCLE1BQXhCLENBQStCLElBQS9CLENBQW9DLElBQXBDLEVBQTBDLEVBQTFDOztBQUVBLFVBQUksWUFBWSxLQUFLLFlBQUwsQ0FBa0IsSUFBbEM7O0FBRUEsY0FBUSxTQUFSO0FBQ0UsYUFBSyxLQUFLLEtBQUwsQ0FBVyxJQUFoQjtBQUNJLGNBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2xCLGdCQUFJLGVBQWUsS0FBSyxJQUFMLENBQVUsUUFBVixDQUNqQixLQUFLLFFBRFksRUFFakIsS0FBSyxTQUFMLENBQWUsUUFGRSxDQUFuQjs7QUFLQSxnQkFBSSxhQUFhLG1CQUFiLEtBQXFDLENBQXpDLEVBQTRDO0FBQzFDLGtCQUFJLFVBQVUsYUFBYSxLQUFiLEdBQXFCLFFBQXJCLENBQThCLEtBQTlCLENBQWQ7QUFDQSxtQkFBSyxTQUFMLENBQWUsUUFBZixDQUF3QixHQUF4QixDQUE0QixPQUE1QjtBQUNELGFBSEQsTUFHTztBQUNMLG1CQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsbUJBQUssWUFBTCxDQUFrQixJQUFsQixHQUF5QixLQUFLLEtBQUwsQ0FBVyxNQUFwQztBQUNEO0FBQ0Y7QUFDSDs7QUFFRixhQUFLLEtBQUssS0FBTCxDQUFXLE1BQWhCO0FBQ0UsY0FBSSxLQUFLLEtBQUwsR0FBYSxDQUFqQixFQUFvQjtBQUNsQixpQkFBSyxLQUFMLElBQWMsR0FBZDtBQUNBLGlCQUFLLFNBQUwsQ0FBZSxLQUFmLElBQXdCLEdBQXhCO0FBQ0QsV0FIRCxNQUdPO0FBQ0wsaUJBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxpQkFBSyxTQUFMLENBQWUsS0FBZixHQUF1QixDQUF2QjtBQUNBLGlCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsR0FBeUIsS0FBSyxLQUFMLENBQVcsUUFBcEM7QUFDQSxpQkFBSyxJQUFMLENBQVUsWUFBVixDQUF1QixJQUF2QixHQUE4QixRQUFRLEtBQVIsQ0FBYyxRQUE1QztBQUNEO0FBQ0Q7O0FBRUYsYUFBSyxLQUFLLEtBQUwsQ0FBVyxRQUFoQjtBQUNFLGNBQUksS0FBSyxXQUFULEVBQXNCO0FBQ3BCLGdCQUFJLFFBQVEsS0FBSyxXQUFMLENBQWlCLFVBQWpCLENBQTRCLEtBQXhDOztBQURvQjtBQUFBO0FBQUE7O0FBQUE7QUFHcEIsbUNBQWdCLEtBQWhCLDhIQUF1QjtBQUFBLG9CQUFaLENBQVk7O0FBQ3JCLG9CQUFJLEVBQUUsR0FBRixLQUFVLFdBQWQsRUFBMkI7O0FBRTNCLG9CQUFJLE9BQU8sRUFBRSxLQUFGLENBQVEsS0FBUixDQUFjLEdBQWQsQ0FBWDs7QUFFQSxvQkFBSSxhQUFhLEtBQUssTUFBdEI7QUFDQSxvQkFBSSxZQUFZLEVBQWhCOztBQUVBLHFCQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksVUFBcEIsRUFBZ0MsS0FBSyxDQUFyQyxFQUF3QztBQUN0QyxzQkFBSSxPQUFPLEtBQUssQ0FBTCxDQUFYO0FBQ0Esc0JBQUksU0FBVSxLQUFLLElBQUksQ0FBVCxDQUFkOztBQUVBLDRCQUFVLElBQVYsQ0FBZTtBQUNiLCtCQUFXLElBREU7QUFFYiw4QkFBVTtBQUZHLG1CQUFmO0FBSUQ7O0FBaEJvQjtBQUFBO0FBQUE7O0FBQUE7QUFrQnJCLHdDQUFnQixTQUFoQixtSUFBMkI7QUFBQSx3QkFBbEIsR0FBa0I7QUFBQSx3QkFDcEIsU0FEb0IsR0FDRyxHQURILENBQ3BCLFNBRG9CO0FBQUEsd0JBQ1QsUUFEUyxHQUNHLEdBREgsQ0FDVCxRQURTOztBQUV6QiwrQkFBVyxTQUFYLElBQXdCLFFBQXhCO0FBQ0Q7QUFyQm9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFzQnRCO0FBekJtQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBMEJyQjs7QUFFRCxlQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsR0FBMEIsSUFBMUI7QUFDQSxlQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLE9BQTFCLEdBQW9DLElBQXBDO0FBQ0E7QUE3REo7O0FBZ0VBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBekZNLEdBRDJEOztBQTZGcEUsa0JBQWdCO0FBQ2QsV0FBTyxlQUFVLFdBQVYsRUFBdUI7QUFBQTs7QUFDNUIsVUFBSSxpQkFBaUIsRUFBckI7QUFDQSxVQUFJLGNBQWMsRUFBbEI7O0FBRjRCO0FBQUE7QUFBQTs7QUFBQTtBQUk1Qiw4QkFBZ0IsV0FBaEIsbUlBQTZCO0FBQUEsY0FBbEIsQ0FBa0I7O0FBQzNCLGNBQUksYUFBYSxhQUFqQixFQUFnQztBQUM5QiwyQkFBZSxJQUFmLENBQW9CLENBQXBCO0FBQ0QsV0FGRCxNQUVPLElBQUksYUFBYSxXQUFqQixFQUE4QjtBQUNuQyx3QkFBWSxJQUFaLENBQWlCLENBQWpCO0FBQ0Q7QUFDRjtBQVYyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVk1QixxQkFBZSxJQUFmLENBQW9CLFVBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUM1QixZQUFJLEtBQUssS0FBSyxJQUFMLENBQVUsUUFBVixDQUNQLEVBQUUsUUFESyxFQUVQLE1BQUssUUFGRSxFQUdQLG1CQUhPLEVBQVQ7QUFJQSxZQUFJLEtBQUssS0FBSyxJQUFMLENBQVUsUUFBVixDQUNQLE1BQUssUUFERSxFQUVQLEVBQUUsUUFGSyxFQUdQLG1CQUhPLEVBQVQ7O0FBS0EsZUFBTyxLQUFLLEVBQVo7QUFDRCxPQVhEOztBQWFBLGtCQUFZLElBQVosQ0FBaUIsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ3pCLFlBQUksS0FBSyxLQUFLLElBQUwsQ0FBVSxRQUFWLENBQ1AsRUFBRSxRQURLLEVBRVAsTUFBSyxRQUZFLEVBR1AsbUJBSE8sRUFBVDtBQUlBLFlBQUksS0FBSyxLQUFLLElBQUwsQ0FBVSxRQUFWLENBQ1AsTUFBSyxRQURFLEVBRVAsRUFBRSxRQUZLLEVBR1AsbUJBSE8sRUFBVDs7QUFLQSxlQUFPLEtBQUssRUFBWjtBQUNELE9BWEQ7O0FBYUEsVUFBSSxlQUFlLE1BQWYsR0FBd0IsQ0FBNUIsRUFBK0I7QUFDN0IsWUFBSSxLQUFLLHdCQUFMLENBQThCLGVBQWUsQ0FBZixDQUE5QixDQUFKLEVBQXNEO0FBQ3BELGVBQUssSUFBTCxHQUFZLGVBQWUsQ0FBZixDQUFaO0FBQ0Q7QUFDRjs7QUFFRCxVQUFJLFlBQVksTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUMxQixZQUFJLEtBQUssd0JBQUwsQ0FBOEIsWUFBWSxDQUFaLENBQTlCLENBQUosRUFBbUQ7QUFDakQsZUFBSyxXQUFMLEdBQW1CLFlBQVksQ0FBWixDQUFuQjtBQUNEO0FBQ0Y7QUFDRjtBQWxEYSxHQTdGb0Q7O0FBa0pwRSxjQUFZO0FBQ1YsV0FBTyxlQUFVLEdBQVYsRUFBZTtBQUNwQixhQUFPLEVBQUUsZUFBZSxTQUFqQixDQUFQO0FBQ0Q7QUFIUyxHQWxKd0Q7O0FBd0pwRSxhQUFXO0FBQ1QsV0FBTyxlQUFVLEdBQVYsRUFBZTtBQUNwQixVQUFJLGVBQWUsU0FBbkIsRUFBOEI7QUFDNUIsWUFBSSxjQUFjLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsSUFBSSxRQUF2QixFQUFpQyxLQUFLLFFBQXRDLEVBQ0MsbUJBREQsRUFBbEI7O0FBR0EsWUFBSSxjQUFjLEtBQUssS0FBTCxHQUFhLEtBQUssS0FBbEIsR0FBMEIsSUFBMUIsR0FBaUMsSUFBbkQsRUFBeUQ7QUFDdkQsZUFBSyxTQUFMLEdBQWlCLEdBQWpCO0FBQ0EsZUFBSyxTQUFMLENBQWUsWUFBZixHQUE4QixJQUE5QjtBQUNBLGVBQUssU0FBTCxDQUFlLElBQWYsR0FBc0IsUUFBdEI7QUFDRDtBQUNGO0FBQ0Y7QUFaUTtBQXhKeUQsQ0FBdkMsQ0FBZCxDQUFqQjs7QUF3S0EsT0FBTyxNQUFQLENBQWMsSUFBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQ25OQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7QUFDQSxJQUFJLFNBQVMsUUFBUSxVQUFSLENBQWI7O0FBRUEsSUFBSSxZQUFZLFNBQVosU0FBWSxHQUFZO0FBQzFCLGdCQUFjLElBQWQsQ0FBbUIsSUFBbkI7O0FBRUEsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sVUFBbEIsRUFBOEIsT0FBaEQ7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsVUFBVSxLQUFWLENBQWdCLElBQTlCLEVBQW9DLEtBQUssU0FBekM7O0FBRUEsT0FBSyxLQUFMLEdBQWEsSUFBYjs7QUFFQTtBQUNBLE9BQUssUUFBTCxHQUF1QixVQUFVLFNBQWpDO0FBQ0EsT0FBSyxlQUFMLEdBQXVCLFVBQVUsZ0JBQWpDOztBQUVBLE9BQUssSUFBTCxHQUFZLEdBQVo7QUFDQSxPQUFLLFdBQUwsR0FBbUIsR0FBbkI7QUFDQSxPQUFLLFFBQUwsR0FBZ0IsR0FBaEI7O0FBRUEsT0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0QsQ0FwQkQ7O0FBc0JBLE9BQU8sZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUM7QUFDakMsU0FBUTtBQUNOLFdBQVE7QUFDTixZQUFPO0FBREQ7QUFERixHQUR5Qjs7QUFPakMsYUFBWTtBQUNWLFdBQVE7QUFERSxHQVBxQjs7QUFXakMsb0JBQW1CO0FBQ2pCLFdBQVE7QUFEUztBQVhjLENBQW5DOztBQWdCQSxVQUFVLFNBQVYsR0FBc0IsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsY0FBYyxTQUE1QixFQUF1QztBQUN6RSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQixvQkFBYyxTQUFkLENBQXdCLE1BQXhCLENBQStCLElBQS9CLENBQW9DLElBQXBDLEVBQTBDLEVBQTFDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNOztBQTBCVDs7Ozs7Ozs7O0FBM0J5RSxDQUF2QyxDQUFkLENBQXRCOztBQXNDQSxPQUFPLE1BQVAsQ0FBYyxTQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7O0FDdkZBOztBQUVBLElBQUksT0FBZ0IsSUFBSSxJQUF4QjtBQUNBLElBQUksT0FBZ0IsUUFBUSxTQUFSLENBQXBCO0FBQ0EsSUFBSSxTQUFnQixLQUFLLE1BQXpCO0FBQ0EsSUFBSSxhQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLFVBQXRDO0FBQ0EsSUFBSSxnQkFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixhQUF0Qzs7QUFFQSxJQUFJLFNBQVMsU0FBVCxNQUFTLEdBQVk7QUFDdkIsZ0JBQWMsSUFBZCxDQUFtQixJQUFuQjs7QUFFQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxPQUFsQixFQUEyQixPQUE3QztBQUNBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLE9BQWxCLEVBQTJCLE9BQTdDO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLFdBQVcsV0FBWCxFQUFqQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxFQUF4QyxDQUFsQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxFQUF4QyxDQUFsQjtBQUNBLE9BQUssU0FBTCxDQUFlLFFBQWYsQ0FBd0IsS0FBSyxVQUE3QjtBQUNBLE9BQUssU0FBTCxDQUFlLFFBQWYsQ0FBd0IsS0FBSyxVQUE3QjtBQUNBLE9BQUssUUFBTCxDQUFjLE9BQU8sS0FBUCxDQUFhLElBQTNCLEVBQWlDLEtBQUssU0FBdEM7QUFDQTtBQUNBOzs7OztBQUtBO0FBQ0E7Ozs7Ozs7O0FBU0E7QUFDQTs7OztBQUlBLE9BQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxPQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0QsQ0FsQ0Q7O0FBb0NBLE9BQU8sZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0M7QUFDOUIsU0FBUTtBQUNOLFdBQVE7QUFDTixZQUFPO0FBREQ7QUFERjtBQURzQixDQUFoQzs7QUFRQSxPQUFPLFNBQVAsR0FBbUIsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsY0FBYyxTQUE1QixFQUF1QztBQUN0RSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQixvQkFBYyxTQUFkLENBQXdCLE1BQXhCLENBQStCLElBQS9CLENBQW9DLElBQXBDLEVBQTBDLEVBQTFDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNO0FBRDZELENBQXZDLENBQWQsQ0FBbkI7O0FBNEJBLE9BQU8sTUFBUCxDQUFjLE1BQWQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7QUNsRkE7O0FBRUEsSUFBSSxPQUFnQixJQUFJLElBQXhCO0FBQ0EsSUFBSSxPQUFnQixRQUFRLFNBQVIsQ0FBcEI7QUFDQSxJQUFJLFNBQWdCLEtBQUssTUFBekI7QUFDQSxJQUFJLGFBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsVUFBdEM7QUFDQSxJQUFJLGdCQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLGFBQXRDOztBQUVBLElBQUksT0FBTyxTQUFQLElBQU8sR0FBWTtBQUNyQixnQkFBYyxJQUFkLENBQW1CLElBQW5COztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLE1BQWxCLEVBQTBCLE9BQTVDO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sTUFBbEIsRUFBMEIsT0FBNUM7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLENBQWxCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsS0FBSyxLQUFMLENBQVcsSUFBekIsRUFBK0IsS0FBSyxTQUFwQztBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTs7Ozs7Ozs7QUFTQTtBQUNBOzs7O0FBSUEsT0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLE9BQUssS0FBTCxHQUFhLElBQWI7QUFDRCxDQWxDRDs7QUFvQ0EsT0FBTyxnQkFBUCxDQUF3QixJQUF4QixFQUE4QjtBQUM1QixTQUFRO0FBQ04sV0FBUTtBQUNOLFlBQU87QUFERDtBQURGO0FBRG9CLENBQTlCOztBQVFBLEtBQUssU0FBTCxHQUFpQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxjQUFjLFNBQTVCLEVBQXVDO0FBQ3BFLFVBQVM7QUFDUCxXQUFRLGVBQVUsRUFBVixFQUFjO0FBQ3BCLG9CQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsRUFBMEMsRUFBMUM7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQ7QUF2Qk07QUFEMkQsQ0FBdkMsQ0FBZCxDQUFqQjs7QUE0QkEsT0FBTyxNQUFQLENBQWMsSUFBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQ2xGQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7O0FBRUEsSUFBSSxPQUFPLFNBQVAsSUFBTyxHQUFZO0FBQ3JCLGdCQUFjLElBQWQsQ0FBbUIsSUFBbkI7O0FBRUEsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sTUFBbEIsRUFBMEIsT0FBNUM7QUFDQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxNQUFsQixFQUEwQixPQUE1QztBQUNBLE9BQUssU0FBTCxHQUFpQixXQUFXLFdBQVgsRUFBakI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsQ0FBbEI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsQ0FBbEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxLQUFLLEtBQUwsQ0FBVyxJQUF6QixFQUErQixLQUFLLFNBQXBDO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBOzs7Ozs7OztBQVNBO0FBQ0E7Ozs7QUFJQSxPQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsT0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNELENBbENEOztBQW9DQSxPQUFPLGdCQUFQLENBQXdCLElBQXhCLEVBQThCO0FBQzVCLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEb0IsQ0FBOUI7QUFPQSxLQUFLLFNBQUwsR0FBaUIsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsY0FBYyxTQUE1QixFQUF1QztBQUNwRSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQixvQkFBYyxTQUFkLENBQXdCLE1BQXhCLENBQStCLElBQS9CLENBQW9DLElBQXBDLEVBQTBDLEVBQTFDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNO0FBRDJELENBQXZDLENBQWQsQ0FBakI7O0FBNEJBLE9BQU8sTUFBUCxDQUFjLElBQWQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7QUNqRkE7O0FBRUEsSUFBSSxPQUFnQixJQUFJLElBQXhCO0FBQ0EsSUFBSSxPQUFnQixRQUFRLFNBQVIsQ0FBcEI7QUFDQSxJQUFJLFNBQWdCLEtBQUssTUFBekI7QUFDQSxJQUFJLGFBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsVUFBdEM7QUFDQSxJQUFJLGdCQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLGFBQXRDOztBQUVBLElBQUksT0FBTyxTQUFQLElBQU8sR0FBWTtBQUNyQixnQkFBYyxJQUFkLENBQW1CLElBQW5COztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLE1BQWxCLEVBQTBCLE9BQTVDO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sTUFBbEIsRUFBMEIsT0FBNUM7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLENBQWxCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsS0FBSyxLQUFMLENBQVcsSUFBekIsRUFBK0IsS0FBSyxTQUFwQztBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTs7Ozs7Ozs7QUFTQTtBQUNBOzs7O0FBSUEsT0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLE9BQUssS0FBTCxHQUFhLElBQWI7QUFDRCxDQWxDRDs7QUFvQ0EsT0FBTyxnQkFBUCxDQUF3QixJQUF4QixFQUE4QjtBQUM1QixTQUFRO0FBQ04sV0FBUTtBQUNOLFlBQU87QUFERDtBQURGO0FBRG9CLENBQTlCOztBQVFBLEtBQUssU0FBTCxHQUFpQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxjQUFjLFNBQTVCLEVBQXVDO0FBQ3BFLFVBQVM7QUFDUCxXQUFRLGVBQVUsRUFBVixFQUFjO0FBQ3BCLG9CQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsRUFBMEMsRUFBMUM7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQ7QUF2Qk07QUFEMkQsQ0FBdkMsQ0FBZCxDQUFqQjs7QUE0QkEsT0FBTyxNQUFQLENBQWMsSUFBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQ2xGQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7O0FBRUEsSUFBSSxTQUFTLFNBQVQsTUFBUyxHQUFZO0FBQ3ZCLGdCQUFjLElBQWQsQ0FBbUIsSUFBbkI7O0FBRUEsTUFBSSxRQUFRLENBQ1YsSUFBSSxLQUFLLElBQVQsQ0FBYyxDQUFDLEVBQWYsRUFBbUIsQ0FBQyxFQUFwQixDQURVLEVBRVYsSUFBSSxLQUFLLElBQVQsQ0FBYyxFQUFkLEVBQWtCLENBQUMsRUFBbkIsQ0FGVSxFQUdWLElBQUksS0FBSyxJQUFULENBQWMsRUFBZCxFQUFrQixFQUFsQixDQUhVLEVBSVYsSUFBSSxLQUFLLElBQVQsQ0FBYyxDQUFDLEVBQWYsRUFBbUIsRUFBbkIsQ0FKVSxDQUFaOztBQU9BLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLFNBQWxCLEVBQTZCLE9BQS9DO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sU0FBbEIsRUFBNkIsT0FBL0M7QUFDQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxTQUFsQixFQUE2QixPQUEvQztBQUNBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLFNBQWxCLEVBQTZCLE9BQS9DOztBQUVBLE9BQUssU0FBTCxHQUFpQixXQUFXLFdBQVgsRUFBakI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsRUFBNEMsS0FBNUMsQ0FBbEI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsRUFBNEMsS0FBNUMsQ0FBbEI7QUFDQSxPQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsSUFBcUIsRUFBckI7QUFDQSxPQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsSUFBcUIsRUFBckI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxPQUFPLEtBQVAsQ0FBYSxJQUEzQixFQUFpQyxLQUFLLFNBQXRDOztBQUVBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsRUFBbEI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsRUFBNEMsS0FBNUMsQ0FBbEI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsRUFBNEMsS0FBNUMsQ0FBbEI7QUFDQSxPQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsSUFBcUIsRUFBckI7QUFDQSxPQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsSUFBcUIsRUFBckI7QUFDQSxPQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBeUIsS0FBSyxVQUE5QjtBQUNBLE9BQUssVUFBTCxDQUFnQixRQUFoQixDQUF5QixLQUFLLFVBQTlCO0FBQ0EsT0FBSyxRQUFMLENBQWMsT0FBTyxLQUFQLENBQWEsS0FBM0IsRUFBa0MsS0FBSyxVQUF2Qzs7QUFFQTtBQUNBLE9BQUssbUJBQUwsR0FBMkIsRUFBM0I7O0FBRUE7QUFDQSxPQUFLLFFBQUwsR0FBdUIsT0FBTyxTQUE5QjtBQUNBLE9BQUssZUFBTCxHQUF1QixPQUFPLGdCQUE5Qjs7QUFFQSxPQUFLLFlBQUwsR0FBb0IsQ0FBcEI7O0FBRUEsT0FBSyxJQUFMLEdBQVksRUFBWjtBQUNBLE9BQUssV0FBTCxHQUFtQixHQUFuQjtBQUNBLE9BQUssUUFBTCxHQUFnQixDQUFoQjtBQUNELENBN0NEOztBQStDQSxPQUFPLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDO0FBQzlCLGFBQVk7QUFDVixXQUFRO0FBREUsR0FEa0I7O0FBSzlCLG9CQUFtQjtBQUNqQixXQUFRO0FBRFMsR0FMVzs7QUFTOUIsb0JBQW1CO0FBQ2pCLFdBQVE7QUFEUyxHQVRXOztBQWE5Qiw2QkFBNEI7QUFDMUIsV0FBUTtBQURrQixHQWJFOztBQWlCOUIsc0JBQXFCO0FBQ25CLFdBQVE7QUFEVyxHQWpCUztBQW9COUIsU0FBUTtBQUNOLFdBQVE7QUFDTixZQUFPLE1BREQ7QUFFTixhQUFRO0FBRkY7QUFERjtBQXBCc0IsQ0FBaEM7O0FBNEJBLE9BQU8sU0FBUCxHQUFtQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxjQUFjLFNBQTVCLEVBQXVDO0FBQ3RFLFVBQVM7QUFDUCxXQUFRLGVBQVUsRUFBVixFQUFjO0FBQ3BCLG9CQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsRUFBMEMsRUFBMUM7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQ7QUF2Qk0sR0FENkQ7O0FBMkJ0RSxlQUFhO0FBQ1gsV0FBTyxlQUFVLFFBQVYsRUFBb0I7QUFDekIsVUFBSSxLQUFLLFlBQUwsR0FBb0IsQ0FBeEIsRUFBMkI7O0FBRTNCLFVBQUksWUFBZ0IsU0FBUyxTQUFULENBQW1CLFNBQVMsS0FBNUIsQ0FBcEI7QUFDQSxVQUFJLGNBQWdCLFNBQVMsaUJBQVQsRUFBcEI7QUFDQSxVQUFJLGVBQWdCLENBQUMsQ0FBckI7QUFDQSxVQUFJLGdCQUFnQixDQUFDLENBQXJCO0FBQ0EsVUFBSSxhQUFnQixDQUFDLENBQXJCO0FBQ0EsVUFBSSxlQUFnQixDQUFDLENBQXJCOztBQUVBO0FBQ0EsV0FBSyxJQUFJLElBQUksS0FBSyxtQkFBTCxDQUF5QixNQUF0QyxFQUE4QyxLQUFLLENBQW5ELEVBQXNELEdBQXRELEVBQTJEO0FBQ3pELFlBQUksQ0FBQyxTQUFTLFNBQVQsQ0FBbUIsS0FBSyxtQkFBTCxDQUF5QixDQUF6QixDQUFuQixDQUFMLEVBQXNEO0FBQ3BELGVBQUssbUJBQUwsQ0FBeUIsTUFBekIsQ0FBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkM7QUFDRDtBQUNGOztBQUVEO0FBQ0EsVUFBSSxjQUFjLENBQUMsQ0FBbkIsRUFBc0I7QUFDcEIsZ0JBQVEsV0FBUjtBQUNFLGVBQUssU0FBUyxJQUFkO0FBQ0EsZUFBSyxTQUFTLEtBQWQ7QUFDQSxlQUFLLFNBQVMsRUFBZDtBQUNBLGVBQUssU0FBUyxJQUFkO0FBQ0UsaUJBQUssbUJBQUwsQ0FBeUIsSUFBekIsQ0FBOEIsV0FBOUI7QUFDQTtBQU5KO0FBUUQ7O0FBRUQ7QUFDQSxVQUFJLGtCQUFrQixDQUF0QjtBQUNBLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLG1CQUFMLENBQXlCLE1BQTdDLEVBQXFELEdBQXJELEVBQTBEO0FBQ3hELGdCQUFRLEtBQUssbUJBQUwsQ0FBeUIsQ0FBekIsQ0FBUjtBQUNFLGVBQUssU0FBUyxJQUFkO0FBQ0UsMkJBQWUsZUFBZjtBQUNBO0FBQ0E7QUFDRixlQUFLLFNBQVMsS0FBZDtBQUNFLDRCQUFnQixlQUFoQjtBQUNBO0FBQ0E7QUFDRixlQUFLLFNBQVMsRUFBZDtBQUNFLHlCQUFhLGVBQWI7QUFDQTtBQUNBO0FBQ0YsZUFBSyxTQUFTLElBQWQ7QUFDRSwyQkFBZSxlQUFmO0FBQ0E7QUFDQTtBQWhCSjtBQWtCRDs7QUFFRDtBQUNBLFVBQUksS0FBSjtBQUNBLFVBQUksU0FBSixFQUFlO0FBQ2IsZ0JBQVEsT0FBTyx5QkFBZjtBQUNBLGFBQUssUUFBTCxHQUFnQixPQUFPLGdCQUF2QjtBQUNELE9BSEQsTUFHTztBQUNMLGdCQUFRLE9BQU8sa0JBQWY7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsT0FBTyxTQUF2QjtBQUNEOztBQUVEO0FBQ0EsVUFBSSxlQUFlLGFBQW5CLEVBQWtDO0FBQ2hDLFlBQUksZ0JBQWdCLElBQUksS0FBSyxJQUFULENBQWMsQ0FBQyxDQUFmLEVBQWtCLENBQWxCLENBQXBCO0FBQ0Esc0JBQWMsUUFBZCxDQUNFLFFBQVEsS0FBSyxJQURmOztBQUlBLGFBQUssUUFBTCxDQUFjLGFBQWQ7QUFDQSxhQUFLLFFBQUwsQ0FBYyxPQUFPLEtBQVAsQ0FBYSxJQUEzQjtBQUNEO0FBQ0QsVUFBSSxnQkFBZ0IsWUFBcEIsRUFBa0M7QUFDaEMsWUFBSSxnQkFBZ0IsSUFBSSxLQUFLLElBQVQsQ0FBYyxDQUFkLEVBQWlCLENBQWpCLENBQXBCO0FBQ0Esc0JBQWMsUUFBZCxDQUNFLFFBQVEsS0FBSyxJQURmOztBQUlBLGFBQUssUUFBTCxDQUFjLGFBQWQ7QUFDQSxhQUFLLFFBQUwsQ0FBYyxPQUFPLEtBQVAsQ0FBYSxLQUEzQjtBQUNEO0FBQ0QsVUFBSSxhQUFhLFlBQWpCLEVBQStCO0FBQzdCLFlBQUksZ0JBQWdCLElBQUksS0FBSyxJQUFULENBQWMsQ0FBZCxFQUFpQixDQUFDLENBQWxCLENBQXBCO0FBQ0Esc0JBQWMsUUFBZCxDQUNFLFFBQVEsS0FBSyxJQURmOztBQUlBLGFBQUssUUFBTCxDQUFjLGFBQWQ7QUFDRDtBQUNELFVBQUksZUFBZSxVQUFuQixFQUErQjtBQUM3QixZQUFJLGdCQUFnQixJQUFJLEtBQUssSUFBVCxDQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBcEI7QUFDQSxzQkFBYyxRQUFkLENBQ0UsUUFBUSxLQUFLLElBRGY7O0FBSUEsYUFBSyxRQUFMLENBQWMsYUFBZDtBQUNEO0FBQ0Y7QUFsR1U7QUEzQnlELENBQXZDLENBQWQsQ0FBbkI7O0FBaUlBLE9BQU8sTUFBUCxDQUFjLE1BQWQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7QUN0TkE7O0FBRUEsSUFBSSxJQUFnQixJQUFJLE1BQXhCO0FBQ0EsSUFBSSxPQUFnQixJQUFJLElBQXhCO0FBQ0EsSUFBSSxPQUFnQixRQUFRLFNBQVIsQ0FBcEI7QUFDQSxJQUFJLFNBQWdCLEtBQUssTUFBekI7QUFDQSxJQUFJLGFBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsVUFBdEM7QUFDQSxJQUFJLGdCQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLGFBQXRDOztBQUVBLElBQUksVUFBVSxTQUFWLE9BQVUsQ0FBVSxJQUFWLEVBQWdCLFFBQWhCLEVBQTBCLE1BQTFCLEVBQWdFO0FBQUEsTUFBOUIsSUFBOEIsdUVBQXZCLEVBQXVCO0FBQUEsTUFBbkIsWUFBbUIsdUVBQUosRUFBSTs7QUFDNUUsZ0JBQWMsSUFBZCxDQUFtQixJQUFuQjs7QUFFQSxPQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxPQUFLLFdBQUwsR0FBbUIsQ0FBbkI7QUFDQSxPQUFLLFlBQUwsR0FBb0IsWUFBcEI7O0FBRUEsT0FBSyxRQUFMLEdBQWdCLFFBQWhCOztBQUVBLE9BQUssU0FBTCxHQUFpQixJQUFJLEtBQUssTUFBTCxDQUFZLFNBQWhCLENBQTBCLE9BQU8sUUFBakMsQ0FBakI7QUFDQSxPQUFLLGFBQUwsR0FBcUIsSUFBSSxLQUFLLE1BQUwsQ0FBWSxTQUFoQixDQUEwQixPQUFPLGFBQWpDLENBQXJCO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLElBQUksS0FBSyxNQUFMLENBQVksVUFBaEIsQ0FBMkIsRUFBM0IsRUFBK0IsRUFBRSxNQUFNLFdBQVIsRUFBL0IsQ0FBakI7O0FBRUE7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLEdBQTBCLEtBQUssU0FBTCxDQUFlLEtBQWYsR0FBdUIsUUFBUSxPQUFSLEdBQWtCLENBQW5FOztBQUVBLE1BQUksVUFBVSxLQUFLLFNBQUwsQ0FBZSxLQUFmLEdBQXVCLEdBQXJDO0FBQ0EsTUFBSSxVQUFVLEtBQUssU0FBTCxDQUFlLE1BQWYsR0FBd0IsR0FBdEM7O0FBRUEsT0FBSyxTQUFMLENBQWUsQ0FBZixJQUFvQixPQUFwQjtBQUNBLE9BQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsT0FBcEI7QUFDQSxPQUFLLGFBQUwsQ0FBbUIsQ0FBbkIsSUFBd0IsT0FBeEI7QUFDQSxPQUFLLGFBQUwsQ0FBbUIsQ0FBbkIsSUFBd0IsT0FBeEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxDQUFmLElBQW9CLFVBQVUsUUFBUSxPQUF0QztBQUNBLE9BQUssU0FBTCxDQUFlLENBQWYsSUFBb0IsVUFBVSxRQUFRLE9BQXRDOztBQUVBLE9BQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxPQUFLLEtBQUwsR0FBYSxJQUFiOztBQUVBLE9BQUssUUFBTCxDQUFjLEtBQUssU0FBbkI7QUFDQSxPQUFLLFFBQUwsQ0FBYyxLQUFLLFNBQW5COztBQUVBLE9BQUssS0FBTCxHQUFhLElBQWI7O0FBRUEsT0FBSyxNQUFMLEdBQWMsTUFBZDs7QUFFQSxPQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0QsQ0FyQ0Q7O0FBdUNBLE9BQU8sZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUM7QUFDL0IsU0FBUTtBQUNOLFdBQVE7QUFDTixZQUFPO0FBREQ7QUFERixHQUR1Qjs7QUFPL0I7QUFDQSxvQkFBa0I7QUFDaEIsV0FBTyxJQUFJO0FBREssR0FSYTs7QUFZL0IsV0FBUztBQUNQLFdBQU87QUFEQSxHQVpzQjs7QUFnQi9CLGNBQVk7QUFDVixXQUFPO0FBREc7QUFoQm1CLENBQWpDOztBQXFCQSxRQUFRLFNBQVIsR0FBb0IsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsY0FBYyxTQUE1QixFQUF1QztBQUN2RSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQjtBQUNBLFdBQUssU0FBTCxDQUFlLENBQWYsR0FBbUIsS0FBSyxLQUFMLENBQVcsS0FBSyxTQUFMLENBQWUsQ0FBMUIsSUFBK0IsR0FBbEQ7QUFDQSxXQUFLLFNBQUwsQ0FBZSxDQUFmLEdBQW1CLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLENBQTFCLElBQStCLEdBQWxEO0FBQ0EsV0FBSyxDQUFMLEdBQVMsS0FBSyxLQUFMLENBQVcsS0FBSyxDQUFoQixDQUFUO0FBQ0EsV0FBSyxDQUFMLEdBQVMsS0FBSyxLQUFMLENBQVcsS0FBSyxDQUFoQixDQUFUO0FBQ0EsVUFBSSxLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLEtBQUssU0FBM0IsS0FBeUMsQ0FBN0MsRUFBZ0Q7QUFDOUMsYUFBSyxTQUFMLENBQWUsQ0FBZixHQUFtQixLQUFLLEtBQUwsQ0FBVyxLQUFLLFNBQUwsQ0FBZSxDQUExQixJQUErQixHQUFsRDtBQUNBLGFBQUssU0FBTCxDQUFlLENBQWYsR0FBbUIsS0FBSyxLQUFMLENBQVcsS0FBSyxTQUFMLENBQWUsQ0FBMUIsSUFBK0IsR0FBbEQ7QUFDRCxPQUhELE1BR087QUFDTCxhQUFLLGFBQUwsQ0FBbUIsQ0FBbkIsR0FBdUIsS0FBSyxLQUFMLENBQVcsS0FBSyxhQUFMLENBQW1CLENBQTlCLElBQW1DLEdBQTFEO0FBQ0EsYUFBSyxhQUFMLENBQW1CLENBQW5CLEdBQXVCLEtBQUssS0FBTCxDQUFXLEtBQUssYUFBTCxDQUFtQixDQUE5QixJQUFtQyxHQUExRDtBQUNEOztBQUVELFdBQUssV0FBTCxJQUFvQixFQUFwQjtBQUNBLFVBQUksY0FBYyxLQUFLLEtBQUwsQ0FBVyxLQUFLLEdBQUwsQ0FDM0IsS0FBSyxXQUFMLEdBQW1CLEtBQUssWUFBeEIsR0FBdUMsUUFBUSxnQkFEcEIsRUFFM0IsS0FBSyxVQUFMLENBQWdCLE1BRlcsQ0FBWCxDQUFsQjs7QUFLQSxXQUFLLFNBQUwsQ0FBZSxJQUFmLEdBQXNCLEtBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixDQUF2QixFQUEwQixXQUExQixDQUF0Qjs7QUFFQSxVQUFJLGdCQUFnQixLQUFLLFVBQUwsQ0FBZ0IsTUFBcEMsRUFBNEM7QUFDMUMsWUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsY0FBSSxLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLEtBQUssU0FBM0IsS0FBeUMsQ0FBN0MsRUFBZ0Q7QUFDOUMsaUJBQUssV0FBTCxDQUFpQixLQUFLLFNBQXRCO0FBQ0EsaUJBQUssVUFBTCxDQUFnQixLQUFLLGFBQXJCLEVBQW9DLENBQXBDO0FBQ0Q7O0FBRUQsZUFBSyxXQUFMO0FBQ0Q7QUFDRixPQVRELE1BU087QUFDTCxZQUFJLE9BQU8sS0FBSyxRQUFoQjs7QUFFQSxZQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssUUFBcEIsQ0FBSixFQUFtQztBQUNqQyxlQUFLLFdBQUwsSUFBb0IsUUFBUSxVQUE1QjtBQUNEO0FBQ0Y7QUFDRjtBQXZDTSxHQUQ4RDs7QUEyQ3ZFLGFBQVc7QUFDVCxXQUFPLGVBQVUsR0FBVixFQUFlLENBQ3JCO0FBRlEsR0EzQzREOztBQWdEdkUsZUFBYTtBQUNYLFdBQU8saUJBQVk7QUFDakIsVUFBSSxPQUFPLEtBQUssUUFBaEI7O0FBRUEsVUFBSSxLQUFLLFdBQUwsQ0FBaUIsS0FBSyxRQUF0QixDQUFKLEVBQXFDO0FBQ25DLGFBQUssT0FBTCxHQUFlLEtBQWY7QUFDQSxVQUFFLElBQUYsRUFBUSxPQUFSLENBQWdCLFdBQWhCO0FBQ0Q7QUFDRjtBQVJVO0FBaEQwRCxDQUF2QyxDQUFkLENBQXBCOztBQTREQSxPQUFPLE1BQVAsQ0FBYyxPQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7O0FDbklBOztBQUVBLElBQUksT0FBZ0IsSUFBSSxJQUF4QjtBQUNBLElBQUksT0FBZ0IsUUFBUSxTQUFSLENBQXBCO0FBQ0EsSUFBSSxTQUFnQixLQUFLLE1BQXpCO0FBQ0EsSUFBSSxhQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLFVBQXRDO0FBQ0EsSUFBSSxnQkFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixhQUF0QztBQUNBLElBQUksVUFBVSxRQUFRLFdBQVIsQ0FBZDs7QUFFQSxJQUFJLFdBQVcsU0FBWCxRQUFXLEdBQVk7QUFDekIsVUFBUSxJQUFSLENBQWEsSUFBYjs7QUFFQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxVQUFsQixFQUE4QixPQUFoRDtBQUNBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLFVBQWxCLEVBQThCLE9BQWhEO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sVUFBbEIsRUFBOEIsT0FBaEQ7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLENBQXhDLEVBQTJDLEtBQUssV0FBaEQsQ0FBbEI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsQ0FBeEMsRUFBMkMsS0FBSyxXQUFoRCxDQUFsQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxDQUF4QyxFQUEyQyxLQUFLLFdBQWhELENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsU0FBUyxLQUFULENBQWUsSUFBN0IsRUFBbUMsS0FBSyxTQUF4QztBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTs7Ozs7Ozs7QUFTQTtBQUNBOzs7QUFHRCxDQWxDRDs7QUFvQ0EsT0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQztBQUNoQyxTQUFRO0FBQ04sV0FBUTtBQUNOLFlBQU87QUFERDtBQURGO0FBRHdCLENBQWxDOztBQVFBLFNBQVMsU0FBVCxHQUFxQixPQUFPLE1BQVAsQ0FBYyxPQUFPLE1BQVAsQ0FBYyxRQUFRLFNBQXRCLEVBQWlDO0FBQ2xFLFVBQVM7QUFDUCxXQUFRLGVBQVUsRUFBVixFQUFjO0FBQ3BCLGNBQVEsU0FBUixDQUFrQixNQUFsQixDQUF5QixJQUF6QixDQUE4QixJQUE5QixFQUFvQyxFQUFwQzs7QUFFQSxVQUFJLFlBQVksS0FBSyxZQUFMLENBQWtCLElBQWxDOztBQUVBLFVBQUksY0FBYyxTQUFTLEtBQVQsQ0FBZSxJQUFqQyxFQUF1QztBQUNyQyxhQUFLLGFBQUw7QUFDRDtBQUNGO0FBVE0sR0FEeUQ7O0FBYWxFLGlCQUFlO0FBQ2IsV0FBTyxpQkFBWTtBQUNqQixVQUFJLEtBQUssTUFBTCxDQUFZLHlCQUFaLENBQXNDLElBQXRDLEVBQTRDLEVBQTVDLENBQUosRUFBcUQ7QUFDbkQsYUFBSyxZQUFMLENBQWtCLElBQWxCLEdBQXlCLFFBQVEsS0FBUixDQUFjLFFBQXZDO0FBQ0Q7QUFDRjtBQUxZO0FBYm1ELENBQWpDLENBQWQsQ0FBckI7O0FBc0JBLE9BQU8sTUFBUCxDQUFjLFFBQWQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7QUM3RUE7O0FBRUEsSUFBSSxPQUFnQixJQUFJLElBQXhCO0FBQ0EsSUFBSSxPQUFnQixRQUFRLFNBQVIsQ0FBcEI7QUFDQSxJQUFJLFNBQWdCLEtBQUssTUFBekI7QUFDQSxJQUFJLGFBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsVUFBdEM7QUFDQSxJQUFJLGdCQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLGFBQXRDO0FBQ0EsSUFBSSxVQUFVLFFBQVEsV0FBUixDQUFkO0FBQ0EsSUFBSSxTQUFTLFFBQVEsVUFBUixDQUFiOztBQUVBLElBQUksWUFBWSxTQUFaLFNBQVksR0FBWTtBQUMxQixVQUFRLElBQVIsQ0FBYSxJQUFiOztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLFVBQWxCLEVBQThCLE9BQWhEO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLFdBQVcsV0FBWCxFQUFqQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxFQUF4QyxFQUE0QyxLQUFLLFdBQWpELENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsVUFBVSxLQUFWLENBQWdCLElBQTlCLEVBQW9DLEtBQUssU0FBekM7QUFDQTtBQUNBOzs7OztBQUtBO0FBQ0E7Ozs7Ozs7O0FBU0E7QUFDQTs7O0FBR0QsQ0E1QkQ7O0FBOEJBLE9BQU8sZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUM7QUFDakMsU0FBUTtBQUNOLFdBQVE7QUFDTixZQUFPO0FBREQ7QUFERjtBQUR5QixDQUFuQzs7QUFRQSxVQUFVLFNBQVYsR0FBc0IsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsUUFBUSxTQUF0QixFQUFpQztBQUNuRSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQixjQUFRLFNBQVIsQ0FBa0IsTUFBbEIsQ0FBeUIsSUFBekIsQ0FBOEIsSUFBOUIsRUFBb0MsRUFBcEM7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQ7QUF2Qk0sR0FEMEQ7O0FBMkJuRSxjQUFZO0FBQ1YsV0FBTyxlQUFVLEdBQVYsRUFBZTtBQUNwQixhQUFRLGVBQWUsTUFBdkI7QUFDRDtBQUhTO0FBM0J1RCxDQUFqQyxDQUFkLENBQXRCOztBQWtDQSxPQUFPLE1BQVAsQ0FBYyxTQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7O0FDcEZBOztBQUVBLElBQUksT0FBZ0IsSUFBSSxJQUF4QjtBQUNBLElBQUksT0FBZ0IsUUFBUSxTQUFSLENBQXBCO0FBQ0EsSUFBSSxTQUFnQixLQUFLLE1BQXpCO0FBQ0EsSUFBSSxhQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLFVBQXRDO0FBQ0EsSUFBSSxnQkFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixhQUF0QztBQUNBLElBQUksVUFBVSxRQUFRLFdBQVIsQ0FBZDtBQUNBLElBQUksU0FBUyxRQUFRLFVBQVIsQ0FBYjs7QUFFQSxJQUFJLGFBQWEsU0FBYixVQUFhLEdBQVk7QUFDM0IsVUFBUSxJQUFSLENBQWEsSUFBYjs7QUFFQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxXQUFsQixFQUErQixPQUFqRDtBQUNBLE9BQUssU0FBTCxHQUFpQixXQUFXLFdBQVgsRUFBakI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsRUFBeEMsRUFBNEMsS0FBSyxXQUFqRCxDQUFsQjtBQUNBLE9BQUssU0FBTCxDQUFlLFFBQWYsQ0FBd0IsS0FBSyxVQUE3QjtBQUNBLE9BQUssUUFBTCxDQUFjLFdBQVcsS0FBWCxDQUFpQixJQUEvQixFQUFxQyxLQUFLLFNBQTFDO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBOzs7Ozs7OztBQVNBO0FBQ0E7OztBQUdELENBNUJEOztBQThCQSxPQUFPLGdCQUFQLENBQXdCLFVBQXhCLEVBQW9DO0FBQ2xDLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEMEIsQ0FBcEM7O0FBUUEsV0FBVyxTQUFYLEdBQXVCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLFFBQVEsU0FBdEIsRUFBaUM7QUFDcEUsVUFBUztBQUNQLFdBQVEsZUFBVSxFQUFWLEVBQWM7QUFDcEIsY0FBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLElBQXpCLENBQThCLElBQTlCLEVBQW9DLEVBQXBDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNLEdBRDJEOztBQTJCcEUsY0FBWTtBQUNWLFdBQU8sZUFBVSxHQUFWLEVBQWU7QUFDcEIsYUFBUSxlQUFlLE1BQXZCO0FBQ0Q7QUFIUztBQTNCd0QsQ0FBakMsQ0FBZCxDQUF2Qjs7QUFrQ0EsT0FBTyxNQUFQLENBQWMsVUFBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBakI7OztBQ3BGQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7QUFDQSxJQUFJLFVBQVUsUUFBUSxXQUFSLENBQWQ7QUFDQSxJQUFJLFNBQVMsUUFBUSxVQUFSLENBQWI7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsR0FBWTtBQUM5QixVQUFRLElBQVIsQ0FBYSxJQUFiOztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLGVBQWxCLEVBQW1DLE9BQXJEO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLFdBQVcsV0FBWCxFQUFqQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxFQUF4QyxFQUE0QyxLQUFLLFdBQWpELENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsY0FBYyxLQUFkLENBQW9CLElBQWxDLEVBQXdDLEtBQUssU0FBN0M7QUFDQTtBQUNBOzs7OztBQUtBO0FBQ0E7Ozs7Ozs7O0FBU0E7QUFDQTs7O0FBR0QsQ0E1QkQ7O0FBOEJBLE9BQU8sZ0JBQVAsQ0FBd0IsYUFBeEIsRUFBdUM7QUFDckMsU0FBUTtBQUNOLFdBQVE7QUFDTixZQUFPO0FBREQ7QUFERjtBQUQ2QixDQUF2Qzs7QUFRQSxjQUFjLFNBQWQsR0FBMEIsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsUUFBUSxTQUF0QixFQUFpQztBQUN2RSxVQUFTO0FBQ1AsV0FBUSxlQUFVLEVBQVYsRUFBYztBQUNwQixjQUFRLFNBQVIsQ0FBa0IsTUFBbEIsQ0FBeUIsSUFBekIsQ0FBOEIsSUFBOUIsRUFBb0MsRUFBcEM7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQ7QUF2Qk07QUFEOEQsQ0FBakMsQ0FBZCxDQUExQjs7QUE0QkEsT0FBTyxNQUFQLENBQWMsYUFBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsYUFBakI7OztBQzlFQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7QUFDQSxJQUFJLFVBQVUsUUFBUSxXQUFSLENBQWQ7O0FBRUEsSUFBSSxXQUFXLFNBQVgsUUFBVyxHQUFZO0FBQ3pCLFVBQVEsSUFBUixDQUFhLElBQWI7O0FBRUEsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sU0FBbEIsRUFBNkIsT0FBL0M7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLEVBQTRDLEtBQUssV0FBakQsQ0FBbEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxTQUFTLEtBQVQsQ0FBZSxJQUE3QixFQUFtQyxLQUFLLFNBQXhDO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBOzs7Ozs7OztBQVNBO0FBQ0E7OztBQUlELENBN0JEOztBQStCQSxPQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDO0FBQ2hDLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEd0IsQ0FBbEM7O0FBUUEsU0FBUyxTQUFULEdBQXFCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLFFBQVEsU0FBdEIsRUFBaUM7QUFDbEUsVUFBUztBQUNQLFdBQVEsZUFBVSxFQUFWLEVBQWM7QUFDcEIsY0FBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLElBQXpCLENBQThCLElBQTlCLEVBQW9DLEVBQXBDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNO0FBRHlELENBQWpDLENBQWQsQ0FBckI7O0FBNEJBLE9BQU8sTUFBUCxDQUFjLFFBQWQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7QUM5RUE7O0FBRUEsSUFBSSxPQUFnQixJQUFJLElBQXhCO0FBQ0EsSUFBSSxPQUFnQixRQUFRLFNBQVIsQ0FBcEI7QUFDQSxJQUFJLFNBQWdCLEtBQUssTUFBekI7QUFDQSxJQUFJLGFBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsVUFBdEM7QUFDQSxJQUFJLGdCQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLGFBQXRDO0FBQ0EsSUFBSSxVQUFVLFFBQVEsV0FBUixDQUFkO0FBQ0EsSUFBSSxTQUFTLFFBQVEsVUFBUixDQUFiOztBQUVBLElBQUksV0FBVyxTQUFYLFFBQVcsR0FBWTtBQUN6QixVQUFRLElBQVIsQ0FBYSxJQUFiOztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLFNBQWxCLEVBQTZCLE9BQS9DO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLFdBQVcsV0FBWCxFQUFqQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxFQUF4QyxFQUE0QyxLQUFLLFdBQWpELENBQWxCO0FBQ0EsT0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixLQUFLLFVBQTdCO0FBQ0EsT0FBSyxRQUFMLENBQWMsU0FBUyxLQUFULENBQWUsSUFBN0IsRUFBbUMsS0FBSyxTQUF4QztBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTs7Ozs7Ozs7QUFTQTtBQUNBOzs7O0FBSUEsT0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNELENBOUJEOztBQWdDQSxPQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDO0FBQ2hDLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEd0IsQ0FBbEM7O0FBUUEsU0FBUyxTQUFULEdBQXFCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLFFBQVEsU0FBdEIsRUFBaUM7QUFDbEUsVUFBUztBQUNQLFdBQVEsZUFBVSxFQUFWLEVBQWM7QUFDcEIsY0FBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLElBQXpCLENBQThCLElBQTlCLEVBQW9DLEVBQXBDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNLEdBRHlEOztBQTJCbEUsY0FBWTtBQUNWLFdBQU8sZUFBVSxHQUFWLEVBQWU7QUFDcEIsYUFBUSxlQUFlLE1BQXZCO0FBQ0Q7QUFIUztBQTNCc0QsQ0FBakMsQ0FBZCxDQUFyQjs7QUFrQ0EsT0FBTyxNQUFQLENBQWMsUUFBZDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsUUFBakI7OztBQ3RGQTs7QUFFQSxJQUFJLE9BQWdCLElBQUksSUFBeEI7QUFDQSxJQUFJLE9BQWdCLFFBQVEsU0FBUixDQUFwQjtBQUNBLElBQUksU0FBZ0IsS0FBSyxNQUF6QjtBQUNBLElBQUksYUFBZ0IsSUFBSSxJQUFKLENBQVMsUUFBVCxDQUFrQixVQUF0QztBQUNBLElBQUksZ0JBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsYUFBdEM7QUFDQSxJQUFJLFVBQVUsUUFBUSxXQUFSLENBQWQ7QUFDQSxJQUFJLFNBQVMsUUFBUSxVQUFSLENBQWI7O0FBRUEsSUFBSSxZQUFZLFNBQVosU0FBWSxHQUFZO0FBQzFCLFVBQVEsSUFBUixDQUFhLElBQWI7O0FBRUEsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sVUFBbEIsRUFBOEIsT0FBaEQ7QUFDQSxPQUFLLFNBQUwsR0FBaUIsV0FBVyxXQUFYLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLEVBQXhDLEVBQTRDLEtBQUssV0FBakQsQ0FBbEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxVQUFVLEtBQVYsQ0FBZ0IsSUFBOUIsRUFBb0MsS0FBSyxTQUF6QztBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTs7Ozs7Ozs7QUFTQTtBQUNBOzs7O0FBSUEsT0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNELENBOUJEOztBQWdDQSxPQUFPLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DO0FBQ2pDLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEeUIsQ0FBbkM7O0FBUUEsVUFBVSxTQUFWLEdBQXNCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLFFBQVEsU0FBdEIsRUFBaUM7QUFDbkUsVUFBUztBQUNQLFdBQVEsZUFBVSxFQUFWLEVBQWM7QUFDcEIsY0FBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLElBQXpCLENBQThCLElBQTlCLEVBQW9DLEVBQXBDOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JEO0FBdkJNO0FBRDBELENBQWpDLENBQWQsQ0FBdEI7O0FBNEJBLE9BQU8sTUFBUCxDQUFjLFNBQWQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7QUNoRkE7O0FBRUEsSUFBSSxPQUFnQixJQUFJLElBQXhCO0FBQ0EsSUFBSSxPQUFnQixRQUFRLFNBQVIsQ0FBcEI7QUFDQSxJQUFJLFNBQWdCLEtBQUssTUFBekI7QUFDQSxJQUFJLGFBQWdCLElBQUksSUFBSixDQUFTLFFBQVQsQ0FBa0IsVUFBdEM7QUFDQSxJQUFJLGdCQUFnQixJQUFJLElBQUosQ0FBUyxRQUFULENBQWtCLGFBQXRDOztBQUVBLElBQUksUUFBUSxTQUFSLEtBQVEsR0FBWTtBQUN0QixnQkFBYyxJQUFkLENBQW1CLElBQW5COztBQUVBLE9BQUssVUFBTCxHQUFrQixPQUFPLEdBQVAsQ0FBVyxPQUFPLE1BQWxCLEVBQTBCLE9BQTVDO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLE9BQU8sR0FBUCxDQUFXLE9BQU8sTUFBbEIsRUFBMEIsT0FBNUM7QUFDQSxPQUFLLFVBQUwsR0FBa0IsT0FBTyxHQUFQLENBQVcsT0FBTyxNQUFsQixFQUEwQixPQUE1QztBQUNBLE9BQUssU0FBTCxHQUFpQixXQUFXLFdBQVgsRUFBakI7QUFDQSxPQUFLLFVBQUwsR0FBa0IsV0FBVyxXQUFYLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsQ0FBeEMsRUFBMkMsS0FBSyxXQUFoRCxDQUFsQjtBQUNBLE9BQUssVUFBTCxHQUFrQixXQUFXLFdBQVgsQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxDQUF4QyxFQUEyQyxLQUFLLFdBQWhELENBQWxCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLFdBQVcsV0FBWCxDQUF1QixLQUFLLFVBQTVCLEVBQXdDLENBQXhDLEVBQTJDLEtBQUssV0FBaEQsQ0FBbEI7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLEtBQUssVUFBN0I7QUFDQSxPQUFLLFFBQUwsQ0FBYyxNQUFNLEtBQU4sQ0FBWSxJQUExQixFQUFnQyxLQUFLLFNBQXJDO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBOzs7Ozs7OztBQVNBO0FBQ0E7OztBQUdELENBbENEOztBQW9DQSxPQUFPLGdCQUFQLENBQXdCLEtBQXhCLEVBQStCO0FBQzdCLFNBQVE7QUFDTixXQUFRO0FBQ04sWUFBTztBQUREO0FBREY7QUFEcUIsQ0FBL0I7O0FBUUEsTUFBTSxTQUFOLEdBQWtCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLGNBQWMsU0FBNUIsRUFBdUMsRUFBdkMsQ0FBZCxDQUFsQjs7QUFHQSxPQUFPLE1BQVAsQ0FBYyxLQUFkOztBQUVBLE9BQU8sT0FBUCxHQUFpQixLQUFqQjs7O0FDekRBOztBQUVBLElBQUksU0FBUyxRQUFRLGFBQVIsQ0FBYjtBQUNBLElBQUksWUFBWSxRQUFRLGdCQUFSLENBQWhCO0FBQ0EsSUFBSSxVQUFVLFFBQVEsY0FBUixDQUFkO0FBQ0EsSUFBSSxZQUFZLFFBQVEsZ0JBQVIsQ0FBaEI7QUFDQSxJQUFJLGFBQWEsUUFBUSxpQkFBUixDQUFqQjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsb0JBQVIsQ0FBcEI7QUFDQSxJQUFJLFlBQVksUUFBUSxnQkFBUixDQUFoQjtBQUNBLElBQUksV0FBVyxRQUFRLGVBQVIsQ0FBZjtBQUNBLElBQUksV0FBVyxRQUFRLGVBQVIsQ0FBZjtBQUNBLElBQUksV0FBVyxRQUFRLGVBQVIsQ0FBZjs7QUFFQSxJQUFJLFFBQVEsUUFBUSxZQUFSLENBQVo7O0FBRUEsSUFBSSxPQUFPLFFBQVEsV0FBUixDQUFYO0FBQ0EsSUFBSSxZQUFZLFFBQVEsZ0JBQVIsQ0FBaEI7O0FBRUEsSUFBSSxjQUFjLFFBQVEsa0JBQVIsQ0FBbEI7O0FBRUEsSUFBSSxVQUFVLFFBQVEsY0FBUixDQUFkOztBQUVBLElBQUksU0FBUyxRQUFRLGFBQVIsQ0FBYjs7QUFFQSxJQUFJLE9BQU8sUUFBUSxXQUFSLENBQVg7QUFDQSxJQUFJLE9BQU8sUUFBUSxXQUFSLENBQVg7QUFDQSxJQUFJLE9BQU8sUUFBUSxXQUFSLENBQVg7O0FBRUEsT0FBTyxPQUFQLEdBQWlCO0FBQ2YsVUFBUSxNQURPO0FBRWYsYUFBVyxTQUZJO0FBR2YsV0FBUyxPQUhNO0FBSWYsYUFBVyxTQUpJO0FBS2YsY0FBWSxVQUxHO0FBTWYsaUJBQWUsYUFOQTtBQU9mLGFBQVcsU0FQSTtBQVFmLFlBQVUsUUFSSztBQVNmLFlBQVUsUUFUSztBQVVmLFlBQVUsUUFWSzs7QUFZZixTQUFPLEtBWlE7O0FBY2YsUUFBTSxJQWRTO0FBZWYsYUFBVyxTQWZJOztBQWlCZixlQUFhLFdBakJFOztBQW1CZixXQUFTLE9BbkJNOztBQXFCZjtBQUNBLFVBQVEsTUF0Qk87QUF1QmYsUUFBTSxJQXZCUztBQXdCZixRQUFNLElBeEJTO0FBeUJmLFFBQU07QUF6QlMsQ0FBakI7OztBQzVCQTs7QUFFQSxJQUFJLE9BQVMsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFJLFNBQVMsUUFBUSxVQUFSLENBQWI7QUFDQSxJQUFJLFNBQVMsUUFBUSxrQkFBUixDQUFiO0FBQ0EsSUFBSSxNQUFTLFFBQVEsT0FBUixDQUFiOztBQUVBO0FBQ0EsSUFBSSxTQUFTLFNBQVMsYUFBVCxDQUF1QixjQUF2QixDQUFiO0FBQ0EsSUFBSSxPQUFTLElBQUksTUFBSixDQUFXLE1BQVgsQ0FBYjtBQUNBLEtBQUssUUFBTCxDQUFjLGVBQWQsR0FBZ0MsUUFBaEM7O0FBRUE7O0FBRUEsSUFBSSxlQUFlLFNBQWYsWUFBZSxHQUFZO0FBQzdCLE1BQUksSUFBSSxLQUFLLE1BQWI7O0FBRUE7QUFDQSxPQUFLLElBQUksS0FBVCxJQUFrQixNQUFsQixFQUEwQjtBQUN4QixRQUFJO0FBQ0YsVUFBSSxFQUFFLEdBQUYsQ0FBTSxPQUFPLEtBQVAsQ0FBTixDQUFKO0FBQ0QsS0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVLENBQ1g7QUFDRjs7QUFFRCxJQUFFLElBQUYsQ0FBTyxZQUFQO0FBQ0E7QUFDRCxDQWJEOztBQWVBLElBQUksZUFBZSxTQUFmLFlBQWUsR0FBWTtBQUM3QixTQUFPLEdBQVAsR0FBYSxVQUFVLElBQVYsRUFBZ0I7QUFBRSxXQUFPLEtBQUssTUFBTCxDQUFZLFNBQVosQ0FBc0IsSUFBdEIsQ0FBUDtBQUFxQyxHQUFwRTs7QUFFQTtBQUNELENBSkQ7O0FBTUEsSUFBSSxXQUFXLFNBQVgsUUFBVyxHQUFZO0FBQ3pCLE1BQUksT0FBTyxPQUFPLElBQWxCOztBQUR5Qiw2QkFHZCxJQUhjO0FBSXZCLFFBQUksTUFBSixDQUFXLE9BQVgsQ0FBbUIsS0FBSSxJQUF2QixFQUE2QixVQUFDLElBQUQ7QUFBQSxhQUFVLFVBQVUsS0FBSSxHQUFkLEVBQW1CLElBQW5CLENBQVY7QUFBQSxLQUE3QjtBQUp1Qjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFHekIseUJBQWtCLElBQWxCLDhIQUF3QjtBQUFBLFVBQWIsSUFBYTs7QUFBQSxZQUFiLElBQWE7QUFFdkI7QUFMd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU0xQixDQU5EOztBQVFBLElBQUksY0FBYyxDQUFsQjtBQUNBLElBQUksWUFBWSxTQUFaLFNBQVksQ0FBVSxHQUFWLEVBQWUsSUFBZixFQUFxQjtBQUNuQzs7QUFFQSxNQUFJLE9BQUosQ0FBWSxLQUFaLENBQWtCLEdBQWxCLEVBQXVCLElBQXZCOztBQUVBLE1BQUksZ0JBQWdCLE9BQU8sSUFBUCxDQUFZLE1BQWhDLEVBQXdDO0FBQ3RDO0FBQ0EsUUFBSSxZQUFZLElBQUksT0FBTyxVQUFYLENBQXNCLE1BQXRCLEVBQThCLEtBQUssSUFBbkMsQ0FBaEI7QUFDQSxTQUFLLFFBQUwsQ0FBYyxTQUFkO0FBQ0Q7QUFDRixDQVZEOztBQVlBLElBQUksV0FBVyxTQUFYLFFBQVcsQ0FBVSxDQUFWLEVBQWE7QUFDMUI7QUFDRCxDQUZEOztBQUlBLElBQUksU0FBUyxTQUFULE1BQVMsR0FBWTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSxNQUFJLElBQUksT0FBTyxVQUFmLENBSnVCLENBSUs7QUFDNUIsTUFBSSxJQUFJLE9BQU8sV0FBZixDQUx1QixDQUtLOztBQUU1QixTQUFPLEtBQVAsR0FBZ0IsQ0FBaEI7QUFDQSxTQUFPLE1BQVAsR0FBZ0IsQ0FBaEI7QUFDQSxPQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLEtBQW5CLENBQXlCLEtBQXpCLEdBQWtDLElBQUksSUFBdEM7QUFDQSxPQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLEtBQW5CLENBQXlCLE1BQXpCLEdBQWtDLElBQUksSUFBdEM7QUFDQSxPQUFLLFFBQUwsQ0FBYyxNQUFkLENBQXFCLENBQXJCLEVBQXdCLENBQXhCO0FBQ0QsQ0FaRDs7QUFjQSxPQUFPLE1BQVAsR0FBZ0IsWUFBaEI7QUFDQSxPQUFPLFFBQVAsR0FBa0IsUUFBbEI7OztBQzNFQTs7QUFFQSxJQUFNLFdBQVcsUUFBUSxhQUFSLENBQWpCOztBQUVBLElBQU0sZ0JBQWdCO0FBQ3BCLFNBQU8sZUFBQyxjQUFELEVBQWlCLEtBQWpCLEVBQTJCO0FBQ2hDLFFBQUksSUFBSSxJQUFSO0FBQ0EsUUFBSSxTQUFTLGVBQWUsTUFBNUI7QUFDQSxRQUFJLGFBQWEsT0FBTyxJQUF4QjtBQUNBLFFBQUksWUFBWSxJQUFoQjs7QUFFQSxRQUFJLGVBQWUsWUFBbkIsRUFBaUM7QUFDL0Isa0JBQVksU0FBUyxRQUFULENBQVo7QUFDRCxLQUZELE1BRU87QUFDTDtBQUNBLG1CQUFhLFdBQVcsT0FBWCxDQUFtQixRQUFuQixFQUE2QixFQUE3QixDQUFiOztBQUVBLGtCQUFZLFNBQVMsVUFBVCxDQUFaO0FBQ0Q7O0FBRUQsUUFBSSxTQUFKLEVBQWU7QUFDYixVQUFJLElBQUksU0FBSixFQUFKO0FBQ0EsUUFBRSxRQUFGLENBQVcsQ0FBWCxHQUFlLGVBQWUsQ0FBOUI7QUFDQSxRQUFFLFFBQUYsQ0FBVyxDQUFYLEdBQWUsZUFBZSxDQUE5QjtBQUNBLFFBQUUsUUFBRixHQUFhLGVBQWUsUUFBNUI7QUFDQSxRQUFFLFVBQUYsQ0FBYSxLQUFiLEdBQXFCLGVBQWUsS0FBcEM7O0FBRUE7QUFDQSxRQUFFLEtBQUYsR0FBVSxlQUFlLEtBQWYsQ0FBcUIsS0FBckIsQ0FBMkIsS0FBM0IsRUFBa0MsQ0FBbEMsQ0FBVjtBQUNEOztBQUVELFFBQUksQ0FBSixFQUFPO0FBQ0wsVUFBSSxlQUFlLFlBQW5CLEVBQWlDO0FBQy9CLGNBQU0sTUFBTixHQUFlLENBQWY7QUFDQSxjQUFNLE1BQU4sQ0FBYSxNQUFiLENBQW9CLENBQXBCO0FBQ0Q7O0FBRUQsYUFBTyxDQUFQO0FBQ0Q7O0FBRUQsVUFBTSxPQUFPLElBQVAsR0FBYyxnQkFBcEI7QUFDRDtBQXJDbUIsQ0FBdEI7O0FBd0NBLE9BQU8sT0FBUCxHQUFpQixhQUFqQjs7O0FDNUNBOztBQUVBLElBQUksT0FBTyxFQUFYOztBQUVBLElBQU0sVUFBVTtBQUNkLFNBQU8sZUFBQyxHQUFELEVBQU0sSUFBTixFQUFlO0FBQ3BCLFNBQUssR0FBTCxJQUFZLElBQVo7QUFDRCxHQUhhOztBQUtkLE9BQUssYUFBQyxHQUFELEVBQVM7QUFDWixXQUFPLEtBQUssR0FBTCxDQUFQO0FBQ0Q7QUFQYSxDQUFoQjs7QUFVQSxPQUFPLE9BQVAsR0FBaUIsT0FBakI7OztBQ2RBOztBQUVBLElBQUksVUFBVSxRQUFRLGNBQVIsQ0FBZDtBQUNBLElBQUksZ0JBQWdCLFFBQVEsb0JBQVIsQ0FBcEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCO0FBQ2YsV0FBUyxPQURNO0FBRWYsaUJBQWU7QUFGQSxDQUFqQjs7O0FDTEE7O0FBRUEsSUFBSSxJQUFnQixJQUFJLE1BQXhCO0FBQ0EsSUFBSSxPQUFPLElBQUksSUFBZjtBQUNBLElBQUksUUFBUSxJQUFJLE9BQUosQ0FBWSxLQUF4QjtBQUNBLElBQUksTUFBTSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQUksU0FBUyxRQUFRLG1CQUFSLENBQWI7QUFDQSxJQUFJLFdBQVcsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJLGFBQWEsUUFBUSxjQUFSLENBQWpCOztBQUVBLElBQUksYUFBYSxRQUFRLGtCQUFSLENBQWpCOztBQUVBLElBQUksZ0JBQWdCLFNBQWhCLGFBQWdCLENBQVUsTUFBVixFQUFrQixJQUFsQixFQUF3QjtBQUMxQyxRQUFNLElBQU4sQ0FBVyxJQUFYLEVBQWlCLE1BQWpCLEVBQXlCLElBQXpCOztBQUVBLE9BQUssSUFBTCxHQUFZLElBQVo7O0FBRUEsT0FBSyxRQUFMLEdBQWdCLElBQUksS0FBSyxNQUFMLENBQVksU0FBaEIsQ0FBMEIsT0FBTyxTQUFqQyxDQUFoQjtBQUNBLE9BQUssUUFBTCxDQUFjLEtBQWQsR0FBc0IsQ0FBdEI7O0FBRUEsT0FBSyxNQUFMLEdBQWMsSUFBSSxTQUFTLE1BQWIsRUFBZDtBQUNBLE9BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsS0FBSyxNQUF4QjtBQUNBLE9BQUssYUFBTCxDQUFtQixLQUFLLE1BQXhCOztBQUVBLE9BQUssSUFBTCxHQUFZLElBQVo7QUFDRCxDQWJEOztBQWVBLE9BQU8sZ0JBQVAsQ0FBd0IsYUFBeEIsRUFBdUMsRUFBdkM7O0FBR0EsY0FBYyxTQUFkLEdBQTBCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLE1BQU0sU0FBcEIsRUFBK0I7QUFDckUsVUFBUztBQUNQLFdBQU8sZUFBVSxFQUFWLEVBQWM7QUFBQTs7QUFDbkIsWUFBTSxTQUFOLENBQWdCLE1BQWhCLENBQXVCLElBQXZCLENBQTRCLElBQTVCLEVBQWtDLEVBQWxDOztBQUVBLFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBbEIsRUFBd0I7QUFDdEIsYUFBSyxJQUFMLEdBQVksSUFBSSxTQUFTLE9BQWIsQ0FDVixJQURVLEVBRVYsS0FBSyxRQUZLLEVBR1YsS0FBSyxNQUhLLEVBSVYsbUJBSlUsQ0FBWjtBQU1BLGFBQUssSUFBTCxDQUFVLENBQVYsR0FBYyxDQUFDLEtBQWY7QUFDQSxhQUFLLElBQUwsQ0FBVSxPQUFWLEdBQW9CLElBQXBCOztBQUVBLFVBQUUsS0FBSyxJQUFQLEVBQWEsRUFBYixDQUFnQixXQUFoQixFQUE2QixZQUFNO0FBQ2pDLGNBQUksV0FBVyxJQUFJLFVBQUosQ0FBZSxNQUFLLE1BQXBCLEVBQTRCLE1BQUssSUFBakMsQ0FBZjtBQUNBLGdCQUFLLE1BQUwsQ0FBWSxRQUFaO0FBQ0EsZ0JBQUssS0FBTDtBQUNELFNBSkQ7O0FBTUEsYUFBSyxhQUFMLENBQW1CLEtBQUssSUFBeEIsRUFBOEIsQ0FBOUI7QUFDRDtBQUNGO0FBdEJNLEdBRDREOztBQTBCckU7OztBQUdBLFFBQU87QUFDTCxXQUFRLGVBQVUsUUFBVixFQUFvQjtBQUMxQixVQUFJLEtBQUssUUFBTCxDQUFjLEtBQWQsR0FBc0IsQ0FBMUIsRUFBNkI7QUFDM0IsYUFBSyxRQUFMLENBQWMsS0FBZCxHQUFzQixPQUFPLFVBQTdCO0FBQ0EsYUFBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixPQUFPLFdBQTlCO0FBQ0EsYUFBSyxRQUFMLENBQWMsQ0FBZCxHQUFrQixLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLENBQXJCLEdBQXlCLE9BQU8sVUFBUCxHQUFvQixHQUEvRDtBQUNBLGFBQUssUUFBTCxDQUFjLENBQWQsR0FBa0IsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixDQUFyQixHQUF5QixPQUFPLFdBQVAsR0FBcUIsR0FBaEU7QUFDQSxhQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEtBQUssUUFBMUI7QUFDRDs7QUFFRDtBQUNBLFdBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsTUFBckIsR0FBOEIsQ0FBOUI7QUFDQSxXQUFLLHFCQUFMLEdBQThCLEtBQUssMkJBQUwsQ0FBaUMsS0FBSyxNQUF0QyxFQUE4QyxDQUE5QyxFQUFpRCxJQUFqRCxDQUM1QixVQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDUjtBQUNBLFlBQUksRUFBRSxLQUFGLEtBQVksRUFBRSxLQUFsQixFQUF5QjtBQUN2QixpQkFBUSxFQUFFLFNBQUYsQ0FBWSxRQUFaLENBQXFCLEVBQXJCLEdBQTBCLEVBQUUsZ0JBQUYsQ0FBbUIsTUFBbkIsR0FBNEIsR0FBdkQsSUFDQyxFQUFFLFNBQUYsQ0FBWSxRQUFaLENBQXFCLEVBQXJCLEdBQTBCLEVBQUUsZ0JBQUYsQ0FBbUIsTUFBbkIsR0FBNEIsR0FEdkQsQ0FBUDs7QUFHRjtBQUNDLFNBTEQsTUFLTztBQUNMLGlCQUFPLEVBQUUsS0FBRixHQUFVLEVBQUUsS0FBbkI7QUFDRDtBQUNGLE9BWDJCLENBQTlCOztBQWNBO0FBekIwQjtBQUFBO0FBQUE7O0FBQUE7QUEwQjFCLDZCQUFnQixLQUFLLHFCQUFyQiw4SEFBNEM7QUFBQSxjQUFuQyxHQUFtQzs7QUFDMUMsY0FBSSxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQUosRUFBc0I7QUFDcEIsaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsR0FBckI7QUFDRDtBQUNGO0FBOUJ5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBK0IzQjtBQWhDSSxHQTdCOEQ7O0FBZ0VyRSxnQkFBZTtBQUNiLFdBQVEsaUJBQVk7QUFDbEIsVUFBSSxPQUFPLEtBQUssUUFBaEI7QUFDRDtBQUhZO0FBaEVzRCxDQUEvQixDQUFkLENBQTFCOztBQXVFQSxPQUFPLE9BQVAsR0FBaUIsYUFBakI7OztBQ3JHQTs7QUFFQSxJQUFJLElBQWdCLElBQUksTUFBeEI7QUFDQSxJQUFJLE9BQU8sSUFBSSxJQUFmO0FBQ0EsSUFBSSxRQUFRLElBQUksT0FBSixDQUFZLEtBQXhCO0FBQ0EsSUFBSSxNQUFNLFFBQVEsUUFBUixDQUFWO0FBQ0EsSUFBSSxTQUFTLFFBQVEsbUJBQVIsQ0FBYjtBQUNBLElBQUksV0FBVyxRQUFRLGFBQVIsQ0FBZjs7QUFFQSxJQUFJLGFBQWEsUUFBUSxrQkFBUixDQUFqQjs7QUFFQSxJQUFJLFlBQVksU0FBWixTQUFZLENBQVUsTUFBVixFQUFrQixJQUFsQixFQUF3QjtBQUN0QyxRQUFNLElBQU4sQ0FBVyxJQUFYLEVBQWlCLE1BQWpCLEVBQXlCLElBQXpCOztBQUVBLE9BQUssR0FBTCxHQUFXLElBQVg7QUFDQSxPQUFLLGdCQUFMLEdBQXdCLEVBQXhCO0FBQ0EsT0FBSyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsT0FBSyxVQUFMLEdBQWtCLEVBQWxCOztBQUVBLE9BQUssSUFBTCxHQUFZLElBQVo7O0FBRUEsT0FBSyxRQUFMLEdBQWdCLElBQUksS0FBSyxNQUFMLENBQVksU0FBaEIsQ0FBMEIsT0FBTyxTQUFqQyxDQUFoQjtBQUNELENBWkQ7O0FBY0EsT0FBTyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQztBQUNqQzs7Ozs7Ozs7QUFRQSxZQUFVO0FBQ1IsV0FBTztBQURDLEdBVHVCOztBQWFqQyxhQUFXO0FBQ1QsV0FBTztBQURFLEdBYnNCOztBQWlCakMsZUFBYTtBQUNYLFdBQU87QUFDTCxpQkFBVyxXQUROO0FBRUwsWUFBTSxNQUZEO0FBR0wsa0JBQVk7QUFIUDtBQURJO0FBakJvQixDQUFuQzs7QUEwQkEsVUFBVSxTQUFWLEdBQXNCLE9BQU8sTUFBUCxDQUFjLE9BQU8sTUFBUCxDQUFjLE1BQU0sU0FBcEIsRUFBK0I7QUFDakUsVUFBUztBQUNQLFdBQVEsZUFBVSxFQUFWLEVBQWM7QUFDcEIsV0FBSyx5QkFBTDtBQUNBLFdBQUssY0FBTDtBQUNBLFdBQUssWUFBTDs7QUFFQSxZQUFNLFNBQU4sQ0FBZ0IsTUFBaEIsQ0FBdUIsSUFBdkIsQ0FBNEIsSUFBNUIsRUFBa0MsRUFBbEM7O0FBRUEsV0FBSyxlQUFMO0FBQ0EsV0FBSyxpQkFBTDtBQUNEO0FBVk0sR0FEd0Q7O0FBY2pFOzs7QUFHQSxRQUFPO0FBQ0wsV0FBUSxlQUFVLFFBQVYsRUFBb0I7QUFDMUI7QUFDQSxXQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLE1BQXJCLEdBQThCLENBQTlCO0FBQ0EsV0FBSyxxQkFBTCxHQUE4QixLQUFLLDJCQUFMLENBQWlDLEtBQUssTUFBdEMsRUFBOEMsQ0FBOUMsRUFBaUQsSUFBakQsQ0FDNUIsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1I7QUFDQSxZQUFJLEVBQUUsS0FBRixLQUFZLEVBQUUsS0FBbEIsRUFBeUI7QUFDdkIsaUJBQVEsRUFBRSxTQUFGLENBQVksUUFBWixDQUFxQixFQUFyQixHQUEwQixFQUFFLGdCQUFGLENBQW1CLE1BQW5CLEdBQTRCLEdBQXZELElBQ0MsRUFBRSxTQUFGLENBQVksUUFBWixDQUFxQixFQUFyQixHQUEwQixFQUFFLGdCQUFGLENBQW1CLE1BQW5CLEdBQTRCLEdBRHZELENBQVA7O0FBR0Y7QUFDQyxTQUxELE1BS087QUFDTCxpQkFBTyxFQUFFLEtBQUYsR0FBVSxFQUFFLEtBQW5CO0FBQ0Q7QUFDRixPQVgyQixDQUE5Qjs7QUFjQTtBQWpCMEI7QUFBQTtBQUFBOztBQUFBO0FBa0IxQiw2QkFBZ0IsS0FBSyxxQkFBckIsOEhBQTRDO0FBQUEsY0FBbkMsR0FBbUM7O0FBQzFDLGNBQUksS0FBSyxNQUFMLENBQVksR0FBWixDQUFKLEVBQXNCO0FBQ3BCLGlCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEdBQXJCO0FBQ0Q7QUFDRjtBQXRCeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUF3QjFCLFVBQUksS0FBSyxRQUFMLENBQWMsS0FBZCxHQUFzQixDQUExQixFQUE2QjtBQUMzQixhQUFLLFFBQUwsQ0FBYyxLQUFkLEdBQXNCLE9BQU8sVUFBN0I7QUFDQSxhQUFLLFFBQUwsQ0FBYyxNQUFkLEdBQXVCLE9BQU8sV0FBOUI7QUFDQSxhQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsQ0FBckIsR0FBeUIsT0FBTyxVQUFQLEdBQW9CLEdBQS9EO0FBQ0EsYUFBSyxRQUFMLENBQWMsQ0FBZCxHQUFrQixLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLENBQXJCLEdBQXlCLE9BQU8sV0FBUCxHQUFxQixHQUFoRTtBQUNBLGFBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsS0FBSyxRQUExQjtBQUNEO0FBQ0Y7QUFoQ0ksR0FqQjBEOztBQW9EakUsVUFBUTtBQUNOLFdBQU8sZUFBVSxHQUFWLEVBQWU7QUFDcEIsV0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNEO0FBSEssR0FwRHlEOztBQTBEakUsV0FBUztBQUNQLFdBQU8saUJBQVk7QUFDakIsVUFBSSxVQUFVLElBQUksT0FBSixDQUFZLEdBQVosQ0FBZ0IsS0FBSyxHQUFyQixDQUFkO0FBQ0EsVUFBSSxZQUFZLFFBQVEsS0FBeEI7QUFGaUIsVUFHWixXQUhZLEdBR0csU0FISCxDQUdaLFdBSFk7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBS2pCLDhCQUFnQixXQUFoQixtSUFBNkI7QUFBQSxjQUFsQixDQUFrQjs7QUFDM0IsY0FBSSxNQUFNLElBQUksYUFBSixDQUFrQixLQUFsQixDQUF3QixDQUF4QixFQUEyQixJQUEzQixDQUFWO0FBQ0EsZUFBSyxhQUFMLENBQW1CLEdBQW5CLEVBQXdCLElBQUksS0FBNUI7O0FBRUEsY0FBSSxJQUFJLFVBQUosQ0FBZSxLQUFuQixFQUEwQjtBQUN4QixpQkFBSyxlQUFMLENBQXFCLEdBQXJCO0FBQ0Q7QUFDRjtBQVpnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWNqQixVQUFJLE1BQU0sS0FBSyxjQUFMLEVBQVY7O0FBZGlCO0FBQUE7QUFBQTs7QUFBQTtBQWdCakIsOEJBQW9CLEdBQXBCLG1JQUF5QjtBQUFBLGNBQWQsS0FBYzs7QUFDdkIsY0FBSSxNQUFNLGNBQVYsRUFBMEI7QUFDeEIsa0JBQU0sY0FBTixDQUFxQixHQUFyQixFQUEwQixLQUFLLElBQS9CO0FBQ0Q7O0FBRUQsY0FBSSxpQkFBaUIsU0FBUyxRQUE5QixFQUF3QztBQUN0QyxpQkFBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFwQjtBQUNEO0FBQ0Y7QUF4QmdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBMEJqQixXQUFLLFVBQUw7QUFDRDtBQTVCTSxHQTFEd0Q7O0FBeUZqRSxrQkFBZ0I7QUFDZCxXQUFPLGVBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDMUIsV0FBSyxnQkFBTCxDQUFzQixJQUF0QixDQUEyQjtBQUN6QixhQUFLLEdBRG9CO0FBRXpCLGNBQU0sSUFGbUI7QUFHekIsZ0JBQVEsS0FIaUI7QUFJekIsaUJBQVM7QUFKZ0IsT0FBM0I7QUFNRDtBQVJhLEdBekZpRDs7QUFvR2pFLGtCQUFnQjtBQUNkLFdBQU8sZUFBVSxHQUFWLEVBQWUsSUFBZixFQUFxQjtBQUMxQixXQUFLLGVBQUwsQ0FBcUIsSUFBckIsQ0FBMEI7QUFDeEIsYUFBSyxHQURtQjtBQUV4QixjQUFNO0FBRmtCLE9BQTFCO0FBSUQ7QUFOYSxHQXBHaUQ7O0FBNkdqRSxtQkFBaUI7QUFDZixXQUFPLGVBQVUsR0FBVixFQUFlO0FBQ3BCLFVBQUksUUFBUSxJQUFJLFVBQUosQ0FBZSxLQUEzQjs7QUFEb0I7QUFBQTtBQUFBOztBQUFBO0FBR3BCLDhCQUFtQixLQUFuQixtSUFBMEI7QUFBQSxjQUFmLElBQWU7O0FBQ3hCLGNBQUksTUFBTSxLQUFLLEdBQWY7QUFDQSxjQUFJLFFBQVEsS0FBSyxLQUFqQjs7QUFFQSxjQUFJLFFBQVEsVUFBVSxXQUFWLENBQXNCLFNBQWxDLEVBQTZDO0FBQzNDLGlCQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBeUIsS0FBekI7QUFDRCxXQUZELE1BRU8sSUFBSSxRQUFRLFVBQVUsV0FBVixDQUFzQixJQUFsQyxFQUF3QztBQUM3QyxpQkFBSyxjQUFMLENBQW9CLEdBQXBCLEVBQXlCLEtBQXpCO0FBQ0Q7QUFDRjtBQVptQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBYXJCO0FBZGMsR0E3R2dEOztBQThIakUsbUJBQWlCO0FBQ2YsV0FBTyxpQkFBWTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNqQiw4QkFBaUIsS0FBSyxlQUF0QixtSUFBdUM7QUFBQSxjQUE1QixFQUE0Qjs7QUFDckMsY0FBSSxPQUFPLEdBQUcsSUFBZDtBQUNBLGNBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQVg7O0FBRUEsY0FBSSxhQUFhLEtBQUssQ0FBTCxDQUFqQjtBQUNBLGNBQUksV0FBVyxLQUFLLENBQUwsQ0FBZjtBQUNBLGNBQUksYUFBYSxLQUFLLE1BQUwsR0FBYyxDQUEvQjtBQUNBLGNBQUksWUFBWSxFQUFoQjs7QUFHQSxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksVUFBcEIsRUFBZ0MsS0FBSyxDQUFyQyxFQUF3QztBQUN0QyxnQkFBSSxPQUFPLEtBQUssSUFBSSxDQUFULENBQVg7QUFDQSxnQkFBSSxTQUFVLEtBQUssSUFBSSxDQUFKLEdBQVEsQ0FBYixDQUFkOztBQUVBLHNCQUFVLElBQVYsQ0FBZTtBQUNiLHlCQUFXLElBREU7QUFFYix3QkFBVTtBQUZHLGFBQWY7QUFJRDs7QUFFRCxjQUFJLFdBQVcsVUFBWCxNQUEyQixRQUEvQixFQUF5QztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUN2QyxvQ0FBZ0IsU0FBaEIsbUlBQTJCO0FBQUEsb0JBQWxCLEdBQWtCO0FBQUEsb0JBQ3BCLFNBRG9CLEdBQ0csR0FESCxDQUNwQixTQURvQjtBQUFBLG9CQUNULFFBRFMsR0FDRyxHQURILENBQ1QsUUFEUzs7O0FBR3pCLG9CQUFJLGNBQWMsT0FBZCxJQUF5QixhQUFhLFdBQTFDLEVBQXdEO0FBQ3RELHNCQUFJLE1BQU0sR0FBRyxHQUFiO0FBQ0Esc0JBQUksSUFBSSxJQUFJLFNBQVMsU0FBYixFQUFSO0FBQ0Esb0JBQUUsUUFBRixDQUFXLENBQVgsR0FBZSxJQUFJLENBQW5CO0FBQ0Esb0JBQUUsUUFBRixDQUFXLENBQVgsR0FBZSxJQUFJLENBQW5CO0FBQ0EsdUJBQUssYUFBTCxDQUFtQixDQUFuQixFQUFzQixDQUF0QjtBQUNBLHVCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBckI7QUFFRCxpQkFSRCxNQVFPO0FBQ0wsNkJBQVcsU0FBWCxJQUF3QixRQUF4QjtBQUNEO0FBQ0Y7QUFmc0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFpQnZDLGlCQUFLLGVBQUwsQ0FBcUIsTUFBckIsQ0FBNEIsS0FBSyxlQUFMLENBQXFCLE9BQXJCLENBQTZCLEVBQTdCLENBQTVCLEVBQThELENBQTlEO0FBQ0Q7QUFDRjtBQXhDZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXlDbEI7QUExQ2MsR0E5SGdEOztBQTJLakUsb0JBQWtCO0FBQ2hCLFdBQU8saUJBQVk7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDakIsOEJBQWlCLEtBQUssZ0JBQXRCLG1JQUF3QztBQUFBLGNBQTdCLEVBQTZCOztBQUN0QyxjQUFJLEtBQUssTUFBTCxDQUFZLHdCQUFaLENBQXFDLEdBQUcsR0FBeEMsQ0FBSixFQUFrRDtBQUNoRCxnQkFBSSxDQUFDLEdBQUcsTUFBUixFQUFnQjtBQUNkLGtCQUFJLE9BQU8sR0FBRyxJQUFkO0FBQ0Esa0JBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQVg7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0JBQUksS0FBSyxNQUFMLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3JCLG9CQUFJLFlBQVksS0FBSyxDQUFMLENBQWhCO0FBQ0Esb0JBQUksV0FBVyxLQUFLLENBQUwsQ0FBZjs7QUFFQSxvQkFBSSxXQUFXLFNBQVgsTUFBMEIsUUFBOUIsRUFBd0M7QUFDdEMsdUJBQUssYUFBTCxDQUFtQixFQUFuQixFQUF1QixLQUFLLENBQUwsQ0FBdkI7QUFDRDs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNDLGVBZkQsTUFlTyxJQUFJLEtBQUssTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQzFCLG9CQUFJLGFBQWEsS0FBSyxDQUFMLENBQWpCO0FBQ0Esb0JBQUksV0FBVyxLQUFLLENBQUwsQ0FBZjtBQUNBLG9CQUFJLFNBQVMsS0FBSyxLQUFLLE1BQUwsR0FBYyxDQUFuQixDQUFiOztBQUVBO0FBQ0Esb0JBQUksYUFBYSxLQUFLLE1BQUwsR0FBYyxDQUEvQjtBQUNBLG9CQUFJLFlBQVksRUFBaEI7O0FBRUEscUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxVQUFwQixFQUFnQyxLQUFLLENBQXJDLEVBQXdDO0FBQ3RDLHNCQUFJLE9BQU8sS0FBSyxJQUFJLENBQVQsQ0FBWDtBQUNBLHNCQUFJLFNBQVUsS0FBSyxJQUFJLENBQUosR0FBUSxDQUFiLENBQWQ7O0FBRUEsNEJBQVUsSUFBVixDQUFlO0FBQ2IsK0JBQVcsSUFERTtBQUViLDhCQUFVO0FBRkcsbUJBQWY7QUFJRDs7QUFFRCxvQkFBSSxXQUFXLFVBQVgsTUFBMkIsUUFBL0IsRUFBeUM7QUFDdkMsdUJBQUsscUJBQUwsQ0FBMkIsRUFBM0IsRUFBK0IsU0FBL0IsRUFBMEMsTUFBMUM7QUFDRDtBQUVGLGVBdkJNLE1BdUJBO0FBQ0wscUJBQUssYUFBTCxDQUFtQixFQUFuQixFQUF1QixHQUFHLElBQTFCO0FBQ0Q7QUFDRjtBQUNGLFdBbERELE1Ba0RPO0FBQ0wsZ0JBQUksR0FBRyxNQUFQLEVBQWU7QUFDYixtQkFBSyxhQUFMLENBQW1CLEVBQW5CO0FBQ0Q7QUFDRjtBQUNGO0FBekRnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBMERsQjtBQTNEZSxHQTNLK0M7O0FBeU9qRSxpQkFBZTtBQUNiLFdBQU8sZUFBVSxLQUFWLEVBQThCO0FBQUEsVUFBYixNQUFhLHVFQUFKLEVBQUk7O0FBQ25DLFlBQU0sTUFBTixHQUFlLElBQWY7QUFDQSxVQUFJLFVBQVUsSUFBSSxTQUFTLE9BQWIsQ0FDWixLQUFLLElBRE8sRUFFWixLQUFLLFFBRk8sRUFHWixLQUFLLE1BSE8sRUFJWixNQUpZLENBQWQ7O0FBT0EsY0FBUSxDQUFSLEdBQVksTUFBTSxHQUFOLENBQVUsQ0FBdEI7QUFDQSxjQUFRLENBQVIsR0FBWSxNQUFNLEdBQU4sQ0FBVSxDQUFWLEdBQWMsRUFBMUI7O0FBRUE7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsT0FBbkIsRUFBNEIsQ0FBNUI7QUFDQSxZQUFNLE9BQU4sR0FBZ0IsT0FBaEI7QUFDQSxXQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLEtBQUssTUFBeEI7QUFDRDtBQWpCWSxHQXpPa0Q7O0FBNlBqRSx5QkFBdUI7QUFDckIsV0FBTyxlQUFVLEtBQVYsRUFBaUIsU0FBakIsRUFBeUM7QUFBQTs7QUFBQSxVQUFiLE1BQWEsdUVBQUosRUFBSTs7QUFDOUMsWUFBTSxNQUFOLEdBQWUsSUFBZjtBQUNBLFVBQUksVUFBVSxJQUFJLFNBQVMsT0FBYixDQUNaLEtBQUssSUFETyxFQUVaLEtBQUssUUFGTyxFQUdaLEtBQUssTUFITyxFQUlaLE1BSlksQ0FBZDtBQU1BLGNBQVEsT0FBUixHQUFrQixJQUFsQjtBQUNBLFdBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsTUFBTSxHQUF6Qjs7QUFFQSxjQUFRLENBQVIsR0FBWSxNQUFNLEdBQU4sQ0FBVSxDQUF0QjtBQUNBLGNBQVEsQ0FBUixHQUFZLE1BQU0sR0FBTixDQUFVLENBQVYsR0FBYyxFQUExQjs7QUFFQSxXQUFLLE1BQUwsQ0FBWSxZQUFaO0FBQ0EsV0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixRQUF6QixDQUFrQyxDQUFsQztBQUNBLFdBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsUUFBckIsQ0FBOEIsQ0FBOUI7O0FBRUE7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsT0FBbkIsRUFBNEIsQ0FBNUI7QUFDQSxZQUFNLE9BQU4sR0FBZ0IsT0FBaEI7O0FBRUEsUUFBRSxPQUFGLEVBQVcsRUFBWCxDQUFjLFdBQWQsRUFBMkIsVUFBQyxDQUFELEVBQU87QUFDaEMsVUFBRSxPQUFGLEVBQVcsR0FBWDs7QUFEZ0M7QUFBQTtBQUFBOztBQUFBO0FBR2hDLGdDQUFnQixTQUFoQixtSUFBMkI7QUFBQSxnQkFBbEIsR0FBa0I7QUFBQSxnQkFDcEIsU0FEb0IsR0FDRyxHQURILENBQ3BCLFNBRG9CO0FBQUEsZ0JBQ1QsUUFEUyxHQUNHLEdBREgsQ0FDVCxRQURTOztBQUV6Qix1QkFBVyxTQUFYLElBQXdCLFFBQXhCO0FBQ0Q7QUFOK0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFPaEMsY0FBSyxNQUFMLENBQVksWUFBWjs7QUFFQSxjQUFLLGFBQUwsQ0FBbUIsS0FBbkI7QUFDRCxPQVZEO0FBV0Q7QUFsQ29CLEdBN1AwQzs7QUFrU2pFLGlCQUFlO0FBQ2IsV0FBTyxlQUFVLEtBQVYsRUFBaUI7QUFDdEI7QUFDQSxZQUFNLE9BQU4sQ0FBYyxVQUFkLENBQXlCLE9BQXpCLEdBQW1DLElBQW5DO0FBQ0EsWUFBTSxNQUFOLEdBQWUsS0FBZjtBQUNBLFlBQU0sT0FBTixHQUFnQixJQUFoQjtBQUNEO0FBTlksR0FsU2tEOztBQTJTakUsNkJBQTJCO0FBQ3pCLFdBQU8saUJBQVk7QUFDakIsVUFBSSxNQUFNLEtBQUssY0FBTCxFQUFWOztBQURpQjtBQUFBO0FBQUE7O0FBQUE7QUFHakIsOEJBQWMsR0FBZCxtSUFBbUI7QUFBQSxjQUFWLENBQVU7O0FBQ2pCLGNBQUksRUFBRSxVQUFGLENBQWEsT0FBYixLQUF5QixJQUE3QixFQUFtQztBQUNqQyxpQkFBSyxnQkFBTCxDQUFzQixDQUF0QjtBQUNEO0FBQ0Y7QUFQZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFsQjtBQVR3QixHQTNTc0M7O0FBdVRqRSxrQkFBZ0I7QUFDZCxXQUFPLGlCQUFZO0FBQ2pCLFVBQUksTUFBTSxLQUFLLGNBQUwsRUFBVjs7QUFFQSxXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksSUFBSSxNQUF4QixFQUFnQyxHQUFoQyxFQUFxQztBQUNuQyxZQUFJLENBQUosRUFBTyxZQUFQLENBQW9CLFFBQXBCLENBQTZCLFVBQVUsUUFBdkM7QUFDQSxZQUFJLENBQUosRUFBTyxRQUFQLENBQWdCLFFBQWhCLENBQXlCLFVBQVUsUUFBbkM7QUFDRDtBQUNGO0FBUmEsR0F2VGlEOztBQWtVakUsZ0JBQWU7QUFDYixXQUFRLGlCQUFZO0FBQ2xCLFVBQUksT0FBTyxLQUFLLFFBQWhCOztBQUVBLFVBQUksS0FBSyxNQUFULEVBQWlCO0FBQ2YsYUFBSyxNQUFMLENBQVksV0FBWixDQUF3QixJQUF4QjtBQUNEO0FBQ0Y7QUFQWSxHQWxVa0Q7O0FBNFVqRSxxQkFBbUI7QUFDakIsV0FBTyxlQUFVLFdBQVYsRUFBdUI7QUFDNUIsV0FBSyxnQkFBTDs7QUFENEI7QUFBQTtBQUFBOztBQUFBO0FBRzVCLCtCQUFrQixLQUFLLFVBQXZCLHdJQUFtQztBQUFBLGNBQTFCLEtBQTBCO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUVqQyxtQ0FBYyxLQUFLLFNBQW5CLHdJQUE4QjtBQUFBLGtCQUFyQixDQUFxQjs7QUFDNUIsa0JBQUksS0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLEtBQXhCLElBQWlDLENBQXJDLEVBQXdDO0FBQ3hDLGtCQUFJLEtBQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsQ0FBdkIsSUFBNEIsQ0FBaEMsRUFBbUM7O0FBRW5DLGtCQUFJLE1BQU0seUJBQU4sQ0FBZ0MsQ0FBaEMsRUFBbUMsRUFBbkMsQ0FBSixFQUE0QztBQUMxQyxrQkFBRSxZQUFGLENBQWUsSUFBZixHQUFzQixTQUFTLE9BQVQsQ0FBaUIsS0FBakIsQ0FBdUIsUUFBN0M7QUFDQSxxQkFBSyxTQUFMLENBQWUsTUFBZixDQUFzQixLQUFLLFNBQUwsQ0FBZSxPQUFmLENBQXVCLENBQXZCLENBQXRCLEVBQWlELENBQWpEO0FBQ0EscUJBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixLQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsS0FBeEIsQ0FBdkIsRUFBdUQsQ0FBdkQ7QUFDQSxzQkFBTSxVQUFOLENBQWlCLE9BQWpCLEdBQTJCLElBQTNCO0FBQ0Esa0JBQUUsS0FBRixHQUFVLEtBQVY7QUFDRDtBQUNGO0FBYmdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFjbEM7QUFqQjJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBbUI1QixZQUFNLFNBQU4sQ0FBZ0IsaUJBQWhCLENBQWtDLElBQWxDLENBQXVDLElBQXZDLEVBQTZDLFdBQTdDO0FBQ0Q7QUFyQmdCLEdBNVU4Qzs7QUFvV2pFLHFCQUFtQjtBQUNqQixXQUFPLGlCQUFZO0FBQUE7O0FBQ2pCLFVBQUksS0FBSyxRQUFMLENBQWMsS0FBZCxLQUF3QixDQUE1QixFQUErQjtBQUM3QixZQUFJLFdBQVcsR0FBWCxLQUFtQixLQUFLLEdBQTVCLEVBQWlDO0FBQy9CLGVBQUssV0FBTCxDQUFpQixZQUFNO0FBQ3JCLGdCQUFJLFdBQVcsSUFBSSxTQUFKLENBQWMsT0FBSyxNQUFuQixFQUEyQixPQUFLLElBQWhDLENBQWY7QUFDQSxxQkFBUyxNQUFULENBQWdCLFdBQVcsR0FBM0I7QUFDQSxxQkFBUyxPQUFUO0FBQ0EsbUJBQUssTUFBTCxDQUFZLFFBQVo7O0FBRUEsbUJBQUssS0FBTDtBQUNELFdBUEQ7QUFRRDs7QUFFRCxZQUFJLFdBQVcsUUFBWCxLQUF3QixNQUE1QixFQUFvQztBQUNsQyxlQUFLLFdBQUwsQ0FBaUIsWUFBTTtBQUNyQixnQkFBSSxnQkFBZ0IsUUFBUSxpQkFBUixDQUFwQjtBQUNBLGdCQUFJLFdBQVcsSUFBSSxhQUFKLENBQWtCLE9BQUssTUFBdkIsRUFBK0IsT0FBSyxJQUFwQyxDQUFmO0FBQ0EsbUJBQUssTUFBTCxDQUFZLFFBQVo7QUFDQSxtQkFBSyxLQUFMO0FBQ0QsV0FMRDtBQU1EO0FBQ0Y7QUFDRjtBQXZCZ0IsR0FwVzhDOztBQThYakUsY0FBWTtBQUNWLFdBQU8sZUFBVSxRQUFWLEVBQW9CO0FBQUE7O0FBQ3pCLFdBQUssUUFBTCxDQUFjLEtBQWQsR0FBc0IsQ0FBdEI7QUFDQSxXQUFLLE1BQUwsQ0FBWSxZQUFaOztBQUVBLFVBQUksS0FBSyxPQUFPLFdBQVAsQ0FDUCxZQUFNO0FBQ0osZUFBSyxRQUFMLENBQWMsS0FBZCxJQUF1QixVQUFVLFNBQWpDO0FBQ0EsZUFBSyxRQUFMLENBQWMsS0FBZCxJQUF1QixHQUF2Qjs7QUFFQSxZQUFJLE9BQUssUUFBTCxDQUFjLEtBQWQsSUFBdUIsQ0FBM0IsRUFBOEI7QUFDNUIsaUJBQU8sYUFBUCxDQUFxQixFQUFyQjtBQUNBLGlCQUFLLFFBQUwsQ0FBYyxLQUFkLEdBQXNCLENBQXRCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLFlBQVo7QUFDQSxpQkFBSyxNQUFMLENBQVksV0FBWixDQUF3QixPQUFLLFFBQTdCOztBQUVBLGNBQUksUUFBSixFQUFjO0FBQ1o7QUFDRDtBQUNGO0FBQ0YsT0FmTSxFQWdCUCxDQWhCTyxDQUFUO0FBa0JEO0FBdkJTLEdBOVhxRDs7QUF3WmpFLGVBQWE7QUFDWCxXQUFPLGVBQVUsUUFBVixFQUFvQjtBQUFBOztBQUN6QixXQUFLLFFBQUwsQ0FBYyxLQUFkLEdBQXNCLENBQXRCO0FBQ0EsV0FBSyxNQUFMLENBQVksWUFBWjs7QUFFQSxVQUFJLEtBQUssT0FBTyxXQUFQLENBQ1AsWUFBTTtBQUNKLGVBQUssUUFBTCxDQUFjLEtBQWQsSUFBdUIsVUFBVSxTQUFqQztBQUNBLGVBQUssUUFBTCxDQUFjLEtBQWQsSUFBdUIsSUFBdkI7O0FBRUEsWUFBSSxPQUFLLFFBQUwsQ0FBYyxLQUFkLElBQXVCLENBQTNCLEVBQThCO0FBQzVCLGlCQUFPLGFBQVAsQ0FBcUIsRUFBckI7QUFDQSxpQkFBSyxRQUFMLENBQWMsS0FBZCxHQUFzQixDQUF0QjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxZQUFaOztBQUVBLGNBQUksUUFBSixFQUFjO0FBQ1o7QUFDRDtBQUNGO0FBQ0YsT0FkTSxFQWVQLENBZk8sQ0FBVDtBQWlCRDtBQXRCVTtBQXhab0QsQ0FBL0IsQ0FBZCxDQUF0Qjs7QUFrYkEsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7QUNyZUE7O0FBRUEsSUFBSSxJQUFnQixJQUFJLE1BQXhCO0FBQ0EsSUFBSSxPQUFPLElBQUksSUFBZjtBQUNBLElBQUksUUFBUSxJQUFJLE9BQUosQ0FBWSxLQUF4QjtBQUNBLElBQUksTUFBTSxRQUFRLFFBQVIsQ0FBVjtBQUNBLElBQUksU0FBUyxRQUFRLG1CQUFSLENBQWI7QUFDQSxJQUFJLFdBQVcsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJLFlBQVksUUFBUSxhQUFSLENBQWhCOztBQUVBLElBQUksYUFBYSxRQUFRLGtCQUFSLENBQWpCOztBQUVBLElBQUksYUFBYSxTQUFiLFVBQWEsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCO0FBQ3ZDLFFBQU0sSUFBTixDQUFXLElBQVgsRUFBaUIsTUFBakIsRUFBeUIsSUFBekI7O0FBRUEsT0FBSyxJQUFMLEdBQVksSUFBWjs7QUFFQSxPQUFLLFFBQUwsR0FBZ0IsSUFBSSxLQUFLLE1BQUwsQ0FBWSxTQUFoQixDQUEwQixPQUFPLFNBQWpDLENBQWhCO0FBQ0EsT0FBSyxRQUFMLENBQWMsS0FBZCxHQUFzQixDQUF0Qjs7QUFFQSxPQUFLLE1BQUwsR0FBYyxJQUFJLFNBQVMsS0FBYixFQUFkO0FBQ0EsT0FBSyxNQUFMLENBQVksQ0FBWixHQUFnQixDQUFDLEdBQWpCO0FBQ0EsT0FBSyxhQUFMLENBQW1CLEtBQUssTUFBeEI7O0FBRUEsT0FBSyxJQUFMLEdBQVksSUFBWjs7QUFHQSxhQUFXLEtBQVgsR0FBbUIsR0FBbkI7QUFDQSxhQUFXLE1BQVgsR0FBb0IsR0FBcEI7QUFDQSxhQUFXLElBQVgsR0FBa0IsR0FBbEI7QUFDQSxhQUFXLEtBQVgsR0FBbUIsR0FBbkI7QUFDQSxhQUFXLEtBQVgsR0FBbUIsR0FBbkI7QUFDQSxhQUFXLFFBQVgsR0FBc0IsT0FBdEI7QUFDQSxhQUFXLEdBQVgsR0FBaUIsTUFBakI7QUFDRCxDQXRCRDs7QUF3QkEsT0FBTyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxFQUFwQzs7QUFHQSxXQUFXLFNBQVgsR0FBdUIsT0FBTyxNQUFQLENBQWMsT0FBTyxNQUFQLENBQWMsTUFBTSxTQUFwQixFQUErQjtBQUNsRSxVQUFTO0FBQ1AsV0FBTyxlQUFVLEVBQVYsRUFBYztBQUFBOztBQUNuQixZQUFNLFNBQU4sQ0FBZ0IsTUFBaEIsQ0FBdUIsSUFBdkIsQ0FBNEIsSUFBNUIsRUFBa0MsRUFBbEM7O0FBRUEsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFsQixFQUF3QjtBQUN0QixhQUFLLElBQUwsR0FBWSxJQUFJLFNBQVMsT0FBYixDQUNWLElBRFUsRUFFVixLQUFLLFFBRkssRUFHVixLQUFLLE1BSEssRUFJViwyQkFKVSxDQUFaO0FBTUEsYUFBSyxJQUFMLENBQVUsT0FBVixHQUFvQixJQUFwQjs7QUFFQSxVQUFFLEtBQUssSUFBUCxFQUFhLEVBQWIsQ0FBZ0IsV0FBaEIsRUFBNkIsWUFBTTtBQUNqQyxjQUFJLFdBQVcsSUFBSSxTQUFKLENBQWMsTUFBSyxNQUFuQixFQUEyQixNQUFLLElBQWhDLENBQWY7QUFDQSxtQkFBUyxNQUFULENBQWdCLE9BQU8sSUFBUCxDQUFZLENBQVosRUFBZSxHQUEvQjtBQUNBLG1CQUFTLE9BQVQ7QUFDQSxnQkFBSyxNQUFMLENBQVksUUFBWjtBQUNBLGdCQUFLLEtBQUw7QUFDRCxTQU5EOztBQVFBLGFBQUssYUFBTCxDQUFtQixLQUFLLElBQXhCLEVBQThCLENBQTlCO0FBQ0Q7QUFDRjtBQXZCTSxHQUR5RDs7QUEyQmxFOzs7QUFHQSxRQUFPO0FBQ0wsV0FBUSxlQUFVLFFBQVYsRUFBb0I7QUFDMUIsVUFBSSxLQUFLLFFBQUwsQ0FBYyxLQUFkLEdBQXNCLENBQTFCLEVBQTZCO0FBQzNCLGFBQUssUUFBTCxDQUFjLEtBQWQsR0FBc0IsT0FBTyxVQUE3QjtBQUNBLGFBQUssUUFBTCxDQUFjLE1BQWQsR0FBdUIsT0FBTyxXQUE5QjtBQUNBLGFBQUssUUFBTCxDQUFjLENBQWQsR0FBa0IsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixDQUFyQixHQUF5QixPQUFPLFVBQVAsR0FBb0IsR0FBL0Q7QUFDQSxhQUFLLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsQ0FBckIsR0FBeUIsT0FBTyxXQUFQLEdBQXFCLEdBQWhFO0FBQ0EsYUFBSyxNQUFMLENBQVksUUFBWixDQUFxQixLQUFLLFFBQTFCO0FBQ0Q7O0FBRUQ7QUFDQSxXQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLE1BQXJCLEdBQThCLENBQTlCO0FBQ0EsV0FBSyxxQkFBTCxHQUE4QixLQUFLLDJCQUFMLENBQWlDLEtBQUssTUFBdEMsRUFBOEMsQ0FBOUMsRUFBaUQsSUFBakQsQ0FDNUIsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1I7QUFDQSxZQUFJLEVBQUUsS0FBRixLQUFZLEVBQUUsS0FBbEIsRUFBeUI7QUFDdkIsaUJBQVEsRUFBRSxTQUFGLENBQVksUUFBWixDQUFxQixFQUFyQixHQUEwQixFQUFFLGdCQUFGLENBQW1CLE1BQW5CLEdBQTRCLEdBQXZELElBQ0MsRUFBRSxTQUFGLENBQVksUUFBWixDQUFxQixFQUFyQixHQUEwQixFQUFFLGdCQUFGLENBQW1CLE1BQW5CLEdBQTRCLEdBRHZELENBQVA7O0FBR0Y7QUFDQyxTQUxELE1BS087QUFDTCxpQkFBTyxFQUFFLEtBQUYsR0FBVSxFQUFFLEtBQW5CO0FBQ0Q7QUFDRixPQVgyQixDQUE5Qjs7QUFjQTtBQXpCMEI7QUFBQTtBQUFBOztBQUFBO0FBMEIxQiw2QkFBZ0IsS0FBSyxxQkFBckIsOEhBQTRDO0FBQUEsY0FBbkMsR0FBbUM7O0FBQzFDLGNBQUksS0FBSyxNQUFMLENBQVksR0FBWixDQUFKLEVBQXNCO0FBQ3BCLGlCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEdBQXJCO0FBQ0Q7QUFDRjtBQTlCeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQStCM0I7QUFoQ0ksR0E5QjJEOztBQWlFbEUsZ0JBQWU7QUFDYixXQUFRLGlCQUFZO0FBQ2xCLFVBQUksT0FBTyxLQUFLLFFBQWhCO0FBQ0Q7QUFIWTtBQWpFbUQsQ0FBL0IsQ0FBZCxDQUF2Qjs7QUF3RUEsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7QUMvR0E7O0FBRUEsSUFBSSxZQUFZLFFBQVEsZ0JBQVIsQ0FBaEI7QUFDQSxJQUFJLGdCQUFnQixRQUFRLG9CQUFSLENBQXBCO0FBQ0EsSUFBSSxhQUFhLFFBQVEsaUJBQVIsQ0FBakI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsZUFBWSxTQURDO0FBRWIsbUJBQWdCLGFBRkg7QUFHYixnQkFBYTtBQUhBLENBQWpCOzs7QUNOQTs7QUFFQSxPQUFPLE9BQVAsR0FBaUI7QUFDZixRQUFNLENBQ0osRUFBQyxLQUFLLE1BQU4sRUFBYyxNQUFNLHlCQUFwQixFQURJLEVBRUosRUFBQyxLQUFLLE1BQU4sRUFBYyxNQUFNLHlCQUFwQixFQUZJLENBRFM7O0FBTWY7QUFDQSxTQUFPLDRCQVBRO0FBUWYsY0FBWSw0QkFSRztBQVNmLGVBQWEsNkJBVEU7QUFVZixtQkFBaUIsZ0NBVkY7QUFXZixjQUFZLDRCQVhHO0FBWWYsYUFBVywyQkFaSTtBQWFmLGNBQVksNEJBYkc7QUFjZixjQUFZLDRCQWRHO0FBZWYsY0FBWSw0QkFmRztBQWdCZixhQUFXLDJCQWhCSTtBQWlCZixpQkFBZSwrQkFqQkE7QUFrQmYsZ0JBQWMsOEJBbEJDOztBQW9CZixRQUFNLHVCQXBCUztBQXFCZixjQUFZLDRCQXJCRzs7QUF1QmYsYUFBVywyQkF2Qkk7O0FBeUJmLFVBQVEseUJBekJPO0FBMEJmLFVBQVEseUJBMUJPO0FBMkJmLFVBQVEseUJBM0JPOztBQTZCZixVQUFRLHlCQTdCTztBQThCZixhQUFXLDJCQTlCSTtBQStCZixhQUFXLDJCQS9CSTtBQWdDZixhQUFXLDJCQWhDSTtBQWlDZixhQUFXLDJCQWpDSTs7QUFtQ2YsWUFBVSwwQkFuQ0s7QUFvQ2YsaUJBQWUsOEJBcENBO0FBcUNmLGdCQUFjLDhCQXJDQzs7QUF1Q2YsV0FBUywwQkF2Q007QUF3Q2YsV0FBUywwQkF4Q007O0FBMENmLFVBQVEsd0JBMUNPO0FBMkNmLFVBQVEsd0JBM0NPOztBQTZDZixVQUFRLHdCQTdDTztBQThDZixVQUFRLHdCQTlDTzs7QUFnRGYsVUFBUSx3QkFoRE87QUFpRGYsVUFBUSx3QkFqRE87O0FBbURmO0FBQ0E7QUFDQSxRQUFNLHdCQXJEUzs7QUF1RGY7QUFDQSxPQUFhLGFBQVUsSUFBVixFQUFnQixDQUFHO0FBeERqQixDQUFqQjs7O0FDRkE7O0FBRUEsSUFBSSxTQUFTLFFBQVEsYUFBUixDQUFiOztBQUVBLElBQUksWUFBWSxTQUFaLFNBQVksQ0FBVSxVQUFWLEVBQXNCO0FBQ2xDO0FBQ0gsU0FBSyxLQUFMLEdBQWEsSUFBSSxTQUFTLFNBQWIsQ0FBdUIsS0FBdkIsQ0FBYjtBQUNBLFNBQUssS0FBTCxDQUFXLGFBQVgsQ0FBeUIsU0FBUyxLQUFsQzs7QUFFRztBQUNBLFdBQU8sR0FBUCxHQUFhLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsSUFBckIsQ0FBMEIsS0FBSyxLQUEvQixDQUFiOztBQUVBO0FBQ0EsUUFBSSxVQUFKLEVBQWdCO0FBQ1osYUFBSyxLQUFMLENBQVcsRUFBWCxDQUFjLFVBQWQsRUFBMEIsVUFBMUI7QUFDSDs7QUFFRCxRQUFJLGFBQWEsRUFBakI7O0FBRUE7QUFDQSxTQUFLLElBQUksS0FBVCxJQUFrQixNQUFsQixFQUEwQjtBQUN0QixZQUFJLFdBQVc7QUFDWCxnQkFBSyxLQURNO0FBRVgsaUJBQU0sT0FBTyxLQUFQO0FBRkssU0FBZjs7QUFLQSxtQkFBVyxJQUFYLENBQWdCLFFBQWhCO0FBQ0g7O0FBRUosU0FBSyxLQUFMLENBQVcsWUFBWCxDQUF3QixVQUF4QjtBQUNBLENBMUJEOztBQTRCQSxPQUFPLE9BQVAsR0FBaUIsU0FBakI7OztBQ2hDQTs7QUFFQSxJQUFJLFNBQVksUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSSxZQUFZLFFBQVEsZ0JBQVIsQ0FBaEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCO0FBQ2hCLFNBQVEsTUFEUTtBQUVoQixZQUFXO0FBRkssQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgLy8gSmVyZW15XHJcbiAganRhbGs6IFwiMFwiLFxyXG4gIGp0YWxrMjogXCIwXCIsXHJcbiAgamVuZDogXCIwXCIsXHJcbiAgXHJcbiAgLy8gRGFyZWxsXHJcbiAgZHRhbGs6IFwiMFwiLFxyXG4gIFxyXG4gIC8vIE1heHlcclxuICBtdGFsazogXCIwXCIsXHJcbiAgXHJcbiAgZ2FtZW92ZXI6IFwiZmFsc2VcIixcclxuICBcclxuICBtYXA6IFwibWFwMFwiXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBIZXhUaWxlID0gcmVxdWlyZSgnLi9IZXhUaWxlJyk7XHJcblxyXG52YXIgQmxvY2tGdWxsID0gZnVuY3Rpb24gKCkge1xyXG4gIEhleFRpbGUuY2FsbCh0aGlzKTtcclxuXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0spLnRleHR1cmU7XHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE1LCB0aGlzLmhleFZlcnRpY2VzKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuYWRkU3RhdGUoQmxvY2tGdWxsLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoQmxvY2tGdWxsLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAqL1xyXG5cclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEJsb2NrRnVsbCwge1xyXG4gIFNUQVRFIDoge1xyXG4gICAgdmFsdWUgOiB7XHJcbiAgICAgIElETEUgOiBcIklETEVcIixcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuQmxvY2tGdWxsLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBCbG9ja0Z1bGwuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoQmxvY2tGdWxsLlNUQVRFLlVQX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmxvY2tGdWxsLlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoQmxvY2tGdWxsLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCbG9ja0Z1bGwuU1RBVEUuTEVGVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShCbG9ja0Z1bGwuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJsb2NrRnVsbC5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShCbG9ja0Z1bGwuU1RBVEUuUklHSFRfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgKi9cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoQmxvY2tGdWxsKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmxvY2tGdWxsOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcclxuXHJcbnZhciBFdmVudEJvdW5kcyA9IGZ1bmN0aW9uICgpIHtcclxuICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcbiAgXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuRVZFTlRfQk9VTkRTKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuYWRkU3RhdGUoRXZlbnRCb3VuZHMuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gIFxyXG4gIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG4gIFxyXG4gIHRoaXMuc29saWQgPSBmYWxzZTtcclxuICB0aGlzLmZpeGVkID0gdHJ1ZTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEV2ZW50Qm91bmRzLCB7XHJcbiAgU1RBVEUgOiB7XHJcbiAgICB2YWx1ZSA6IHtcclxuICAgICAgSURMRSA6IFwiSURMRVwiLFxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5FdmVudEJvdW5kcy5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBIYW5kbGUgc3RhdGVcclxuICAgICAgLypcclxuICAgICAgdmFyIHN0YXRlTmFtZSA9IHRoaXMuY3VycmVudFN0YXRlLm5hbWU7XHJcblxyXG4gICAgICBzd2l0Y2ggKHN0YXRlTmFtZSkge1xyXG4gICAgICAgIGNhc2UgRXZlbnRCb3VuZHMuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoRXZlbnRCb3VuZHMuU1RBVEUuVVBfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudEJvdW5kcy5TVEFURS5ET1dOX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKEV2ZW50Qm91bmRzLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudEJvdW5kcy5TVEFURS5MRUZUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKEV2ZW50Qm91bmRzLlNUQVRFLkxFRlRfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudEJvdW5kcy5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShFdmVudEJvdW5kcy5TVEFURS5SSUdIVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShFdmVudEJvdW5kcyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50Qm91bmRzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgRXZlbnRCb3VuZHMgPSByZXF1aXJlKCcuL0V2ZW50Qm91bmRzJyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG5cclxudmFyIEhleFRpbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG4gIFxyXG4gIHRoaXMuaGV4VmVydGljZXMgPSBbXTtcclxuICBcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgdmFyIHggPSBIZXhUaWxlLldJRFRIICogMC41ICogTWF0aC5jb3MoKGkgLyA2KSAqIE1hdGguUEkgKiAyKTtcclxuICAgIHZhciB5ID0gSGV4VGlsZS5XSURUSCAqIDAuNSAqIE1hdGguc2luKChpIC8gNikgKiBNYXRoLlBJICogMik7XHJcbiAgICB0aGlzLmhleFZlcnRpY2VzLnB1c2gobmV3IGdlb20uVmVjMih4LCB5KSk7XHJcbiAgfVxyXG4gIFxyXG4gIHRoaXMuc29saWQgPSBmYWxzZTtcclxuICB0aGlzLmZpeGVkID0gdHJ1ZTtcclxuICB0aGlzLnByZXZTcHJpdGUgPSBudWxsO1xyXG4gIFxyXG4gIHRoaXMuY2xhaW1pbmdHcmFwaGljID0gbnVsbDtcclxuICB0aGlzLmNsYWltZWRHcmFwaGljID0gbnVsbDtcclxuICBcclxuICB0aGlzLmNsYWltVHJhbnNpdGlvbiA9IDA7XHJcbiAgdGhpcy5ldmVudEJvdW5kcyA9IG51bGw7XHJcbiAgdGhpcy5wbGF5ZXIgPSBudWxsO1xyXG4gIFxyXG4gIHRoaXMuUElYSSA9IG51bGw7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhIZXhUaWxlLCB7XHJcbiAgV0lEVEg6IHtcclxuICAgIHZhbHVlOiAxNjhcclxuICB9LFxyXG4gIEhFSUdIVDoge1xyXG4gICAgdmFsdWU6IDE0NFxyXG4gIH0sXHJcbiAgU1RBVEU6IHtcclxuICAgIHZhbHVlOiB7XHJcbiAgICAgIENMQUlNSU5HOiBcIkNMQUlNSU5HXCIsXHJcbiAgICAgIENMQUlNSU5HX1BST0dSRVNTOiBcIkNMQUlNSU5HX1BST0dSRVNTXCIsXHJcbiAgICAgIENMQUlNRUQ6IFwiQ0xBSU1FRFwiXHJcbiAgICB9XHJcbiAgfSxcclxuICBDTEFJTV9SQVRFOiB7XHJcbiAgICB2YWx1ZTogMC4wM1xyXG4gIH1cclxufSk7XHJcblxyXG5IZXhUaWxlLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBIZXhUaWxlLlNUQVRFLkNMQUlNSU5HOlxyXG4gICAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4uaW5kZXhPZih0aGlzLmNsYWltaW5nR3JhcGhpYykgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5jbGFpbWVkR3JhcGhpYyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5jbGFpbWluZ0dyYXBoaWMpO1xyXG4gICAgICAgICAgICB0aGlzLmNsYWltZWRHcmFwaGljLmFscGhhID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgdGhpcy5jbGFpbVRyYW5zaXRpb24gKz0gSGV4VGlsZS5DTEFJTV9SQVRFO1xyXG4gICAgICAgICAgdGhpcy5jbGFpbWluZ0dyYXBoaWMuYWxwaGEgPSB0aGlzLmNsYWltVHJhbnNpdGlvbjtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKHRoaXMuY2xhaW1UcmFuc2l0aW9uID49IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGFpbVRyYW5zaXRpb24gPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmNsYWltaW5nR3JhcGhpYy5hbHBoYSA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhaW1lZEdyYXBoaWMuYWxwaGEgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lID0gSGV4VGlsZS5TVEFURS5DTEFJTUlOR19QUk9HUkVTUztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgY2FzZSBIZXhUaWxlLlNUQVRFLkNMQUlNSU5HX1BST0dSRVNTOlxyXG4gICAgICAgICAgdGhpcy5jbGFpbVRyYW5zaXRpb24gLT0gSGV4VGlsZS5DTEFJTV9SQVRFO1xyXG4gICAgICAgICAgdGhpcy5jbGFpbWluZ0dyYXBoaWMuYWxwaGEgPSB0aGlzLmNsYWltVHJhbnNpdGlvbjtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKHRoaXMuY2xhaW1UcmFuc2l0aW9uIDw9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jbGFpbVRyYW5zaXRpb24gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lID0gSGV4VGlsZS5TVEFURS5DTEFJTUVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIEhleFRpbGUuU1RBVEUuQ0xBSU1FRDpcclxuICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbdGhpcy5jbGFpbWVkR3JhcGhpY107XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgUGh5c2ljc09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBmaW5kUmVmZXJlbmNlczoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChnYW1lT2JqZWN0cywgUElYSSkge1xyXG4gICAgICB0aGlzLlBJWEkgPSBQSVhJO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5jbGFpbWluZ0dyYXBoaWMgPSBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKEFzc2V0cy5USUxFX0NMQUlNSU5HKTtcclxuICAgICAgdGhpcy5jbGFpbWVkR3JhcGhpYyA9IG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UoQXNzZXRzLlRJTEVfQ0xBSU1FRCk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgb2Zmc2V0WCA9IHRoaXMud2lkdGggKiAwLjU7XHJcbiAgICAgIHZhciBvZmZzZXRZID0gdGhpcy5oZWlnaHQgKiAwLjU7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmNsYWltaW5nR3JhcGhpYy54IC09IG9mZnNldFg7XHJcbiAgICAgIHRoaXMuY2xhaW1pbmdHcmFwaGljLnkgLT0gb2Zmc2V0WTtcclxuICAgICAgdGhpcy5jbGFpbWVkR3JhcGhpYy54IC09IG9mZnNldFg7XHJcbiAgICAgIHRoaXMuY2xhaW1lZEdyYXBoaWMueSAtPSBvZmZzZXRZO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5jbGFpbWluZ0dyYXBoaWMuYWxwaGEgPSAwO1xyXG4gICAgICBcclxuICAgICAgXHJcbiAgICAgIFxyXG4gICAgICB2YXIgZXZlbnRCb3VuZHMgPSBbXTtcclxuICAgICAgXHJcbiAgICAgIGZvciAoY29uc3QgZyBvZiBnYW1lT2JqZWN0cykge1xyXG4gICAgICAgIGlmIChnIGluc3RhbmNlb2YgRXZlbnRCb3VuZHMpIHtcclxuICAgICAgICAgIGV2ZW50Qm91bmRzLnB1c2goZyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnIGluc3RhbmNlb2YgUGxheWVyKSB7XHJcbiAgICAgICAgICB0aGlzLnBsYXllciA9IGc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBldmVudEJvdW5kcy5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgdmFyIGQwID0gZ2VvbS5WZWMyLnN1YnRyYWN0KFxyXG4gICAgICAgICAgYS5wb3NpdGlvbixcclxuICAgICAgICAgIHRoaXMucG9zaXRpb25cclxuICAgICAgICApLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICAgICAgICB2YXIgZDEgPSBnZW9tLlZlYzIuc3VidHJhY3QoXHJcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLCBcclxuICAgICAgICAgIGIucG9zaXRpb25cclxuICAgICAgICApLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZDAgLSBkMTtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoZXZlbnRCb3VuZHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrQnJvYWRQaGFzZUNvbGxpc2lvbihldmVudEJvdW5kc1swXSkpIHtcclxuICAgICAgICAgIHRoaXMuZXZlbnRCb3VuZHMgPSBldmVudEJvdW5kc1swXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoSGV4VGlsZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhleFRpbGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBIb2xlQ292ZXIgPSByZXF1aXJlKCcuL0hvbGVDb3ZlcicpO1xyXG52YXIgVGlsZU9sZEplcmVteSA9IHJlcXVpcmUoJy4vVGlsZU9sZEplcmVteScpO1xyXG52YXIgRXZlbnRCb3VuZHMgPSByZXF1aXJlKCcuL0V2ZW50Qm91bmRzJyk7XHJcbnZhciBIZXhUaWxlID0gcmVxdWlyZSgnLi9IZXhUaWxlJyk7XHJcbnZhciBDb25kaXRpb25zID0gcmVxdWlyZSgnLi4vQ29uZGl0aW9ucycpO1xyXG5cclxudmFyIEhvbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5IT0xFKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuYWRkU3RhdGUoSG9sZS5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcblxyXG4gIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gIFxyXG4gIHRoaXMuaG9sZUNvdmVyID0gbnVsbDtcclxuICB0aGlzLmZpbGxlZCA9IGZhbHNlO1xyXG4gIHRoaXMudGlsZSA9IG51bGw7XHJcbiAgdGhpcy5ldmVudEJvdW5kcyA9IG51bGw7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhIb2xlLCB7XHJcbiAgU1RBVEUgOiB7XHJcbiAgICB2YWx1ZSA6IHtcclxuICAgICAgSURMRSA6IFwiSURMRVwiLFxyXG4gICAgICBGSUxMRUQ6IFwiRklMTEVEXCIsXHJcbiAgICAgIENPTVBMRVRFOiBcIkNPTVBMRVRFXCJcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuSG9sZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuICAgICAgXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBIb2xlLlNUQVRFLklETEU6XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhvbGVDb3Zlcikge1xyXG4gICAgICAgICAgICAgIHZhciBkaXNwbGFjZW1lbnQgPSBnZW9tLlZlYzIuc3VidHJhY3QoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob2xlQ292ZXIucG9zaXRpb25cclxuICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoZGlzcGxhY2VtZW50LmdldE1hZ25pdHVkZVNxdWFyZWQoKSA+IDIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbXB1bHNlID0gZGlzcGxhY2VtZW50LmNsb25lKCkubXVsdGlwbHkoMC4wMzUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob2xlQ292ZXIucG9zaXRpb24uYWRkKGltcHVsc2UpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lID0gSG9sZS5TVEFURS5GSUxMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlIEhvbGUuU1RBVEUuRklMTEVEOlxyXG4gICAgICAgICAgaWYgKHRoaXMuYWxwaGEgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWxwaGEgLT0gMC4xO1xyXG4gICAgICAgICAgICB0aGlzLmhvbGVDb3Zlci5hbHBoYSAtPSAwLjE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFscGhhID0gMDtcclxuICAgICAgICAgICAgdGhpcy5ob2xlQ292ZXIuYWxwaGEgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lID0gSG9sZS5TVEFURS5DT01QTEVURTtcclxuICAgICAgICAgICAgdGhpcy50aWxlLmN1cnJlbnRTdGF0ZS5uYW1lID0gSGV4VGlsZS5TVEFURS5DTEFJTUlORztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgSG9sZS5TVEFURS5DT01QTEVURTpcclxuICAgICAgICAgIGlmICh0aGlzLmV2ZW50Qm91bmRzKSB7XHJcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHRoaXMuZXZlbnRCb3VuZHMuY3VzdG9tRGF0YS5wcm9wcztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcCBvZiBwcm9wcykge1xyXG4gICAgICAgICAgICAgIGlmIChwLmtleSAhPT0gXCJ0aWxlQ2xhaW1cIikgY29udGludWU7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBwLnZhbHVlLnNwbGl0KCd8Jyk7XHJcblxyXG4gICAgICAgICAgICAgIHZhciBjb25kaXRpb25zID0gYXJncy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50U2V0cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbmRpdGlvbnM7IGkgKz0gMikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbmQgPSBhcmdzW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1ZhbCAgPSBhcmdzW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICAgICAgICBldmVudFNldHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogY29uZCxcclxuICAgICAgICAgICAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBmb3IgKGxldCBzZXQgb2YgZXZlbnRTZXRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQge2NvbmRpdGlvbiwgbmV3VmFsdWV9ID0gc2V0O1xyXG4gICAgICAgICAgICAgICAgQ29uZGl0aW9uc1tjb25kaXRpb25dID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIHRoaXMuY3VzdG9tRGF0YS5yZXRpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuaG9sZUNvdmVyLmN1c3RvbURhdGEucmV0aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gSGFuZGxlIHN0YXRlXHJcbiAgICAgIC8qXHJcbiAgICAgIHZhciBzdGF0ZU5hbWUgPSB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xyXG5cclxuICAgICAgc3dpdGNoIChzdGF0ZU5hbWUpIHtcclxuICAgICAgICBjYXNlIEhvbGUuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoSG9sZS5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEhvbGUuU1RBVEUuRE9XTl9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShIb2xlLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBIb2xlLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoSG9sZS5TVEFURS5MRUZUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSG9sZS5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShIb2xlLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBmaW5kUmVmZXJlbmNlczoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChnYW1lT2JqZWN0cykge1xyXG4gICAgICB2YXIgb2xkSmVyZW15VGlsZXMgPSBbXTtcclxuICAgICAgdmFyIGV2ZW50Qm91bmRzID0gW107XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKGNvbnN0IGcgb2YgZ2FtZU9iamVjdHMpIHtcclxuICAgICAgICBpZiAoZyBpbnN0YW5jZW9mIFRpbGVPbGRKZXJlbXkpIHtcclxuICAgICAgICAgIG9sZEplcmVteVRpbGVzLnB1c2goZyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnIGluc3RhbmNlb2YgRXZlbnRCb3VuZHMpIHtcclxuICAgICAgICAgIGV2ZW50Qm91bmRzLnB1c2goZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBvbGRKZXJlbXlUaWxlcy5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgdmFyIGQwID0gZ2VvbS5WZWMyLnN1YnRyYWN0KFxyXG4gICAgICAgICAgYS5wb3NpdGlvbixcclxuICAgICAgICAgIHRoaXMucG9zaXRpb25cclxuICAgICAgICApLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICAgICAgICB2YXIgZDEgPSBnZW9tLlZlYzIuc3VidHJhY3QoXHJcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLCBcclxuICAgICAgICAgIGIucG9zaXRpb25cclxuICAgICAgICApLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZDAgLSBkMTtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICBldmVudEJvdW5kcy5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgdmFyIGQwID0gZ2VvbS5WZWMyLnN1YnRyYWN0KFxyXG4gICAgICAgICAgYS5wb3NpdGlvbixcclxuICAgICAgICAgIHRoaXMucG9zaXRpb25cclxuICAgICAgICApLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICAgICAgICB2YXIgZDEgPSBnZW9tLlZlYzIuc3VidHJhY3QoXHJcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLCBcclxuICAgICAgICAgIGIucG9zaXRpb25cclxuICAgICAgICApLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZDAgLSBkMTtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAob2xkSmVyZW15VGlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrQnJvYWRQaGFzZUNvbGxpc2lvbihvbGRKZXJlbXlUaWxlc1swXSkpIHtcclxuICAgICAgICAgIHRoaXMudGlsZSA9IG9sZEplcmVteVRpbGVzWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKGV2ZW50Qm91bmRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBpZiAodGhpcy5jaGVja0Jyb2FkUGhhc2VDb2xsaXNpb24oZXZlbnRCb3VuZHNbMF0pKSB7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50Qm91bmRzID0gZXZlbnRCb3VuZHNbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBjYW5Db2xsaWRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICByZXR1cm4gIShvYmogaW5zdGFuY2VvZiBIb2xlQ292ZXIpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgb25Db2xsaWRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICBpZiAob2JqIGluc3RhbmNlb2YgSG9sZUNvdmVyKSB7XHJcbiAgICAgICAgdmFyIGRpc3RTcXVhcmVkID0gZ2VvbS5WZWMyLnN1YnRyYWN0KG9iai5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0TWFnbml0dWRlU3F1YXJlZCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChkaXN0U3F1YXJlZCA8IHRoaXMud2lkdGggKiB0aGlzLndpZHRoICogMC43NSAqIDAuNzUpIHtcclxuICAgICAgICAgIHRoaXMuaG9sZUNvdmVyID0gb2JqO1xyXG4gICAgICAgICAgdGhpcy5ob2xlQ292ZXIuaWdub3JlUGxheWVyID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuaG9sZUNvdmVyLm1hc3MgPSBJbmZpbml0eTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoSG9sZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhvbGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG5cclxudmFyIEhvbGVDb3ZlciA9IGZ1bmN0aW9uICgpIHtcclxuICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLkhPTEVfQ09WRVIpLnRleHR1cmU7XHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMSk7XHJcbiAgdGhpcy5hZGRTdGF0ZShIb2xlQ292ZXIuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG5cclxuICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHJcbiAgLy8gU2V0IGNvbnN0YW50c1xyXG4gIHRoaXMubWF4U3BlZWQgICAgICAgID0gSG9sZUNvdmVyLk1BWF9TUEVFRDtcclxuICB0aGlzLm1heEFjY2VsZXJhdGlvbiA9IEhvbGVDb3Zlci5NQVhfQUNDRUxFUkFUSU9OO1xyXG4gIFxyXG4gIHRoaXMubWFzcyA9IDAuMTtcclxuICB0aGlzLnJlc3RpdHV0aW9uID0gMC41O1xyXG4gIHRoaXMuZnJpY3Rpb24gPSAwLjA7XHJcbiAgXHJcbiAgdGhpcy5pZ25vcmVQbGF5ZXIgPSBmYWxzZTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEhvbGVDb3Zlciwge1xyXG4gIFNUQVRFIDoge1xyXG4gICAgdmFsdWUgOiB7XHJcbiAgICAgIElETEUgOiBcIklETEVcIixcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIE1BWF9TUEVFRCA6IHtcclxuICAgIHZhbHVlIDogMTVcclxuICB9LFxyXG4gIFxyXG4gIE1BWF9BQ0NFTEVSQVRJT04gOiB7XHJcbiAgICB2YWx1ZSA6IDEwXHJcbiAgfVxyXG59KTtcclxuXHJcbkhvbGVDb3Zlci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBIYW5kbGUgc3RhdGVcclxuICAgICAgLypcclxuICAgICAgdmFyIHN0YXRlTmFtZSA9IHRoaXMuY3VycmVudFN0YXRlLm5hbWU7XHJcblxyXG4gICAgICBzd2l0Y2ggKHN0YXRlTmFtZSkge1xyXG4gICAgICAgIGNhc2UgSG9sZUNvdmVyLlNUQVRFLlVQX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKEhvbGVDb3Zlci5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEhvbGVDb3Zlci5TVEFURS5ET1dOX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKEhvbGVDb3Zlci5TVEFURS5ET1dOX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSG9sZUNvdmVyLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoSG9sZUNvdmVyLlNUQVRFLkxFRlRfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBIb2xlQ292ZXIuU1RBVEUuUklHSFRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoSG9sZUNvdmVyLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qY2FuQ29sbGlkZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgaWYgKHRoaXMuaWdub3JlUGxheWVyICYmIChvYmogaW5zdGFuY2VvZiBQbGF5ZXIpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9Ki9cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShIb2xlQ292ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIb2xlQ292ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcblxyXG52YXIgSmVyZW15ID0gZnVuY3Rpb24gKCkge1xyXG4gIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuSkVSRU1ZMCkudGV4dHVyZTtcclxuICB0aGlzLm15R3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5KRVJFTVkxKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAzMCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUyID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzIsIDMwKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgdGhpcy5hZGRTdGF0ZShKZXJlbXkuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gIC8vIFJlZmVyZW5jZSBncmFwaGljc1xyXG4gIC8qXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICB0aGlzLm15R3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5NWV9HUkFQSElDKS50ZXh0dXJlO1xyXG4gICovXHJcblxyXG4gIC8vIENyZWF0ZSBzdGF0ZVxyXG4gIC8qXHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcblxyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAxNSk7XHJcbiAgdGhpcy5mcmFtZUlkbGUyID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzIsIDE1KTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgKi9cclxuXHJcbiAgLy8gQWRkIHN0YXRlc1xyXG4gIC8qXHJcbiAgdGhpcy5hZGRTdGF0ZShKZXJlbXkuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gICovXHJcbiAgXHJcbiAgdGhpcy5zb2xpZCA9IGZhbHNlO1xyXG4gIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoSmVyZW15LCB7XHJcbiAgU1RBVEUgOiB7XHJcbiAgICB2YWx1ZSA6IHtcclxuICAgICAgSURMRSA6IFwiSURMRVwiLFxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5KZXJlbXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgUGh5c2ljc09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgLy8gSGFuZGxlIHN0YXRlXHJcbiAgICAgIC8qXHJcbiAgICAgIHZhciBzdGF0ZU5hbWUgPSB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xyXG5cclxuICAgICAgc3dpdGNoIChzdGF0ZU5hbWUpIHtcclxuICAgICAgICBjYXNlIEplcmVteS5TVEFURS5VUF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShKZXJlbXkuU1RBVEUuVVBfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBKZXJlbXkuU1RBVEUuRE9XTl9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShKZXJlbXkuU1RBVEUuRE9XTl9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEplcmVteS5TVEFURS5MRUZUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKEplcmVteS5TVEFURS5MRUZUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSmVyZW15LlNUQVRFLlJJR0hUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKEplcmVteS5TVEFURS5SSUdIVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShKZXJlbXkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKZXJlbXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcblxyXG52YXIgTlBDQSA9IGZ1bmN0aW9uICgpIHtcclxuICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk5QQ19BMCkudGV4dHVyZTtcclxuICB0aGlzLm15R3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5OUENfQTEpLnRleHR1cmU7XHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE4KTtcclxuICB0aGlzLmZyYW1lSWRsZTIgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMiwgMTcpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUyKTtcclxuICB0aGlzLmFkZFN0YXRlKE5QQ0EuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gIC8vIFJlZmVyZW5jZSBncmFwaGljc1xyXG4gIC8qXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICB0aGlzLm15R3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5NWV9HUkFQSElDKS50ZXh0dXJlO1xyXG4gICovXHJcblxyXG4gIC8vIENyZWF0ZSBzdGF0ZVxyXG4gIC8qXHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcblxyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAxNSk7XHJcbiAgdGhpcy5mcmFtZUlkbGUyID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzIsIDE1KTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgKi9cclxuXHJcbiAgLy8gQWRkIHN0YXRlc1xyXG4gIC8qXHJcbiAgdGhpcy5hZGRTdGF0ZShOUENBLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAqL1xyXG4gIFxyXG4gIHRoaXMuc29saWQgPSBmYWxzZTtcclxuICB0aGlzLmZpeGVkID0gdHJ1ZTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE5QQ0EsIHtcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBJRExFIDogXCJJRExFXCIsXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbk5QQ0EucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgUGh5c2ljc09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgLy8gSGFuZGxlIHN0YXRlXHJcbiAgICAgIC8qXHJcbiAgICAgIHZhciBzdGF0ZU5hbWUgPSB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xyXG5cclxuICAgICAgc3dpdGNoIChzdGF0ZU5hbWUpIHtcclxuICAgICAgICBjYXNlIE5QQ0EuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoTlBDQS5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIE5QQ0EuU1RBVEUuRE9XTl9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShOUENBLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBOUENBLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoTlBDQS5TVEFURS5MRUZUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgTlBDQS5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShOUENBLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKE5QQ0EpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOUENBOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxudmFyIE5QQ0IgPSBmdW5jdGlvbiAoKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5OUENfQjApLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTlBDX0IxKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAzMCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUyID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzIsIDMwKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgdGhpcy5hZGRTdGF0ZShOUENCLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoTlBDQi5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgKi9cclxuICBcclxuICB0aGlzLnNvbGlkID0gZmFsc2U7XHJcbiAgdGhpcy5maXhlZCA9IHRydWU7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhOUENCLCB7XHJcbiAgU1RBVEUgOiB7XHJcbiAgICB2YWx1ZSA6IHtcclxuICAgICAgSURMRSA6IFwiSURMRVwiLFxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbk5QQ0IucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgUGh5c2ljc09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgLy8gSGFuZGxlIHN0YXRlXHJcbiAgICAgIC8qXHJcbiAgICAgIHZhciBzdGF0ZU5hbWUgPSB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xyXG5cclxuICAgICAgc3dpdGNoIChzdGF0ZU5hbWUpIHtcclxuICAgICAgICBjYXNlIE5QQ0IuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoTlBDQi5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIE5QQ0IuU1RBVEUuRE9XTl9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShOUENCLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBOUENCLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoTlBDQi5TVEFURS5MRUZUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgTlBDQi5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShOUENCLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKE5QQ0IpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOUENCOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxudmFyIE5QQ0MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5OUENfQzApLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTlBDX0MxKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCA0NSk7XHJcbiAgdGhpcy5mcmFtZUlkbGUyID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzIsIDQ1KTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgdGhpcy5hZGRTdGF0ZShOUENDLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoTlBDQy5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgKi9cclxuICBcclxuICB0aGlzLnNvbGlkID0gZmFsc2U7XHJcbiAgdGhpcy5maXhlZCA9IHRydWU7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhOUENDLCB7XHJcbiAgU1RBVEUgOiB7XHJcbiAgICB2YWx1ZSA6IHtcclxuICAgICAgSURMRSA6IFwiSURMRVwiLFxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5OUENDLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBOUENDLlNUQVRFLlVQX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKE5QQ0MuU1RBVEUuVVBfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBOUENDLlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoTlBDQy5TVEFURS5ET1dOX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgTlBDQy5TVEFURS5MRUZUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKE5QQ0MuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIE5QQ0MuU1RBVEUuUklHSFRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoTlBDQy5TVEFURS5SSUdIVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShOUENDKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTlBDQzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnZW9tICAgICAgICAgID0gd2ZsLmdlb207XHJcbnZhciB1dGlsICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzICAgICAgICA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCAgICA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxuXHJcbnZhciBQbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG4gIFxyXG4gIHZhciB2ZXJ0cyA9IFtcclxuICAgIG5ldyBnZW9tLlZlYzIoLTMyLCAtMzIpLFxyXG4gICAgbmV3IGdlb20uVmVjMigzMiwgLTMyKSxcclxuICAgIG5ldyBnZW9tLlZlYzIoMzIsIDMyKSxcclxuICAgIG5ldyBnZW9tLlZlYzIoLTMyLCAzMilcclxuICBdXHJcblxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLlBMQVlFUl9MMCkudGV4dHVyZTtcclxuICB0aGlzLm15R3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5QTEFZRVJfTDEpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMzID0gQXNzZXRzLmdldChBc3NldHMuUExBWUVSX1IwKS50ZXh0dXJlO1xyXG4gIHRoaXMubXlHcmFwaGljNCA9IEFzc2V0cy5nZXQoQXNzZXRzLlBMQVlFUl9SMSkudGV4dHVyZTtcclxuICBcclxuICB0aGlzLnN0YXRlTGVmdCA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMzAsIHZlcnRzKTtcclxuICB0aGlzLmZyYW1lSWRsZTIgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMiwgMzAsIHZlcnRzKTtcclxuICB0aGlzLmZyYW1lSWRsZTEueSAtPSAyODtcclxuICB0aGlzLmZyYW1lSWRsZTIueSAtPSAyODtcclxuICB0aGlzLnN0YXRlTGVmdC5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVMZWZ0LmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgdGhpcy5hZGRTdGF0ZShQbGF5ZXIuU1RBVEUuTEVGVCwgdGhpcy5zdGF0ZUxlZnQpO1xyXG4gIFxyXG4gIHRoaXMuc3RhdGVSaWdodCA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICB0aGlzLmZyYW1lSWRsZTMgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMywgMzAsIHZlcnRzKTtcclxuICB0aGlzLmZyYW1lSWRsZTQgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljNCwgMzAsIHZlcnRzKTtcclxuICB0aGlzLmZyYW1lSWRsZTMueSAtPSAyODtcclxuICB0aGlzLmZyYW1lSWRsZTQueSAtPSAyODtcclxuICB0aGlzLnN0YXRlUmlnaHQuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUzKTtcclxuICB0aGlzLnN0YXRlUmlnaHQuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGU0KTtcclxuICB0aGlzLmFkZFN0YXRlKFBsYXllci5TVEFURS5SSUdIVCwgdGhpcy5zdGF0ZVJpZ2h0KTtcclxuXHJcbiAgLy8gVGhlIHRvcCBvZiB0aGUgc3RhY2sgZGV0ZXJtaW5lcyB3aGljaCBkaXJlY3Rpb24gdGhlIHBsYXllciBmYWNlc1xyXG4gIHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFjayA9IFtdO1xyXG5cclxuICAvLyBTZXQgY29uc3RhbnRzXHJcbiAgdGhpcy5tYXhTcGVlZCAgICAgICAgPSBQbGF5ZXIuTUFYX1NQRUVEO1xyXG4gIHRoaXMubWF4QWNjZWxlcmF0aW9uID0gUGxheWVyLk1BWF9BQ0NFTEVSQVRJT047XHJcbiAgXHJcbiAgdGhpcy5tb3ZlbWVudExvY2sgPSAwO1xyXG4gIFxyXG4gIHRoaXMubWFzcyA9IDEwO1xyXG4gIHRoaXMucmVzdGl0dXRpb24gPSAwLjg7XHJcbiAgdGhpcy5mcmljdGlvbiA9IDE7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF5ZXIsIHtcclxuICBNQVhfU1BFRUQgOiB7XHJcbiAgICB2YWx1ZSA6IDNcclxuICB9LFxyXG4gIFxyXG4gIE1BWF9BQ0NFTEVSQVRJT04gOiB7XHJcbiAgICB2YWx1ZSA6IC41NVxyXG4gIH0sXHJcbiAgXHJcbiAgU1BSSU5UX01BWF9TUEVFRCA6IHtcclxuICAgIHZhbHVlIDogNi41XHJcbiAgfSxcclxuICBcclxuICBTUFJJTlRfQk9PU1RfQUNDRUxFUkFUSU9OIDoge1xyXG4gICAgdmFsdWUgOiAuMVxyXG4gIH0sXHJcblxyXG4gIEJPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgIHZhbHVlIDogLjA1XHJcbiAgfSxcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBMRUZUIDogXCJMRUZUXCIsXHJcbiAgICAgIFJJR0hUIDogXCJSSUdIVFwiXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBIYW5kbGUgc3RhdGVcclxuICAgICAgLypcclxuICAgICAgdmFyIHN0YXRlTmFtZSA9IHRoaXMuY3VycmVudFN0YXRlLm5hbWU7XHJcblxyXG4gICAgICBzd2l0Y2ggKHN0YXRlTmFtZSkge1xyXG4gICAgICAgIGNhc2UgUGxheWVyLlNUQVRFLlVQX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFBsYXllci5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFBsYXllci5TVEFURS5ET1dOX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFBsYXllci5TVEFURS5ET1dOX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgUGxheWVyLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoUGxheWVyLlNUQVRFLkxFRlRfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBQbGF5ZXIuU1RBVEUuUklHSFRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoUGxheWVyLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBoYW5kbGVJbnB1dDoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChrZXlib2FyZCkge1xyXG4gICAgICBpZiAodGhpcy5tb3ZlbWVudExvY2sgPiAwKSByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgICB2YXIgc3ByaW50aW5nICAgICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5TSElGVCk7XHJcbiAgICAgIHZhciBsYXN0UHJlc3NlZCAgID0ga2V5Ym9hcmQuZ2V0S2V5SnVzdFByZXNzZWQoKTtcclxuICAgICAgdmFyIGxlZnRQcmlvcml0eSAgPSAtMTtcclxuICAgICAgdmFyIHJpZ2h0UHJpb3JpdHkgPSAtMTtcclxuICAgICAgdmFyIHVwUHJpb3JpdHkgICAgPSAtMTtcclxuICAgICAgdmFyIGRvd25Qcmlvcml0eSAgPSAtMTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB2YWx1ZXMgdGhhdCBzaG91bGRuJ3QgYmUgaW4gdGhlIHN0YWNrXHJcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLl93YWxrRGlyZWN0aW9uU3RhY2subGVuZ3RoOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGlmICgha2V5Ym9hcmQuaXNQcmVzc2VkKHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFja1tpXSkpIHtcclxuICAgICAgICAgIHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFjay5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGN1cnJlbnQgZGlyZWN0aW9uIG9mIG1vdmVtZW50IHRvIHRoZSBzdGFjayAoaWYgYW55KVxyXG4gICAgICBpZiAobGFzdFByZXNzZWQgPiAtMSkge1xyXG4gICAgICAgIHN3aXRjaCAobGFzdFByZXNzZWQpIHtcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuTEVGVDpcclxuICAgICAgICAgIGNhc2Uga2V5Ym9hcmQuUklHSFQ6XHJcbiAgICAgICAgICBjYXNlIGtleWJvYXJkLlVQOlxyXG4gICAgICAgICAgY2FzZSBrZXlib2FyZC5ET1dOOlxyXG4gICAgICAgICAgICB0aGlzLl93YWxrRGlyZWN0aW9uU3RhY2sucHVzaChsYXN0UHJlc3NlZCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBwcmlvcml0aWVzIG9mIHRoZSBkaXJlY3Rpb25zXHJcbiAgICAgIHZhciBwcmlvcml0eUNvdW50ZXIgPSAwO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3dhbGtEaXJlY3Rpb25TdGFjay5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fd2Fsa0RpcmVjdGlvblN0YWNrW2ldKSB7XHJcbiAgICAgICAgICBjYXNlIGtleWJvYXJkLkxFRlQ6XHJcbiAgICAgICAgICAgIGxlZnRQcmlvcml0eSA9IHByaW9yaXR5Q291bnRlcjtcclxuICAgICAgICAgICAgcHJpb3JpdHlDb3VudGVyKys7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBrZXlib2FyZC5SSUdIVDpcclxuICAgICAgICAgICAgcmlnaHRQcmlvcml0eSA9IHByaW9yaXR5Q291bnRlcjtcclxuICAgICAgICAgICAgcHJpb3JpdHlDb3VudGVyKys7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBrZXlib2FyZC5VUDpcclxuICAgICAgICAgICAgdXBQcmlvcml0eSA9IHByaW9yaXR5Q291bnRlcjtcclxuICAgICAgICAgICAgcHJpb3JpdHlDb3VudGVyKys7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBrZXlib2FyZC5ET1dOOlxyXG4gICAgICAgICAgICBkb3duUHJpb3JpdHkgPSBwcmlvcml0eUNvdW50ZXI7XHJcbiAgICAgICAgICAgIHByaW9yaXR5Q291bnRlcisrO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERldGVybWluZSBob3cgZmFzdCB0aGUgcGxheWVyIHNob3VsZCBiZSBtb3ZpbmdcclxuICAgICAgdmFyIGJvb3N0O1xyXG4gICAgICBpZiAoc3ByaW50aW5nKSB7XHJcbiAgICAgICAgYm9vc3QgPSBQbGF5ZXIuU1BSSU5UX0JPT1NUX0FDQ0VMRVJBVElPTjtcclxuICAgICAgICB0aGlzLm1heFNwZWVkID0gUGxheWVyLlNQUklOVF9NQVhfU1BFRUQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYm9vc3QgPSBQbGF5ZXIuQk9PU1RfQUNDRUxFUkFUSU9OO1xyXG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSBQbGF5ZXIuTUFYX1NQRUVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNb3ZlIHRoZSBwbGF5ZXIgaW4gdGhlIGFwcHJvcHJpYXRlIGRpcmVjdGlvblxyXG4gICAgICBpZiAobGVmdFByaW9yaXR5ID4gcmlnaHRQcmlvcml0eSkge1xyXG4gICAgICAgIHZhciBtb3ZlbWVudEZvcmNlID0gbmV3IGdlb20uVmVjMigtMSwgMCk7XHJcbiAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgIGJvb3N0ICogdGhpcy5tYXNzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKFBsYXllci5TVEFURS5MRUZUKTtcclxuICAgICAgfSBcclxuICAgICAgaWYgKHJpZ2h0UHJpb3JpdHkgPiBsZWZ0UHJpb3JpdHkpIHtcclxuICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IG5ldyBnZW9tLlZlYzIoMSwgMCk7XHJcbiAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgIGJvb3N0ICogdGhpcy5tYXNzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKFBsYXllci5TVEFURS5SSUdIVCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHVwUHJpb3JpdHkgPiBkb3duUHJpb3JpdHkpIHtcclxuICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IG5ldyBnZW9tLlZlYzIoMCwgLTEpO1xyXG4gICAgICAgIG1vdmVtZW50Rm9yY2UubXVsdGlwbHkoXHJcbiAgICAgICAgICBib29zdCAqIHRoaXMubWFzc1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkRm9yY2UobW92ZW1lbnRGb3JjZSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRvd25Qcmlvcml0eSA+IHVwUHJpb3JpdHkpIHtcclxuICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IG5ldyBnZW9tLlZlYzIoMCwgMSk7XHJcbiAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgIGJvb3N0ICogdGhpcy5tYXNzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBnZW9tICAgICAgICAgID0gd2ZsLmdlb207XHJcbnZhciB1dGlsICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzICAgICAgICA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCAgICA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxuXHJcbnZhciBUZXh0Qm94ID0gZnVuY3Rpb24gKFBJWEksIGtleWJvYXJkLCBwbGF5ZXIsIHRleHQgPSBcIlwiLCBkaXNwbGF5U3BlZWQgPSAyNSkge1xyXG4gIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuICBcclxuICB0aGlzLmZ1bGxTdHJpbmcgPSB0ZXh0O1xyXG4gIHRoaXMudGltZUVsYXBzZWQgPSAwO1xyXG4gIHRoaXMuZGlzcGxheVNwZWVkID0gZGlzcGxheVNwZWVkO1xyXG4gIFxyXG4gIHRoaXMua2V5Ym9hcmQgPSBrZXlib2FyZDtcclxuICBcclxuICB0aGlzLmJnR3JhcGhpYyA9IG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UoQXNzZXRzLlRFWFRfQk9YKTtcclxuICB0aGlzLmJnR3JhcGhpY05leHQgPSBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKEFzc2V0cy5URVhUX0JPWF9ORVhUKTtcclxuICB0aGlzLnRleHRDaGlsZCA9IG5ldyBQSVhJLmV4dHJhcy5CaXRtYXBUZXh0KFwiXCIsIHsgZm9udDogXCIxOHB4IGxkMzhcIiB9KTtcclxuICBcclxuICAvLyBJZGsgd2h5IG11bHRpcGx5IHBhZGRpbmcgYnkgNFxyXG4gIHRoaXMudGV4dENoaWxkLm1heFdpZHRoID0gdGhpcy5iZ0dyYXBoaWMud2lkdGggLSBUZXh0Qm94LlBBRERJTkcgKiA0O1xyXG5cclxuICBsZXQgb2Zmc2V0WCA9IHRoaXMuYmdHcmFwaGljLndpZHRoICogMC41O1xyXG4gIGxldCBvZmZzZXRZID0gdGhpcy5iZ0dyYXBoaWMuaGVpZ2h0ICogMC41O1xyXG4gIFxyXG4gIHRoaXMuYmdHcmFwaGljLnggLT0gb2Zmc2V0WDtcclxuICB0aGlzLmJnR3JhcGhpYy55IC09IG9mZnNldFk7XHJcbiAgdGhpcy5iZ0dyYXBoaWNOZXh0LnggLT0gb2Zmc2V0WDtcclxuICB0aGlzLmJnR3JhcGhpY05leHQueSAtPSBvZmZzZXRZO1xyXG4gIHRoaXMudGV4dENoaWxkLnggLT0gb2Zmc2V0WCAtIFRleHRCb3guUEFERElORztcclxuICB0aGlzLnRleHRDaGlsZC55IC09IG9mZnNldFkgLSBUZXh0Qm94LlBBRERJTkc7XHJcbiAgXHJcbiAgdGhpcy5zb2xpZCA9IGZhbHNlO1xyXG4gIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gIFxyXG4gIHRoaXMuYWRkQ2hpbGQodGhpcy5iZ0dyYXBoaWMpO1xyXG4gIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0Q2hpbGQpO1xyXG4gIFxyXG4gIHRoaXMuYWxwaGEgPSAwLjk1O1xyXG4gIFxyXG4gIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gIFxyXG4gIHRoaXMuaGFzTmV4dCA9IGZhbHNlO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGV4dEJveCwge1xyXG4gIFNUQVRFIDoge1xyXG4gICAgdmFsdWUgOiB7XHJcbiAgICAgIElETEUgOiBcIklETEVcIixcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIC8vIENoYXJhY3RlcnMgLyBTZWNvbmRcclxuICBDSEFSU19QRVJfU0VDT05EOiB7XHJcbiAgICB2YWx1ZTogMSAvIDYwXHJcbiAgfSxcclxuICBcclxuICBQQURESU5HOiB7XHJcbiAgICB2YWx1ZTogNVxyXG4gIH0sXHJcbiAgXHJcbiAgUlVTSF9TUEVFRDoge1xyXG4gICAgdmFsdWU6IDEuNVxyXG4gIH1cclxufSk7XHJcblxyXG5UZXh0Qm94LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIC8vIFNuYXAgdG8gY29ycmVjdCBwaXhlbHMgZm9yIGNyaXNwIHRleHQgYW5kIGdyYXBoaWNcclxuICAgICAgdGhpcy50ZXh0Q2hpbGQueCA9IE1hdGguZmxvb3IodGhpcy50ZXh0Q2hpbGQueCkgKyAwLjU7XHJcbiAgICAgIHRoaXMudGV4dENoaWxkLnkgPSBNYXRoLmZsb29yKHRoaXMudGV4dENoaWxkLnkpICsgMC41O1xyXG4gICAgICB0aGlzLnggPSBNYXRoLmZsb29yKHRoaXMueCk7XHJcbiAgICAgIHRoaXMueSA9IE1hdGguZmxvb3IodGhpcy55KTtcclxuICAgICAgaWYgKHRoaXMuY2hpbGRyZW4uaW5kZXhPZih0aGlzLmJnR3JhcGhpYykgPj0gMCkge1xyXG4gICAgICAgIHRoaXMuYmdHcmFwaGljLnggPSBNYXRoLmZsb29yKHRoaXMuYmdHcmFwaGljLngpICsgMC41O1xyXG4gICAgICAgIHRoaXMuYmdHcmFwaGljLnkgPSBNYXRoLmZsb29yKHRoaXMuYmdHcmFwaGljLnkpICsgMC41O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYmdHcmFwaGljTmV4dC54ID0gTWF0aC5mbG9vcih0aGlzLmJnR3JhcGhpY05leHQueCkgKyAwLjU7XHJcbiAgICAgICAgdGhpcy5iZ0dyYXBoaWNOZXh0LnkgPSBNYXRoLmZsb29yKHRoaXMuYmdHcmFwaGljTmV4dC55KSArIDAuNTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy50aW1lRWxhcHNlZCArPSBkdDtcclxuICAgICAgbGV0IGNoYXJzVG9TaG93ID0gTWF0aC5mbG9vcihNYXRoLm1pbihcclxuICAgICAgICB0aGlzLnRpbWVFbGFwc2VkICogdGhpcy5kaXNwbGF5U3BlZWQgKiBUZXh0Qm94LkNIQVJTX1BFUl9TRUNPTkQsXHJcbiAgICAgICAgdGhpcy5mdWxsU3RyaW5nLmxlbmd0aFxyXG4gICAgICApKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMudGV4dENoaWxkLnRleHQgPSB0aGlzLmZ1bGxTdHJpbmcuc3Vic3RyKDAsIGNoYXJzVG9TaG93KTtcclxuICAgICAgXHJcbiAgICAgIGlmIChjaGFyc1RvU2hvdyA9PT0gdGhpcy5mdWxsU3RyaW5nLmxlbmd0aCkge1xyXG4gICAgICAgIGlmICh0aGlzLmhhc05leHQpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmluZGV4T2YodGhpcy5iZ0dyYXBoaWMpID49IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLmJnR3JhcGhpYyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGRBdCh0aGlzLmJnR3JhcGhpY05leHQsIDApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuaGFuZGxlSW5wdXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGtleXMgPSB0aGlzLmtleWJvYXJkO1xyXG5cclxuICAgICAgICBpZiAoa2V5cy5pc1ByZXNzZWQoa2V5cy5TUEFDRUJBUikpIHtcclxuICAgICAgICAgIHRoaXMudGltZUVsYXBzZWQgKj0gVGV4dEJveC5SVVNIX1NQRUVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgb25Db2xsaWRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaikge1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgaGFuZGxlSW5wdXQ6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBrZXlzID0gdGhpcy5rZXlib2FyZDtcclxuICAgICAgXHJcbiAgICAgIGlmIChrZXlzLmp1c3RQcmVzc2VkKGtleXMuU1BBQ0VCQVIpKSB7XHJcbiAgICAgICAgdGhpcy5oYXNOZXh0ID0gZmFsc2U7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFwibmV4dC10ZXh0XCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKFRleHRCb3gpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXh0Qm94OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgSGV4VGlsZSA9IHJlcXVpcmUoJy4vSGV4VGlsZScpO1xyXG5cclxudmFyIFRpbGVGcmVlID0gZnVuY3Rpb24gKCkge1xyXG4gIEhleFRpbGUuY2FsbCh0aGlzKTtcclxuXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuVElMRV9GUkVFMCkudGV4dHVyZTtcclxuICB0aGlzLm15R3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5USUxFX0ZSRUUxKS50ZXh0dXJlO1xyXG4gIHRoaXMubXlHcmFwaGljMyA9IEFzc2V0cy5nZXQoQXNzZXRzLlRJTEVfRlJFRTIpLnRleHR1cmU7XHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDQsIHRoaXMuaGV4VmVydGljZXMpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCA0LCB0aGlzLmhleFZlcnRpY2VzKTtcclxuICB0aGlzLmZyYW1lSWRsZTMgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMywgNCwgdGhpcy5oZXhWZXJ0aWNlcyk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMyk7XHJcbiAgdGhpcy5hZGRTdGF0ZShUaWxlRnJlZS5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgLypcclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5NWV9HUkFQSElDKS50ZXh0dXJlO1xyXG4gIHRoaXMubXlHcmFwaGljMiA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgKi9cclxuXHJcbiAgLy8gQ3JlYXRlIHN0YXRlXHJcbiAgLypcclxuICB0aGlzLnN0YXRlSWRsZSA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuXHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE1KTtcclxuICB0aGlzLmZyYW1lSWRsZTIgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMiwgMTUpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUyKTtcclxuICAqL1xyXG5cclxuICAvLyBBZGQgc3RhdGVzXHJcbiAgLypcclxuICB0aGlzLmFkZFN0YXRlKFRpbGVGcmVlLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAqL1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGlsZUZyZWUsIHtcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBJRExFIDogXCJJRExFXCIsXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblRpbGVGcmVlLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIHZhciBzdGF0ZU5hbWUgPSB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xyXG4gICAgICBcclxuICAgICAgaWYgKHN0YXRlTmFtZSA9PT0gVGlsZUZyZWUuU1RBVEUuSURMRSkge1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZVBsYXllcigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfaGFuZGxlUGxheWVyOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodGhpcy5wbGF5ZXIuY2hlY2tOYXJyb3dQaGFzZUNvbGxpc2lvbih0aGlzLCB7fSkpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lID0gSGV4VGlsZS5TVEFURS5DTEFJTUlORztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShUaWxlRnJlZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVGcmVlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgSGV4VGlsZSA9IHJlcXVpcmUoJy4vSGV4VGlsZScpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcclxuXHJcbnZhciBUaWxlR3Jhc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgSGV4VGlsZS5jYWxsKHRoaXMpO1xyXG5cclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5USUxFX0dSQVNTKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAxNSwgdGhpcy5oZXhWZXJ0aWNlcyk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLmFkZFN0YXRlKFRpbGVHcmFzcy5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgLypcclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5NWV9HUkFQSElDKS50ZXh0dXJlO1xyXG4gIHRoaXMubXlHcmFwaGljMiA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgKi9cclxuXHJcbiAgLy8gQ3JlYXRlIHN0YXRlXHJcbiAgLypcclxuICB0aGlzLnN0YXRlSWRsZSA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuXHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE1KTtcclxuICB0aGlzLmZyYW1lSWRsZTIgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMiwgMTUpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUyKTtcclxuICAqL1xyXG5cclxuICAvLyBBZGQgc3RhdGVzXHJcbiAgLypcclxuICB0aGlzLmFkZFN0YXRlKFRpbGVHcmFzcy5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgKi9cclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFRpbGVHcmFzcywge1xyXG4gIFNUQVRFIDoge1xyXG4gICAgdmFsdWUgOiB7XHJcbiAgICAgIElETEUgOiBcIklETEVcIixcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuVGlsZUdyYXNzLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBUaWxlR3Jhc3MuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZUdyYXNzLlNUQVRFLlVQX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVGlsZUdyYXNzLlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZUdyYXNzLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBUaWxlR3Jhc3MuU1RBVEUuTEVGVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlR3Jhc3MuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVHcmFzcy5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlR3Jhc3MuU1RBVEUuUklHSFRfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgKi9cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIGNhbkNvbGxpZGU6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICAgIHJldHVybiAob2JqIGluc3RhbmNlb2YgUGxheWVyKTtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoVGlsZUdyYXNzKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlsZUdyYXNzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgSGV4VGlsZSA9IHJlcXVpcmUoJy4vSGV4VGlsZScpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcclxuXHJcbnZhciBUaWxlSmVyZW15ID0gZnVuY3Rpb24gKCkge1xyXG4gIEhleFRpbGUuY2FsbCh0aGlzKTtcclxuXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuVElMRV9KRVJFTVkpLnRleHR1cmU7XHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE1LCB0aGlzLmhleFZlcnRpY2VzKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuYWRkU3RhdGUoVGlsZUplcmVteS5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgLy8gUmVmZXJlbmNlIGdyYXBoaWNzXHJcbiAgLypcclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5NWV9HUkFQSElDKS50ZXh0dXJlO1xyXG4gIHRoaXMubXlHcmFwaGljMiA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgKi9cclxuXHJcbiAgLy8gQ3JlYXRlIHN0YXRlXHJcbiAgLypcclxuICB0aGlzLnN0YXRlSWRsZSA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuXHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE1KTtcclxuICB0aGlzLmZyYW1lSWRsZTIgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMiwgMTUpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUyKTtcclxuICAqL1xyXG5cclxuICAvLyBBZGQgc3RhdGVzXHJcbiAgLypcclxuICB0aGlzLmFkZFN0YXRlKFRpbGVKZXJlbXkuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gICovXHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhUaWxlSmVyZW15LCB7XHJcbiAgU1RBVEUgOiB7XHJcbiAgICB2YWx1ZSA6IHtcclxuICAgICAgSURMRSA6IFwiSURMRVwiLFxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5UaWxlSmVyZW15LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBUaWxlSmVyZW15LlNUQVRFLlVQX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFRpbGVKZXJlbXkuU1RBVEUuVVBfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBUaWxlSmVyZW15LlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZUplcmVteS5TVEFURS5ET1dOX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVGlsZUplcmVteS5TVEFURS5MRUZUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFRpbGVKZXJlbXkuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVKZXJlbXkuU1RBVEUuUklHSFRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZUplcmVteS5TVEFURS5SSUdIVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgY2FuQ29sbGlkZToge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgcmV0dXJuIChvYmogaW5zdGFuY2VvZiBQbGF5ZXIpO1xyXG4gICAgfVxyXG4gIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShUaWxlSmVyZW15KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlsZUplcmVteTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnZW9tICAgICAgICAgID0gd2ZsLmdlb207XHJcbnZhciB1dGlsICAgICAgICAgID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzICAgICAgICA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCAgICA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIEhleFRpbGUgPSByZXF1aXJlKCcuL0hleFRpbGUnKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcblxyXG52YXIgVGlsZU9sZEplcmVteSA9IGZ1bmN0aW9uICgpIHtcclxuICBIZXhUaWxlLmNhbGwodGhpcyk7XHJcblxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLlRJTEVfT0xEX0pFUkVNWSkudGV4dHVyZTtcclxuICB0aGlzLnN0YXRlSWRsZSA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUsIHRoaXMuaGV4VmVydGljZXMpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMSk7XHJcbiAgdGhpcy5hZGRTdGF0ZShUaWxlT2xkSmVyZW15LlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoVGlsZU9sZEplcmVteS5TVEFURS5JRExFLCB0aGlzLnN0YXRlSWRsZSk7XHJcbiAgKi9cclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFRpbGVPbGRKZXJlbXksIHtcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBJRExFIDogXCJJRExFXCIsXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblRpbGVPbGRKZXJlbXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKEhleFRpbGUucHJvdG90eXBlLCB7XHJcbiAgdXBkYXRlIDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgSGV4VGlsZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICBcclxuICAgICAgLy8gSGFuZGxlIHN0YXRlXHJcbiAgICAgIC8qXHJcbiAgICAgIHZhciBzdGF0ZU5hbWUgPSB0aGlzLmN1cnJlbnRTdGF0ZS5uYW1lO1xyXG5cclxuICAgICAgc3dpdGNoIChzdGF0ZU5hbWUpIHtcclxuICAgICAgICBjYXNlIFRpbGVPbGRKZXJlbXkuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZU9sZEplcmVteS5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVPbGRKZXJlbXkuU1RBVEUuRE9XTl9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlT2xkSmVyZW15LlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBUaWxlT2xkSmVyZW15LlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZU9sZEplcmVteS5TVEFURS5MRUZUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVGlsZU9sZEplcmVteS5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlT2xkSmVyZW15LlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKFRpbGVPbGRKZXJlbXkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaWxlT2xkSmVyZW15OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgSGV4VGlsZSA9IHJlcXVpcmUoJy4vSGV4VGlsZScpO1xyXG5cclxudmFyIFRpbGVTYW5kID0gZnVuY3Rpb24gKCkge1xyXG4gIEhleFRpbGUuY2FsbCh0aGlzKTtcclxuXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuVElMRV9TQU5EKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAxNSwgdGhpcy5oZXhWZXJ0aWNlcyk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLmFkZFN0YXRlKFRpbGVTYW5kLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoVGlsZVNhbmQuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gICovXHJcblxyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGlsZVNhbmQsIHtcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBJRExFIDogXCJJRExFXCIsXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblRpbGVTYW5kLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBUaWxlU2FuZC5TVEFURS5VUF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlU2FuZC5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVTYW5kLlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZVNhbmQuU1RBVEUuRE9XTl9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVTYW5kLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZVNhbmQuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVTYW5kLlNUQVRFLlJJR0hUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFRpbGVTYW5kLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKFRpbGVTYW5kKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlsZVNhbmQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBIZXhUaWxlID0gcmVxdWlyZSgnLi9IZXhUaWxlJyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG5cclxudmFyIFRpbGVWb2lkID0gZnVuY3Rpb24gKCkge1xyXG4gIEhleFRpbGUuY2FsbCh0aGlzKTtcclxuXHJcbiAgdGhpcy5teUdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuVElMRV9WT0lEKS50ZXh0dXJlO1xyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMSA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMxLCAxNSwgdGhpcy5oZXhWZXJ0aWNlcyk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLmFkZFN0YXRlKFRpbGVWb2lkLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoVGlsZVZvaWQuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gICovXHJcblxyXG4gIHRoaXMuc29saWQgPSB0cnVlO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGlsZVZvaWQsIHtcclxuICBTVEFURSA6IHtcclxuICAgIHZhbHVlIDoge1xyXG4gICAgICBJRExFIDogXCJJRExFXCIsXHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblRpbGVWb2lkLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBUaWxlVm9pZC5TVEFURS5VUF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlVm9pZC5TVEFURS5VUF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVWb2lkLlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZVZvaWQuU1RBVEUuRE9XTl9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVWb2lkLlNUQVRFLkxFRlRfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZVZvaWQuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVWb2lkLlNUQVRFLlJJR0hUX1dBTEs6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKFRpbGVWb2lkLlNUQVRFLlJJR0hUX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgICovXHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBjYW5Db2xsaWRlOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICByZXR1cm4gKG9iaiBpbnN0YW5jZW9mIFBsYXllcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKFRpbGVWb2lkKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlsZVZvaWQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2VvbSAgICAgICAgICA9IHdmbC5nZW9tO1xyXG52YXIgdXRpbCAgICAgICAgICA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyAgICAgICAgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgICAgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBIZXhUaWxlID0gcmVxdWlyZSgnLi9IZXhUaWxlJyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG5cclxudmFyIFRpbGVXYXRlciA9IGZ1bmN0aW9uICgpIHtcclxuICBIZXhUaWxlLmNhbGwodGhpcyk7XHJcblxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLlRJTEVfV0FURVIpLnRleHR1cmU7XHJcbiAgdGhpcy5zdGF0ZUlkbGUgPSBHYW1lT2JqZWN0LmNyZWF0ZVN0YXRlKCk7XHJcbiAgdGhpcy5mcmFtZUlkbGUxID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzEsIDE1LCB0aGlzLmhleFZlcnRpY2VzKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuYWRkU3RhdGUoVGlsZVdhdGVyLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoVGlsZVdhdGVyLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAqL1xyXG5cclxuICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFRpbGVXYXRlciwge1xyXG4gIFNUQVRFIDoge1xyXG4gICAgdmFsdWUgOiB7XHJcbiAgICAgIElETEUgOiBcIklETEVcIixcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuVGlsZVdhdGVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShIZXhUaWxlLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIEhleFRpbGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIC8vIEhhbmRsZSBzdGF0ZVxyXG4gICAgICAvKlxyXG4gICAgICB2YXIgc3RhdGVOYW1lID0gdGhpcy5jdXJyZW50U3RhdGUubmFtZTtcclxuXHJcbiAgICAgIHN3aXRjaCAoc3RhdGVOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBUaWxlV2F0ZXIuU1RBVEUuVVBfV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZVdhdGVyLlNUQVRFLlVQX0lETEUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgVGlsZVdhdGVyLlNUQVRFLkRPV05fV0FMSzpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoVGlsZVdhdGVyLlNUQVRFLkRPV05fSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBUaWxlV2F0ZXIuU1RBVEUuTEVGVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlV2F0ZXIuU1RBVEUuTEVGVF9JRExFKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFRpbGVXYXRlci5TVEFURS5SSUdIVF9XQUxLOlxyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShUaWxlV2F0ZXIuU1RBVEUuUklHSFRfSURMRSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgKi9cclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoVGlsZVdhdGVyKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlsZVdhdGVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGdlb20gICAgICAgICAgPSB3ZmwuZ2VvbTtcclxudmFyIHV0aWwgICAgICAgICAgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgICAgICAgID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ICAgID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxudmFyIFRpdGxlID0gZnVuY3Rpb24gKCkge1xyXG4gIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuICBcclxuICB0aGlzLm15R3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5USVRMRTApLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuVElUTEUxKS50ZXh0dXJlO1xyXG4gIHRoaXMubXlHcmFwaGljMyA9IEFzc2V0cy5nZXQoQXNzZXRzLlRJVExFMikudGV4dHVyZTtcclxuICB0aGlzLnN0YXRlSWRsZSA9IEdhbWVPYmplY3QuY3JlYXRlU3RhdGUoKTtcclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgNCwgdGhpcy5oZXhWZXJ0aWNlcyk7XHJcbiAgdGhpcy5mcmFtZUlkbGUyID0gR2FtZU9iamVjdC5jcmVhdGVGcmFtZSh0aGlzLm15R3JhcGhpYzIsIDQsIHRoaXMuaGV4VmVydGljZXMpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMyA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMzLCA0LCB0aGlzLmhleFZlcnRpY2VzKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTEpO1xyXG4gIHRoaXMuc3RhdGVJZGxlLmFkZEZyYW1lKHRoaXMuZnJhbWVJZGxlMik7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUzKTtcclxuICB0aGlzLmFkZFN0YXRlKFRpdGxlLlNUQVRFLklETEUsIHRoaXMuc3RhdGVJZGxlKTtcclxuICAvLyBSZWZlcmVuY2UgZ3JhcGhpY3NcclxuICAvKlxyXG4gIHRoaXMubXlHcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLk1ZX0dSQVBISUMpLnRleHR1cmU7XHJcbiAgdGhpcy5teUdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuTVlfR1JBUEhJQykudGV4dHVyZTtcclxuICAqL1xyXG5cclxuICAvLyBDcmVhdGUgc3RhdGVcclxuICAvKlxyXG4gIHRoaXMuc3RhdGVJZGxlID0gR2FtZU9iamVjdC5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICB0aGlzLmZyYW1lSWRsZTEgPSBHYW1lT2JqZWN0LmNyZWF0ZUZyYW1lKHRoaXMubXlHcmFwaGljMSwgMTUpO1xyXG4gIHRoaXMuZnJhbWVJZGxlMiA9IEdhbWVPYmplY3QuY3JlYXRlRnJhbWUodGhpcy5teUdyYXBoaWMyLCAxNSk7XHJcbiAgdGhpcy5zdGF0ZUlkbGUuYWRkRnJhbWUodGhpcy5mcmFtZUlkbGUxKTtcclxuICB0aGlzLnN0YXRlSWRsZS5hZGRGcmFtZSh0aGlzLmZyYW1lSWRsZTIpO1xyXG4gICovXHJcblxyXG4gIC8vIEFkZCBzdGF0ZXNcclxuICAvKlxyXG4gIHRoaXMuYWRkU3RhdGUoVGl0bGUuU1RBVEUuSURMRSwgdGhpcy5zdGF0ZUlkbGUpO1xyXG4gICovXHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhUaXRsZSwge1xyXG4gIFNUQVRFIDoge1xyXG4gICAgdmFsdWUgOiB7XHJcbiAgICAgIElETEUgOiBcIklETEVcIixcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuVGl0bGUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoVGl0bGUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaXRsZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllci5qcycpO1xyXG52YXIgQmxvY2tGdWxsID0gcmVxdWlyZSgnLi9CbG9ja0Z1bGwuanMnKTtcclxudmFyIEhleFRpbGUgPSByZXF1aXJlKCcuL0hleFRpbGUuanMnKTtcclxudmFyIFRpbGVXYXRlciA9IHJlcXVpcmUoJy4vVGlsZVdhdGVyLmpzJyk7XHJcbnZhciBUaWxlSmVyZW15ID0gcmVxdWlyZSgnLi9UaWxlSmVyZW15LmpzJyk7XHJcbnZhciBUaWxlT2xkSmVyZW15ID0gcmVxdWlyZSgnLi9UaWxlT2xkSmVyZW15LmpzJyk7XHJcbnZhciBUaWxlR3Jhc3MgPSByZXF1aXJlKCcuL1RpbGVHcmFzcy5qcycpO1xyXG52YXIgVGlsZVNhbmQgPSByZXF1aXJlKCcuL1RpbGVTYW5kLmpzJyk7XHJcbnZhciBUaWxlRnJlZSA9IHJlcXVpcmUoJy4vVGlsZUZyZWUuanMnKTtcclxudmFyIFRpbGVWb2lkID0gcmVxdWlyZSgnLi9UaWxlVm9pZC5qcycpO1xyXG5cclxudmFyIFRpdGxlID0gcmVxdWlyZSgnLi9UaXRsZS5qcycpO1xyXG5cclxudmFyIEhvbGUgPSByZXF1aXJlKCcuL0hvbGUuanMnKTtcclxudmFyIEhvbGVDb3ZlciA9IHJlcXVpcmUoJy4vSG9sZUNvdmVyLmpzJyk7XHJcblxyXG52YXIgRXZlbnRCb3VuZHMgPSByZXF1aXJlKCcuL0V2ZW50Qm91bmRzLmpzJyk7XHJcblxyXG52YXIgVGV4dEJveCA9IHJlcXVpcmUoJy4vVGV4dEJveC5qcycpO1xyXG5cclxudmFyIEplcmVteSA9IHJlcXVpcmUoJy4vSmVyZW15LmpzJyk7XHJcblxyXG52YXIgTlBDQSA9IHJlcXVpcmUoJy4vTlBDQS5qcycpO1xyXG52YXIgTlBDQiA9IHJlcXVpcmUoJy4vTlBDQi5qcycpO1xyXG52YXIgTlBDQyA9IHJlcXVpcmUoJy4vTlBDQy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgUGxheWVyOiBQbGF5ZXIsXHJcbiAgQmxvY2tGdWxsOiBCbG9ja0Z1bGwsXHJcbiAgSGV4VGlsZTogSGV4VGlsZSxcclxuICBUaWxlV2F0ZXI6IFRpbGVXYXRlcixcclxuICBUaWxlSmVyZW15OiBUaWxlSmVyZW15LFxyXG4gIFRpbGVPbGRKZXJlbXk6IFRpbGVPbGRKZXJlbXksXHJcbiAgVGlsZUdyYXNzOiBUaWxlR3Jhc3MsXHJcbiAgVGlsZVNhbmQ6IFRpbGVTYW5kLFxyXG4gIFRpbGVGcmVlOiBUaWxlRnJlZSxcclxuICBUaWxlVm9pZDogVGlsZVZvaWQsXHJcbiAgXHJcbiAgVGl0bGU6IFRpdGxlLFxyXG4gIFxyXG4gIEhvbGU6IEhvbGUsXHJcbiAgSG9sZUNvdmVyOiBIb2xlQ292ZXIsXHJcbiAgXHJcbiAgRXZlbnRCb3VuZHM6IEV2ZW50Qm91bmRzLFxyXG4gIFxyXG4gIFRleHRCb3g6IFRleHRCb3gsXHJcbiAgXHJcbiAgLy8gQ2hhcmFjdGVyc1xyXG4gIEplcmVteTogSmVyZW15LFxyXG4gIE5QQ0E6IE5QQ0EsXHJcbiAgTlBDQjogTlBDQixcclxuICBOUENDOiBOUENDLFxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgICA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXMnKTtcclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vdXRpbC9Bc3NldHMuanMnKTtcclxudmFyIG1hcCAgICA9IHJlcXVpcmUoJy4vbWFwJyk7XHJcblxyXG4vLyBDcmVhdGUgZ2FtZVxyXG52YXIgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWNhbnZhc1wiKTtcclxudmFyIGdhbWUgICA9IHdmbC5jcmVhdGUoY2FudmFzKTtcclxuZ2FtZS5yZW5kZXJlci5iYWNrZ3JvdW5kQ29sb3IgPSAweDAwMDAwMDtcclxuXHJcbi8vZ2FtZS5kZWJ1ZyA9IHt2ZWN0b3JzOiB0cnVlfTtcclxuXHJcbnZhciBvbkxvYWRXaW5kb3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIGwgPSBnYW1lLmxvYWRlcjtcclxuXHJcbiAgLy8gUHJlcGFyZSB0byBsb2FkIGFzc2V0c1xyXG4gIGZvciAodmFyIGFzc2V0IGluIEFzc2V0cykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgbCA9IGwuYWRkKEFzc2V0c1thc3NldF0pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbC5sb2FkKG9uTG9hZEFzc2V0cyk7XHJcbiAgcmVzaXplKCk7XHJcbn07XHJcblxyXG52YXIgb25Mb2FkQXNzZXRzID0gZnVuY3Rpb24gKCkge1xyXG4gIEFzc2V0cy5nZXQgPSBmdW5jdGlvbiAocGF0aCkgeyByZXR1cm4gUElYSS5sb2FkZXIucmVzb3VyY2VzW3BhdGhdOyB9O1xyXG4gIFxyXG4gIGxvYWRNYXBzKCk7XHJcbn07XHJcblxyXG52YXIgbG9hZE1hcHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG1hcHMgPSBBc3NldHMubWFwcztcclxuICBcclxuICBmb3IgKGNvbnN0IG1hcCBvZiBtYXBzKSB7XHJcbiAgICB3ZmwuanF1ZXJ5LmdldEpTT04obWFwLnBhdGgsIChkYXRhKSA9PiBvbkxvYWRNYXAobWFwLmtleSwgZGF0YSkpO1xyXG4gIH1cclxufVxyXG5cclxudmFyIGxvYWRDb3VudGVyID0gMDtcclxudmFyIG9uTG9hZE1hcCA9IGZ1bmN0aW9uIChrZXksIGRhdGEpIHtcclxuICBsb2FkQ291bnRlcisrO1xyXG4gIFxyXG4gIG1hcC5NYXBQb29sLnN0b3JlKGtleSwgZGF0YSk7XHJcbiAgXHJcbiAgaWYgKGxvYWRDb3VudGVyID09PSBBc3NldHMubWFwcy5sZW5ndGgpIHtcclxuICAgIC8vIExvYWQgc2NlbmUgaGVyZVxyXG4gICAgdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMuVGl0bGVTY2VuZShjYW52YXMsIGdhbWUucGl4aSk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVTY2VuZSk7XHJcbiAgfVxyXG59XHJcblxyXG52YXIgb25SZXNpemUgPSBmdW5jdGlvbiAoZSkge1xyXG4gIHJlc2l6ZSgpO1xyXG59O1xyXG5cclxudmFyIHJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAvLyBVc2UgdGhlIGNvbW1lbnRlZCBjb2RlIGlmIHlvdSB3YW50IHRvIGxpbWl0IHRoZSBjYW52YXMgc2l6ZVxyXG4gIC8vIHZhciBNQVhfV0lEVEggID0gMTM2NjtcclxuICAvLyB2YXIgTUFYX0hFSUdIVCA9IDc2ODtcclxuICB2YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRoOyAgLy8gTWF0aC5taW4od2luZG93LmlubmVyV2lkdGgsICBNQVhfV0lEVEgpO1xyXG4gIHZhciBoID0gd2luZG93LmlubmVySGVpZ2h0OyAvLyBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQsIE1BWF9IRUlHSFQpO1xyXG4gIFxyXG4gIGNhbnZhcy53aWR0aCAgPSB3O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIGdhbWUucmVuZGVyZXIudmlldy5zdHlsZS53aWR0aCAgPSB3ICsgJ3B4JztcclxuICBnYW1lLnJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gaCArICdweCc7XHJcbiAgZ2FtZS5yZW5kZXJlci5yZXNpemUodywgaCk7XHJcbn1cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBvbkxvYWRXaW5kb3c7XHJcbndpbmRvdy5vbnJlc2l6ZSA9IG9uUmVzaXplOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxuY29uc3QgRW50aXR5QnVpbGRlciA9IHtcclxuICBidWlsZDogKGdhbWVPYmplY3REYXRhLCBzY2VuZSkgPT4ge1xyXG4gICAgbGV0IGcgPSBudWxsO1xyXG4gICAgbGV0IGVudGl0eSA9IGdhbWVPYmplY3REYXRhLmVudGl0eTtcclxuICAgIGxldCBlbnRpdHlOYW1lID0gZW50aXR5Lm5hbWU7XHJcbiAgICBsZXQgY2xhc3NOYW1lID0gbnVsbDtcclxuICAgIFxyXG4gICAgaWYgKGVudGl0eU5hbWUgPT09IFwiU3Bhd25Qb2ludFwiKSB7XHJcbiAgICAgIGNsYXNzTmFtZSA9IGVudGl0aWVzW1wiUGxheWVyXCJdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gUmVtb3ZlIG51bWJlcnMgZnJvbSBlbnRpdHlOYW1lc1xyXG4gICAgICBlbnRpdHlOYW1lID0gZW50aXR5TmFtZS5yZXBsYWNlKC9bMC05XS9nLCAnJyk7XHJcbiAgICAgIFxyXG4gICAgICBjbGFzc05hbWUgPSBlbnRpdGllc1tlbnRpdHlOYW1lXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICBnID0gbmV3IGNsYXNzTmFtZSgpO1xyXG4gICAgICBnLnBvc2l0aW9uLnggPSBnYW1lT2JqZWN0RGF0YS54O1xyXG4gICAgICBnLnBvc2l0aW9uLnkgPSBnYW1lT2JqZWN0RGF0YS55O1xyXG4gICAgICBnLnJvdGF0aW9uID0gZ2FtZU9iamVjdERhdGEucm90YXRpb247XHJcbiAgICAgIGcuY3VzdG9tRGF0YS5wcm9wcyA9IGdhbWVPYmplY3REYXRhLnByb3BzO1xyXG4gICAgICBcclxuICAgICAgLy8gR2V0IGludCBmcm9tIHN0cmluZyAoXCJsYXllcjBcIiAtPiAwKVxyXG4gICAgICBnLmxheWVyID0gZ2FtZU9iamVjdERhdGEubGF5ZXIubWF0Y2goL1xcZCsvKVswXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKGcpIHtcclxuICAgICAgaWYgKGVudGl0eU5hbWUgPT09IFwiU3Bhd25Qb2ludFwiKSB7XHJcbiAgICAgICAgc2NlbmUucGxheWVyID0gZztcclxuICAgICAgICBzY2VuZS5jYW1lcmEuZm9sbG93KGcpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4gZztcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhyb3cgZW50aXR5Lm5hbWUgKyBcIiBkb2Vzbid0IGV4aXN0XCI7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eUJ1aWxkZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5sZXQgbWFwcyA9IHt9O1xyXG5cclxuY29uc3QgTWFwUG9vbCA9IHtcclxuICBzdG9yZTogKGtleSwgZGF0YSkgPT4ge1xyXG4gICAgbWFwc1trZXldID0gZGF0YTtcclxuICB9LFxyXG4gIFxyXG4gIGdldDogKGtleSkgPT4ge1xyXG4gICAgcmV0dXJuIG1hcHNba2V5XTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwUG9vbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNYXBQb29sID0gcmVxdWlyZSgnLi9NYXBQb29sLmpzJyk7XHJcbnZhciBFbnRpdHlCdWlsZGVyID0gcmVxdWlyZSgnLi9FbnRpdHlCdWlsZGVyLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBNYXBQb29sOiBNYXBQb29sLFxyXG4gIEVudGl0eUJ1aWxkZXI6IEVudGl0eUJ1aWxkZXIsXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgbWFwID0gcmVxdWlyZSgnLi4vbWFwJyk7XHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuLi91dGlsL0Fzc2V0cy5qcycpO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG52YXIgVGl0bGVTY2VuZSA9IHJlcXVpcmUoJy4vVGl0bGVTY2VuZScpO1xyXG5cclxudmFyIENvbmRpdGlvbnMgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zLmpzJyk7XHJcblxyXG52YXIgR2FtZU92ZXJTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMsIFBJWEkpIHtcclxuICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcywgUElYSSk7XHJcbiAgXHJcbiAgdGhpcy5QSVhJID0gUElYSTtcclxuICBcclxuICB0aGlzLmJsYWNrQm94ID0gbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZShBc3NldHMuQkxBQ0tfQk9YKTtcclxuICB0aGlzLmJsYWNrQm94LmFscGhhID0gMTtcclxuICBcclxuICB0aGlzLnBsYXllciA9IG5ldyBlbnRpdGllcy5KZXJlbXkoKTtcclxuICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXllcik7XHJcbiAgXHJcbiAgdGhpcy50ZXh0ID0gbnVsbDtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEdhbWVPdmVyU2NlbmUsIHtcclxufSk7XHJcblxyXG5HYW1lT3ZlclNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgIFNjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAodGhpcy50ZXh0ID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gbmV3IGVudGl0aWVzLlRleHRCb3goXHJcbiAgICAgICAgICBQSVhJLFxyXG4gICAgICAgICAgdGhpcy5rZXlib2FyZCxcclxuICAgICAgICAgIHRoaXMucGxheWVyLFxyXG4gICAgICAgICAgXCJLZWVwIG9uIGNsYWltaW5nLlwiXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnRleHQueSA9IC0xMDAuNTtcclxuICAgICAgICB0aGlzLnRleHQuaGFzTmV4dCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJCh0aGlzLnRleHQpLm9uKCduZXh0LXRleHQnLCAoKSA9PiB7XHJcbiAgICAgICAgICB2YXIgbmV3U2NlbmUgPSBuZXcgVGl0bGVTY2VuZSh0aGlzLmNhbnZhcywgdGhpcy5QSVhJKTtcclxuICAgICAgICAgIHRoaXMuY2hhbmdlKG5ld1NjZW5lKTtcclxuICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMudGV4dCwgNSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIChBZGFwdGVkIGZyb20gd2ZsLlNjZW5lLmpzKSBEcmF3cyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgKi9cclxuICBkcmF3IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAocmVuZGVyZXIpIHtcclxuICAgICAgaWYgKHRoaXMuYmxhY2tCb3guYWxwaGEgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5ibGFja0JveC53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgIHRoaXMuYmxhY2tCb3guaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYmxhY2tCb3gueCA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggLSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuNTtcclxuICAgICAgICB0aGlzLmJsYWNrQm94LnkgPSB0aGlzLmNhbWVyYS5wb3NpdGlvbi55IC0gd2luZG93LmlubmVySGVpZ2h0ICogMC41O1xyXG4gICAgICAgIHRoaXMuX3N0YWdlLmFkZENoaWxkKHRoaXMuYmxhY2tCb3gpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBDbGVhciBhbGwgY2hpbGRyZW4gdGhlbiBhZGQgb25seSB0aGUgb25lcyB0aGF0IGNhbiBiZSBzZWVuXHJcbiAgICAgIHRoaXMuX3N0YWdlLmNoaWxkcmVuLmxlbmd0aCA9IDA7XHJcbiAgICAgIHRoaXMuX2xhc3REcmF3bkdhbWVPYmplY3RzICA9IHRoaXMuX2ZpbmRTdXJyb3VuZGluZ0dhbWVPYmplY3RzKHRoaXMuY2FtZXJhLCAyKS5zb3J0KFxyXG4gICAgICAgIChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAvLyBTb3J0IG9iamVjdHMgb24gdGhlIHNhbWUgbGF5ZXIgYnkgdGhlaXIgYm90dG9tIFktY29vcmRpbmF0ZVxyXG4gICAgICAgICAgaWYgKGEubGF5ZXIgPT09IGIubGF5ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChhLnRyYW5zZm9ybS5wb3NpdGlvbi5feSArIGEuY2FsY3VsYXRpb25DYWNoZS5oZWlnaHQgKiAwLjUpXHJcbiAgICAgICAgICAgICAgICAgLSAoYi50cmFuc2Zvcm0ucG9zaXRpb24uX3kgKyBiLmNhbGN1bGF0aW9uQ2FjaGUuaGVpZ2h0ICogMC41KVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBPdGhlcndpc2UsIHNvcnQgdGhlbSBieSBsYXllclxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEubGF5ZXIgLSBiLmxheWVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFRoaXMgc2VlbXMgdG8gcGVyZm9ybSBmYXN0ZXIgdGhhbiB1c2luZyBmaWx0ZXIoKVxyXG4gICAgICBmb3IgKGxldCBvYmogb2YgdGhpcy5fbGFzdERyYXduR2FtZU9iamVjdHMpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW5TZWUob2JqKSkge1xyXG4gICAgICAgICAgdGhpcy5fc3RhZ2UuYWRkQ2hpbGQob2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9oYW5kbGVJbnB1dCA6IHtcclxuICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIga2V5cyA9IHRoaXMua2V5Ym9hcmQ7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPdmVyU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgJCAgICAgICAgICAgICA9IHdmbC5qcXVlcnk7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgbWFwID0gcmVxdWlyZSgnLi4vbWFwJyk7XHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuLi91dGlsL0Fzc2V0cy5qcycpO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIENvbmRpdGlvbnMgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zLmpzJyk7XHJcblxyXG52YXIgR2FtZVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgUElYSSkge1xyXG4gIFNjZW5lLmNhbGwodGhpcywgY2FudmFzLCBQSVhJKTtcclxuICBcclxuICB0aGlzLm1hcCA9IG51bGw7XHJcbiAgdGhpcy50b3VjaEV2ZW50Qm91bmRzID0gW107XHJcbiAgdGhpcy5hdXRvRXZlbnRCb3VuZHMgPSBbXTtcclxuICB0aGlzLnZvaWRUaWxlcyA9IFtdO1xyXG4gIHRoaXMuaG9sZUNvdmVycyA9IFtdO1xyXG4gIFxyXG4gIHRoaXMuUElYSSA9IFBJWEk7XHJcbiAgXHJcbiAgdGhpcy5ibGFja0JveCA9IG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UoQXNzZXRzLkJMQUNLX0JPWCk7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAvKlxyXG4gIE1ZX0NPTlNUOiB7XHJcbiAgICB2YWx1ZToge1xyXG4gICAgICBmb286IDAsXHJcbiAgICAgIGJhcjogMVxyXG4gICAgfVxyXG4gIH1cclxuICAqL1xyXG4gIEZSSUNUSU9OOiB7XHJcbiAgICB2YWx1ZTogMC45XHJcbiAgfSxcclxuICBcclxuICBGQURFX1JBVEU6IHtcclxuICAgIHZhbHVlOiAwLjAwMlxyXG4gIH0sXHJcbiAgXHJcbiAgUHJvcGVydHlUYWc6IHtcclxuICAgIHZhbHVlOiB7XHJcbiAgICAgIENPTExJU0lPTjogXCJjb2xsaXNpb25cIixcclxuICAgICAgQVVUTzogXCJhdXRvXCIsXHJcbiAgICAgIFRJTEVfQ0xBSU06IFwidGlsZUNsYWltXCJcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuR2FtZVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICB1cGRhdGUgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICB0aGlzLl9yZW1vdmVSZXRpcmVkR2FtZU9iamVjdHMoKTtcclxuICAgICAgdGhpcy5fYXBwbHlGcmljdGlvbigpO1xyXG4gICAgICB0aGlzLl9oYW5kbGVJbnB1dCgpO1xyXG4gICAgICBcclxuICAgICAgU2NlbmUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuY2hlY2tBdXRvRXZlbnRzKCk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZUNvbmRpdGlvbnMoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIChBZGFwdGVkIGZyb20gd2ZsLlNjZW5lLmpzKSBEcmF3cyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgKi9cclxuICBkcmF3IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAocmVuZGVyZXIpIHtcclxuICAgICAgLy8gQ2xlYXIgYWxsIGNoaWxkcmVuIHRoZW4gYWRkIG9ubHkgdGhlIG9uZXMgdGhhdCBjYW4gYmUgc2VlblxyXG4gICAgICB0aGlzLl9zdGFnZS5jaGlsZHJlbi5sZW5ndGggPSAwO1xyXG4gICAgICB0aGlzLl9sYXN0RHJhd25HYW1lT2JqZWN0cyAgPSB0aGlzLl9maW5kU3Vycm91bmRpbmdHYW1lT2JqZWN0cyh0aGlzLmNhbWVyYSwgMikuc29ydChcclxuICAgICAgICAoYSwgYikgPT4ge1xyXG4gICAgICAgICAgLy8gU29ydCBvYmplY3RzIG9uIHRoZSBzYW1lIGxheWVyIGJ5IHRoZWlyIGJvdHRvbSBZLWNvb3JkaW5hdGVcclxuICAgICAgICAgIGlmIChhLmxheWVyID09PSBiLmxheWVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYS50cmFuc2Zvcm0ucG9zaXRpb24uX3kgKyBhLmNhbGN1bGF0aW9uQ2FjaGUuaGVpZ2h0ICogMC41KVxyXG4gICAgICAgICAgICAgICAgIC0gKGIudHJhbnNmb3JtLnBvc2l0aW9uLl95ICsgYi5jYWxjdWxhdGlvbkNhY2hlLmhlaWdodCAqIDAuNSlcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gT3RoZXJ3aXNlLCBzb3J0IHRoZW0gYnkgbGF5ZXJcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLmxheWVyIC0gYi5sYXllcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBUaGlzIHNlZW1zIHRvIHBlcmZvcm0gZmFzdGVyIHRoYW4gdXNpbmcgZmlsdGVyKClcclxuICAgICAgZm9yIChsZXQgb2JqIG9mIHRoaXMuX2xhc3REcmF3bkdhbWVPYmplY3RzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuU2VlKG9iaikpIHtcclxuICAgICAgICAgIHRoaXMuX3N0YWdlLmFkZENoaWxkKG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiAodGhpcy5ibGFja0JveC5hbHBoYSA+IDApIHtcclxuICAgICAgICB0aGlzLmJsYWNrQm94LndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5ibGFja0JveC5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5ibGFja0JveC54ID0gdGhpcy5jYW1lcmEucG9zaXRpb24ueCAtIHdpbmRvdy5pbm5lcldpZHRoICogMC41O1xyXG4gICAgICAgIHRoaXMuYmxhY2tCb3gueSA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgLSB3aW5kb3cuaW5uZXJIZWlnaHQgKiAwLjU7XHJcbiAgICAgICAgdGhpcy5fc3RhZ2UuYWRkQ2hpbGQodGhpcy5ibGFja0JveCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIHNldE1hcDoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgdGhpcy5tYXAgPSBrZXk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBsb2FkTWFwOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgbWFwRGF0YSA9IG1hcC5NYXBQb29sLmdldCh0aGlzLm1hcCk7XHJcbiAgICAgIHZhciBsZXZlbERhdGEgPSBtYXBEYXRhLmxldmVsO1xyXG4gICAgICB2YXIge2dhbWVPYmplY3RzfSA9IGxldmVsRGF0YTtcclxuICAgICAgXHJcbiAgICAgIGZvciAoY29uc3QgZyBvZiBnYW1lT2JqZWN0cykge1xyXG4gICAgICAgIGxldCBvYmogPSBtYXAuRW50aXR5QnVpbGRlci5idWlsZChnLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3Qob2JqLCBvYmoubGF5ZXIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChvYmouY3VzdG9tRGF0YS5wcm9wcykge1xyXG4gICAgICAgICAgdGhpcy5wYXJzZVByb3BlcnRpZXMob2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHZhciBhbGwgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKGNvbnN0IGFkZGVkIG9mIGFsbCkge1xyXG4gICAgICAgIGlmIChhZGRlZC5maW5kUmVmZXJlbmNlcykge1xyXG4gICAgICAgICAgYWRkZWQuZmluZFJlZmVyZW5jZXMoYWxsLCB0aGlzLlBJWEkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoYWRkZWQgaW5zdGFuY2VvZiBlbnRpdGllcy5UaWxlVm9pZCkge1xyXG4gICAgICAgICAgdGhpcy52b2lkVGlsZXMucHVzaChhZGRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLl9mYWRlSW5NYXAoKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIGxpbmtUb3VjaEV2ZW50OiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaiwgZGF0YSkge1xyXG4gICAgICB0aGlzLnRvdWNoRXZlbnRCb3VuZHMucHVzaCh7XHJcbiAgICAgICAgb2JqOiBvYmosXHJcbiAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICAgIHRleHRCb3g6IG51bGxcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIHNldHVwQXV0b0V2ZW50OiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaiwgZGF0YSkge1xyXG4gICAgICB0aGlzLmF1dG9FdmVudEJvdW5kcy5wdXNoKHtcclxuICAgICAgICBvYmo6IG9iaixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgcGFyc2VQcm9wZXJ0aWVzOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICB2YXIgcHJvcHMgPSBvYmouY3VzdG9tRGF0YS5wcm9wcztcclxuICAgICAgXHJcbiAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBwcm9wcykge1xyXG4gICAgICAgIGxldCBrZXkgPSBwcm9wLmtleTtcclxuICAgICAgICBsZXQgdmFsdWUgPSBwcm9wLnZhbHVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChrZXkgPT09IEdhbWVTY2VuZS5Qcm9wZXJ0eVRhZy5DT0xMSVNJT04pIHtcclxuICAgICAgICAgIHRoaXMubGlua1RvdWNoRXZlbnQob2JqLCB2YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IEdhbWVTY2VuZS5Qcm9wZXJ0eVRhZy5BVVRPKSB7XHJcbiAgICAgICAgICB0aGlzLnNldHVwQXV0b0V2ZW50KG9iaiwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgY2hlY2tBdXRvRXZlbnRzOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICBmb3IgKGNvbnN0IGV2IG9mIHRoaXMuYXV0b0V2ZW50Qm91bmRzKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBldi5kYXRhO1xyXG4gICAgICAgIHZhciBhcmdzID0gZGF0YS5zcGxpdCgnfCcpO1xyXG5cclxuICAgICAgICB2YXIgY29uZGl0aW9uMSA9IGFyZ3NbMF07XHJcbiAgICAgICAgdmFyIGV4cGVjdGVkID0gYXJnc1sxXTtcclxuICAgICAgICB2YXIgY29uZGl0aW9ucyA9IGFyZ3MubGVuZ3RoIC0gMjtcclxuICAgICAgICB2YXIgZXZlbnRTZXRzID0gW107XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZGl0aW9uczsgaSArPSAyKSB7XHJcbiAgICAgICAgICBsZXQgY29uZCA9IGFyZ3NbMiArIGldO1xyXG4gICAgICAgICAgbGV0IG5ld1ZhbCAgPSBhcmdzWzIgKyBpICsgMV07XHJcblxyXG4gICAgICAgICAgZXZlbnRTZXRzLnB1c2goe1xyXG4gICAgICAgICAgICBjb25kaXRpb246IGNvbmQsXHJcbiAgICAgICAgICAgIG5ld1ZhbHVlOiBuZXdWYWxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKENvbmRpdGlvbnNbY29uZGl0aW9uMV0gPT09IGV4cGVjdGVkKSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBzZXQgb2YgZXZlbnRTZXRzKSB7XHJcbiAgICAgICAgICAgIGxldCB7Y29uZGl0aW9uLCBuZXdWYWx1ZX0gPSBzZXQ7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoY29uZGl0aW9uID09PSBcInNwYXduXCIgJiYgbmV3VmFsdWUgPT09IFwiSG9sZUNvdmVyXCIpICB7XHJcbiAgICAgICAgICAgICAgdmFyIG9iaiA9IGV2Lm9iajtcclxuICAgICAgICAgICAgICB2YXIgZSA9IG5ldyBlbnRpdGllcy5Ib2xlQ292ZXIoKTtcclxuICAgICAgICAgICAgICBlLnBvc2l0aW9uLnggPSBvYmoueDtcclxuICAgICAgICAgICAgICBlLnBvc2l0aW9uLnkgPSBvYmoueTtcclxuICAgICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoZSwgMSk7XHJcbiAgICAgICAgICAgICAgdGhpcy5ob2xlQ292ZXJzLnB1c2goZSk7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgQ29uZGl0aW9uc1tjb25kaXRpb25dID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgdGhpcy5hdXRvRXZlbnRCb3VuZHMuc3BsaWNlKHRoaXMuYXV0b0V2ZW50Qm91bmRzLmluZGV4T2YoZXYpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIGNoZWNrVG91Y2hFdmVudHM6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGZvciAoY29uc3QgZXYgb2YgdGhpcy50b3VjaEV2ZW50Qm91bmRzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyLmNoZWNrQnJvYWRQaGFzZUNvbGxpc2lvbihldi5vYmopKSB7XHJcbiAgICAgICAgICBpZiAoIWV2LmFjdGl2ZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGV2LmRhdGE7XHJcbiAgICAgICAgICAgIHZhciBhcmdzID0gZGF0YS5zcGxpdCgnfCcpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gMDogQ29uZGl0aW9uXHJcbiAgICAgICAgICAgIC8vIDE6IEV4cGVjdGVkIHZhbHVlXHJcbiAgICAgICAgICAgIC8vIDI6IFN0cmluZ1xyXG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICB2YXIgY29uZGl0aW9uID0gYXJnc1swXTtcclxuICAgICAgICAgICAgICB2YXIgZXhwZWN0ZWQgPSBhcmdzWzFdO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIGlmIChDb25kaXRpb25zW2NvbmRpdGlvbl0gPT09IGV4cGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFdmVudFRleHQoZXYsIGFyZ3NbMl0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gMDogQ29uZGl0aW9uMVxyXG4gICAgICAgICAgICAvLyAxOiBFeHBlY3RlZCB2YWx1ZVxyXG4gICAgICAgICAgICAvLyAyOiBDb25kaXRpb24yIHRvIGNoYW5nZSBhZnRlciBTUEFDRSBpcyBwcmVzc2VkXHJcbiAgICAgICAgICAgIC8vIDM6IFZhbHVlIHRvIHNldCBDb25kaXRpb24yIHRvXHJcbiAgICAgICAgICAgIC8vIEV2ZW4gbnVtYmVyczogQ29uZGl0aW9uWCB0byBjaGFuZ2UgYWZ0ZXIgU1BBQ0UgaXMgcHJlc3NlZFxyXG4gICAgICAgICAgICAvLyBPZGQgbnVtYmVyczogVmFsdWUgdG8gc2V0IENvbmRpdGlvblggdG9cclxuICAgICAgICAgICAgLy8gbjogU3RyaW5nXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPiA0KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGNvbmRpdGlvbjEgPSBhcmdzWzBdO1xyXG4gICAgICAgICAgICAgIHZhciBleHBlY3RlZCA9IGFyZ3NbMV07XHJcbiAgICAgICAgICAgICAgdmFyIHN0cmluZyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gLTMgZm9yIGFyZzAsIDEsIGFuZCAyXHJcbiAgICAgICAgICAgICAgdmFyIGNvbmRpdGlvbnMgPSBhcmdzLmxlbmd0aCAtIDM7XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50U2V0cyA9IFtdO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZGl0aW9uczsgaSArPSAyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29uZCA9IGFyZ3NbMiArIGldO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1ZhbCAgPSBhcmdzWzIgKyBpICsgMV07XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGV2ZW50U2V0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgY29uZGl0aW9uOiBjb25kLFxyXG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZTogbmV3VmFsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICBpZiAoQ29uZGl0aW9uc1tjb25kaXRpb24xXSA9PT0gZXhwZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0V2ZW50UHJvZ3Jlc3NUZXh0KGV2LCBldmVudFNldHMsIHN0cmluZyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuc2hvd0V2ZW50VGV4dChldiwgZXYuZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGV2LmFjdGl2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVFdmVudFRleHQoZXYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgc2hvd0V2ZW50VGV4dDoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChldmVudCwgc3RyaW5nID0gXCJcIikge1xyXG4gICAgICBldmVudC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICB2YXIgdGV4dEJveCA9IG5ldyBlbnRpdGllcy5UZXh0Qm94KFxyXG4gICAgICAgIHRoaXMuUElYSSxcclxuICAgICAgICB0aGlzLmtleWJvYXJkLFxyXG4gICAgICAgIHRoaXMucGxheWVyLFxyXG4gICAgICAgIHN0cmluZ1xyXG4gICAgICApO1xyXG4gICAgICBcclxuICAgICAgdGV4dEJveC54ID0gZXZlbnQub2JqLng7XHJcbiAgICAgIHRleHRCb3gueSA9IGV2ZW50Lm9iai55IC0gNzU7XHJcbiAgICAgIFxyXG4gICAgICAvLyBMYXllciA1IGZvciBoaWdoZXIgb2JqZWN0cyBsaWtlIHRleHQgYm94ZXNcclxuICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KHRleHRCb3gsIDUpO1xyXG4gICAgICBldmVudC50ZXh0Qm94ID0gdGV4dEJveDtcclxuICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIHNob3dFdmVudFByb2dyZXNzVGV4dDoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChldmVudCwgZXZlbnRTZXRzLCBzdHJpbmcgPSBcIlwiKSB7XHJcbiAgICAgIGV2ZW50LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgIHZhciB0ZXh0Qm94ID0gbmV3IGVudGl0aWVzLlRleHRCb3goXHJcbiAgICAgICAgdGhpcy5QSVhJLFxyXG4gICAgICAgIHRoaXMua2V5Ym9hcmQsXHJcbiAgICAgICAgdGhpcy5wbGF5ZXIsXHJcbiAgICAgICAgc3RyaW5nXHJcbiAgICAgICk7XHJcbiAgICAgIHRleHRCb3guaGFzTmV4dCA9IHRydWU7XHJcbiAgICAgIHRoaXMuY2FtZXJhLmZvbGxvdyhldmVudC5vYmopO1xyXG4gICAgICBcclxuICAgICAgdGV4dEJveC54ID0gZXZlbnQub2JqLng7XHJcbiAgICAgIHRleHRCb3gueSA9IGV2ZW50Lm9iai55IC0gNzU7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnBsYXllci5tb3ZlbWVudExvY2srKztcclxuICAgICAgdGhpcy5wbGF5ZXIuYWNjZWxlcmF0aW9uLm11bHRpcGx5KDApO1xyXG4gICAgICB0aGlzLnBsYXllci52ZWxvY2l0eS5tdWx0aXBseSgwKTtcclxuICAgICAgXHJcbiAgICAgIC8vIExheWVyIDUgZm9yIGhpZ2hlciBvYmplY3RzIGxpa2UgdGV4dCBib3hlc1xyXG4gICAgICB0aGlzLmFkZEdhbWVPYmplY3QodGV4dEJveCwgNSk7XHJcbiAgICAgIGV2ZW50LnRleHRCb3ggPSB0ZXh0Qm94O1xyXG4gICAgICBcclxuICAgICAgJCh0ZXh0Qm94KS5vbignbmV4dC10ZXh0JywgKGUpID0+IHtcclxuICAgICAgICAkKHRleHRCb3gpLm9mZigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IHNldCBvZiBldmVudFNldHMpIHtcclxuICAgICAgICAgIGxldCB7Y29uZGl0aW9uLCBuZXdWYWx1ZX0gPSBzZXQ7XHJcbiAgICAgICAgICBDb25kaXRpb25zW2NvbmRpdGlvbl0gPSBuZXdWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIubW92ZW1lbnRMb2NrLS07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5oaWRlRXZlbnRUZXh0KGV2ZW50KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBoaWRlRXZlbnRUZXh0OiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIC8vdGhpcy5yZW1vdmVHYW1lT2JqZWN0KGV2ZW50LnRleHRCb3gpO1xyXG4gICAgICBldmVudC50ZXh0Qm94LmN1c3RvbURhdGEucmV0aXJlZCA9IHRydWU7XHJcbiAgICAgIGV2ZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICBldmVudC50ZXh0Qm94ID0gbnVsbDtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9yZW1vdmVSZXRpcmVkR2FtZU9iamVjdHM6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBnb3MgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKGxldCBnIG9mIGdvcykge1xyXG4gICAgICAgIGlmIChnLmN1c3RvbURhdGEucmV0aXJlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KGcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgX2FwcGx5RnJpY3Rpb246IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBnb3MgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGdvc1tpXS5hY2NlbGVyYXRpb24ubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICBnb3NbaV0udmVsb2NpdHkubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgX2hhbmRsZUlucHV0IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBrZXlzID0gdGhpcy5rZXlib2FyZDtcclxuICAgICAgXHJcbiAgICAgIGlmICh0aGlzLnBsYXllcikge1xyXG4gICAgICAgIHRoaXMucGxheWVyLmhhbmRsZUlucHV0KGtleXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcclxuICBfaGFuZGxlQ29sbGlzaW9uczoge1xyXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChnYW1lT2JqZWN0cykge1xyXG4gICAgICB0aGlzLmNoZWNrVG91Y2hFdmVudHMoKTtcclxuICAgICAgXHJcbiAgICAgIGZvciAobGV0IGNvdmVyIG9mIHRoaXMuaG9sZUNvdmVycykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IHQgb2YgdGhpcy52b2lkVGlsZXMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmhvbGVDb3ZlcnMuaW5kZXhPZihjb3ZlcikgPCAwKSBjb250aW51ZTtcclxuICAgICAgICAgIGlmICh0aGlzLnZvaWRUaWxlcy5pbmRleE9mKHQpIDwgMCkgY29udGludWU7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChjb3Zlci5jaGVja05hcnJvd1BoYXNlQ29sbGlzaW9uKHQsIHt9KSkge1xyXG4gICAgICAgICAgICB0LmN1cnJlbnRTdGF0ZS5uYW1lID0gZW50aXRpZXMuSGV4VGlsZS5TVEFURS5DTEFJTUlORztcclxuICAgICAgICAgICAgdGhpcy52b2lkVGlsZXMuc3BsaWNlKHRoaXMudm9pZFRpbGVzLmluZGV4T2YodCksIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmhvbGVDb3ZlcnMuc3BsaWNlKHRoaXMuaG9sZUNvdmVycy5pbmRleE9mKGNvdmVyKSwgMSk7XHJcbiAgICAgICAgICAgIGNvdmVyLmN1c3RvbURhdGEucmV0aXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHQuc29saWQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIFNjZW5lLnByb3RvdHlwZS5faGFuZGxlQ29sbGlzaW9ucy5jYWxsKHRoaXMsIGdhbWVPYmplY3RzKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9oYW5kbGVDb25kaXRpb25zOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodGhpcy5ibGFja0JveC5hbHBoYSA9PT0gMCkge1xyXG4gICAgICAgIGlmIChDb25kaXRpb25zLm1hcCAhPT0gdGhpcy5tYXApIHtcclxuICAgICAgICAgIHRoaXMuX2ZhZGVPdXRNYXAoKCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgbmV3U2NlbmUgPSBuZXcgR2FtZVNjZW5lKHRoaXMuY2FudmFzLCB0aGlzLlBJWEkpO1xyXG4gICAgICAgICAgICBuZXdTY2VuZS5zZXRNYXAoQ29uZGl0aW9ucy5tYXApO1xyXG4gICAgICAgICAgICBuZXdTY2VuZS5sb2FkTWFwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlKG5ld1NjZW5lKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoQ29uZGl0aW9ucy5nYW1lb3ZlciA9PT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgIHRoaXMuX2ZhZGVPdXRNYXAoKCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgR2FtZU92ZXJTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZU92ZXJTY2VuZScpO1xyXG4gICAgICAgICAgICB2YXIgbmV3U2NlbmUgPSBuZXcgR2FtZU92ZXJTY2VuZSh0aGlzLmNhbnZhcywgdGhpcy5QSVhJKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2UobmV3U2NlbmUpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9mYWRlSW5NYXA6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5ibGFja0JveC5hbHBoYSA9IDE7XHJcbiAgICAgIHRoaXMucGxheWVyLm1vdmVtZW50TG9jaysrO1xyXG4gICAgICBcclxuICAgICAgdmFyIGlkID0gd2luZG93LnNldEludGVydmFsKFxyXG4gICAgICAgICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuYmxhY2tCb3guYWxwaGEgLT0gR2FtZVNjZW5lLkZBREVfUkFURTtcclxuICAgICAgICAgIHRoaXMuYmxhY2tCb3guYWxwaGEgKj0gMC45O1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAodGhpcy5ibGFja0JveC5hbHBoYSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGlkKTtcclxuICAgICAgICAgICAgdGhpcy5ibGFja0JveC5hbHBoYSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm1vdmVtZW50TG9jay0tO1xyXG4gICAgICAgICAgICB0aGlzLl9zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmJsYWNrQm94KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIDFcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9LFxyXG4gIFxyXG4gIF9mYWRlT3V0TWFwOiB7XHJcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMuYmxhY2tCb3guYWxwaGEgPSAwO1xyXG4gICAgICB0aGlzLnBsYXllci5tb3ZlbWVudExvY2srKztcclxuICAgICAgXHJcbiAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmJsYWNrQm94LmFscGhhICs9IEdhbWVTY2VuZS5GQURFX1JBVEU7XHJcbiAgICAgICAgICB0aGlzLmJsYWNrQm94LmFscGhhICo9IDEuMDU7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmICh0aGlzLmJsYWNrQm94LmFscGhhID49IDEpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoaWQpO1xyXG4gICAgICAgICAgICB0aGlzLmJsYWNrQm94LmFscGhhID0gMTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIubW92ZW1lbnRMb2NrLS07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAxXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciAkICAgICAgICAgICAgID0gd2ZsLmpxdWVyeTtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBtYXAgPSByZXF1aXJlKCcuLi9tYXAnKTtcclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4uL3V0aWwvQXNzZXRzLmpzJyk7XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcbnZhciBHYW1lU2NlbmUgPSByZXF1aXJlKCcuL0dhbWVTY2VuZScpO1xyXG5cclxudmFyIENvbmRpdGlvbnMgPSByZXF1aXJlKCcuLi9Db25kaXRpb25zLmpzJyk7XHJcblxyXG52YXIgVGl0bGVTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMsIFBJWEkpIHtcclxuICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcywgUElYSSk7XHJcbiAgXHJcbiAgdGhpcy5QSVhJID0gUElYSTtcclxuICBcclxuICB0aGlzLmJsYWNrQm94ID0gbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZShBc3NldHMuQkxBQ0tfQk9YKTtcclxuICB0aGlzLmJsYWNrQm94LmFscGhhID0gMTtcclxuICBcclxuICB0aGlzLnBsYXllciA9IG5ldyBlbnRpdGllcy5UaXRsZSgpO1xyXG4gIHRoaXMucGxheWVyLnkgPSAtMTAwO1xyXG4gIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXllcik7XHJcbiAgXHJcbiAgdGhpcy50ZXh0ID0gbnVsbDtcclxuICBcclxuICAgICAgICAgIFxyXG4gIENvbmRpdGlvbnMuanRhbGsgPSBcIjBcIjtcclxuICBDb25kaXRpb25zLmp0YWxrMiA9IFwiMFwiO1xyXG4gIENvbmRpdGlvbnMuamVuZCA9IFwiMFwiO1xyXG4gIENvbmRpdGlvbnMuZHRhbGsgPSBcIjBcIjtcclxuICBDb25kaXRpb25zLm10YWxrID0gXCIwXCI7XHJcbiAgQ29uZGl0aW9ucy5nYW1lb3ZlciA9IFwiZmFsc2VcIjtcclxuICBDb25kaXRpb25zLm1hcCA9IFwibWFwMFwiO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVGl0bGVTY2VuZSwge1xyXG59KTtcclxuXHJcblRpdGxlU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gIHVwZGF0ZSA6IHtcclxuICAgIHZhbHVlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgU2NlbmUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgXHJcbiAgICAgIGlmICh0aGlzLnRleHQgPT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRleHQgPSBuZXcgZW50aXRpZXMuVGV4dEJveChcclxuICAgICAgICAgIFBJWEksXHJcbiAgICAgICAgICB0aGlzLmtleWJvYXJkLFxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXIsXHJcbiAgICAgICAgICBcIldoYXQgaGF2ZSB5b3UgY2xhaW1lZC4uLj9cIlxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy50ZXh0Lmhhc05leHQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgICQodGhpcy50ZXh0KS5vbignbmV4dC10ZXh0JywgKCkgPT4ge1xyXG4gICAgICAgICAgdmFyIG5ld1NjZW5lID0gbmV3IEdhbWVTY2VuZSh0aGlzLmNhbnZhcywgdGhpcy5QSVhJKTtcclxuICAgICAgICAgIG5ld1NjZW5lLnNldE1hcChBc3NldHMubWFwc1swXS5rZXkpO1xyXG4gICAgICAgICAgbmV3U2NlbmUubG9hZE1hcCgpO1xyXG4gICAgICAgICAgdGhpcy5jaGFuZ2UobmV3U2NlbmUpO1xyXG4gICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy50ZXh0LCA1KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgLyoqXHJcbiAgICogKEFkYXB0ZWQgZnJvbSB3ZmwuU2NlbmUuanMpIERyYXdzIHRoZSBzY2VuZSBhbmQgYWxsIGdhbWUgb2JqZWN0cyBpbiBpdFxyXG4gICAqL1xyXG4gIGRyYXcgOiB7XHJcbiAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyZW5kZXJlcikge1xyXG4gICAgICBpZiAodGhpcy5ibGFja0JveC5hbHBoYSA+IDApIHtcclxuICAgICAgICB0aGlzLmJsYWNrQm94LndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgdGhpcy5ibGFja0JveC5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5ibGFja0JveC54ID0gdGhpcy5jYW1lcmEucG9zaXRpb24ueCAtIHdpbmRvdy5pbm5lcldpZHRoICogMC41O1xyXG4gICAgICAgIHRoaXMuYmxhY2tCb3gueSA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgLSB3aW5kb3cuaW5uZXJIZWlnaHQgKiAwLjU7XHJcbiAgICAgICAgdGhpcy5fc3RhZ2UuYWRkQ2hpbGQodGhpcy5ibGFja0JveCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIENsZWFyIGFsbCBjaGlsZHJlbiB0aGVuIGFkZCBvbmx5IHRoZSBvbmVzIHRoYXQgY2FuIGJlIHNlZW5cclxuICAgICAgdGhpcy5fc3RhZ2UuY2hpbGRyZW4ubGVuZ3RoID0gMDtcclxuICAgICAgdGhpcy5fbGFzdERyYXduR2FtZU9iamVjdHMgID0gdGhpcy5fZmluZFN1cnJvdW5kaW5nR2FtZU9iamVjdHModGhpcy5jYW1lcmEsIDIpLnNvcnQoXHJcbiAgICAgICAgKGEsIGIpID0+IHtcclxuICAgICAgICAgIC8vIFNvcnQgb2JqZWN0cyBvbiB0aGUgc2FtZSBsYXllciBieSB0aGVpciBib3R0b20gWS1jb29yZGluYXRlXHJcbiAgICAgICAgICBpZiAoYS5sYXllciA9PT0gYi5sYXllcikge1xyXG4gICAgICAgICAgICByZXR1cm4gKGEudHJhbnNmb3JtLnBvc2l0aW9uLl95ICsgYS5jYWxjdWxhdGlvbkNhY2hlLmhlaWdodCAqIDAuNSlcclxuICAgICAgICAgICAgICAgICAtIChiLnRyYW5zZm9ybS5wb3NpdGlvbi5feSArIGIuY2FsY3VsYXRpb25DYWNoZS5oZWlnaHQgKiAwLjUpXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIE90aGVyd2lzZSwgc29ydCB0aGVtIGJ5IGxheWVyXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5sYXllciAtIGIubGF5ZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgICBcclxuICAgICAgLy8gVGhpcyBzZWVtcyB0byBwZXJmb3JtIGZhc3RlciB0aGFuIHVzaW5nIGZpbHRlcigpXHJcbiAgICAgIGZvciAobGV0IG9iaiBvZiB0aGlzLl9sYXN0RHJhd25HYW1lT2JqZWN0cykge1xyXG4gICAgICAgIGlmICh0aGlzLmNhblNlZShvYmopKSB7XHJcbiAgICAgICAgICB0aGlzLl9zdGFnZS5hZGRDaGlsZChvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXHJcbiAgX2hhbmRsZUlucHV0IDoge1xyXG4gICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBrZXlzID0gdGhpcy5rZXlib2FyZDtcclxuICAgIH1cclxuICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGl0bGVTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBHYW1lU2NlbmUgPSByZXF1aXJlKCcuL0dhbWVTY2VuZS5qcycpO1xyXG52YXIgR2FtZU92ZXJTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZU92ZXJTY2VuZS5qcycpO1xyXG52YXIgVGl0bGVTY2VuZSA9IHJlcXVpcmUoJy4vVGl0bGVTY2VuZS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBHYW1lU2NlbmUgOiBHYW1lU2NlbmUsXHJcbiAgICBHYW1lT3ZlclNjZW5lIDogR2FtZU92ZXJTY2VuZSxcclxuICAgIFRpdGxlU2NlbmUgOiBUaXRsZVNjZW5lXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtYXBzOiBbXHJcbiAgICB7a2V5OiAnbWFwMCcsIHBhdGg6ICcuL2Fzc2V0cy9tYXBzL21hcDAuanNvbid9LFxyXG4gICAge2tleTogJ21hcDEnLCBwYXRoOiAnLi9hc3NldHMvbWFwcy9tYXAxLmpzb24nfSxcclxuICBdLFxyXG4gIFxyXG4gIC8vIE1ZX0dSQVBISUM6IFwiLi9hc3NldHMvaW1nL01ZX0dSQVBISUMucG5nXCIsXHJcbiAgQkxPQ0s6IFwiLi9hc3NldHMvaW1nL0Jsb2NrRnVsbC5wbmdcIixcclxuICBUSUxFX1dBVEVSOiBcIi4vYXNzZXRzL2ltZy9UaWxlV2F0ZXIucG5nXCIsXHJcbiAgVElMRV9KRVJFTVk6IFwiLi9hc3NldHMvaW1nL1RpbGVKZXJlbXkucG5nXCIsXHJcbiAgVElMRV9PTERfSkVSRU1ZOiBcIi4vYXNzZXRzL2ltZy9UaWxlT2xkSmVyZW15LnBuZ1wiLFxyXG4gIFRJTEVfR1JBU1M6IFwiLi9hc3NldHMvaW1nL1RpbGVHcmFzcy5wbmdcIixcclxuICBUSUxFX1NBTkQ6IFwiLi9hc3NldHMvaW1nL1RpbGVTYW5kLnBuZ1wiLFxyXG4gIFRJTEVfRlJFRTA6IFwiLi9hc3NldHMvaW1nL1RpbGVGcmVlMC5wbmdcIixcclxuICBUSUxFX0ZSRUUxOiBcIi4vYXNzZXRzL2ltZy9UaWxlRnJlZTEucG5nXCIsXHJcbiAgVElMRV9GUkVFMjogXCIuL2Fzc2V0cy9pbWcvVGlsZUZyZWUyLnBuZ1wiLFxyXG4gIFRJTEVfVk9JRDogXCIuL2Fzc2V0cy9pbWcvVGlsZVZvaWQucG5nXCIsXHJcbiAgVElMRV9DTEFJTUlORzogXCIuL2Fzc2V0cy9pbWcvVGlsZUNsYWltaW5nLnBuZ1wiLFxyXG4gIFRJTEVfQ0xBSU1FRDogXCIuL2Fzc2V0cy9pbWcvVGlsZUNsYWltZWQucG5nXCIsXHJcbiAgXHJcbiAgSE9MRTogXCIuL2Fzc2V0cy9pbWcvSG9sZS5wbmdcIixcclxuICBIT0xFX0NPVkVSOiBcIi4vYXNzZXRzL2ltZy9Ib2xlQ292ZXIucG5nXCIsXHJcbiAgXHJcbiAgQkxBQ0tfQk9YOiBcIi4vYXNzZXRzL2ltZy9CbGFja0JveC5wbmdcIixcclxuICBcclxuICBUSVRMRTA6IFwiLi9hc3NldHMvaW1nL1RpdGxlMC5wbmdcIixcclxuICBUSVRMRTE6IFwiLi9hc3NldHMvaW1nL1RpdGxlMS5wbmdcIixcclxuICBUSVRMRTI6IFwiLi9hc3NldHMvaW1nL1RpdGxlMi5wbmdcIixcclxuICBcclxuICBQTEFZRVI6IFwiLi9hc3NldHMvaW1nL1BsYXllci5wbmdcIixcclxuICBQTEFZRVJfTDA6IFwiLi9hc3NldHMvaW1nL1BsYXllckwwLnBuZ1wiLFxyXG4gIFBMQVlFUl9MMTogXCIuL2Fzc2V0cy9pbWcvUGxheWVyTDEucG5nXCIsXHJcbiAgUExBWUVSX1IwOiBcIi4vYXNzZXRzL2ltZy9QbGF5ZXJSMC5wbmdcIixcclxuICBQTEFZRVJfUjE6IFwiLi9hc3NldHMvaW1nL1BsYXllclIxLnBuZ1wiLFxyXG4gIFxyXG4gIFRFWFRfQk9YOiBcIi4vYXNzZXRzL2ltZy9UZXh0Qm94LnBuZ1wiLFxyXG4gIFRFWFRfQk9YX05FWFQ6IFwiLi9hc3NldHMvaW1nL1RleHRCb3hOZXh0LnBuZ1wiLFxyXG4gIEVWRU5UX0JPVU5EUzogXCIuL2Fzc2V0cy9pbWcvRXZlbnRCb3VuZHMucG5nXCIsXHJcbiAgXHJcbiAgSkVSRU1ZMDogXCIuL2Fzc2V0cy9pbWcvSmVyZW15MC5wbmdcIixcclxuICBKRVJFTVkxOiBcIi4vYXNzZXRzL2ltZy9KZXJlbXkxLnBuZ1wiLFxyXG4gIFxyXG4gIE5QQ19BMDogXCIuL2Fzc2V0cy9pbWcvTlBDQTAucG5nXCIsXHJcbiAgTlBDX0ExOiBcIi4vYXNzZXRzL2ltZy9OUENBMS5wbmdcIixcclxuICBcclxuICBOUENfQjA6IFwiLi9hc3NldHMvaW1nL05QQ0IwLnBuZ1wiLFxyXG4gIE5QQ19CMTogXCIuL2Fzc2V0cy9pbWcvTlBDQjEucG5nXCIsXHJcbiAgXHJcbiAgTlBDX0MwOiBcIi4vYXNzZXRzL2ltZy9OUENDMC5wbmdcIixcclxuICBOUENfQzE6IFwiLi9hc3NldHMvaW1nL05QQ0MxLnBuZ1wiLFxyXG4gIFxyXG4gIC8vIEZvbnRzXHJcbiAgLy9GT05UX1RFWFRVUkU6IFwiLi9hc3NldHMvZm9udC9sZDM4LnBuZ1wiLFxyXG4gIEZPTlQ6IFwiLi9hc3NldHMvZm9udC9sZDM4LnhtbFwiLFxyXG5cclxuICAvLyBQcmVsb2FkZXIuanMgd2lsbCByZXBsYWNlIGdldHRlciB3aXRoIGFwcHJvcHJpYXRlIGRlZmluaXRpb25cclxuICBnZXQgICAgICAgIDogZnVuY3Rpb24gKHBhdGgpIHsgfVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcblxyXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcclxuICAgIC8vIFNldCB1cCBwcmVsb2FkZXJcclxuXHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblx0dGhpcy5xdWV1ZS5pbnN0YWxsUGx1Z2luKGNyZWF0ZWpzLlNvdW5kKTtcclxuXHJcbiAgICAvLyBSZXBsYWNlIGRlZmluaXRpb24gb2YgQXNzZXQgZ2V0dGVyIHRvIHVzZSB0aGUgZGF0YSBmcm9tIHRoZSBxdWV1ZVxyXG4gICAgQXNzZXRzLmdldCA9IHRoaXMucXVldWUuZ2V0UmVzdWx0LmJpbmQodGhpcy5xdWV1ZSk7XHJcblxyXG4gICAgLy8gT25jZSBldmVyeXRoaW5nIGhhcyBiZWVuIHByZWxvYWRlZCwgc3RhcnQgdGhlIGFwcGxpY2F0aW9uXHJcbiAgICBpZiAob25Db21wbGV0ZSkge1xyXG4gICAgICAgIHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCBvbkNvbXBsZXRlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmVlZFRvTG9hZCA9IFtdO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdG8gbG9hZCBhc3NldHNcclxuICAgIGZvciAodmFyIGFzc2V0IGluIEFzc2V0cykge1xyXG4gICAgICAgIHZhciBhc3NldE9iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiBhc3NldCxcclxuICAgICAgICAgICAgc3JjIDogQXNzZXRzW2Fzc2V0XVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmVlZFRvTG9hZC5wdXNoKGFzc2V0T2JqKTtcclxuICAgIH1cclxuXHJcblx0dGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobmVlZFRvTG9hZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgICAgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG52YXIgUHJlbG9hZGVyID0gcmVxdWlyZSgnLi9QcmVsb2FkZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdEFzc2V0czogQXNzZXRzLFxyXG5cdFByZWxvYWRlcjogUHJlbG9hZGVyXHJcbn07Il19
