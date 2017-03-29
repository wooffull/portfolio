"use strict";

var app = app || {};

app.ui = {
    toolButtons : undefined,
    selectedToolButton : undefined,
    tools : undefined,

    init : function () {
        this.toolButtons = [];

        this.toolButtons.push(document.querySelector("#tool-draw"));
        this.toolButtons.push(document.querySelector("#tool-select"));
        this.toolButtons.push(document.querySelector("#tool-align"));
        this.toolButtons.push(document.querySelector("#tool-rotate"));

        for (var i = 0; i < this.toolButtons.length; i++) {
            this.toolButtons[i].onclick = this.onClickTool.bind(this);
        }

        // Set up tools
        this.tools = {
            "tool-draw" : app.tool.draw,
            "tool-select" : app.tool.select,
            "tool-align" : app.tool.align,
            "tool-rotate" : app.tool.rotate
        };

        this.selectTool(this.toolButtons[0]);
    },

    /**
     * Selects a tool based on the given HTML element for the tool
     */
    selectTool : function (tool) {
        this.selectedToolButton = tool;

        for (var i = 0; i < this.toolButtons.length; i++) {
            this.toolButtons[i].classList.remove("tool-selected");
        }

        this.selectedToolButton.classList.add("tool-selected");
        this.getSelectedTool().reset();
    },

    /**
     * Gets the ID of the selected tool
     */
    getSelectedToolId : function () {
        return this.selectedToolButton.id;
    },

    /**
     * Gets the tool object corresponding to the selected tool
     */
    getSelectedTool : function () {
        return this.tools[this.getSelectedToolId()];
    },

    /**
     * Callback for when a tool button is clicked
     */
    onClickTool : function (e) {
        if (e.target !== this.selectedToolButton) {
            this.selectTool(e.target);
        }
    }
};