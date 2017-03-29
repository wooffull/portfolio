"use strict";

var app = app || {};

app.main = {
    WIDTH : 900,
    HEIGHT : 600,
    BACKGROUND_PARALLAX_PAN_RATE : 0.125,
    MINIMAP : Object.freeze({
        WIDTH : 150,
        HEIGHT : 100,
        SCALE : 0.1,
        FILL_STYLE : "#192427"
    }),
    SCALE : Object.freeze({
        MIN : 0.025,
        MAX : 1.5,
        INCREMENT : 0.015,
        PARALLAX_SCALAR : 0.15
    }),
    TOOL : Object.freeze({
        DRAW : "tool-draw",
        SELECT : "tool-select"
    }),
    MIN_GRID_SCALE : 0.175,
    PAN_SPEED : 5,
    scale : undefined,
    canvas : undefined,
    ctx : undefined,
    animationID : 0,
    keyboard : undefined,
    mouse : undefined,
    backgroundTile : undefined,
    gameObjects : undefined,
    selector : undefined,
    worldOffset : undefined,
   	previousTime : 0, // Used when calculating delta time
    paused : false,
    debug : false,

    /**
     * Initializer for the app
     */
	init : function () {
		// Initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');

        this.selector = new app.Selector();

        this.keyboard = app.keyboard;

        this.mouse = app.canvasMouse;
        this.mouse.init(this.canvas);

        app.ui.init();

        this.reset();

        $(this.mouse).on(
            this.mouse.Event.MOVE,
            this.onMouseMove.bind(this)
        );
        $(this.mouse).on(
            this.mouse.Event.DOWN,
            this.onMouseDown.bind(this)
        );
        $(this.mouse).on(
            this.mouse.Event.BEFORE_UP,
            this.onBeforeMouseUp.bind(this)
        );
        $(this.mouse).on(
            this.mouse.Event.LEAVE,
            this.onMouseLeave.bind(this)
        );
        $(this.mouse).on(
            this.mouse.Event.ENTER,
            this.onMouseEnter.bind(this)
        );
        $(this.canvas).on(
            "contextmenu",
            this.onContextMenu.bind(this)
        );

        // Add all addable entities to the <select> for the editor
        var entities = app.EntityBuilder.ENTITIES;
        for (var i = 0; i < entities.length; i++) {
            var cur = entities[i];

            if (typeof cur !== "undefined") {
                var name = entities[i].name;
                var option = $('<option value="' + name + '">');

                option.html(name);

                $("#item-selector").append(option);
            }
        }

        $("#file-input").change(this.onFileLoad);
        $("#btn-save-file").click(this.onFileSave);
        $("#btn-clear").click(this.reset.bind(this));

        this.selector.clear();

		// Start the game loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
	},

    /**
     * Downloads a file filled with the provided text, name, and file type
     */
    download : function (text, name, type) {
        var a = $("<a>")[0];
        var file = new Blob([text], {type : type});
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
    },

    /**
     * Callback for when a file is saved
     */
    onFileSave : function (e) {
        var text = app.Level.exportJson();
        var name = $("#level-name").val() || "untitled";
        name += ".json";

        app.main.download(text, name, "text/plain");
    },

    /**
     * Callback for when a file is loaded
     */
    onFileLoad : function (e) {
        var reader = new FileReader();

        // Callback for when the file loads
        reader.onload = function (e) {
            app.Level.importJson(e.target.result, true);
            app.main.selector.clear();
        };

        // Load the file
        reader.readAsText(this.files[0]);

        // Remove the old file selector
        $("#file-input").detach();

        // Create a replacement for the file selector that refreshes the
        // "onChange" event so that the same file could be picked again and
        // loaded as if it was a new load
        var fileInputReplacement = $('<input id="file-input" type="file">');
        fileInputReplacement.change(app.main.onFileLoad);
        $("#side-ui").prepend(fileInputReplacement);
    },

    /**
     * Resets the app
     */
    reset : function () {
        this.backgroundTile = app.GameObject.prototype.createImageFromSrc(app.IMAGES['bgTile']);
        this.gameObjects = [];
        this.selector.clear();
        this.worldOffset = new app.Vec2();
        this.scale = 1;
    },

    /**
     * Adds a specified game object to the game world
     */
    addGameObject : function (obj) {
        this.gameObjects.push(obj);

        this.selector.clear();
        this.selector.add(obj);
    },

    /**
     * Removes a specified game object from the game world
     */
    removeGameObject : function (obj) {
        var objIndex = this.gameObjects.indexOf(obj);

        // Remove the game object from the world
        if (objIndex >= 0 && objIndex < this.gameObjects.length) {
            this.gameObjects.splice(objIndex, 1);
        }

        this.selector.remove(obj);
    },

    /**
     * Selects game objects in the given box
     */
    selectGameObjects : function (selectionX, selectionY, selectionWidth, selectionHeight) {
        var selected = [];

        for (var i = 0; i < this.gameObjects.length; i++) {
            var cur = this.gameObjects[i];

            if (selectionX <= cur.position.x &&
                selectionX + selectionWidth >= cur.position.x &&
                selectionY <= cur.position.y &&
                selectionY + selectionHeight >= cur.position.y) {

                selected.push(cur);
            }
        }

        return selected;
    },

    /**
     * Gets the game object that's colliding with the point (x, y)
     * Returns null if no such game object exists
     */
    getGameObjectAt : function (x, y) {
        for (var i = 0; i < this.gameObjects.length; i++) {
            var cur = this.gameObjects[i];
            var width = (Math.abs(Math.cos(cur.rotation)) * cur.width + Math.abs(Math.sin(cur.rotation)) * cur.height);
            var height = (Math.abs(Math.cos(cur.rotation)) * cur.height + Math.abs(Math.sin(cur.rotation)) * cur.width);

            if (x >= cur.position.x - width * 0.5 &&
                x <= cur.position.x + width * 0.5 &&
                y >= cur.position.y - height * 0.5 &&
                y <= cur.position.y + height * 0.5) {

                return cur;
            }
        }

        return null;
    },

    /**
     * Update loop for the app
     */
	update : function (time) {
        var dt = time - this.previousTime;
	 	this.previousTime = time;

        // If over 100 ms have passed, force a 16 ms dt
        // This is useful for large lag spikes
        if (dt > 100) {
            dt = 16;
        }

		// Schedule a call to update()
	 	this.animationID = requestAnimationFrame(this.update.bind(this));

        // Draw background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.handleInput();
        this.draw(this.ctx);

        this.keyboard.update();
	},

    /**
     * Pauses the app from the play state
     */
    pauseGame : function () {
        this.paused = true;

        // Stop the animation loop
        cancelAnimationFrame(this.animationID);

        // Call update() once so that our paused screen gets drawn
        this.animationID = requestAnimationFrame(this.update.bind(this));
    },

    /**
     * Resumes the app from the pause state
     */
    resumeGame : function () {
        this.paused = false;

        // Stop the animation loop, just in case it's running
        cancelAnimationFrame(this.animationID);

        // Restart the loop
        this.animationID = requestAnimationFrame(this.update.bind(this));
    },

    /**
     * Draw everything in the game
     */
    draw : function (ctx) {
        this.drawBackground(ctx);
        this.drawMouseTile(ctx);

        // Only draw the grid if zoomed enough -- Looks less cluttered when zoomed far out
        if (this.scale > this.MIN_GRID_SCALE) {
            this.drawGrid(ctx);
        }

        this.drawGameObjects(ctx);
        this.drawSelection(ctx);

        // Draw any needed visuals for the selected tool
        var tool = app.ui.getSelectedTool();
        tool.draw(ctx);

        this.drawHUD(ctx);

        if (this.paused) {
            this.drawPauseScreen(ctx);
        }
    },

    /**
     * Draws all game objects that exist in the game world
     */
    drawGameObjects : function (ctx) {
        ctx.save();

        // Offset the drawing from the center of the screen
        var offset = this.getCenterOffset();
        ctx.translate(offset.x, offset.y);
        ctx.scale(this.scale, this.scale);

        for (var i = 0; i < this.gameObjects.length; i++) {
            var obj = this.gameObjects[i];
            var objOffset = new app.Vec2(
                obj.position.x - this.worldOffset.x,
                obj.position.y - this.worldOffset.y
            );

            // See if the object is visible in the world
            var inRange =
                Math.abs(objOffset.x) < this.WIDTH  / this.scale &&
                Math.abs(objOffset.y) < this.HEIGHT / this.scale;

            // If the game object isn't too far away, draw it!
            if (inRange) {
                ctx.save();

                ctx.translate(objOffset.x, objOffset.y);
                obj.draw(ctx);

                if (this.debug) {
                    obj.drawDebug(ctx);
                }

                ctx.restore();
            }
        }

        ctx.restore();
    },

    /**
     * Draws all indicators for selected game objects
     */
    drawSelection : function (ctx) {
        var selectedObjects = this.selector.getSelectedObjects();

        // No selected game objects, so no need to draw anything
        if (selectedObjects.length > 0) {
            ctx.save();

            // Offset the drawing from the center of the screen
            var offset = this.getCenterOffset();
            ctx.translate(offset.x, offset.y);

            // Scale appropriately and translate with the (scaled) world offset of the camera
            ctx.scale(this.scale, this.scale);
            ctx.translate(-this.worldOffset.x, -this.worldOffset.y);

            // Draw the selection
            this.selector.draw(ctx);

            ctx.restore();
        }
    },

    /**
     * Draws the level editor grid for tiles
     */
    drawGrid : function (ctx) {
        var tileSize = app.Level.TILE_SIZE;
        var totalHorizontal = Math.round((this.canvas.width / this.scale) / tileSize + 2);
        var totalVertical = Math.round((this.canvas.height / this.scale) / tileSize + 2);

        ctx.save();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 0.5;

        // Offset the drawing from the center of the screen
        var offset = this.getCenterOffset();
        ctx.translate(offset.x, offset.y);
        ctx.scale(this.scale, this.scale);

        for (var i = -Math.round(totalHorizontal * 0.5); i < Math.round(totalHorizontal * 0.5); i++) {
            for (var j = -Math.round(totalVertical * 0.5); j < Math.round(totalVertical * 0.5); j++) {
                var x = i * tileSize - this.worldOffset.x % tileSize;
                var y = j * tileSize - this.worldOffset.y % tileSize;

                ctx.beginPath();
                ctx.rect(Math.round(x), Math.round(y), tileSize, tileSize);
                ctx.stroke();
            }
        }

        ctx.restore();
    },

    /**
     * Draws a highlighted tile for whichever tile the mouse is on
     */
    drawMouseTile : function (ctx) {
        var tileSize = app.Level.TILE_SIZE;

        ctx.save();

        ctx.fillStyle = "rgba(255, 255, 200, 0.2)";

        // Offset the drawing from the center of the screen
        var offset = this.getCenterOffset();
        ctx.translate(offset.x, offset.y);
        ctx.scale(this.scale, this.scale);

        // Get the mouse's tile position
        var mouseTilePos = this.getMouseTilePosition();
        var tileWorldPos = mouseTilePos.multiply(tileSize);

        ctx.translate(-this.worldOffset.x, -this.worldOffset.y);

        ctx.beginPath();
        ctx.rect(tileWorldPos.x, tileWorldPos.y, tileSize, tileSize);
        ctx.fill();

        ctx.restore();
    },

    /**
     * Draws the minimap for spacial reference
     */
    drawHUD : function (ctx) {
        ctx.save();

        ctx.translate(this.canvas.width - this.MINIMAP.WIDTH, 0);
        ctx.beginPath();
        ctx.rect(0, 0, this.MINIMAP.WIDTH, this.MINIMAP.HEIGHT);
        ctx.clip();

        ctx.fillStyle = this.MINIMAP.FILL_STYLE;
        ctx.strokeStyle = "rgb(100, 100, 100)";
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.rect(0, 0, this.MINIMAP.WIDTH, this.MINIMAP.HEIGHT);
        ctx.fill();
        ctx.stroke();

        // Offset the drawing from the center of the minimap
        var offset = new app.Vec2(
            this.MINIMAP.WIDTH * 0.5,
            this.MINIMAP.HEIGHT * 0.5
        );
        ctx.translate(offset.x, offset.y);
        ctx.scale(this.MINIMAP.SCALE, this.MINIMAP.SCALE);
        ctx.scale(this.scale, this.scale);

        
        var invScale = 1 / (this.MINIMAP.SCALE * this.scale);
        
        
        var bounds = [];
        var activeObjs = [];
        
        for (var i = 0; i < this.gameObjects.length; i++) {
            var cur = this.gameObjects[i];
            
            if (cur instanceof app.FullBlock) {
                bounds.push(cur);
            } else {
                activeObjs.push(cur);
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

        //////////////////////////////////////////////////////////////////////////////////
        // (Optimization) Draw remaining objects
        //////////////////////////////////////////////////////////////////////////////////
        for (var i = 0; i < activeObjs.length; i++) {
            var obj = activeObjs[i];
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

        ctx.restore();
    },

    /**
     * Draws the pause screen to the canvas's context
     */
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

    /**
     * Draws the tiled background
     */
    drawBackground : function (ctx) {
        var bgScale = this.scale * this.SCALE.PARALLAX_SCALAR + (1 - this.SCALE.PARALLAX_SCALAR);

        var tileWidth = this.backgroundTile.width;
        var tileHeight = this.backgroundTile.height;
        var totalHorizontal = Math.round((this.canvas.width / bgScale) / tileWidth + 2);
        var totalVertical = Math.round((this.canvas.height / bgScale) / tileHeight + 2);

        ctx.save();

        // Offset the drawing from the center of the screen
        var offset = this.getCenterOffset();
        ctx.translate(offset.x, offset.y);
        ctx.scale(bgScale, bgScale);

        for (var i = -Math.round(totalHorizontal * 0.5 + 1); i < Math.round(totalHorizontal * 0.5 + 1); i++) {
            for (var j = -Math.round(totalVertical * 0.5 + 1); j < Math.round(totalVertical * 0.5 + 1); j++) {
                var x = i * tileWidth - (this.worldOffset.x * this.BACKGROUND_PARALLAX_PAN_RATE) % tileWidth;
                var y = j * tileHeight - (this.worldOffset.y * this.BACKGROUND_PARALLAX_PAN_RATE) % tileHeight;

                ctx.drawImage(this.backgroundTile, Math.round(x), Math.round(y));
            }
        }

        ctx.restore();
    },

    /**
     * Handles input for the app
     */
    handleInput : function () {
        // Stop checking for input if the app is paused
        if (this.paused) {
            return;
        }

        var keyboard = this.keyboard;

        // Shift + Ctrl Key -- Toggle Debug
        if (keyboard.isPressed(keyboard.SHIFT) &&
            keyboard.justPressed(keyboard.CONTROL)) {

            this.toggleDebug();
        }

        // WASD Keys -- Pan around level area
        var dx = 0;
        var dy = 0;
        var scaleIncrement = 0;

        if (keyboard.isPressed(keyboard.W)) dy -= this.PAN_SPEED;
        if (keyboard.isPressed(keyboard.S)) dy += this.PAN_SPEED;
        if (keyboard.isPressed(keyboard.A)) dx -= this.PAN_SPEED;
        if (keyboard.isPressed(keyboard.D)) dx += this.PAN_SPEED;

        // [] Keys -- Scale the level area
        if (keyboard.isPressed(keyboard.LEFT_SQUARE_BRACKET))  scaleIncrement -= this.SCALE.INCREMENT;
        if (keyboard.isPressed(keyboard.RIGHT_SQUARE_BRACKET)) scaleIncrement += this.SCALE.INCREMENT;

        // \ Key -- Reset scale
        if (keyboard.isPressed(keyboard.BACKSLASH)) {
            scaleIncrement = 0;
            this.scale = 1;
        }

        // Ctrl + A -- Select all
        if (keyboard.isPressed(keyboard.CONTROL) &&
            keyboard.justPressed(keyboard.A)) {

            // Ctrl + Shift + A -- Deselect All
            if (keyboard.isPressed(keyboard.SHIFT)) {
                this.selector.clear();

            } else {
                for (var i = 0; i < this.gameObjects.length; i++) {
                    var cur = this.gameObjects[i];
                    this.selector.add(cur);
                }
            }
        }

        // Delete Key -- Delete current selection
        if (keyboard.isPressed(keyboard.DELETE)) {
            var selectedObjects = this.selector.getSelectedObjects();

            for (var i = selectedObjects.length - 1; i >= 0; i--) {
                this.removeGameObject(selectedObjects[i]);
            }
        }

        // Shift Key -- Doubles speeds
        if (keyboard.isPressed(keyboard.SHIFT)) {
            dx *= 2;
            dy *= 2;
            scaleIncrement *= 2;
        }

        // Spacebar Key -- Halves speeds
        if (keyboard.isPressed(keyboard.SPACEBAR)) {
            dx *= 0.5;
            dy *= 0.5;
            scaleIncrement *= 0.5;
        }

        // If Ctrl key is down, don't allow panning or zooming
        if (keyboard.isPressed(keyboard.CONTROL)) {
            scaleIncrement = 0;
            dx = 0;
            dy = 0;
        }

        this.scale += scaleIncrement;

        // Limit scale increment
        this.scale = Math.max(this.SCALE.MIN, Math.min(this.SCALE.MAX, this.scale));
        dx /= this.scale;
        dy /= this.scale;

        // Adjust world offset
        this.worldOffset.x += dx;
        this.worldOffset.y += dy;

        // Apply movement panning appropriately based on the currently selected
        // tool
        var tool = app.ui.getSelectedTool();
        tool.onPan(dx, dy);
    },

    /**
     * Toggles debug mode on and off
     */
    toggleDebug : function () {
        this.debug = !this.debug;
    },

    /**
     * Gets a tile position for the given point
     */
    convertToTilePosition : function (point) {
        // Clone the reference point before applying operations on it
        var tilePos = point.clone();

        // Divide by tile size then round to the nearest tile coordinate
        tilePos.divide(app.Level.TILE_SIZE);
        tilePos.x = Math.round(tilePos.x - 0.5);
        tilePos.y = Math.round(tilePos.y - 0.5);

        return tilePos;
    },

    /**
     * Gets the offset to the center of the canvas
     */
    getCenterOffset : function () {
        return new app.Vec2(
            this.WIDTH * 0.5,
            this.HEIGHT * 0.5
        );
    },

    /**
     * Gets the tile position in the game world for the mouse
     */
    getMouseTilePosition : function () {
        var offset = this.getCenterOffset();
        var mouseOffset = app.Vec2.subtract(this.mouse.position, offset).divide(this.scale);
        var mouseWorldPos = app.Vec2.add(mouseOffset, this.worldOffset);
        var mouseTilePos = this.convertToTilePosition(mouseWorldPos);
        return mouseTilePos;
    },

    /**
     * Gets the mouse's position in the world
     */
    convertPagePositionToWorldPosition : function (pos) {
        var mouseWorldPos = app.Vec2.add(
            pos.clone().divide(this.scale),
            this.worldOffset
        );
        mouseWorldPos.subtract(
            this.getCenterOffset().divide(this.scale)
        );

        return mouseWorldPos;
    },

    /**
     * Callback for when the mouse moves -- Updates the mouse position
     */
    onMouseMove : function (jqe, e) {
        app.ui.getSelectedTool().onMove();
    },

    /**
     * Callback for when the mouse clicks down
     */
    onMouseDown : function (jqe, e) {
        var tool = app.ui.getSelectedTool();

        if (e.which === 1) {
            tool.onLeftDown.call(tool);
        } else if (e.which === 3) {
            tool.onRightDown.call(tool);
        }

        e.stopPropagation();
        e.preventDefault();
    },

    /**
     * Callback for when the mouse button is released
     */
    onBeforeMouseUp : function (jqe, e) {
        var tool = app.ui.getSelectedTool();

        if (e.which === 1) {
            tool.onLeftUp.call(tool);
        } else if (e.which === 3) {
            tool.onRightUp.call(tool);
        }
    },

    /**
     * Callback for when the mouse leaves the canvas
     */
    onMouseLeave : function (jqe, e) {
    },

    /**
     * Callback for when the mouse enters the canvas -- Snaps any selected
     * items to where the mouse is
     */
    onMouseEnter : function (jqe, e) {
    },

    /**
     * Callback for when the context menu should be brought up -- Prevents the
     * context menu from coming up on a right click
     */
    onContextMenu : function (e) {
        this.selector.clear();
        return false;
    }
};
