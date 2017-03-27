"use strict";

var app = app || {};

(function () {

    /**
     * Used to handle selections in the editor
     */
    var Selector = function () {
        this.selectedObjects = undefined;
        this.selectionBox = undefined;

        this.clear();
    };
    Selector.prototype = Object.freeze(Object.create(Selector.prototype, {
        /**
         * Clears all game objects from the selection
         */
        clear : {
            value : function () {
                this.selectedObjects = [];
                this.selectionBox = {
                    x : -Infinity,
                    y : -Infinity,
                    width : 0,
                    height : 0
                };
            }
        },

        /**
         * Adds the given game object to the selection
         */
        add : {
            value : function (obj) {
                // Remove first just in case to prevent duplicates
                this.remove(obj);

                this.selectedObjects.push(obj);
                this.update();
            }
        },

        /**
         * Removes the given game object from the selection (if it exists)
         */
        remove : {
            value : function (obj) {
                var selectedIndex = this.selectedObjects.indexOf(obj);

                // Remove the game object from the list of selected game objects
                if (selectedIndex >= 0 &&
                    selectedIndex < this.selectedObjects.length) {

                    this.selectedObjects.splice(selectedIndex, 1);
                    this.update();
                }
            }
        },

        /**
         * Gets all currently selected game objects
         */
        getSelectedObjects : {
            value : function () {
                return this.selectedObjects;
            }
        },

        /**
         * Checks if the given game object is currently selected
         */
        isSelected : {
            value : function (obj) {
                return (this.selectedObjects.indexOf(obj) >= 0);
            }
        },

        /**
         * Updates the current selection
         */
        update : {
            value : function () {
                // No selected game objects, so no need to draw anything
                if (this.selectedObjects.length === 0) {
                    this.selectionBox.x = 0;
                    this.selectionBox.y = 0;
                    this.selectionBox.width = 0;
                    this.selectionBox.height = 0;

                    return;
                }

                // Coordinates for the selection box
                var min = { x : Infinity, y : Infinity };
                var max = { x : -Infinity, y : -Infinity };

                // Find the selection box to draw around the selected game objects
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var cur = this.selectedObjects[i];
                    var curPos = cur.position;
                    var halfWidth = (Math.abs(Math.cos(cur.rotation)) * cur.width + Math.abs(Math.sin(cur.rotation)) * cur.height) * 0.5;
                    var halfHeight = (Math.abs(Math.cos(cur.rotation)) * cur.height + Math.abs(Math.sin(cur.rotation)) * cur.width) * 0.5;

                    if (curPos.x - halfWidth  < min.x) min.x = curPos.x - halfWidth;
                    if (curPos.y - halfHeight < min.y) min.y = curPos.y - halfHeight;
                    if (curPos.x + halfWidth  > max.x) max.x = curPos.x + halfWidth;
                    if (curPos.y + halfHeight > max.y) max.y = curPos.y + halfHeight;
                }

                this.selectionBox.x = min.x;
                this.selectionBox.y = min.y;
                this.selectionBox.width = max.x - min.x;
                this.selectionBox.height = max.y - min.y;
            }
        },

        /**
         * Draws the current selection
         */
        draw : {
            value : function (ctx) {
                var box = this.selectionBox;

                ctx.save();

                // Draw the selection box around all selected elements
                ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(box.x, box.y, box.width, box.height);
                ctx.stroke();
                ctx.fill();

                // Draw all selected game objects over the selection box
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var cur = this.selectedObjects[i];

                    ctx.save();
                    ctx.translate(cur.position.x, cur.position.y);
                    cur.draw(ctx);
                    ctx.restore();
                }

                ctx.restore();
            }
        },

        /**
         * Checks if the selection contains the given point
         */
        hitTestPoint : {
            value : function (point) {
                var box = this.selectionBox;

                return (point.x >= box.x && point.x <= box.x + box.width &&
                        point.y >= box.y && point.y <= box.y + box.height);
            }
        },

        /**
         * Moves all currently selected game objects by dx and dy
         */
        move : {
            value : function (dx, dy) {
                for (var i = 0; i < this.selectedObjects.length; i++) {
                    var cur = this.selectedObjects[i];

                    cur.position.x += dx;
                    cur.position.y += dy;
                }

                this.selectionBox.x += dx;
                this.selectionBox.y += dy;
            }
        }
    }));

    app.Selector = Selector;

})();