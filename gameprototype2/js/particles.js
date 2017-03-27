"use strict";

var app = app || {};

(function () {

    /**
     * An Emitter to create particles (EmitterParticle)
     */
    var Emitter = function () {
        app.GameObject.call(this);

        this.particles = [];
        this.angleRange = Emitter.DEFAULT_ANGLE_OFFSET_RANGE;
        this.maxParticles = Emitter.DEFAULT_MAX_PARTICLES;
    };
    Object.defineProperties(Emitter, {
        DEFAULT_ANGLE_OFFSET_RANGE : {
            value : 0.675
        },

        DEFAULT_MAX_PARTICLES : {
            value : 150
        }
    });
    Emitter.prototype = Object.freeze(Object.create(app.GameObject.prototype, {
        addParticle : {
            value : function (position, velocity) {
                // Too many particles, remove the first one
                if (this.particles.length > this.maxParticles) {
                    this.particles.splice(0, 1);
                }

                var angleOffset = Math.random() * this.angleRange - this.angleRange * 0.5;
                var particle = new EmitterParticle();
                particle.position = position.clone();
                particle.velocity = velocity.clone().multiply(-1);
                particle.velocity.rotate(angleOffset);

                // Choose from 2 colors
                var colorIdSelected = Math.floor(Math.random() * 2);
                var r = 0;
                var g = 0;
                var b = 0;

                switch (colorIdSelected) {
                case 0:
                    r = 223;
                    g = 44;
                    b = 56;
                    break;

                case 1:
                    r = 246;
                    g = 110;
                    b = 73;
                    break;
                }

                particle.red = r;
                particle.green = g;
                particle.blue = b;

                this.particles.push(particle);
            }
        },

        update : {
            value : function (dt) {
                for (var i = this.particles.length - 1; i >= 0; i--) {
                    var cur = this.particles[i];

                    cur.update(dt);

                    // Remove the particle when its time is up
                    if (cur.age >= cur.lifeTime) {
                        this.particles.splice(i, 1);
                    }
                }
            }
        },

        draw : {
            value : function (ctx) {
                for (var i = this.particles.length - 1; i >= 0; i--) {
                    this.particles[i].draw(ctx);
                }
            }
        }
    }));
    Object.freeze(Emitter);

    /**
     * Particles to be used by an Emitter
     */
    var EmitterParticle = function () {
        app.PhysicsObject.call(this);

        this.age = 0;
        this.lifeTime = EmitterParticle.DEFAULT_LIFE_TIME;
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.startSize = EmitterParticle.DEFAULT_START_SIZE;
        this.size = this.startSize;
        this.decayRate = EmitterParticle.DEFAULT_DECAY_RATE;
        this.expansionRate = EmitterParticle.DEFAULT_EXPANSION_RATE;
    };
    Object.defineProperties(EmitterParticle, {
        DEFAULT_LIFE_TIME : {
            value : 100
        },

        DEFAULT_START_SIZE : {
            value : 5.0
        },

        DEFAULT_DECAY_RATE : {
            value : 2.35
        },

        DEFAULT_EXPANSION_RATE : {
            value : 0.25
        },

        MAX_ALPHA : {
            value : 1
        }
    });
    EmitterParticle.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                if (this.age < this.lifeTime) {
                    app.PhysicsObject.prototype.update.call(this, dt);

                    this.age += this.decayRate;
                    this.size += this.expansionRate;
                }
            }
        },

        draw : {
            value : function (ctx) {
                var alpha = EmitterParticle.MAX_ALPHA * (1 - this.age / this.lifeTime);

                ctx.save();

                ctx.translate(this.position.x, this.position.y);
                ctx.beginPath();
                ctx.globalAlpha *= alpha;
                ctx.fillStyle = "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
                ctx.rect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
                ctx.fill();

                ctx.restore();
            }
        }
    }));
    Object.freeze(EmitterParticle);

    app.Emitter = Emitter;
    app.EmitterParticle = EmitterParticle;
})();