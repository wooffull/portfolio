"use strict";

var app = app || {};

app.canvasMouse = {
    Event : Object.freeze({
        MOVE : "move",
        DOWN : "down",
        BEFORE_UP : "before_up",
        UP : "up",
        LEAVE : "leave",
        ENTER : "enter"
    }),
    canvas : undefined,
    states : undefined,
    position : undefined,
    touchingCanvas : false,
    init : function (canvas) {
        this.canvas = canvas;
        this.states = [];
        this.states[1] = this.createState(1); // Left
        this.states[2] = this.createState(2); // Middle
        this.states[3] = this.createState(3); // Right

        this.position = new app.Vec2(-Infinity, -Infinity);

        $(this.canvas).on("mousemove", this.onMove.bind(this));
        $(this.canvas).on("mousedown", this.onDown.bind(this));
        $(document).on("mouseup", this.onUp.bind(this));
        $(this.canvas).on("mouseleave", this.onLeave.bind(this));
        $(this.canvas).on("mouseenter", this.onEnter.bind(this));
    },

    /**
     * Creates a state for the canvas mouse, based on the given input button ID
     */
    createState : function (which) {
        return {
            which : which,
            isDown : false,
            dragging : false,
            prevPos : new app.Vec2(-Infinity, -Infinity),
            dragStart : new app.Vec2(-Infinity, -Infinity),
            dragEnd : new app.Vec2(-Infinity, -Infinity)
        };
    },

    /**
     * Gets the state for the given input button ID
     */
    getState : function (which) {
        return this.states[which];
    },

    /**
     * Limits the given position to the canvas's bounds
     */
    limitPosition : function (pos) {
        var rect = this.canvas.getBoundingClientRect();

        if (pos.x < 0) {
            pos.x = 0;
        } else if (pos.x > rect.right - rect.left) {
            pos.x = rect.right - rect.left;
        }

        if (pos.y < 0) {
            pos.y = 0;
        } else if (pos.y > rect.bottom - rect.top) {
            pos.y = rect.bottom - rect.top;
        }
    },

    /**
     * Gets the position of the mouse based on the given mouse event
     */
    getMousePositionFromEvent : function (e) {
        var rect = this.canvas.getBoundingClientRect();
        var pos = new app.Vec2();
        pos.x = e.clientX - rect.left;
        pos.y = e.clientY - rect.top;

        return pos;
    },

    /**
     * Callback for when the mouse button is pressed down on the canvas
     */
    onDown : function (e) {
        var state = this.getState(e.which);

        if (state) {
            state.isDown = true;
            state.dragging = false;
            state.prevPos.x = this.position.x;
            state.prevPos.y = this.position.y;
            state.dragStart.x = this.position.x;
            state.dragStart.y = this.position.y;
            state.dragEnd.x = this.position.x;
            state.dragEnd.y = this.position.y;

            $(this).trigger(this.Event.DOWN, e);
        }
    },

    /**
     * Callback for then the mouse button is released
     */
    onUp : function (e) {
        var state = this.getState(e.which);

        if (state) {
            $(this).trigger(this.Event.BEFORE_UP, e);

            state.isDown = false;
            state.dragging = false;
            state.prevPos.x = -Infinity;
            state.prevPos.y = -Infinity;
            state.dragStart.x = -Infinity;
            state.dragStart.y = -Infinity;
            state.dragEnd.x = -Infinity;
            state.dragEnd.y = -Infinity;

            $(this).trigger(this.Event.UP, e);
        }
    },

    /**
     * Callback for when the mouse moves on the canvas
     */
    onMove : function (e) {
        this.touchingCanvas = true;

        var newPos = this.getMousePositionFromEvent(e);
        this.limitPosition(newPos);

        for (var i = 1; i < 4; i++) {
            var state = this.getState(i);

            if (state.isDown) {
                state.dragging = true;
                state.dragEnd.x = newPos.x;
                state.dragEnd.y = newPos.y;
                state.prevPos.x = this.position.x;
                state.prevPos.y = this.position.y;
            }
        }

        this.position.x = newPos.x;
        this.position.y = newPos.y;

        $(this).trigger(this.Event.MOVE, e);
    },

    /**
     * Callback for when the mouse leaves the canvas
     */
    onLeave : function (e) {
        this.touchingCanvas = false;

        var newPos = this.getMousePositionFromEvent(e);
        this.position.x = newPos.x;
        this.position.y = newPos.y;
        this.limitPosition(this.position);

        for (var i = 1; i < 4; i++) {
            var state = this.getState(i);

            if (state.dragging) {
                state.dragEnd.x = this.position.x;
                state.dragEnd.y = this.position.y;
            }
        }

        $(this).trigger(this.Event.LEAVE, e);
    },

    /**
     * Callback for when the mouse enters the canvas
     */
    onEnter : function (e) {
        this.touchingCanvas = true;

        var newPos = this.getMousePositionFromEvent(e);
        this.position.x = newPos.x;
        this.position.y = newPos.y;
        this.limitPosition(this.position);

        for (var i = 1; i < 4; i++) {
            var state = this.getState(i);

            if (state.dragging) {
                state.dragEnd.x = this.position.x;
                state.dragEnd.y = this.position.y;
            }
        }

        $(this).trigger(this.Event.ENTER, e);
    }
};