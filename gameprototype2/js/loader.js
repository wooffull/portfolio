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

var isIe = function () {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // Edge (IE 12+) => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

window.onload = function(){
    // Preload Images
    app.queue = new createjs.LoadQueue(false);
    app.queue.installPlugin(createjs.Sound);
    app.queue.on("complete", function () {
        if (!isIe()) {
            for (var sound in app.SOUNDS) {   
                createjs.Sound.setDefaultPlayProps(app.SOUNDS[sound], {pan: 0.0001});
            }
        }
    
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", "editor/data/ld_final2.json", false);
        rawFile.onreadystatechange = function ()
        {
            if (rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var data = rawFile.responseText;
                    document.querySelector("#loading-div").style.display = "none";
                    app.main.init();

                    window.onblur = function() {
                        app.main.pauseGame();
                    };

                    window.onfocus = function() {
                        app.main.resumeGame();
                    };
                    
                    app.main.currentLevelData = data;
                }
            }
        }
        rawFile.send(null);
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