/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

window.onload = function(){
	// Preload Images
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	app.queue.on("complete", function () {
        document.querySelector("#loading-div").style.display = "none";
        app.main.init();

        window.onblur = function() {
            app.main.pauseGame();
        };

        window.onfocus = function() {
            app.main.resumeGame();
        };
	});

    var needToLoad = [];

    // Prepare to load sounds
    for (var sound in app.SOUNDS) {
        var soundObj = {
            id : sound,
            src : app.SOUNDS[sound]
        }

        needToLoad.push(soundObj);
    }

    // Prepare to load images
    for (var img in app.IMAGES) {
        var imgObj = {
            id : img,
            src : app.IMAGES[img]
        }

        needToLoad.push(imgObj);
    }

	app.queue.loadManifest(needToLoad);
};