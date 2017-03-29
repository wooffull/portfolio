"use strict";

var app = app || {};

(function () {

    /**
     * The ship that the player controls throughout the game
     */
    var Ship = function () {
        app.LivingObject.call(this);

        this.health = Ship.DEFAULT_MAX_HEALTH;
        this.maxHealth = Ship.DEFAULT_MAX_HEALTH;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['ship']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [
            new app.Vec2(-w * 0.5, -h * 0.5),
            new app.Vec2(w * 0.5, 0),
            new app.Vec2(-w * 0.5, h * 0.5)
        ];
        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.exhaust = new app.Emitter();
        this.exhaustTimer = 0;
        this.shootTimer = 0;
        this.maxExhaustTimer = Ship.DEFAULT_MAX_EXHAUST_TIMER;
        this.maxShootTimer = Ship.BULLET_MAX_SHOOT_TIMER;
        this.solid = true;
        this.curFrameFixedCollisions = 0;
        this.curFramePillarCollisions = 0;

        this.exhaustSound = createjs.Sound.play("se_exhaust", {volume : Ship.EXHAUST_SOUND_VOLUME, loop : -1});
        this.exhaustSound.paused = true;

        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(Ship, {
        TURN_RATE : {
            value : 0.00375
        },

        BOOST_ACCELERATION : {
            value : 0.00018
        },

        BRAKE_RATE : {
            value : 0.95
        },

        DEFAULT_MAX_EXHAUST_TIMER : {
            value : 10
        },

        BULLET_MAX_SHOOT_TIMER : {
            value : 20
        },

        PULSE_MAX_SHOOT_TIMER : {
            value: 38
        },

        MIN_EXHAUST_ACCELERATION : {
            value : 0.0005
        },

        EXHAUST_SOUND_VOLUME : {
            value : 0.245
        },

        MINIMAP_FILL_STYLE : {
            value : "#86c8d3"
        },

        DEFAULT_MAX_HEALTH : {
            value : 5
        }
    });
    Ship.prototype = Object.freeze(Object.create(app.LivingObject.prototype, {
        update : {
            value : function (dt) {
                app.LivingObject.prototype.update.call(this, dt);

                // Update shoot timer when just shot
                if (this.justShot()) {
                    this.shootTimer++;

                    if (this.shootTimer >= this.maxShootTimer) {
                        this.shootTimer = 0;
                    }
                }

                if (this.acceleration.getMagnitudeSquared() > Ship.MIN_EXHAUST_ACCELERATION * Ship.MIN_EXHAUST_ACCELERATION) {
                    // Add the next particle for the exhaust if we're able to
                    if (this.exhaustTimer === 0) {
                        var particlePosition = this.forward.clone().multiply(-this.graphic.height * 0.5);
                        this.exhaust.addParticle(particlePosition, this.velocity);
                    }

                    if (this.exhaustSound.paused) {
                        this.exhaustSound.paused = false;
                        this.exhaustSound.play();
                    }
                } else {
                    this.exhaustSound.paused = true;
                }

                // Update exhaust timer for when to add the next particle
                this.exhaustTimer += dt;
                if (this.exhaustTimer >= this.maxExhaustTimer) {
                    this.exhaustTimer = 0;
                }

                // Update exhaust particle system
                this.exhaust.update(dt);

                // Collapse & destroy the ship if it's colliding with too many things at once :(
                if (this.curFrameFixedCollisions > 1 && this.curFramePillarCollisions > 0) {
                    this.health = 0;
                } else {
                    // Reset total collisions with fixed objects every frame
                    this.curFrameFixedCollisions = 0;
                    this.curFramePillarCollisions = 0;
                }
            }
        },

        draw : {
            value : function (ctx) {
                app.LivingObject.prototype.draw.call(this, ctx);

                this.exhaust.draw(ctx);
            }
        },

        drawOnMinimap : {
            value : function (ctx) {
                var w = this.width;
                var h = this.height;
                var offsetX = Math.round(-w * 0.5);
                var offsetY = Math.round(-h * 0.5);
                var displayWidth = Math.round(w);
                var displayHeight = Math.round(h);

                ctx.save();

                ctx.fillStyle = Ship.MINIMAP_FILL_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

                ctx.restore();
            }
        },

        shoot : {
            value : function () {
                if (!this.justShot()) {
                    this.shootTimer = 1;
                    this.maxShootTimer = Ship.BULLET_MAX_SHOOT_TIMER;

                    var bullet = new app.Bullet(1);
                    bullet.position.x = this.position.x;
                    bullet.position.y = this.position.y;
                    bullet.velocity.x = this.forward.x;
                    bullet.velocity.y = this.forward.y;
                    bullet.rotate(this.forward.getAngle());
                    bullet.velocity.multiply(app.Bullet.DEFAULT_SPEED);
                    bullet.velocity.add(this.velocity);
                    app.main.gameObjects.push(bullet);

                    createjs.Sound.play("se_shoot", {volume : 0.38});
                }
            }
        },

        pulse : {
            value : function () {
                if (!this.justShot()) {
                    this.shootTimer = 1;
                    this.maxShootTimer = Ship.PULSE_MAX_SHOOT_TIMER;

                    var pulse = new app.Pulse(1);
                    pulse.position.x = this.position.x;
                    pulse.position.y = this.position.y;
                    pulse.rotate(this.forward.getAngle());
                    pulse.velocity.add(this.velocity);
                    app.main.gameObjects.push(pulse);

                    createjs.Sound.play("se_pulse", {volume : 0.38});
                }
            }
        },

        justShot : {
            value : function () {
                return (this.shootTimer > 0);
            }
        },

        brake: {
            value: function (dt) {
                var brakePercentage = Math.min(1, Math.max(0, dt / 1000));
                var brakeMagnitude  = this.maxSpeed * brakePercentage;
                var brakeImpulse    = this.velocity.clone().normalize().multiply(-brakeMagnitude * this.mass);

                this.addImpulse(brakeImpulse);
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (physObj instanceof app.Pickup && !physObj.pickedUp) {
                    if (physObj instanceof app.Expandium) {
                        app.main.onItemPickup(physObj, "Expandium");
                        app.main.removeGameObject(physObj);
                        app.main.currentLevel.collectedExpandium++;
                    } else if (physObj instanceof app.HealthOrb) {
                        app.main.onItemPickup(physObj, "Health Orb");
                        app.main.removeGameObject(physObj);
                        this.heal(1);
                    } else if (physObj instanceof app.PowerUpBullet) {
                        app.main.onItemPickup(physObj, "Bullet Upgrade");
                        app.main.removeGameObject(physObj);
                        app.main.canShootBullet = true;
                    }

                    physObj.pickedUp = true;
                }

                if (physObj.solid || ((physObj instanceof app.Bullet) && (physObj.fromEnemy))) {
                    if (physObj.fixed && (!(physObj instanceof app.Enemy) || (physObj instanceof app.ReachWall))) {
                        this.curFrameFixedCollisions++;
                    }

                    if ((physObj instanceof app.BlockPillar5) || (physObj instanceof app.BlockPillar5R)) {
                        this.curFramePillarCollisions++;
                    }

                    this.takeDamage(1);
                    createjs.Sound.play("se_crash");
                }
            }
        }
    }));
    Object.freeze(Ship);

    app.Ship = Ship;

})();