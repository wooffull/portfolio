"use strict";

var app = app || {};

(function () {


    /**
     * Spawn Point for player
     */
    var SpawnPoint = function () {
        app.PhysicsObject.call(this);

        this.id = SpawnPoint.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['spawnPoint']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = false;
        this.fixed = true;
    };
    Object.defineProperties(SpawnPoint, {
        name : {
            value : "SpawnPoint"
        },

        id : {
            value : 10000
        }
    });
    SpawnPoint.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        drawOnMinimap : {
            value : function (ctx) { }
        }
    }));
    Object.freeze(SpawnPoint);


    /**
     * Check point for player
     */
    var CheckPoint = function () {
        app.PhysicsObject.call(this);

        this.id = CheckPoint.id;

        this.width  = 128;
        this.height = 128;
        this.vertices = [
            new app.Vec2(-this.width * 0.5, -this.height * 0.5),
            new app.Vec2(this.width * 0.5, -this.height * 0.5),
            new app.Vec2(this.width * 0.5, this.height * 0.5),
            new app.Vec2(-this.width * 0.5, this.height * 0.5)
        ];

        this.timer = 0;
        this.radius = 0;
        this.solid = false;

        // Whether or not this is the checkpoint the player will return to upon death
        this.inUse = false;

        this.textField = new app.TextField();
        this.textField.text = "Check Point";
    };
    Object.defineProperties(CheckPoint, {
        name : {
            value : "CheckPoint"
        },

        id : {
            value : 10001
        },

        PULSE_FREQUENCY : {
            value : 1000
        },

        MIN_RADIUS : {
            value : 32
        },

        MAX_RADIUS : {
            value : 64
        },
        
        ACTIVE_MINIMAP_FILL_STYLE : {
            value : "#99ff66"
        },
        
        MINIMAP_FILL_STYLE : {
            value : "#ffcc66"
        }
    });
    CheckPoint.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);

                this.acceleration.multiply(0);
                this.velocity.multiply(0);
                this.timer += dt;
                this.textField.update(dt);
            }
        },

        draw : {
            value : function (ctx) {
                var percentage = 0;

                ctx.save();
                ctx.lineWidth = 2;

                if (this.inUse) {
                    percentage = (this.timer % CheckPoint.PULSE_FREQUENCY) / CheckPoint.PULSE_FREQUENCY;
                    
                    this.radius = CheckPoint.MIN_RADIUS + Math.sin((1 - percentage) * Math.PI * 2) * (CheckPoint.MAX_RADIUS - CheckPoint.MIN_RADIUS);
                    this.textField.fillStyle = "white";
                    this.textField.strokeStyle = "transparent";
                    ctx.strokeStyle = "white";

                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    this.radius = CheckPoint.MIN_RADIUS + Math.sin(percentage * Math.PI * 2) * (CheckPoint.MAX_RADIUS - CheckPoint.MIN_RADIUS);

                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    percentage = (this.timer % (CheckPoint.PULSE_FREQUENCY * 2)) / (CheckPoint.PULSE_FREQUENCY * 2);
                    this.radius = CheckPoint.MIN_RADIUS + Math.sin(percentage * Math.PI * 2) * (CheckPoint.MAX_RADIUS - CheckPoint.MIN_RADIUS);
                    this.textField.fillStyle = "transparent";
                    this.textField.strokeStyle = "red";
                    ctx.strokeStyle = "red";

                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.restore();

                this.textField.draw(ctx);
            }
        },

        drawOnMinimap : {
            value : function (ctx) {
                var displayRadius = Math.round(this.radius);

                if (this.inUse) {
                    ctx.fillStyle = CheckPoint.ACTIVE_MINIMAP_FILL_STYLE;
                } else {
                    ctx.fillStyle = CheckPoint.MINIMAP_FILL_STYLE;
                }
                
                ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
                
                ctx.beginPath();
                ctx.arc(0, 0, displayRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (physObj === app.main.player) {
                    if (physObj.health !== physObj.maxHealth) {
                        physObj.health = physObj.maxHealth;
                        createjs.Sound.play("se_pickup", {volume : 0.9});
                    }

                    if (app.main.currentLevel.checkPoint !== this) {
                        var gameObjects = app.main.gameObjects;

                        for (var i = 0; i < gameObjects.length; i++) {
                            if (gameObjects[i] instanceof CheckPoint) {
                                gameObjects[i].inUse = false;
                            }
                        }

                        this.inUse = true;
                        app.main.currentLevel.checkPoint = this;
                    }
                }
            }
        },
    }));
    Object.freeze(CheckPoint);


    var Absorber = function () {
        app.PhysicsObject.call(this);

        this.id = Absorber.id;

        this.graphic1 = this.createImageFromSrc(app.IMAGES['absorber_1']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['absorber_2']);
        this.graphic3 = this.createImageFromSrc(app.IMAGES['absorber_3']);
        this.graphic4 = this.createImageFromSrc(app.IMAGES['absorber_4']);

        // Create idle state
        this.idleState = new app.GameObjectState();
        this.idleState.addFrame(new app.FrameObject(this.graphic1, 3));
        this.idleState.addFrame(new app.FrameObject(this.graphic2, 3));
        this.idleState.addFrame(new app.FrameObject(this.graphic3, 3));
        this.idleState.addFrame(new app.FrameObject(this.graphic4, 3));

        // Add states
        this.addState(Absorber.STATE.IDLE, this.idleState);

        this.solid = true;
        this.pullRadius = 300;
        this.pullStrength = 1000;
    };
    Object.defineProperties(Absorber, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Absorber"
        },

        id : {
            value : 499
        }
    });
    Absorber.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);

                this.rotate(0.0025 * dt);
                this.acceleration.multiply(0);
                this.velocity.multiply(0);

                var gameObjs = app.main.gameObjects;

                for (var i = 0; i < gameObjs.length; i++) {
                  var cur = gameObjs[i];

                  if (cur.fixed || cur instanceof app.Expandium) {
                    continue;
                  }

                  var dx = cur.position.x - this.position.x;
                  var dy = cur.position.y - this.position.y;
                  var distSquared = dx * dx + dy * dy;

                  if (distSquared <= this.pullRadius * this.pullRadius) {
                    var pull = 0;
                    var pullForce = null;

                    if (distSquared > 0) {
                      pull = this.pullStrength / distSquared;

                      pullForce = new app.Vec2(-dx, -dy).normalize();
                      pullForce.multiply(pull);

                      cur.addForce(pullForce);
                    }
                  }
                }
            }
        },

        resolveCollision : {
            value : function (physObj) {
              if (physObj.fixed) {
                return;
              }

              if (physObj === app.main.player) {
                app.main.player.health = 0;
              } else {
                app.main.removeGameObject(physObj);
              }
            }
        }
    }));
    Object.freeze(Absorber);


    var Plant1 = function () {
        app.PhysicsObject.call(this);

        this.id = Plant1.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['env_Plants1']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        // Add states
        this.addState(Plant1.STATE.IDLE, this.defaultState);

        this.solid = false;
        this.fixed = true;
    };
    Object.defineProperties(Plant1, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Plant1"
        },

        id : {
            value : 498
        }
    });
    Plant1.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
    }));
    Object.freeze(Plant1);
    
    
    var Plant2 = function () {
        app.PhysicsObject.call(this);

        this.id = Plant2.id;

        // Create default state
        this.graphic1 = this.createImageFromSrc(app.IMAGES['env_Plants2a']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['env_Plants2b']);
        
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 45));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 45));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        // Add states
        this.addState(Plant2.STATE.IDLE, this.defaultState);

        this.solid = false;
        this.fixed = true;
    };
    Object.defineProperties(Plant2, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Plant2"
        },

        id : {
            value : 497
        }
    });
    Plant2.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
    }));
    Object.freeze(Plant2);
    
    
    
    
    var Plant3 = function () {
        app.PhysicsObject.call(this);

        this.id = Plant3.id;

        // Create default state
        this.graphic1 = this.createImageFromSrc(app.IMAGES['env_Plants3a']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['env_Plants3b']);
        
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 45));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 45));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        // Add states
        this.addState(Plant3.STATE.IDLE, this.defaultState);

        this.solid = false;
        this.fixed = true;
    };
    Object.defineProperties(Plant3, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Plant3"
        },

        id : {
            value : 496
        }
    });
    Plant3.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
    }));
    Object.freeze(Plant3);
    
    
    var Plant4 = function () {
        app.PhysicsObject.call(this);

        this.id = Plant4.id;

        // Create default state
        this.graphic1 = this.createImageFromSrc(app.IMAGES['env_Plants4a']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['env_Plants4b']);
        this.graphic3 = this.createImageFromSrc(app.IMAGES['env_Plants4c']);
        this.graphic4 = this.createImageFromSrc(app.IMAGES['env_Plants4d']);
        
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 100));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic4, 60));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 30));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic4, 60));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 15));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        // Add states
        this.addState(Plant4.STATE.IDLE, this.defaultState);

        this.solid = false;
        this.fixed = true;
    };
    Object.defineProperties(Plant4, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Plant4"
        },

        id : {
            value : 495
        }
    });
    Plant4.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
    }));
    Object.freeze(Plant4);
    
    
    var Plant5 = function () {
        app.PhysicsObject.call(this);

        this.id = Plant5.id;

        // Create default state
        this.graphic1 = this.createImageFromSrc(app.IMAGES['env_Plants5a']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['env_Plants5b']);
        this.graphic3 = this.createImageFromSrc(app.IMAGES['env_Plants5c']);
        this.graphic4 = this.createImageFromSrc(app.IMAGES['env_Plants5d']);
        
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 100));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic4, 60));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 30));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic4, 60));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 15));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 15));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        // Add states
        this.addState(Plant5.STATE.IDLE, this.defaultState);

        this.solid = false;
        this.fixed = true;
    };
    Object.defineProperties(Plant5, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Plant5"
        },

        id : {
            value : 494
        }
    });
    Plant5.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
    }));
    Object.freeze(Plant5);

    app.SpawnPoint = SpawnPoint;
    app.CheckPoint = CheckPoint;
    app.Absorber = Absorber;

    app.Plant1 = Plant1;
    app.Plant2 = Plant2;
    app.Plant3 = Plant3;
    app.Plant4 = Plant4;
    app.Plant5 = Plant5;

})();