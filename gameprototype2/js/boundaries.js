"use strict";

var app = app || {};

(function () {

    /**
     * A full-sized, quadrilateral block
     */
    var FullBlock = function () {
        app.PhysicsObject.call(this);

        this.id = FullBlock.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['fullBlock']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(FullBlock, {
        name : {
            value : "FullBlock"
        },

        id : {
            value : 0
        }
    });
    FullBlock.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        drawOnMinimap : {
            value : function (ctx) {
                var displayWidth = (this.width + 0.5) | 0;
                var displayHeight = (this.height + 0.5) | 0;
                var offsetX = (0.5 - (this.width >> 1)) | 0;
                var offsetY = (0.5 - (this.height >> 1)) | 0;

                ctx.rotate(this.rotation);
                ctx.fillStyle = app.PhysicsObject.MINIMAP_FILL_STYLE;
                ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);
                ctx.strokeRect(offsetX, offsetY, displayWidth, displayHeight);
            }
        }
    }));
    Object.freeze(FullBlock);


    /**
     * A full-sized, quadrilateral block
     */
    var FullBlock2 = function () {
        app.PhysicsObject.call(this);

        this.id = FullBlock2.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['fullBlock2']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(FullBlock2, {
        name : {
            value : "FullBlock2"
        },

        id : {
            value : 2
        }
    });
    FullBlock2.prototype = FullBlock.prototype;
    Object.freeze(FullBlock2);



    /**
     * A full-sized, quadrilateral block
     */
    var FullBlock3 = function () {
        app.PhysicsObject.call(this);

        this.id = FullBlock3.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['fullBlock3']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(FullBlock3, {
        name : {
            value : "FullBlock3"
        },

        id : {
            value : 50
        }
    });
    FullBlock3.prototype = FullBlock.prototype;
    Object.freeze(FullBlock3);

    /**
     * A full-sized, quadrilateral block
     */
    var FullBlock4 = function () {
        app.PhysicsObject.call(this);

        this.id = FullBlock4.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['fullBlock4']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(FullBlock4, {
        name : {
            value : "FullBlock4"
        },

        id : {
            value : 52
        }
    });
    FullBlock4.prototype = FullBlock.prototype;
    Object.freeze(FullBlock4);

    /**
     * A half-sized, triangular block
     */
    var HalfBlock = function () {
        app.PhysicsObject.call(this);

        this.id = HalfBlock.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['halfBlock']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [
            new app.Vec2(-w * 0.5, -h * 0.5),
            new app.Vec2(w * 0.5, -h * 0.5),
            new app.Vec2(-w * 0.5, h * 0.5)
        ];
        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(HalfBlock, {
        name : {
            value : "HalfBlock"
        },

        id : {
            value : 1
        }
    });
    HalfBlock.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        drawOnMinimap : {
            value : function (ctx) {
                var offsetX = (-(this.width >> 1) + 0.5) | 0;
                var offsetY = (-(this.height >> 1) + 0.5) | 0;

                ctx.rotate(this.rotation);
                ctx.fillStyle = app.PhysicsObject.MINIMAP_FILL_STYLE;
                //ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
                ctx.lineTo(-offsetX, offsetY);
                ctx.lineTo(offsetX, -offsetY);
                ctx.closePath();
                ctx.fill();
                //ctx.stroke();
            }
        }
    }));
    Object.freeze(HalfBlock);


    /**
     * A half-sized, triangular block
     */
    var HalfBlock2 = function () {
        app.PhysicsObject.call(this);

        this.id = HalfBlock2.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['halfBlock2']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [
            new app.Vec2(-w * 0.5, -h * 0.5),
            new app.Vec2(w * 0.5, -h * 0.5),
            new app.Vec2(-w * 0.5, h * 0.5)
        ];
        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(HalfBlock2, {
        name : {
            value : "HalfBlock2"
        },

        id : {
            value : 3
        }
    });
    HalfBlock2.prototype = HalfBlock.prototype;
    Object.freeze(HalfBlock2);

    /**
     * A half-sized, triangular block
     */
    var HalfBlock3 = function () {
        app.PhysicsObject.call(this);

        this.id = HalfBlock3.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['halfBlock3']);

        var w = this.defaultGraphic.width;
        var h = this.defaultGraphic.height;
        var verts = [
            new app.Vec2(-w * 0.5, -h * 0.5),
            new app.Vec2(w * 0.5, -h * 0.5),
            new app.Vec2(-w * 0.5, h * 0.5)
        ];
        var frameObj = new app.FrameObject(this.defaultGraphic, 1, false);
        frameObj.vertices = verts;

        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(frameObj);
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(HalfBlock3, {
        name : {
            value : "HalfBlock3"
        },

        id : {
            value : 51
        }
    });
    HalfBlock3.prototype = HalfBlock.prototype;
    Object.freeze(HalfBlock3);

    /**
     * A 5-block pillar made out of blocks
     */
    var BlockPillar5 = function () {
        app.PhysicsObject.call(this);

        this.id = BlockPillar5.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['blockPillar']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(BlockPillar5, {
        name : {
            value : "BlockPillar5"
        },

        ROTATION_SPEED : {
            value : Math.PI * 0.0002
        },

        id : {
            value : 4
        }
    });
    BlockPillar5.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                this.rotate(BlockPillar5.ROTATION_SPEED * dt);

                app.PhysicsObject.prototype.update.call(this, dt);
            }
        },

        drawOnMinimap : {
            value : function (ctx) {
                var offsetX = Math.round(-this.width * 0.5);
                var offsetY = Math.round(-this.height * 0.5);
                var displayWidth = Math.round(this.width);
                var displayHeight = Math.round(this.height);

                ctx.rotate(this.rotation);
                ctx.fillStyle = app.PhysicsObject.MINIMAP_FILL_STYLE;
                ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);
                ctx.strokeRect(offsetX, offsetY, displayWidth, displayHeight);
            }
        }
    }));
    Object.freeze(BlockPillar5);

    var BlockPillar5R = function () {
        app.PhysicsObject.call(this);

        this.id = BlockPillar5R.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['blockPillarR']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
    };
    Object.defineProperties(BlockPillar5R, {
        name : {
            value : "BlockPillar5R"
        },

        id : {
            value : 5
        }
    });
    BlockPillar5R.prototype = Object.freeze(Object.create(BlockPillar5.prototype, {
        update : {
            value : function (dt) {
                this.rotate(-BlockPillar5.ROTATION_SPEED * dt);

                app.PhysicsObject.prototype.update.call(this, dt);
            }
        }
    }));
    Object.freeze(BlockPillar5R);

    /**
     * Once the player has connected enough expandium, the NeedBlock goes away
     */
    var NeedBlock = function (needed) {
        app.PhysicsObject.call(this);

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['fullBlock']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
        this.needed = needed;

        this.textField = new app.TextField();
        this.textField.text = "< " + 0 + " / " + needed + " >";

        this.expandiumGraphic = this.createImageFromSrc(app.IMAGES['expandiumOrb']);
    };
    Object.defineProperties(NeedBlock, {
        MINIMAP_FILL_STYLE : {
            value : "#999999"
        }
    });
    NeedBlock.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);

                var curLevel = app.main.currentLevel;
                var collected = curLevel.collectedExpandium;
                var needed = this.needed;

                this.textField.update(dt);
                this.textField.text = "< " + collected + " / " + needed + " >";

                if (collected >= needed) {
                    app.main.removeGameObject(this);
                }
            }
        },

        draw : {
            value : function (ctx) {
                app.PhysicsObject.prototype.draw.call(this, ctx);

                var w = this.graphic.width;
                var h = this.graphic.height;
                var offsetX = w * 0.375;
                var offsetY = h * 0.375;

                ctx.fillStyle = "#1a1c1c";
                ctx.fillRect(-offsetX, -offsetY, w * 0.75, h * 0.75);

                ctx.translate(0, -10);
                var exW = this.expandiumGraphic.width;
                var exH = this.expandiumGraphic.height;
                ctx.drawImage(this.expandiumGraphic, -exW * 0.5, -exH * 0.5);

                ctx.translate(0, 30);

                this.textField.draw(ctx);
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

                ctx.fillStyle = NeedBlock.MINIMAP_FILL_STYLE;
                ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);
                ctx.strokeRect(offsetX, offsetY, displayWidth, displayHeight);
            }
        }
    }));
    Object.freeze(NeedBlock);



    var NeedBlock1 = function () {
        NeedBlock.call(this, 1);
        this.id = NeedBlock1.id;
    };
    Object.defineProperties(NeedBlock1, {
        name : {
            value : "NeedBlock1"
        },
        id : {
            value : 6
        }
    });
    NeedBlock1.prototype = Object.freeze(Object.create(NeedBlock.prototype, {}));

    var NeedBlock2 = function () {
        NeedBlock.call(this, 2);
        this.id = NeedBlock2.id;
    };
    Object.defineProperties(NeedBlock2, {
        name : {
            value : "NeedBlock2"
        },
        id : {
            value : 7
        }
    });
    NeedBlock2.prototype = Object.freeze(Object.create(NeedBlock.prototype, {}));

    var NeedBlock3 = function () {
        NeedBlock.call(this, 3);
        this.id = NeedBlock3.id;
    };
    Object.defineProperties(NeedBlock3, {
        name : {
            value : "NeedBlock3"
        },
        id : {
            value : 8
        }
    });
    NeedBlock3.prototype = Object.freeze(Object.create(NeedBlock.prototype, {}));

    var NeedBlock4 = function () {
        NeedBlock.call(this, 4);
        this.id = NeedBlock4.id;
    };
    Object.defineProperties(NeedBlock4, {
        name : {
            value : "NeedBlock4"
        },
        id : {
            value : 9
        }
    });
    NeedBlock4.prototype = Object.freeze(Object.create(NeedBlock.prototype, {}));

    var NeedBlock5 = function () {
        NeedBlock.call(this, 5);
        this.id = NeedBlock5.id;
    };
    Object.defineProperties(NeedBlock5, {
        name : {
            value : "NeedBlock5"
        },
        id : {
            value : 10
        }
    });
    NeedBlock5.prototype = Object.freeze(Object.create(NeedBlock.prototype, {}));




    /**
     * (TEMP) Once the player completes the level, this exit block is removed
     * and the player may leave the level. There is only one exit block per level
     */
    var ExitBlock = function () {
        app.PhysicsObject.call(this);

        this.id = ExitBlock.id;

        // Create default state
        this.defaultGraphic = this.createImageFromSrc(app.IMAGES['fullBlock']);
        this.defaultState = new app.GameObjectState();
        this.defaultState.addFrame(new app.FrameObject(this.defaultGraphic));
        this.addState(app.GameObject.STATE.DEFAULT, this.defaultState);

        this.solid = true;
        this.fixed = true;
        this.rotate(-Math.PI * 0.5);
        this.locked = false;

        this.textField = new app.TextField();
        this.textField.text = "^ Exit ^";

        this.expandiumGraphic = this.createImageFromSrc(app.IMAGES['expandiumOrb']);
    };
    Object.defineProperties(ExitBlock, {
        MINIMAP_FILL_STYLE : {
            value : "#1a1c1c"
        },

        id : {
            value : 15
        }
    });
    ExitBlock.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);

                var curLevel = app.main.currentLevel;
                var collected = curLevel.collectedExpandium;
                var needed = curLevel.neededExpandium;

                this.textField.update(dt);

                if (!this.locked || collected === needed) {
                    this.locked = false;
                    this.textField.text = "^ Exit ^";
                } else {
                    this.textField.text = "< " + collected + " / " + needed + " >";
                }
            }
        },

        draw : {
            value : function (ctx) {
                if (this.locked) {
                    app.PhysicsObject.prototype.draw.call(this, ctx);

                    var w = this.graphic.width;
                    var h = this.graphic.height;
                    var offsetX = w * 0.375;
                    var offsetY = h * 0.375;

                    ctx.fillStyle = app.ExitBlock.MINIMAP_FILL_STYLE;
                    ctx.fillRect(-offsetX, -offsetY, w * 0.75, h * 0.75);

                    ctx.translate(0, -10);
                    var exW = this.expandiumGraphic.width;
                    var exH = this.expandiumGraphic.height;
                    ctx.drawImage(this.expandiumGraphic, -exW * 0.5, -exH * 0.5);

                    ctx.translate(0, 30);
                }

                this.textField.draw(ctx);
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

                ctx.fillStyle = app.ExitBlock.MINIMAP_FILL_STYLE;
                ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
                ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);
                ctx.strokeRect(offsetX, offsetY, displayWidth, displayHeight);
            }
        },

        resolveCollision : {
            value : function (physObj) {
                if (!this.locked) {
                    if (physObj === app.main.player) {
                        app.main.gameState = app.main.GAME_STATE.WON;
                    }
                }
            }
        }
    }));
    Object.freeze(ExitBlock);

    app.FullBlock = FullBlock;
    app.FullBlock2 = FullBlock2;
    app.FullBlock3 = FullBlock3;
    app.FullBlock4 = FullBlock4;
    app.HalfBlock = HalfBlock;
    app.HalfBlock2 = HalfBlock2;
    app.HalfBlock3 = HalfBlock3;
    app.BlockPillar5 = BlockPillar5;
    app.BlockPillar5R = BlockPillar5R;
    app.NeedBlock1 = NeedBlock1;
    app.NeedBlock2 = NeedBlock2;
    app.NeedBlock3 = NeedBlock3;
    app.NeedBlock4 = NeedBlock4;
    app.NeedBlock5 = NeedBlock5;
    app.ExitBlock = ExitBlock;

})();