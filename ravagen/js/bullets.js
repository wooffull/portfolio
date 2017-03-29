"use strict";

var app = app || {};

(function () {

    /**
     * Pulse created from a Ship
     */
    var Pulse = function (damage) {
        if (isNaN(damage) || damage <= 0) {
            damage = 1;
        }

        app.PhysicsObject.call(this);

        this.hitArray = [];
        this.health = Pulse.DEFAULT_MAX_HEALTH;
        this.damage = damage;
        this.age = 0;
        this.lifeTime = Pulse.DEFAULT_MAX_LIFE_TIME;
        this.maxSpeed = Pulse.DEFAULT_MAX_SPEED;
        this.fromEnemy = false;
        this.solid = false;
        
        this.updateVertices();
    };
    Object.defineProperties(Pulse, {
        DEFAULT_MAX_HEALTH : {
            value : Infinity
        },

        DEFAULT_MAX_LIFE_TIME : {
            value : 20
        },

        DEFAULT_SPEED : {
            value : 0
        },

        DEFAULT_MAX_SPEED : {
            value : 1.2
        },
        
        MAX_RADIUS : {
            value : 150
        }
    });
    Pulse.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);
                
                this.position.x = app.main.player.position.x;
                this.position.y = app.main.player.position.y;
                
                var agePercentage = this.age / this.lifeTime;
                this.width = this.height = agePercentage * Pulse.MAX_RADIUS * 2;
                
                this.age++;
                this.updateVertices();

                if (this.age >= this.lifeTime) {
                    app.main.removeGameObject(this);
                }
            }
        },
        
        draw : {
            value : function (ctx) {
                var agePercentage = this.age / this.lifeTime;
            
                ctx.fillStyle = "rgba(150, 150, 255, " + (1 - agePercentage) + ")";
                ctx.beginPath();
                ctx.arc(0, 0, agePercentage * Pulse.MAX_RADIUS, 0, Math.PI * 2, false);
                ctx.arc(0, 0, agePercentage * (Pulse.MAX_RADIUS - 5), 0, Math.PI * 2, true);
                ctx.fill();
            }
        },
        
        updateVertices : {
            value : function() {
                var radius = this.width * 0.5;
                this.vertices = [];
            
                for (var i = 0; i < 20; i++) {
                    var theta = Math.PI * 2 * (i / 20);
                    var x = Math.cos(theta) * radius;
                    var y = Math.sin(theta) * radius;
                    var vert = new app.Vec2(x, y);
                    this.vertices.push(vert);
                }
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (physObj.solid && physObj !== app.main.player && this.hitArray.indexOf(physObj) === -1) {
                    this.hitArray.push(physObj);
                }
            }
        }
    }));
    Object.freeze(Pulse);

    /**
     * Projectiles created from a Ship
     */
    var Bullet = function (damage) {
        if (isNaN(damage) || damage <= 0) {
            damage = 1;
        }

        app.PhysicsObject.call(this);

        // Create default state
        this.graphic1 = this.createImageFromSrc(app.IMAGES['weakBullet_1']);
        this.graphic2 = this.createImageFromSrc(app.IMAGES['weakBullet_2']);
        this.graphic3 = this.createImageFromSrc(app.IMAGES['weakBullet_3']);
        this.graphic4 = this.createImageFromSrc(app.IMAGES['weakBullet_4']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.graphic1, 2));
        this.defaultState.addFrame(new app.FrameObject(this.graphic2, 2));
        this.defaultState.addFrame(new app.FrameObject(this.graphic3, 2));
        this.defaultState.addFrame(new app.FrameObject(this.graphic4, 2));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.health = Bullet.DEFAULT_MAX_HEALTH;
        this.damage = damage;
        this.age = 0;
        this.lifeTime = Bullet.DEFAULT_MAX_LIFE_TIME;
        this.maxSpeed = Bullet.DEFAULT_MAX_SPEED;
        this.fromEnemy = false;
        this.solid = false;
    };
    Object.defineProperties(Bullet, {
        DEFAULT_MAX_HEALTH : {
            value : 1
        },

        DEFAULT_MAX_LIFE_TIME : {
            value : 40
        },

        DEFAULT_SPEED : {
            value : 0.6
        },

        DEFAULT_MAX_SPEED : {
            value : 1.2
        }
    });
    Bullet.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);

                this.age++;

                if (this.age >= this.lifeTime) {
                    app.main.removeGameObject(this);
                }
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (physObj.solid && physObj !== app.main.player) {
                    app.main.removeGameObject(this);
                }
            }
        }
    }));
    Object.freeze(Bullet);

    /**
     * Projectiles created from Ex-Visionists
     */
    var ExVisionistBullet = function (damage) {
        Bullet.call(this, damage);

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['exVisionistBullet']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic, 2));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.setState(app.GameObject.STATE.DEFAULT);
        this.health = ExVisionistBullet.DEFAULT_MAX_HEALTH;
        this.damage = damage;
        this.lifeTime = ExVisionistBullet.DEFAULT_MAX_LIFE_TIME;
        this.maxSpeed = ExVisionistBullet.DEFAULT_MAX_SPEED;
        this.fromEnemy = true;
    };
    Object.defineProperties(ExVisionistBullet, {
        DEFAULT_MAX_HEALTH : {
            value : 1
        },

        DEFAULT_MAX_LIFE_TIME : {
            value : 50
        },

        DEFAULT_SPEED : {
            value : 0.5
        },

        DEFAULT_MAX_SPEED : {
            value : 0.5
        }
    });
    ExVisionistBullet.prototype = Object.freeze(Object.create(Bullet.prototype, {
        resolveCollision : {
            value : function (physObj) {
                if (!(physObj instanceof app.ExVisionist)) {
                    if (physObj.solid) {
                        app.main.removeGameObject(this);
                    }
                }
            }
        }
    }));
    Object.freeze(ExVisionistBullet);

    app.Pulse = Pulse;
    app.Bullet = Bullet;
    app.ExVisionistBullet = ExVisionistBullet;

})();