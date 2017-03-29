"use strict";

var app = app || {};

(function () {

    var Enemy = function () {
        app.LivingObject.call(this);

        this.passive = false;
    };
    Object.defineProperties(Enemy, {
        MINIMAP_AGGRESSIVE_FILL_STYLE : {
            value : "#df2c38"
        },

        MINIMAP_PASSIVE_FILL_STYLE : {
            value : "#55c945"
        }
    });
    Enemy.prototype = Object.freeze(Object.create(app.LivingObject.prototype, {
        drawOnMinimap : {
            value : function (ctx) {
                var w = this.width;
                var h = this.height;
                var offsetX = Math.round(-w * 0.5);
                var offsetY = Math.round(-h * 0.5);
                var displayWidth = Math.round(w);
                var displayHeight = Math.round(h);

                ctx.rotate(this.rotation);

                if (this.passive) {
                    ctx.fillStyle = Enemy.MINIMAP_PASSIVE_FILL_STYLE;
                } else {
                    ctx.fillStyle = Enemy.MINIMAP_AGGRESSIVE_FILL_STYLE;
                }
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (!this.justGotHit()) {
                    var damageTaken = 0;

                    if (physObj instanceof app.Bullet) {
                        if (!physObj.fromEnemy) {
                            this.following = true;
                            damageTaken = physObj.damage;
                        }
                    } else if (physObj instanceof app.Pulse) {
                        if (physObj.hitArray.indexOf(this) === -1) {
                            damageTaken = physObj.damage;
                        }
                    } else if (physObj instanceof app.Ship) {
                        damageTaken = 1;
                    }

                    if (damageTaken > 0) {
                        if (this.health <= damageTaken) {
                            app.main.removeGameObject(this);
                            createjs.Sound.play("se_explosion", {volume : 0.55});
                        } else {
                            createjs.Sound.play("se_crash");
                        }

                        this.takeDamage(damageTaken);
                    }
                }
            }
        }
    }));
    Object.freeze(Enemy);


    var RavageMite = function () {
        Enemy.call(this);

        this.id = RavageMite.id;

        this.graphic1 = this.createImageFromSrc(app.IMAGES['ravageMite_1']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['ravageMite_2']);
        this.graphic3 = this.createImageFromSrc(app.IMAGES['ravageMite_3']);

        // Create idle state
        this.idleState = new app.GameObjectState();
        this.idleState.addFrame(new app.FrameObject(this.graphic1, 20));
        this.idleState.addFrame(new app.FrameObject(this.graphic2, 20));

        // Create chasing state
        this.chasingState = new app.GameObjectState();
        this.chasingState.addFrame(new app.FrameObject(this.graphic1, 20));
        this.chasingState.addFrame(new app.FrameObject(this.graphic2, 15));
        this.chasingState.addFrame(new app.FrameObject(this.graphic3, 7));
        this.chasingState.addFrame(new app.FrameObject(this.graphic2, 7));

        // Add states
        this.addState(RavageMite.STATE.IDLE, this.idleState);
        this.addState(RavageMite.STATE.CHASING, this.chasingState);

        this.rotate(-Math.PI * 0.5);
        this.following = false;
        this.maxSpeed = RavageMite.DEFAULT_MAX_SPEED;
        this.maxAcceleration = RavageMite.DEFAULT_MAX_ACCELERATION;
        this.solid = true;
    };
    Object.defineProperties(RavageMite, {
        STATE : {
            value : {
                IDLE : "IDLE",
                CHASING : "CHASING"
            }
        },

        name : {
            value : "RavageMite"
        },

        id : {
            value : 500
        },

        START_FOLLOWING_DISTANCE : {
            value : 500
        },

        STOP_FOLLOWING_DISTANCE : {
            value : 1200
        },

        DEFAULT_MAX_ACCELERATION : {
            value : 0.01
        },

        DEFAULT_MAX_SPEED : {
            value : 0.125
        },

        BRAKE_RATE : {
            value : 0.9
        }
    });
    RavageMite.prototype = Object.freeze(Object.create(Enemy.prototype, {
        update : {
            value : function (dt) {
                Enemy.prototype.update.call(this, dt);

                var player = app.main.player;

                if (!this.following) {
                    this.setState(RavageMite.STATE.IDLE);

                    this.velocity.multiply(RavageMite.BRAKE_RATE);
                    this.acceleration.multiply(RavageMite.BRAKE_RATE);

                    var tooClose = (app.Vec2.distanceSquared(this.position, player.position) <= RavageMite.START_FOLLOWING_DISTANCE * RavageMite.START_FOLLOWING_DISTANCE);

                    this.following = tooClose;
                }

                // Chase the player if appropriate
                if (this.following) {
                    var tooFar = (app.Vec2.distanceSquared(this.position, player.position) >= RavageMite.STOP_FOLLOWING_DISTANCE * RavageMite.STOP_FOLLOWING_DISTANCE);

                    if (!tooFar) {
                        this.setState(RavageMite.STATE.CHASING);

                        var desiredVelocity = app.Vec2.subtract(player.position, this.position).normalize().multiply(this.maxSpeed);
                        var seekForce = app.Vec2.subtract(desiredVelocity, this.velocity);
                        this.addForce(seekForce);

                        // Adjust forward vector
                        if (this.velocity.getMagnitudeSquared() > 0) {
                            var angleDifference = this.velocity.getAngle() - this.forward.getAngle();
                            this.rotate(angleDifference);
                        }
                    }

                    this.following = !tooFar;
                }
            }
        }
    }));
    Object.freeze(RavageMite);

    var ExVisionist = function () {
        Enemy.call(this);

        this.id = ExVisionist.id;

        this.graphicLeft1 = this.createImageFromSrc(app.IMAGES['exVisionist_left_1']);
        this.graphicLeft2 = this.createImageFromSrc(app.IMAGES['exVisionist_left_2']);
        this.graphicLeft3 = this.createImageFromSrc(app.IMAGES['exVisionist_left_3']);
        this.graphicMiddle1 = this.createImageFromSrc(app.IMAGES['exVisionist_middle_1']);
        this.graphicMiddle2 = this.createImageFromSrc(app.IMAGES['exVisionist_middle_2']);
        this.graphicMiddle3 = this.createImageFromSrc(app.IMAGES['exVisionist_middle_3']);
        this.graphicRight1 = this.createImageFromSrc(app.IMAGES['exVisionist_right_1']);
        this.graphicRight2 = this.createImageFromSrc(app.IMAGES['exVisionist_right_2']);
        this.graphicRight3 = this.createImageFromSrc(app.IMAGES['exVisionist_right_3']);
        this.graphicAggrLeft1 = this.createImageFromSrc(app.IMAGES['exVisionist_aggr_left_1']);
        this.graphicAggrMiddle1 = this.createImageFromSrc(app.IMAGES['exVisionist_aggr_middle_1']);
        this.graphicAggrRight1 = this.createImageFromSrc(app.IMAGES['exVisionist_aggr_right_1']);

        // Create left passive state
        this.leftPassiveState = new app.GameObjectState();
        this.leftPassiveState.addFrame(new app.FrameObject(this.graphicLeft1, 120));
        this.leftPassiveState.addFrame(new app.FrameObject(this.graphicLeft2, 2));
        this.leftPassiveState.addFrame(new app.FrameObject(this.graphicLeft3, 2));
        this.leftPassiveState.addFrame(new app.FrameObject(this.graphicLeft2, 2));

        // Create middle passive state
        this.middlePassiveState = new app.GameObjectState();
        this.middlePassiveState.addFrame(new app.FrameObject(this.graphicMiddle1, 120));
        this.middlePassiveState.addFrame(new app.FrameObject(this.graphicMiddle2, 2));
        this.middlePassiveState.addFrame(new app.FrameObject(this.graphicMiddle3, 2));
        this.middlePassiveState.addFrame(new app.FrameObject(this.graphicMiddle2, 2));

        // Create right passive state
        this.rightPassiveState = new app.GameObjectState();
        this.rightPassiveState.addFrame(new app.FrameObject(this.graphicRight1, 120));
        this.rightPassiveState.addFrame(new app.FrameObject(this.graphicRight2, 2));
        this.rightPassiveState.addFrame(new app.FrameObject(this.graphicRight3, 2));
        this.rightPassiveState.addFrame(new app.FrameObject(this.graphicRight2, 2));

        // Create left aggressive state
        this.leftAggressiveState = new app.GameObjectState();
        this.leftAggressiveState.addFrame(new app.FrameObject(this.graphicAggrLeft1, 120));
        this.leftAggressiveState.addFrame(new app.FrameObject(this.graphicLeft2, 2));
        this.leftAggressiveState.addFrame(new app.FrameObject(this.graphicLeft3, 2));
        this.leftAggressiveState.addFrame(new app.FrameObject(this.graphicLeft2, 2));

        // Create middle aggressive state
        this.middleAggressiveState = new app.GameObjectState();
        this.middleAggressiveState.addFrame(new app.FrameObject(this.graphicAggrMiddle1, 120));
        this.middleAggressiveState.addFrame(new app.FrameObject(this.graphicMiddle2, 2));
        this.middleAggressiveState.addFrame(new app.FrameObject(this.graphicMiddle3, 2));
        this.middleAggressiveState.addFrame(new app.FrameObject(this.graphicMiddle2, 2));

        // Create right aggressive state
        this.rightAggressiveState = new app.GameObjectState();
        this.rightAggressiveState.addFrame(new app.FrameObject(this.graphicAggrRight1, 120));
        this.rightAggressiveState.addFrame(new app.FrameObject(this.graphicRight2, 2));
        this.rightAggressiveState.addFrame(new app.FrameObject(this.graphicRight3, 2));
        this.rightAggressiveState.addFrame(new app.FrameObject(this.graphicRight2, 2));

        // Add states
        this.addState(ExVisionist.STATE.PASSIVE_MIDDLE, this.middlePassiveState);
        this.addState(ExVisionist.STATE.PASSIVE_LEFT, this.leftPassiveState);
        this.addState(ExVisionist.STATE.PASSIVE_RIGHT, this.rightPassiveState);
        this.addState(ExVisionist.STATE.AGGRESSIVE_MIDDLE, this.middleAggressiveState);
        this.addState(ExVisionist.STATE.AGGRESSIVE_LEFT, this.leftAggressiveState);
        this.addState(ExVisionist.STATE.AGGRESSIVE_RIGHT, this.rightAggressiveState);

        this.shootTimer = 0;
        this.health = ExVisionist.DEFAULT_MAX_HEALTH;
        this.maxShootTimer = ExVisionist.DEFAULT_MAX_SHOOT_TIMER;
        this.maxHealth = ExVisionist.DEFAULT_MAX_HEALTH;
        this.fixed = true;
        this.passive = true;
    };
    Object.defineProperties(ExVisionist, {
        STATE : {
            value : {
                PASSIVE_LEFT : "PASSIVE_LEFT",
                PASSIVE_MIDDLE : "PASSIVE_MIDDLE",
                PASSIVE_RIGHT : "PASSIVE_RIGHT",
                AGGRESSIVE_LEFT : "AGGRESSIVE_LEFT",
                AGGRESSIVE_MIDDLE : "AGGRESSIVE_MIDDLE",
                AGGRESSIVE_RIGHT : "AGGRESSIVE_RIGHT"
            }
        },

        name : {
            value : "ExVisionist"
        },

        id : {
            value : 501
        },

        LOOK_DIRECTION : {
            value : {
                LEFT : "LEFT",
                MIDDLE : "MIDDLE",
                RIGHT : "RIGHT"
            }
        },

        DEFAULT_MAX_HEALTH : {
            value : 3
        },

        DEFAULT_MAX_SHOOT_TIMER : {
            value : 100
        },

        BULLET_SPRAY_AMOUNT : {
            value : 8
        }
    });
    ExVisionist.prototype = Object.freeze(Object.create(Enemy.prototype, {
        update : {
            value : function (dt) {
                Enemy.prototype.update.call(this, dt);

                // If the player hit the Ex-Visionist, it becomes aggressive!
                if (this.health < this.maxHealth) {
                    this.passive = false;
                }

                if (!this.passive) {
                    // Update shoot timer when just shot
                    if (this.justShot()) {
                        this.shootTimer++;

                        if (this.shootTimer >= this.maxShootTimer) {
                            this.shootTimer = 0;
                        }
                    } else {
                        this.shoot();
                    }
                }

                var player = app.main.player;
                var displacement = app.Vec2.subtract(player.position, this.position);
                var angle = displacement.getAngle();

                // Player is to the right
                if (angle > -Math.PI * 0.25 && angle < Math.PI * 0.25) {
                    this.setLookDirection(ExVisionist.LOOK_DIRECTION.RIGHT);

                // Player is to the left
                } else if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) {
                    this.setLookDirection(ExVisionist.LOOK_DIRECTION.LEFT);

                // Player is above or below
                } else {
                    this.setLookDirection(ExVisionist.LOOK_DIRECTION.MIDDLE);
                }
            }
        },

        shoot : {
            value : function () {
                if (!this.justShot()) {
                    this.shootTimer = 1;

                    // Get the angle offset between the player and the Ex-Visionist
                    // Use this angle to aim the Ex-Visionist's bullets at the player
                    // (One of the bullets will aim directly at the player)
                    var player = app.main.player;
                    var displacement = app.Vec2.subtract(player.position, this.position);
                    var angleOffset = displacement.getAngle();

                    for (var i = 0; i < ExVisionist.BULLET_SPRAY_AMOUNT; i++) {
                        var angle = angleOffset + 2 * Math.PI * (i / ExVisionist.BULLET_SPRAY_AMOUNT);

                        var bulletVelocityX = Math.cos(angle) * app.ExVisionistBullet.DEFAULT_SPEED;
                        var bulletVelocityY = Math.sin(angle) * app.ExVisionistBullet.DEFAULT_SPEED;

                        var bullet = new app.ExVisionistBullet(1);
                        bullet.position.x = this.position.x;
                        bullet.position.y = this.position.y;
                        bullet.velocity.x = bulletVelocityX;
                        bullet.velocity.y = bulletVelocityY;
                        bullet.velocity.add(this.velocity);
                        bullet.rotate(angle);
                        app.main.gameObjects.push(bullet);
                    }
                }
            }
        },

        justShot : {
            value : function () {
                return (this.shootTimer > 0);
            }
        },

        setLookDirection : {
            value : function (value) {
                var state;

                switch (value) {
                case ExVisionist.LOOK_DIRECTION.LEFT:
                    if (this.passive) {
                        state = ExVisionist.STATE.PASSIVE_LEFT;
                    } else {
                        state = ExVisionist.STATE.AGGRESSIVE_LEFT;
                    }
                    break;

                case ExVisionist.LOOK_DIRECTION.MIDDLE:
                    if (this.passive) {
                        state = ExVisionist.STATE.PASSIVE_MIDDLE;
                    } else {
                        state = ExVisionist.STATE.AGGRESSIVE_MIDDLE;
                    }
                    break;

                case ExVisionist.LOOK_DIRECTION.RIGHT:
                    if (this.passive) {
                        state = ExVisionist.STATE.PASSIVE_RIGHT;
                    } else {
                        state = ExVisionist.STATE.AGGRESSIVE_RIGHT;
                    }
                    break;

                default:
                    state = ExVisionist.STATE.PASSIVE_MIDDLE;
                }

                if (this.currentState.name !== state) {
                    var curOffset = this.currentState.getFrame();
                    this.setState(state);
                    this.currentState.setFrame(curOffset);
                }
            }
        }
    }));
    Object.freeze(ExVisionist);

    var Drainer = function () {
        Enemy.call(this);

        this.id = Drainer.id;

        this.graphic1 = this.createImageFromSrc(app.IMAGES['drainer_1']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['drainer_2']);

        // Create idle state
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 35));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 5));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 5));

        // Add states
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.rotate(-Math.PI * 0.5);
        this.solid = true;
        this.fixed = true;
    };
    Object.defineProperties(Drainer, {
        STATE : {
            value : {
                IDLE : "IDLE"
            }
        },

        name : {
            value : "Drainer"
        },

        id : {
            value : 502
        }
    });
    Drainer.prototype = Object.freeze(Object.create(Enemy.prototype, {

    }));
    Object.freeze(Drainer);


    var ReachWall = function () {
        Enemy.call(this);

        this.id = ReachWall.id;

        this.graphic1 = this.createImageFromSrc(app.IMAGES['reflict']);

        var w = this.graphic1.width;
        var h = this.graphic1.height;
        this.verts = [];

        // Create bounding "circle" for health orb
        var boundingCircleQuality = 8;
        for (var i = 0; i < boundingCircleQuality; i++) {
            var angle = 2 * Math.PI * i / boundingCircleQuality;
            var x = Math.cos(angle) * w * 0.5;
            var y = Math.sin(angle) * h * 0.5;
            this.verts.push(new app.Vec2(x, y));
        }

        var frameObj = new app.FrameObject(this.graphic1, 1, false);
        frameObj.vertices = this.verts;

        // Create idle state
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);

        // Create arm stretched state which is used in _findWalls()
        this.armStretchedState = new app.GameObjectState();

        // Add states
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.rotate(-Math.PI * 0.5);
        this.solid = true;
        this.fixed = true;
        this.right = new app.Vec2(-this.forward.y, this.forward.x).normalize();
        this.foundWalls = false;
        this.leftWall = null;
        this.rightWall = null;
        this.drawOffset = new app.Vec2();
        this.reachLength = 0;
    };
    Object.defineProperties(ReachWall, {
        STATE : {
            value : {
                STRETCHED: "STRETCHED"
            }
        },

        name : {
            value : "ReachWall"
        },

        id : {
            value : 503
        }
    });
    ReachWall.prototype = Object.freeze(Object.create(Enemy.prototype, {
        init : {
            value : function () {
                this._findWalls();
                
                if (this.leftWall && this.rightWall) {
                    var armDist = app.Vec2.subtract(this.rightWall.position, this.leftWall.position);
                    this.reachLength = armDist.getMagnitude();
                }
            }
        },
    
        update : {
            value : function (dt) {
                Enemy.prototype.update.call(this, dt);

                this.height = this.reachLength;
            }
        },

        draw : {
            value : function (ctx) {
                if (this.reachLength > 0) {
                    var displacement = app.Vec2.subtract(this.leftWall.position, this.position);

                    ctx.save();
                    ctx.translate(displacement.x, displacement.y);
                    ctx.rotate(this.rotation);
                    ctx.fillStyle = "#446671";
                    ctx.fillRect(-10, 0, 20, this.reachLength);
                    ctx.restore();
                }

                ctx.translate(this.drawOffset.x, this.drawOffset.y);

                Enemy.prototype.draw.call(this, ctx);
            }
        },

        drawDebug : {
            value : function (ctx) {
                Enemy.prototype.drawDebug.call(this, ctx);

                if (this.reachLength > 0) {
                    var wallSize = 100;

                    if (this.leftWall)  wallSize = this.leftWall.width;
                    if (this.rightWall) wallSize = this.rightWall.width;

                    ctx.strokeStyle = "white";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.lineWidth = 5;

                    if (this.leftWall) {
                        var vecToLeft  = this.leftWall.position.clone().subtract(this.position);
                        ctx.strokeRect(vecToLeft.x - wallSize * 0.5, vecToLeft.y - wallSize * 0.5, wallSize, wallSize);
                    }

                    if (this.rightWall) {
                        var vecToRight = this.rightWall.position.clone().subtract(this.position);
                        ctx.strokeRect(vecToRight.x - wallSize * 0.5, vecToRight.y - wallSize * 0.5, wallSize, wallSize);
                    }
                }
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (!this.justGotHit()) {
                    var damageTaken = 0;

                    if (physObj instanceof app.Bullet) {
                        if (!physObj.fromEnemy) {
                            // Only take damage if the bullet hits the "head" of the ReachWall
                            if (app.Vec2.subtract(this.position.clone().add(this.drawOffset), physObj.position).getMagnitudeSquared() > 64 * 64) {
                                return;
                            }

                            this.following = true;
                            damageTaken = physObj.damage;
                        }
                    }

                    if (damageTaken > 0) {
                        if (this.health <= damageTaken) {
                            app.main.removeGameObject(this);
                            createjs.Sound.play("se_explosion", {volume : 0.55});
                        } else {
                            createjs.Sound.play("se_crash");
                        }

                        this.takeDamage(damageTaken);
                    }
                }
            }
        },

        _findWalls : {
            value : function () {
                this.right = new app.Vec2(-this.forward.y, this.forward.x).normalize();

                var gameObjects  = app.main.gameObjects;
                var leftWall     = null;
                var rightWall    = null;
                var minLeftDist  = Infinity;
                var minRightDist = Infinity;
                var left         = this.right.clone().rotate(Math.PI).normalize();
                var right        = this.right.clone();

                for (var i = 0; i < gameObjects.length; i++) {
                    var cur = gameObjects[i];

                    for (var j = 0; j < cur.vertices.length; j++) {
                        if (cur instanceof ReachWall || cur instanceof app.BlockPillar5 || cur instanceof app.BlockPillar5R) continue;

                        var v0 = cur.vertices[j].clone().add(cur.position).subtract(this.position);
                        var v1 = cur.vertices[(j + 1) % cur.vertices.length].clone().add(cur.position).subtract(this.position);
                        var dist = app.Vec2.distanceSquared(this.position, cur.position);

                        var xProd0Left = v0.x * v1.y - v0.y * v1.x;
                        var xProd1Left = v0.x * left.y - v0.y * left.x;
                        var xProd2Left = left.x * v1.y - left.y * v1.x;
                        var toTheLeft  = (xProd0Left < 0 && xProd1Left < 0 && xProd2Left < 0) ||
                                         (xProd0Left > 0 && xProd1Left > 0 && xProd2Left > 0) ||
                                         (xProd0Left === 0 && xProd1Left === 0 && xProd2Left === 0);

                        var xProd0Right = v0.x * v1.y - v0.y * v1.x;
                        var xProd1Right = v0.x * right.y - v0.y * right.x;
                        var xProd2Right = right.x * v1.y - right.y * v1.x;
                        var toTheRight  = (xProd0Right < 0 && xProd1Right < 0 && xProd2Right < 0) ||
                                          (xProd0Right > 0 && xProd1Right > 0 && xProd2Right > 0) ||
                                          (xProd0Right === 0 && xProd1Right === 0 && xProd2Right === 0);


                        if (toTheLeft) {
                            if (leftWall) {
                                if (dist < minLeftDist) {
                                    minLeftDist = dist;
                                    leftWall = cur;
                                }
                            } else {
                                leftWall = cur;
                            }
                        } else if (toTheRight) {
                            if (rightWall) {
                                if (dist < minRightDist) {
                                    minRightDist = dist;
                                    rightWall = cur;
                                }
                            } else {
                                rightWall = cur;
                            }
                        }
                    }
                }

                this.leftWall = leftWall;
                this.rightWall = rightWall;
                
                if (!this.leftWall || !this.rightWall) {
                    return;
                }

                // Create bounding "circle" for wall's head
                var w = this.graphic1.width;
                var h = this.graphic1.height;
                this.verts = [];
                var boundingCircleQuality = 8;
                var i = 0;
                for (i; i < 3; i++) {
                    var angle = 2 * Math.PI * (i - 5) / boundingCircleQuality + this.rotation;
                    var x = Math.cos(angle) * w * 0.5;
                    var y = Math.sin(angle) * h * 0.5;
                    this.verts.push(new app.Vec2(x, y));
                }

                var displacement = app.Vec2.subtract(this.leftWall.position, this.position);
                var armDist = app.Vec2.subtract(this.rightWall.position, this.leftWall.position);
                var midPoint = this.leftWall.position.clone().add(armDist.clone().multiply(0.5));

                this.drawOffset = this.position.clone().subtract(midPoint);
                this.position = midPoint;

                this.verts.push(new app.Vec2(-w * 0.5, 5).rotate(this.rotation + Math.PI * 0.5));
                this.verts.push(displacement.clone().subtract(this.forward.clone().multiply(5)));
                this.verts.push(displacement.clone().add(this.forward.clone().multiply(5)));
                this.verts.push(new app.Vec2(-w * 0.5, -5).rotate(this.rotation + Math.PI * 0.5));

                i++;

                for (i; i < 7; i++) {
                    var angle = 2 * Math.PI * (i - 5) / boundingCircleQuality + this.rotation;
                    var x = Math.cos(angle) * w * 0.5;
                    var y = Math.sin(angle) * h * 0.5;
                    this.verts.push(new app.Vec2(x, y));
                }

                this.verts.push(new app.Vec2(w * 0.5, -5).rotate(this.rotation + Math.PI * 0.5));
                this.verts.push(displacement.clone().add(armDist).add(this.forward.clone().multiply(5)));
                this.verts.push(displacement.clone().add(armDist).subtract(this.forward.clone().multiply(5)));
                this.verts.push(new app.Vec2(w * 0.5, 5).rotate(this.rotation + Math.PI * 0.5));

                for (var i = 0; i < this.verts.length; i++) {
                    this.verts[i].add(this.drawOffset);
                }

                var frameObj = new app.FrameObject(this.graphic1, 1, false);
                frameObj.vertices = this.verts;

                // Finish creating arm stretched state
                this.armStretchedState.addFrame(frameObj);
                this.addState(ReachWall.STATE.STRETCHED, this.armStretchedState);
                this.setState(ReachWall.STATE.STRETCHED);

                this.height = armDist.getMagnitude();
            }
        }
    }));
    Object.freeze(ReachWall);



    var WallGel = function () {
        Enemy.call(this);

        this.id = WallGel.id;

        this.graphic1 = this.createImageFromSrc(app.IMAGES['wallGel_1a']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['wallGel_1b']);
        this.graphic3 = this.createImageFromSrc(app.IMAGES['wallGel_2']);

        // Create flying state
        this.flyingState = new app.GameObjectState();
        this.flyingState.addFrame(new app.FrameObject(this.graphic1, 3));
        this.flyingState.addFrame(new app.FrameObject(this.graphic2, 3));

        // Create chasing state
        this.bouncingState = new app.GameObjectState();
        this.bouncingState.addFrame(new app.FrameObject(this.graphic3));

        // Add states
        this.addState(WallGel.STATE.FLYING, this.flyingState);
        this.addState(WallGel.STATE.BOUNCING, this.bouncingState);

        this.rotate(-Math.PI * 0.5);
        this.solid = true;
        this.bounceTimer = 0;
        this.health = WallGel.DEFAULT_MAX_HEALTH;
        this.maxHealth = WallGel.DEFAULT_MAX_HEALTH;
    };
    Object.defineProperties(WallGel, {
        STATE : {
            value : {
                FLYING : "FLYING",
                BOUNCING : "BOUNCING"
            }
        },

        name : {
            value : "WallGel"
        },

        id : {
            value : 504
        },

        MAX_BOUNCE_TIME : {
            value : 12
        },

        DEFAULT_MAX_HEALTH : {
            value : 3
        },

        FLY_SPEED : {
            value : 5
        }
    });
    WallGel.prototype = Object.freeze(Object.create(Enemy.prototype, {
        update : {
            value : function (dt) {
                this.handleState();

                Enemy.prototype.update.call(this, dt);
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (physObj.solid && this.currentState.name === WallGel.STATE.FLYING) {
                    this.position.subtract(this.velocity);
                    this.rotate(Math.PI);
                    this.setState(WallGel.STATE.BOUNCING);
                }

                Enemy.prototype.resolveCollision.call(this, physObj);
            }
        },

        handleState : {
            value : function () {
                switch (this.currentState.name) {
                case WallGel.STATE.FLYING:
                    this.addImpulse(this.forward.clone().multiply(WallGel.FLY_SPEED * this.mass));
                    break;

                case WallGel.STATE.BOUNCING:
                    this.bounceTimer++;
                    this.velocity.multiply(0);

                    if (this.bounceTimer >= WallGel.MAX_BOUNCE_TIME) {
                        this.bounceTimer = 0;
                        this.setState(WallGel.STATE.FLYING);
                        this.addImpulse(this.forward.clone().multiply(WallGel.FLY_SPEED * this.mass));
                    }
                    break;
                }
            }
        },
    }));
    Object.freeze(WallGel);

    app.Enemy = Enemy;
    app.RavageMite = RavageMite;
    app.ExVisionist = ExVisionist;
    app.Drainer = Drainer;
    app.ReachWall = ReachWall;
    app.WallGel = WallGel;

})();