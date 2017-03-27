"use strict";

var app = app || {};

(function () {

    var Pickup = function () {
        app.PhysicsObject.call(this);

        this.pickedUp = false;
    };
    Pickup.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {

    }));
    Object.freeze(Pickup);

    var Expandium = function () {
        Pickup.call(this);

        this.id = Expandium.id;

        this.ringGraphic = this.createImageFromSrc(app.IMAGES['expandiumRing']);
        this.ringRotation = 0;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['expandiumOrb']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [];

        // Create bounding "circle" for health orb
        var boundingCircleQuality = 8;
        for (var i = 0; i < boundingCircleQuality; i++) {
            var angle = 2 * Math.PI * i / boundingCircleQuality;
            var x = Math.cos(angle) * w * 0.5;
            var y = Math.sin(angle) * h * 0.5;
            verts.push(new app.Vec2(x, y));
        }

        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = false;
    };
    Object.defineProperties(Expandium, {
        name : {
            value : "Expandium"
        },

        id : {
            value : 1000
        },

        RING_ROTATION_SPEED : {
            value : 0.015
        },

        MINIMAP_FILL_STYLE : {
            value : "white"
        }
    });
    Expandium.prototype = Object.freeze(Object.create(Pickup.prototype, {
        update : {
            value : function (dt) {
                Pickup.prototype.update.call(this, dt);

                this.ringRotation += Expandium.RING_ROTATION_SPEED;
            }
        },

        draw : {
            value : function (ctx) {
                ctx.save();

                ctx.drawImage(this.graphic, -this.graphic.width * 0.5, -this.graphic.height * 0.5);

                ctx.rotate(this.ringRotation);
                ctx.drawImage(this.ringGraphic, -this.ringGraphic.width * 0.5, -this.ringGraphic.height * 0.5);

                ctx.restore();
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

                ctx.fillStyle = Expandium.MINIMAP_FILL_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

                ctx.restore();
            }
        }
    }));
    Object.freeze(Expandium);

    var HealthOrb = function () {
        Pickup.call(this);

        this.id = HealthOrb.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['healthOrbFull']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [];

        // Create bounding "circle" for health orb
        var boundingCircleQuality = 8;
        for (var i = 0; i < boundingCircleQuality; i++) {
            var angle = 2 * Math.PI * i / boundingCircleQuality;
            var x = Math.cos(angle) * w * 0.5;
            var y = Math.sin(angle) * h * 0.5;
            verts.push(new app.Vec2(x, y));
        }

        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = false;
    };
    Object.defineProperties(HealthOrb, {
        name : {
            value : "HealthOrb"
        },

        id : {
            value : 1001
        },

        MINIMAP_FILL_STYLE : {
            value : "#ffaf6e"
        }
    });
    HealthOrb.prototype = Object.freeze(Object.create(Pickup.prototype, {
        drawOnMinimap : {
            value : function (ctx) {
                var w = this.width;
                var h = this.height;
                var offsetX = Math.round(-w * 0.5);
                var offsetY = Math.round(-h * 0.5);
                var displayWidth = Math.round(w);
                var displayHeight = Math.round(h);

                ctx.save();

                ctx.fillStyle = HealthOrb.MINIMAP_FILL_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

                ctx.restore();
            }
        }
    }));
    Object.freeze(HealthOrb);
    
    
    var PowerUpBullet = function () {
        Pickup.call(this);

        this.id = PowerUpBullet.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['powerUpBullet']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [];

        // Create bounding "circle" for health orb
        var boundingCircleQuality = 8;
        for (var i = 0; i < boundingCircleQuality; i++) {
            var angle = 2 * Math.PI * i / boundingCircleQuality;
            var x = Math.cos(angle) * w * 0.5;
            var y = Math.sin(angle) * h * 0.5;
            verts.push(new app.Vec2(x, y));
        }

        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = false;
    };
    Object.defineProperties(PowerUpBullet, {
        name : {
            value : "PowerUpBullet"
        },

        id : {
            value : 1002
        },

        MINIMAP_FILL_STYLE : {
            value : "#fff"
        }
    });
    PowerUpBullet.prototype = Object.freeze(Object.create(Pickup.prototype, {
        drawOnMinimap : {
            value : function (ctx) {
                var w = this.width;
                var h = this.height;
                var offsetX = Math.round(-w * 0.5);
                var offsetY = Math.round(-h * 0.5);
                var displayWidth = Math.round(w);
                var displayHeight = Math.round(h);

                ctx.save();

                ctx.fillStyle = PowerUpBullet.MINIMAP_FILL_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

                ctx.restore();
            }
        }
    }));
    Object.freeze(PowerUpBullet);

    app.Pickup = Pickup;
    app.Expandium = Expandium;
    app.HealthOrb = HealthOrb;
    app.PowerUpBullet = PowerUpBullet;

})();