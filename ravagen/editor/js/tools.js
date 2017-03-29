"use strict";

var app = app || {};

(function () {
    var Tool = function () {
        this.clickedSelection = false;
    };
    Tool.prototype = Object.freeze(Object.create(Tool.prototype, {
        reset : {
            value : function () {}
        },

        onLeftDown : {
            value : function () {}
        },

        onRightDown : {
            value : function () {}
        },

        onLeftUp : {
            value : function () {}
        },

        onRightUp : {
            value : function () {}
        },

        onMove : {
            value : function () {}
        },

        onDrag : {
            value : function () {}
        },

        onLeave : {
            value : function () {}
        },

        onEnter : {
            value : function () {}
        },

        onPan : {
            value : function (dx, dy) {}
        },

        draw : {
            value : function (ctx) {}
        }
    }));
    Object.freeze(Tool);

    var DrawTool = function () {
        Tool.call(this);
        this.reset();
    };
    DrawTool.prototype = Object.freeze(Object.create(Tool.prototype, {
        reset : {
            value : function () {
                this.clickedSelection = false;
            }
        },

        onLeftDown : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;
                var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                    canvasMouse.position
                );
                var clickedObject = app.main.getGameObjectAt(
                    mouseWorldPos.x,
                    mouseWorldPos.y
                );

                // Clicked an object, so it should be selected
                // Shift key also functions as a shortcut for selecting objects
                if (clickedObject !== null ||
                    selector.hitTestPoint(mouseWorldPos) ||
                    keyboard.isPressed(keyboard.SHIFT)) {

                    SelectTool.prototype.onLeftDown.call(this);

                // Clicked on an empty spot on the canvas, so add the new game
                // object there
                } else {
                    var mouseTilePos = app.main.getMouseTilePosition();
                    var tileWorldPos = mouseTilePos.multiply(app.Level.TILE_SIZE);
                    var entity = $("#item-selector").val();
                    var x = tileWorldPos.x + app.Level.TILE_SIZE * 0.5;
                    var y = tileWorldPos.y + app.Level.TILE_SIZE * 0.5;

                    var object = new app[entity];
                    object.position.x = x;
                    object.position.y = y;
                    app.main.addGameObject(object);
                }
            }
        },

        onRightDown : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                    canvasMouse.position
                );
                var clickedObject = app.main.getGameObjectAt(
                    mouseWorldPos.x,
                    mouseWorldPos.y
                );

                // Holding Shift with the draw tool is a shortcut for the
                // Select tool
                if (keyboard.isPressed(keyboard.SHIFT)) {
                    SelectTool.prototype.onRightDown.call(this);

                } else {
                    // Clicked an object, so remove it
                    if (clickedObject !== null) {
                        app.main.removeGameObject(clickedObject);
                    }
                }
            }
        },

        onLeftUp : {
            value : function () {
                var keyboard = app.keyboard;

                // Holding Shift with the draw tool is a shortcut for the
                // Select tool
                if (keyboard.isPressed(keyboard.SHIFT)) {
                    SelectTool.prototype.onLeftUp.call(this);

                } else {
                    var canvasMouse = app.main.mouse;
                    var selector = app.main.selector;
                    var leftMouseState = canvasMouse.getState(1);
                    var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                        canvasMouse.position
                    );

                    // If a selection was being dragged, but the mouse was released off the
                    // canvas, remove everything in the selection
                    if (this.clickedSelection && !canvasMouse.touchingCanvas) {
                        var selectedObjects = selector.getSelectedObjects();

                        for (var i = selectedObjects.length - 1; i >= 0; i--) {
                            app.main.removeGameObject(selectedObjects[i]);
                        }
                    }
                }

                this.clickedSelection = false;
            }
        },

        onMove : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;
                var scale = app.main.scale;

                // Holding Shift with the draw tool is a shortcut for the
                // Select tool, ONLY if the selection isn't being dragged
                if (!keyboard.isPressed(keyboard.SHIFT) || (keyboard.isPressed(keyboard.SHIFT) && this.clickedSelection)) {
                    var leftMouseState = canvasMouse.getState(1);

                    if (leftMouseState.dragging) {
                        selector.move(
                            (leftMouseState.dragEnd.x - leftMouseState.prevPos.x) / scale,
                            (leftMouseState.dragEnd.y - leftMouseState.prevPos.y) / scale
                        );
                    }
                }
            }
        },

        onPan : {
            value : function (dx, dy) {
                var selector = app.main.selector;

                if (this.clickedSelection) {
                    selector.move(dx, dy);
                }
            }
        },

        draw : {
            value : function (ctx) {
                var keyboard = app.keyboard;

                // Holding Shift with the draw tool is a shortcut for the
                // Select tool, ONLY if the selection isn't being dragged
                if (!this.clickedSelection && keyboard.isPressed(keyboard.SHIFT)) {
                    SelectTool.prototype.draw.call(this, ctx);
                }
            }
        }
    }));
    Object.freeze(DrawTool);

    var SelectTool = function () {
        Tool.call(this);
        this.reset();
    };
    SelectTool.prototype = Object.freeze(Object.create(Tool.prototype, {
        reset : {
            value : function () {
                this.clickedSelection = false;
            }
        },

        onLeftDown : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;
                var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                    canvasMouse.position
                );
                var clickedObject = app.main.getGameObjectAt(
                    mouseWorldPos.x,
                    mouseWorldPos.y
                );
                var hitSelectBox = selector.hitTestPoint(mouseWorldPos);

                // Not holding Shift key, so no additions to the selection will
                // be made
                if (!keyboard.isPressed(keyboard.SHIFT)) {
                    // Clicking off the selector's box will clear the selection
                    if (!hitSelectBox) {
                        selector.clear();
                    }
                }

                // Clicked an object that isn't selected yet, so select it
                if (clickedObject !== null &&
                    !selector.isSelected(clickedObject)) {

                    // Shift Key + Click -- Add clicked object in selection
                    if (keyboard.isPressed(keyboard.SHIFT)) {
                        selector.add(clickedObject);

                    // Click only -- Select clicked object
                    } else {
                        selector.clear();
                        selector.add(clickedObject);
                    }

                // Clicked the selection box
                } else if (hitSelectBox) {
                    // Shift Key + Click -- Remove clicked object in selection
                    if (keyboard.isPressed(keyboard.SHIFT)) {
                        selector.remove(clickedObject);
                    }
                }

                if (hitSelectBox) {
                    this.clickedSelection = true;
                }
            }
        },

        onRightDown : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;
                var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                    canvasMouse.position
                );

                // Only remove clicked items if the Shift key isn't down
                if (!keyboard.isPressed(keyboard.SHIFT)) {
                    var clickedObject = app.main.getGameObjectAt(
                        mouseWorldPos.x,
                        mouseWorldPos.y
                    );

                    // Clicked an object that is selected, so deselect it
                    if (clickedObject !== null &&
                        !selector.isSelected(clickedObject)) {
                        selector.remove(clickedObject);

                    // Clicked on nothing, so deselect all
                    } else if (clickedObject === null) {
                        selector.clear();
                    }
                }
            }
        },

        onLeftUp : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;
                var leftMouseState = canvasMouse.getState(1);
                var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                    canvasMouse.position
                );

                // Dragging the mouse to select new elements
                if (leftMouseState.dragging && !this.clickedSelection) {
                    var dragStart = app.main.convertPagePositionToWorldPosition(
                        leftMouseState.dragStart
                    );
                    var dragEnd = app.main.convertPagePositionToWorldPosition(
                        leftMouseState.dragEnd
                    );
                    var minX = Math.min(dragStart.x, dragEnd.x);
                    var minY = Math.min(dragStart.y, dragEnd.y);
                    var maxX = Math.max(dragStart.x, dragEnd.x);
                    var maxY = Math.max(dragStart.y, dragEnd.y);

                    var selected = app.main.selectGameObjects(
                        minX,
                        minY,
                        maxX - minX,
                        maxY - minY
                    );

                    // Shift key is a shortcut for the Select tool, but should only
                    // add extra items when dragging
                    if (!keyboard.isPressed(keyboard.SHIFT)) {
                        selector.clear();
                    }

                    for (var i = 0; i < selected.length; i++) {
                        selector.add(selected[i]);
                    }
                }

                this.clickedSelection = false;
            }
        },

        draw : {
            value : function (ctx) {
                var canvasMouse = app.main.mouse;
                var leftMouseState = canvasMouse.getState(1);

                if (leftMouseState.dragging) {
                    ctx.save();

                    var offset = app.main.getCenterOffset();
                    var scale = app.main.scale;
                    var worldOffset = app.main.worldOffset.clone();

                    // Create drag start point (in world)
                    var dragStart = leftMouseState.dragStart.clone().add(offset);
                    dragStart = app.main.convertPagePositionToWorldPosition(dragStart);
                    dragStart.multiply(scale);
                    dragStart.subtract(worldOffset.multiply(scale));

                    // Create drag end point (in world)
                    var dragEnd = leftMouseState.dragEnd.clone().add(offset);
                    dragEnd = app.main.convertPagePositionToWorldPosition(dragEnd);
                    dragEnd.multiply(scale);
                    dragEnd.subtract(worldOffset);

                    var minX = Math.min(dragStart.x, dragEnd.x);
                    var minY = Math.min(dragStart.y, dragEnd.y);
                    var maxX = Math.max(dragStart.x, dragEnd.x);
                    var maxY = Math.max(dragStart.y, dragEnd.y);

                    ctx.strokeStyle = "rgba(200, 230, 150, 0.75)";
                    ctx.fillStyle = "rgba(200, 230, 150, 0.5)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.rect(minX, minY, maxX - minX, maxY - minY);
                    ctx.stroke();
                    ctx.fill();

                    ctx.restore();
                }
            }
        }
    }));
    Object.freeze(SelectTool);

    var AlignTool = function () {
        Tool.call(this);
        this.reset();
    };
    AlignTool.prototype = Object.freeze(Object.create(Tool.prototype, {
        reset : {
            value : function () {
                this.clickedSelection = false;
            }
        },

        onLeftDown : {
            value : function () {
                var selector = app.main.selector;
                var selectedObjects = selector.getSelectedObjects();

                for (var i = 0; i < selectedObjects.length; i++) {
                    var o = selectedObjects[i];
                    var tilePos = app.main.convertToTilePosition(o.position);
                    var x = (tilePos.x + 0.5) * app.Level.TILE_SIZE;
                    var y = (tilePos.y + 0.5) * app.Level.TILE_SIZE;
                    o.position.x = x;
                    o.position.y = y;
                }

                selector.update();
            }
        }
    }));
    Object.freeze(AlignTool);

    var RotateTool = function () {
        Tool.call(this);
        this.reset();
    };
    RotateTool.prototype = Object.freeze(Object.create(Tool.prototype, {
        reset : {
            value : function () {
                this.clickedSelection = false;
            }
        },

        onLeftDown : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;
                var mouseWorldPos = app.main.convertPagePositionToWorldPosition(
                    canvasMouse.position
                );
                var clickedObject = app.main.getGameObjectAt(
                    mouseWorldPos.x,
                    mouseWorldPos.y
                );

                // Clicked an object, so it should be selected
                // Shift key also functions as a shortcut for selecting objects
                if (clickedObject !== null ||
                    selector.hitTestPoint(mouseWorldPos) ||
                    keyboard.isPressed(keyboard.SHIFT)) {

                    SelectTool.prototype.onLeftDown.call(this);
                }
            }
        },

        onRightDown : {
            value : function () {
                var keyboard = app.keyboard;
                var selector = app.main.selector;

                // Holding Shift with the draw tool is a shortcut for the
                // Select tool
                if (keyboard.isPressed(keyboard.SHIFT)) {
                    SelectTool.prototype.onRightDown.call(this);

                } else {
                    var selectedObjects = selector.getSelectedObjects();

                    for (var i = 0; i < selectedObjects.length; i++) {
                        var curRotation = selectedObjects[i].rotation;
                        var newRotation = Math.round(8 * curRotation / (2 * Math.PI)) *
                            (2 * Math.PI) / 8;

                        selectedObjects[i].setRotation(newRotation);
                    }
                }
            }
        },

        onLeftUp : {
            value : function () {
                var keyboard = app.keyboard;

                // Holding Shift with the rotate tool is a shortcut for the
                // Select tool
                if (keyboard.isPressed(keyboard.SHIFT)) {
                    SelectTool.prototype.onLeftUp.call(this);
                }

                this.clickedSelection = false;
            }
        },

        onMove : {
            value : function () {
                var keyboard = app.keyboard;
                var canvasMouse = app.main.mouse;
                var selector = app.main.selector;

                // Holding Shift with the rotate tool is a shortcut for the
                // Select tool, ONLY if the selection isn't being dragged
                if (!keyboard.isPressed(keyboard.SHIFT)) {
                    var leftMouseState = canvasMouse.getState(1);

                    if (leftMouseState.dragging) {
                        var dragY = leftMouseState.dragEnd.y -
                            leftMouseState.prevPos.y;
                        var rotateValue = dragY %
                            (4 * app.PhysicsObject.TOTAL_DISPLAY_ANGLES);

                        var rotation = 2 * Math.PI *
                            (rotateValue / (4 * app.PhysicsObject.TOTAL_DISPLAY_ANGLES));
                        var selectedObjects = selector.getSelectedObjects();

                        for (var i = 0; i < selectedObjects.length; i++) {
                            selectedObjects[i].rotate(rotation);
                        }
                    }

                    selector.update();
                }
            }
        },

        draw : {
            value : function (ctx) {
                var keyboard = app.keyboard;

                // Holding Shift with the rotate tool is a shortcut for the
                // Select tool, ONLY if the selection isn't being dragged
                if (!this.clickedSelection && keyboard.isPressed(keyboard.SHIFT)) {
                    SelectTool.prototype.draw.call(this, ctx);
                }
            }
        }
    }));
    Object.freeze(RotateTool);

    app.tool = {
        draw : new DrawTool(),
        select : new SelectTool(),
        align : new AlignTool(),
        rotate : new RotateTool()
    };
})();