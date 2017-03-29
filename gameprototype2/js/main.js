// main.js
// Dependencies:
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// If app exists use the existing copy
// else create a new object literal
var app = app || {};

app.main = {
    WIDTH : 1200,
    HEIGHT : 800,
    MAX_WIDTH : 1366,
    MAX_HEIGHT : 768,
    CAMERA_FOLLOW_RATE : 0.055,
    BACKGROUND_PARALLAX_PAN_RATE : 0.125,
    MOVEMENT_FRICTION : 0.925,
    GAME_STATE : Object.freeze({
        LOADING : -1,
        MENU : 0,
        PLAYING : 1,
        ITEM_NOTICE : 2,
        WON : 3
    }),
    MINIMAP : Object.freeze({
        WIDTH : 150,
        HEIGHT : 100,
        SCALE : 0.0585,
        FILL_STYLE : "#192427"
    }),
    SOUNDTRACK_VOLUME : 0.67,
    MAX_PICKUP_TIMER : 200,
    canvas : undefined,
    renderCanvas : undefined,
    ctx : undefined,
    renderCtx : undefined,
    paused : false,
    canShootBullet : false,
    animationID : 0,
    keyboard : undefined,
    gameState : undefined,
    gameObjects : undefined,
    quadtree : undefined,
    worldOffset : undefined,
    backgroundTile : undefined,
    soundtrack : undefined,
    foundItemSound : undefined,
    player : undefined,
    currentLevel : undefined,
    currentLevelData : undefined,
    currentLevelId : 0,
    collectedKeyItems : undefined,
    levelChunks : [],
    chunkData : {
        size: 1000, // True value is set in init
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    },
    nearbyGameObjects : undefined,
   	previousTime : 0, // Used when calculating delta time
    pickupHistory : undefined,
    notificationBox : undefined,
    menuTextField : undefined,
    menuTitleTextField : undefined,
    creditsTextField : undefined,
    winTextField : undefined,
    scoreTextField : undefined,
    debug : false,

    init : function () {
        // Initialize properties
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        
        this.renderCanvas = document.createElement('canvas');
        this.renderCanvas.width = this.canvas.width;
        this.renderCanvas.height = this.canvas.height;
        this.renderCtx = this.renderCanvas.getContext('2d');

        this.gameState = this.GAME_STATE.MENU;

        this.keyboard = app.keyboard;

        this.pickupHistory = [];
        this.quadtree = new app.Quadtree(0, {
            x : 0,
            y : 0,
            width : this.WIDTH,
            height : this.HEIGHT
        });

        this.chunkData.size = app.Level.TILE_SIZE * 15;

        this.soundtrack = createjs.Sound.play("bgm_theme1", {loop : -1, volume : this.SOUNDTRACK_VOLUME});
        this.foundItemSound = createjs.Sound.play("se_findItem", {volume : 0.4});
        this.foundItemSound.paused = true;
        this.foundItemSound.on("complete", this.onFoundItemSoundComplete.bind(this));

        this.backgroundTile = app.GameObject.prototype.createImageFromSrc(app.IMAGES['bgTile']);

        this.winTextField = new app.TextField("To Be Continued...");
        this.winTextField.textAlign = "right";
        
        this.scoreTextField = new app.TextField("---");
        this.scoreTextField.textAlign = "left";

        this.menuTitleTextField = new app.TextField("Ravagen");
        this.menuTitleTextField.fontSize = 46;

        this.menuTextField = new app.TextField("Press Z to Start");
        this.menuTextField.fontSize = 32;

        this.creditsTextField = new app.TextField("By Hector Pineiro II");
        this.creditsTextField.fontSize = 16;
        
        window.onresize = this.resize.bind(this);
        this.resize();

        // Start the game loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
    },
    
    resize : function (e) {
        var w = Math.min(Math.max(window.innerWidth, 640), this.MAX_WIDTH);
        var h = Math.min(Math.max(window.innerHeight, 480), this.MAX_HEIGHT);
        
        this.WIDTH = w;
        this.HEIGHT = h;
        this.canvas.width = w;
        this.canvas.height = h;
        this.renderCanvas.width = this.canvas.width;
        this.renderCanvas.height = this.canvas.height;
    },

    reset : function () {
        this.collectedKeyItems = [];
    
        if (this.player !== undefined) {
            this.player.exhaustSound.stop();
        }

        if (this.currentLevel) {
            this.handleCheckPoint();
        }

        this.gameObjects = [];
        this.nearbyGameObjects = [];
        this.player = new app.Ship();
        this.canShootBullet = false;
    },

    handleCheckPoint : function () {
        var collectedKeyItems = [];
        var curLevelObjs = this.currentLevel.gameObjects;

        if (this.currentLevel.checkPoint) {
            var stillExisting = app.main.gameObjects;

            for (var i = 0; i < curLevelObjs.length; i++) {
                if ((curLevelObjs[i] instanceof app.Expandium) || (curLevelObjs[i] instanceof app.PowerUpBullet)) {
                    collectedKeyItems.push(curLevelObjs[i]);
                }
            }

            for (var i = 0; i < stillExisting.length; i++) {
                for (var j = 0; j < collectedKeyItems.length; j++) {
                    if (collectedKeyItems[j] === stillExisting[i]) {
                        collectedKeyItems.splice(j, 1);
                        break;
                    }
                }
            }
        }
        
        this.collectedKeyItems = collectedKeyItems;
    },

    addGameObject : function (obj) {
        this.gameObjects.push(obj);
    },

    removeGameObject : function (obj) {
        var objIndex = this.gameObjects.indexOf(obj);

        if (objIndex >= 0 && objIndex < this.gameObjects.length) {
            this.gameObjects.splice(objIndex, 1);
        }
    },

	update : function (time) {
        var dt = time - this.previousTime;
	 	this.previousTime = time;

        // If over 100 ms have passed, force a 16 ms dt
        // This is useful for large lag spikes
        if (dt > 100) {
            dt = 16;
        }

        var keyboard = this.keyboard;

        // TODO handle friction over time

		// Schedule a call to update()
	 	this.animationID = requestAnimationFrame(this.update.bind(this));

        if (this.gameState === this.GAME_STATE.MENU) {
            this.ctx.save();

            // Draw background
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

            this.ctx.translate(this.WIDTH * 0.5, 50);
            this.menuTitleTextField.update(dt);
            this.menuTitleTextField.draw(this.ctx);

            this.ctx.translate(0, 200);
            this.menuTextField.update(dt);
            this.menuTextField.draw(this.ctx);

            this.ctx.translate(0, 200);
            this.creditsTextField.update(dt);
            this.creditsTextField.draw(this.ctx);
            this.ctx.restore();

            if (keyboard.justPressed(keyboard.Z)) {
                //this.reset();
                this.currentLevel = app.Level.importJson(this.currentLevelData);
                this.currentLevel.start();
                this.gameObjects.push(this.player);
                this.worldOffset = this.player.position.clone();
                this.gameState = this.GAME_STATE.PLAYING;
                this.soundtrack.stop();
                this.soundtrack.play();
            }
        } else if (this.gameState === this.GAME_STATE.ITEM_NOTICE) {
            this.ctx.save();
            this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
            this.notificationBox.draw(this.ctx);
            this.ctx.restore();

            if (this.foundItemSound.playState === "playFinished") {
                this.soundtrack.volume = 0.1;

                if (keyboard.justPressed(keyboard.Z)) {
                    this.gameState = this.GAME_STATE.PLAYING;
                    this.foundItemSound.stop();
                }
            } else {
                this.soundtrack.volume = 0;
                this.player.exhaustSound.volume = 0;
            }
        } else if (this.gameState === this.GAME_STATE.PLAYING) {
            this.soundtrack.volume = this.SOUNDTRACK_VOLUME;
            this.player.exhaustSound.volume = app.Ship.EXHAUST_SOUND_VOLUME;

            if (!this.paused) {
                //this.quadtree.clear();

                // The quadtree clear happens in partitionChunks()
                this.partitionChunks();
                this.nearbyGameObjects = this.findSurroundingGameObjects({position: {x: this.worldOffset.x, y: this.worldOffset.y}});

                for (var i = 0; i < this.nearbyGameObjects.length; i++) {
                    this.quadtree.insert(this.nearbyGameObjects[i]);
                }

                this.handleInput(dt);

                // Make the game camera follow the player
                this.followPlayer();

                this.updateGameObjects(dt);
                this.handleCollsions();
            }
            
            this.draw(this.ctx);

            // TEMP: Restart if player died
            if (this.player.health === 0) {
                createjs.Sound.play("se_explosion", {volume : 0.55});
                //this.reset();
                this.currentLevel = app.Level.importJson(this.currentLevelData);
                this.currentLevel.start();
                this.gameObjects.push(this.player);
            }
        } else if (this.gameState === this.GAME_STATE.WON) {
            this.soundtrack.paused = true;
            this.player.exhaustSound.paused = true;

            this.ctx.save();
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
            
            this.ctx.translate(10, 20);
            this.scoreTextField.text = "Expandium: " + this.currentLevel.collectedExpandium + "/" + this.currentLevel.neededExpandium;
            this.scoreTextField.update(dt);
            this.scoreTextField.draw(this.ctx);

            this.ctx.translate(this.WIDTH - 20, this.HEIGHT - 40);
            this.winTextField.update(dt);
            this.winTextField.draw(this.ctx);
            this.ctx.restore();

            if (keyboard.justPressed(keyboard.Z)) {
                this.gameState = this.GAME_STATE.MENU;
            }
        }

        keyboard.update();
    },
    
    draw : function (ctx) {    
        // Draw background
        //this.ctx.fillStyle = "black";
        //this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.drawBackground(ctx);
        this.drawGameObjects(ctx);
        this.drawUI(ctx);

        if (this.paused) {
            this.drawPauseScreen(ctx);
        }
    },

    partitionChunks : function () {
        this.levelChunks = [];

        var minX = Infinity;
        var minY = Infinity;
        var maxY = -Infinity;
        var maxX = -Infinity;
        var totalChunksHorizontal = 0;
        var totalChunksVertical   = 0;

        // Find min and max positions
        for (var i = 0; i < this.gameObjects.length; i++) {
            var pos = this.gameObjects[i].position;

            minX = Math.min(pos.x, minX);
            minY = Math.min(pos.y, minY);
            maxX = Math.max(pos.x, maxX);
            maxY = Math.max(pos.y, maxY);
        }

        totalChunksHorizontal = Math.ceil((maxX - minX) / this.chunkData.size);
        totalChunksVertical   = Math.ceil((maxY - minY) / this.chunkData.size);

        totalChunksHorizontal = Math.max(totalChunksHorizontal, 1);
        totalChunksVertical   = Math.max(totalChunksVertical, 1);

        for (var i = 0; i < totalChunksHorizontal; i++) {
            this.levelChunks[i] = [];

            for (var j = 0; j < totalChunksVertical; j++) {
                this.levelChunks[i][j] = [];
            }
        }

        // Add game objects to the chunk they're located in
        for (var i = 0; i < this.gameObjects.length; i++) {
            var pos = this.gameObjects[i].position;
            var chunkX = Math.floor((totalChunksHorizontal - 1) * (pos.x - minX) / (maxX - minX));
            var chunkY = Math.floor((totalChunksVertical - 1) * (pos.y - minY) / (maxY - minY));

            if (isNaN(chunkX)) chunkX = 0;
            if (isNaN(chunkY)) chunkY = 0;

            this.levelChunks[chunkX][chunkY].push(this.gameObjects[i]);
        }

        this.chunkData.minX = minX;
        this.chunkData.minY = minY;
        this.chunkData.maxX = maxX;
        this.chunkData.maxY = maxY;

        this.quadtree = new app.Quadtree(0, {
            x : minX,
            y : minY,
            width : (maxX - minX),
            height : (maxY - minY)
        });
    },

    findSurroundingChunkIndices: function (gameObject, chunkRadius) {
        if (typeof chunkRadius === "undefined") chunkRadius = 1;

        var totalChunksHorizontal = this.levelChunks.length;
        var totalChunksVertical   = this.levelChunks[0].length;
        var pos                   = gameObject.position;
        var chunkX                = Math.floor((totalChunksHorizontal - 1) * (pos.x - this.chunkData.minX) / (this.chunkData.maxX - this.chunkData.minX));
        var chunkY                = Math.floor((totalChunksVertical - 1) * (pos.y - this.chunkData.minY) / (this.chunkData.maxY - this.chunkData.minY));

        if (isNaN(chunkX)) chunkX = 0;
        if (isNaN(chunkY)) chunkY = 0;

        var nearChunksIndices = [];

        for (var i = -chunkRadius; i <= chunkRadius; i++) {
            var refChunkX = chunkX + i;

            for (var j = -chunkRadius; j <= chunkRadius; j++) {
                var refChunkY = chunkY + j;

                if (refChunkX >= 0 && refChunkY >= 0 && refChunkX < totalChunksHorizontal && refChunkY < totalChunksVertical) {
                    nearChunksIndices.push({x: refChunkX, y: refChunkY});
                }
            }
        }

        return nearChunksIndices;
    },

    findSurroundingChunks: function (gameObject, chunkRadius) {
        var nearChunkIndices = this.findSurroundingChunkIndices(gameObject, chunkRadius);
        var nearChunks = [];

        for (var i = 0; i < nearChunkIndices.length; i++) {
            var x = nearChunkIndices[i].x;
            var y = nearChunkIndices[i].y;
            nearChunks.push(this.levelChunks[x][y]);
        }

        return nearChunks;
    },

    findSurroundingGameObjects: function (gameObject, chunkRadius) {
        var nearChunks = this.findSurroundingChunks(gameObject, chunkRadius);
        var gameObjects = [];

        for (var i = 0; i < nearChunks.length; i++) {
            gameObjects = gameObjects.concat(nearChunks[i]);
        }

        return gameObjects;
    },

    pauseGame : function () {
        this.paused = true;

        if (this.soundtrack !== undefined) {
            this.soundtrack.paused = true;

            if (this.player) {
                this.player.exhaustSound.paused = true;
            }
        }

        // Stop the animation loop
        cancelAnimationFrame(this.animationID);

        // Call update() once so that our paused screen gets drawn
        this.animationID = requestAnimationFrame(this.update.bind(this));
    },

    resumeGame : function () {
        this.paused = false;

        if (this.soundtrack !== undefined) {
            this.soundtrack.paused = false;

            if (this.player) {
                this.player.exhaustSound.paused = false;
            }
        }

        // Stop the animation loop, just in case it's running
        cancelAnimationFrame(this.animationID);

        // Restart the loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
    },

    /**
     * Eases the camera's position toward the player, or ahead of the player
     * if its moving
     */
    followPlayer : function () {
        var velocity = this.player.velocity;
        var velocityMag = velocity.getMagnitude();

        // Halve the camera speed if the player's not moving very fast
        if (velocityMag < 0.1) velocityMag *= 0.5;

        // Calculate the distance ahead of the player that the camera should be
        var seekAheadFactor = Math.min(250.0, velocityMag * 1000);
        var maxCamPos = velocity.clone().normalize().multiply(seekAheadFactor);
        
        // Calculate the camera's displacement to the new position then
        // multiply it by a "Follow rate" to ease the camera to that position
        // over time
        var cameraDisplacement = app.Vec2.subtract(
            this.worldOffset,
            this.player.position.clone().add(maxCamPos)
        );
        cameraDisplacement.multiply(this.CAMERA_FOLLOW_RATE);

        // Move the camera to its final position
        this.worldOffset.subtract(cameraDisplacement);
    },

    handleCollsions : function () {
        var objectsNearPlayer = this.nearbyGameObjects;//.slice(0).reverse();

        for (var i = 0; i < objectsNearPlayer.length; i++) {
            var cur = objectsNearPlayer[i];

            // Skip over certain objects for collision detection because other objects will
            // check against them later
            if (!cur || (!(cur instanceof app.Bullet) && !(cur instanceof app.LivingObject) && !(cur instanceof app.Absorber)) || (cur instanceof app.Pickup)) {
                continue;
            }

            var possibleCollisions = [];
            this.quadtree.retrieve(possibleCollisions, cur);

            for (var j = 0; j < possibleCollisions.length; j++) {
                var obj0 = cur;
                var obj1 = possibleCollisions[j];

                // One of the objects was removed upon collision, so continue
                // through the loop because it cannot be used, or if both
                // objects have a fixed location, ignore their collisions
                if (!obj0 || !obj1 || (obj0.fixed && obj1.fixed) || (obj0 === obj1)) {
                    continue;
                }

                // Check collisions if one of the objects is solid
                if (obj0.solid || obj1.solid) {
                    var colliding = obj0.handleCollision(obj1);

                    if (colliding) {
                        obj0.resolveCollision(obj1);
                        obj1.resolveCollision(obj0);
                    }
                }
            }
        }
    },

    updateGameObjects : function (dt) {
        for (var i = 0; i < this.nearbyGameObjects.length; i++) {
            var obj = this.nearbyGameObjects[i];
            obj.update(dt);
        }

        /*var frictionPercentage   = Math.max(0, dt / 1000);
        var accFrictionMagnitude = this.player.acceleration.getMagnitude() * frictionPercentage * this.MOVEMENT_FRICTION;
        var accFrictionForce     = this.player.acceleration.clone().normalize().multiply(-accFrictionMagnitude * this.player.mass);
        var velFrictionMagnitude = this.player.velocity.getMagnitude() * frictionPercentage * this.MOVEMENT_FRICTION;
        var velFrictionImpulse   = this.player.velocity.clone().normalize().multiply(-velFrictionMagnitude * this.player.mass);

        console.log(accFrictionForce, velFrictionImpulse);

        this.player.addForce(accFrictionForce);
        this.player.addImpulse(velFrictionImpulse);*/


        this.player.acceleration.multiply(this.MOVEMENT_FRICTION);
        this.player.velocity.multiply(this.MOVEMENT_FRICTION);

    },

    drawGameObjects : function (ctx) {
        ctx.save();

        var offset = new app.Vec2(
            this.WIDTH * 0.5,
            this.HEIGHT * 0.5
        );

        ctx.translate(offset.x, offset.y);
        
        var bounds = [];
        var reachWalls = [];
        var pillars = [];
        var otherObjs = [];
        var lowEnv = [];
        var topEnv = [];
        
        for (var i = 0; i < this.nearbyGameObjects.length; i++) {
            var cur = this.nearbyGameObjects[i];
            
            if (cur instanceof app.FullBlock || cur instanceof app.HalfBlock) {
                bounds.push(cur);
            } else if (cur instanceof app.ReachWall) {
                reachWalls.push(cur);
            } else if (cur instanceof app.BlockPillar5) {
                pillars.push(cur);
            } else if (cur instanceof app.Plant2 || cur instanceof app.Plant3 || cur instanceof app.Plant4 || cur instanceof app.Plant5) {
                lowEnv.push(cur);
            } else if (cur instanceof app.Plant1) {
                topEnv.push(cur);
            } else {
                otherObjs.push(cur);
            }
        }
        
        var drawnObjs = lowEnv.concat(reachWalls.concat(bounds.concat(topEnv.concat(pillars.concat(otherObjs)))));

        for (var i = 0; i < drawnObjs.length; i++) {
            var obj = drawnObjs[i];
            var objOffset = new app.Vec2(
                obj.position.x - this.worldOffset.x,
                obj.position.y - this.worldOffset.y
            );
            var width = (Math.abs(Math.cos(obj.rotation)) * obj.width + Math.abs(Math.sin(obj.rotation)) * obj.height);
            var height = (Math.abs(Math.cos(obj.rotation)) * obj.height + Math.abs(Math.sin(obj.rotation)) * obj.width);
            
            // If the game object is too far away, don't draw it!
            if (objOffset.x + (width  >> 1) >= -offset.x &&
                objOffset.x - (width  >> 1) <= offset.x  &&
                objOffset.y + (height >> 1) >= -offset.y &&
                objOffset.y - (height >> 1) <= offset.y) {
                
                ctx.save();

                ctx.translate(objOffset.x, objOffset.y);
                obj.draw(ctx);

                if (this.debug) {
                    obj.drawDebug(ctx);
                }

                ctx.restore();
            }
        }

        if (this.debug) {
            ctx.save();
            ctx.translate(-this.worldOffset.x, -this.worldOffset.y);
            this.quadtree.draw(ctx);
            ctx.restore();
        }

        ctx.restore();
    },

    drawUI : function (ctx) {
        this.drawHealth(ctx);
        this.drawCollectedExpandium(ctx);
        this.drawHUD(ctx);
    },

    drawHealth : function (ctx) {
        var currentHealth = this.player.health;
        var maxHealth = this.player.maxHealth;
        var heartsAdded = 0;

        var heartFullGraphic = app.GameObject.prototype.createImageFromSrc(app.IMAGES['healthOrbFull']);
        var heartEmptyGraphic = app.GameObject.prototype.createImageFromSrc(app.IMAGES['healthOrbEmpty']);

        ctx.save();

        // Draw full hearts
        for (var i = 0; i < currentHealth; i++) {
            ctx.drawImage(heartFullGraphic, 0, 0, 20, 20);
            ctx.translate(20, 0);
            heartsAdded++;
        }

        // Draw empty hearts
        for (var i = heartsAdded; i < maxHealth; i++) {
            ctx.drawImage(heartEmptyGraphic, 0, 0, 20, 20);
            ctx.translate(20, 0);
            heartsAdded++;
        }

        ctx.restore();
    },

    drawCollectedExpandium : function (ctx) {
        var currentExpandium = this.currentLevel.collectedExpandium;
        var maxExpandium = this.currentLevel.neededExpandium;
        var expandiumAdded = 0;

        var expandiumOrbGraphic = app.GameObject.prototype.createImageFromSrc(app.IMAGES['expandiumOrb']);
        var expandiumRingGraphic = app.GameObject.prototype.createImageFromSrc(app.IMAGES['expandiumRing']);

        ctx.save();

        ctx.translate(0, 20);

        for (var i = 0; i < maxExpandium; i++) {
            ctx.drawImage(expandiumRingGraphic, 0, 0, 20, 20);

            if (i < currentExpandium) {
                ctx.drawImage(expandiumOrbGraphic, 0, 0, 20, 20);
            }

            ctx.translate(20, 0);
            expandiumAdded++;
        }

        ctx.restore();
    },

    drawHUD : function (ctx) {
        ctx.save();

        ctx.translate(this.canvas.width - this.MINIMAP.WIDTH, 0);
        ctx.beginPath();
        ctx.rect(0, 0, this.MINIMAP.WIDTH, this.MINIMAP.HEIGHT);
        ctx.clip();

        ctx.fillStyle = this.MINIMAP.FILL_STYLE;
        ctx.strokeStyle = "rgb(100, 100, 100)";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(0, 0, this.MINIMAP.WIDTH, this.MINIMAP.HEIGHT);
        ctx.strokeRect(0, 0, this.MINIMAP.WIDTH, this.MINIMAP.HEIGHT);

        var offset = new app.Vec2(
            this.MINIMAP.WIDTH * 0.5,
            this.MINIMAP.HEIGHT * 0.5
        );
        ctx.translate(offset.x, offset.y);

        ctx.scale(this.MINIMAP.SCALE, this.MINIMAP.SCALE);
        
        var invScale = 1 / this.MINIMAP.SCALE;
        
        
        var bounds = [];
        var reachWalls = [];
        var otherObjs = [];
        
        for (var i = 0; i < this.nearbyGameObjects.length; i++) {
            var cur = this.nearbyGameObjects[i];
            
            if (cur instanceof app.FullBlock) {
                bounds.push(cur);
            } else if (cur instanceof app.ReachWall) {
                reachWalls.push(cur);
            } else {
                otherObjs.push(cur);
            }
        }
        
        var drawnObjs = reachWalls.concat(otherObjs);

        //////////////////////////////////////////////////////////////////////////////////
        // (Optimization) Draw objects that aren't the full blocks
        //////////////////////////////////////////////////////////////////////////////////
        for (var i = 0; i < drawnObjs.length; i++) {
            var obj = drawnObjs[i];
            var objOffset = new app.Vec2(
                obj.position.x - this.worldOffset.x,
                obj.position.y - this.worldOffset.y
            );
            var width = (Math.abs(Math.cos(obj.rotation)) * obj.width + Math.abs(Math.sin(obj.rotation)) * obj.height);
            var height = (Math.abs(Math.cos(obj.rotation)) * obj.height + Math.abs(Math.sin(obj.rotation)) * obj.width);
            
            // If the game object is too far away, don't draw it!
            if (objOffset.x + (width  >> 1) >= -offset.x * invScale &&
                objOffset.x - (width  >> 1) <= offset.x  * invScale &&
                objOffset.y + (height >> 1) >= -offset.y * invScale &&
                objOffset.y - (height >> 1) <= offset.y  * invScale) {
                
                ctx.save();

                ctx.translate((objOffset.x + 0.5) | 0, (objOffset.y + 0.5) | 0);
                obj.drawOnMinimap(ctx);

                ctx.restore();
            }
        }
        
        
        //////////////////////////////////////////////////////////////////////////////////
        // (Optimization) Draw full blocks separately since there are so many of them
        // (Batches draw calls for full blocks)
        //////////////////////////////////////////////////////////////////////////////////
        ctx.save();
        var blockSize = 128;
        ctx.beginPath();
        ctx.fillStyle = app.PhysicsObject.MINIMAP_FILL_STYLE;
        ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
        ctx.translate(-this.worldOffset.x, -this.worldOffset.y);
        for (var i = 0; i < bounds.length; i++) {
            var obj = bounds[i];
            var objOffset = new app.Vec2(
                obj.position.x - this.worldOffset.x,
                obj.position.y - this.worldOffset.y
            );
            
            // If the game object is too far away, don't draw it!
            if (objOffset.x + (blockSize >> 1) >= -offset.x * invScale &&
                objOffset.x - (blockSize >> 1) <= offset.x  * invScale &&
                objOffset.y + (blockSize >> 1) >= -offset.y * invScale &&
                objOffset.y - (blockSize >> 1) <= offset.y  * invScale) {
                
                var offsetX = (obj.position.x - (blockSize >> 1) + 0.5) | 0;
                var offsetY = (obj.position.y - (blockSize >> 1) + 0.5) | 0;

                ctx.rect(offsetX, offsetY, blockSize, blockSize);
            }
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    },

    drawPauseScreen : function (ctx) {
        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "36px Ubuntu";
        ctx.textAlign = "center";

        ctx.fillText("Paused", this.canvas.width * 0.5, this.canvas.height * 0.5);

        ctx.restore();
    },

    handleInput : function (dt) {
        var keyboard = this.keyboard;

        var acceleration = 0;
        var theta = 0;

        // Apply brakes!
        if (keyboard.isPressed(keyboard.DOWN)) {
            this.player.brake(dt);
        }

        // Go forward
        if (keyboard.isPressed(keyboard.UP)) {
            acceleration += app.Ship.BOOST_ACCELERATION;
        }

        // Turn counter-clockwise
        if (keyboard.isPressed(keyboard.LEFT)) {
            theta -= app.Ship.TURN_RATE;
        }

        // Turn clockwise
        if (keyboard.isPressed(keyboard.RIGHT)) {
            theta += app.Ship.TURN_RATE;
        }

        if (theta !== 0) {
            this.player.rotate(theta * dt);
        }

        // Shoot
        if (keyboard.isPressed(keyboard.Z)) {
            this.player.pulse();
        }
        if (this.canShootBullet && keyboard.isPressed(keyboard.X)) {
            this.player.shoot();
        }

        if (keyboard.isPressed(keyboard.SPACEBAR) && keyboard.isPressed(keyboard.SHIFT) && keyboard.justPressed(keyboard.D)) {
            this.toggleDebug();
        }

        if (acceleration !== 0) {
            var rotation = this.player.rotation;
            var forwardForce = new app.Vec2(
                acceleration * this.player.mass * Math.cos(rotation),
                acceleration * this.player.mass * Math.sin(rotation)
            );

            this.player.addForce(forwardForce);
        }
    },

    toggleDebug : function () {
        this.debug = !this.debug;
    },

    /**
     * Callback for when the player picks up any item
     */
    onItemPickup : function (item, name) {
        var firstTimePickedUp = true;

        for (var i = 0; i < this.pickupHistory.length; i++) {
            var oldPickup = this.pickupHistory[i];

            if (Object.getPrototypeOf(oldPickup) === Object.getPrototypeOf(item)) {
                firstTimePickedUp = false;
                break;
            }
        }

        if (firstTimePickedUp) {
            this.pickupHistory.push(item);
            this.gameState = this.GAME_STATE.ITEM_NOTICE;

            this.notificationBox = new app.NotificationBox("You found " + name, "Press Z to Continue", item);

            // Stop the sound first so that it resets its start position to 0
            this.foundItemSound.stop();
            this.foundItemSound.play();
        } else {
            createjs.Sound.play("se_pickup", {volume : 0.9});
        }
    },

    /**
     * Callback for when the sound for when the player finds a new item finishes playing
     */
    onFoundItemSoundComplete : function () {
        this.notificationBox.canClose = true;
    },

    /**
     * Draws the tiled background
     */
    drawBackground : function (ctx) {
        var totalHorizontal = this.canvas.width / this.backgroundTile.width + 2;
        var totalVertical = this.canvas.height / this.backgroundTile.height + 2;

        for (var i = -1; i < totalHorizontal - 1; i++) {
            for (var j = -1; j < totalVertical - 1; j++) {
                var x = i * this.backgroundTile.width - (this.worldOffset.x * this.BACKGROUND_PARALLAX_PAN_RATE) % this.backgroundTile.width;
                var y = j * this.backgroundTile.height - (this.worldOffset.y * this.BACKGROUND_PARALLAX_PAN_RATE) % this.backgroundTile.height;

                ctx.drawImage(this.backgroundTile, (x + 0.5) | 0, (y + 0.5) | 0);
            }
        }
    }
};
