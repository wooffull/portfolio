/**
 * Copyright 2014-2015, Hector Piñeiro II, All Rights Reserved
 */
(function () { // Start IIFE

var DomElement = function () {
    this._domElement = null;
};
DomElement.prototype = {};
Object.defineProperties(DomElement.prototype, {
    getDomElement: {
        value: function () {
            return this._domElement;
        }
    },

    setDomElement: {
        value: function (value) {
            this._domElement = value;
        }
    },

    appendTo: {
        value: function (parent) {
            $(this._domElement).appendTo(parent);
        }
    },

    append: {
        value: function (child) {
            $(this._domElement).append(child);
        }
    }
});

var Project = function (name) {
    this._name = "";
    this._images = [];
    this._imagesAdded = 0;
    this._description = "";
    this._downloadLink = null;
    this._tags = null;

    DomElement.call(this);

    this._container = $("<div>");
    this._leftContainer = $("<div>");
    this._rightContainer = $("<div>");
    this._titleContainer = $("<div>");
    this._nameContainer = $("<div>");
    this._tagsContainer = $("<h5>");
    this._imgContainer = $("<div>");
    this._descriptionContainer = $("<div>");
    
    this._titleContainer
        .append(this._nameContainer)
        .append(this._tagsContainer);
    
    this.setName(name);

    this._leftContainer
        .append(this._titleContainer);

    this._rightContainer
        .append(this._imgContainer)
        .append(this._descriptionContainer);

    this._container
        .append(this._leftContainer)
        .append(this._rightContainer);

    this._container.addClass(
        HFP.Class.PROJECT_CONTAINER
    );
    this._titleContainer.addClass(
        HFP.Class.PROJECT_TITLE_CONTAINER
    );
    this._nameContainer.addClass(
        HFP.Class.PROJECT_NAME_CONTAINER
    );
    this._imgContainer.addClass(
        HFP.Class.PROJECT_IMAGE_CONTAINER
    );
    this._descriptionContainer.addClass(
        HFP.Class.PROJECT_DESCRIPTION_CONTAINER
    );

    this.setDomElement(this._container);
};
Project.prototype = Object.create(DomElement.prototype, {
    getName: {
        value: function () {
            return this._name;
        }
    },

    setName: {
        value: function (value) {
            if (typeof value !== "string") {
                value = "";
            }

            this._name = value;
            this.update();
        }
    },

    getImages: {
        value: function () {
            return this._images;
        }
    },

    getDescription: {
        value: function () {
            return this._description;
        }
    },

    setDescription: {
        value: function (value) {
            this._description = value;
        }
    },

    getDownloadLink: {
        value: function () {
            return this._downloadLink;
        }
    },

    setDownloadLink: {
        value: function (value) {
            this._downloadLink = value;
        }
    },
    
    getTags: {
        value: function () {
            return this._tags;
        }
    },
    
    setTags: {
        value: function (value) {
            this._tags = value;
            
            this._tagsContainer.html(this._tags.join(' &ndash; '));
        }
    },

    addImage: {
        value: function (path) {
            var _this = this;
            var img = new Image();
            var imgId = this._imagesAdded;
            this._imagesAdded++;

            img.onload = function (e) {
                _this._images.splice(imgId, 0, this);
                _this.update();
            };
            img.onfail = function (e) {
                console.log(
                    HFP.Error.IMAGE_LOAD_FAIL +
                    ": " +
                    path
                );
            };

            img.src = path;
        }
    },

    update: {
        value: function () {
            this._imgContainer.html("");

            if (this._images.length > 0) {
                this._imgContainer.append(this._images[0]);
            }

            this._nameContainer.html(this._name);
            this._descriptionContainer.html(this._description);

            $(this).trigger(
                HFP.Event.PROJECT_UPDATE
            );
        }
    }
});

var ProjectPage = function (project) {
    var scopeData = {
        _this: this
    };

    this._project = project;

    $(this._project).on(
        HFP.Event.PROJECT_UPDATE,
        scopeData,
        this.onProjectUpdate
    );

    DomElement.call(this);

    this._container = $("<div>");
    this._titleContainer = this._project._titleContainer;
    this._downloadLink = null;
    this._downloadContainer = null;
    this._imgContainer = $("<div>");
    this._descriptionContainer = $("<div>");
    
    this._container.addClass(
        HFP.Class.PROJECT_CURRENT_CONTAINER
    );
    this._imgContainer.addClass(
        HFP.Class.PROJECT_CURRENT_IMAGES
    );
    this._descriptionContainer.addClass(
        HFP.Class.PROJECT_DESCRIPTION_CONTAINER
    );
    
    if (this._project.getDownloadLink()) {
        this._downloadContainer = $("<div>");
        this._downloadLink = $("<a href=\"" + this._project.getDownloadLink() + "\">").html("Play here!");
        this._downloadContainer.append(this._downloadLink);
        
        this._downloadContainer.addClass(
            HFP.Class.PROJECT_DOWNLOAD_LINK
        );
        
        this._container
            .append(this._titleContainer)
            .append(this._downloadContainer)
            .append(this._descriptionContainer)
            .append(this._imgContainer);
    } else {
        this._container
            .append(this._titleContainer)
            .append(this._descriptionContainer)
            .append(this._imgContainer);
    }

    this.setDomElement(this._container);

    this.update();
};
ProjectPage.prototype = Object.create(DomElement.prototype, {
    onProjectUpdate: {
        value: function (e) {
            var _this = e.data._this;
            _this.update();
        }
    },

    update: {
        value: function () {
            var imgs = this._project.getImages();

            this._descriptionContainer.html(
                this._project.getDescription()
            );
            this._imgContainer.html("");

            for (var i = 0; i < imgs.length; i++) {
                this._imgContainer.append(imgs[i]);
            }
        }
    }
});

$(document).ready(function () {
    /**
     * Gets the page string that represents which page the user is currently on
     */
    var getCurrentPage = function () {
        var href = window.location.href;
        var hrefSplitArray = href.split('/');
        var curPage = hrefSplitArray[hrefSplitArray.length - 1] || "index.html";
        curPage = curPage.split('.')[0];

        if (curPage === "index") {
            curPage = HFP.Page.INDEX;
        }

        curPage = curPage.toUpperCase();
        return curPage;
    };

    /**
     * Adjusts the appropriate nav bar element leading to this page to show the
     * user which page they are currently on
     */
    var selectCurrentNavBarElement = function () {
        var curPage = getCurrentPage();
        navBarElement = $("a:contains('" + curPage + "')", "#nav-bar");

        // Apply appropriate classes for a selected nav bar element
        if (!HFP.undefinedOrNull(navBarElement)) {
            navBarElement.addClass(
                HFP.Class.SELECTED_NAV_BAR_ELEMENT
            );
        }
    };

    /**
     * Fades in an HTML element determined by the given selector for jQuery
     */
    var fadeIn = function (jQuerySelector) {
        var content = $(jQuerySelector);
        content.removeClass(HFP.Class.FADE_OUT);
        content.addClass(HFP.Class.FADE_IN);
    };

    /**
     * Gets the value for a query string parameter in the URL
     */
    var getQspVal = function (key) {
        var result = new RegExp(key + "=([^&]*)", "i")
            .exec(window.location.search);
        return result && unescape(result[1]) || "";
    };

    /**
     * Forcefully redirects the browser to the 404 error page
     */
    var load404ErrorPage = function () {
        window.location = "404redirect";
    };

    /**
     * Runs the main method for the current page
     */
    var runCurrentMain = function () {
        var curPage = getCurrentPage();

        switch (curPage) {
        case HFP.Page.INDEX:
            break;

        case HFP.Page.PROJECTS:
            var idQsp = getQspVal("id");
            var id = parseInt(idQsp);
            var projects = [];
            var project;
            
            project = new Project("Ravagen");
            project.setTags(["HTML5 Canvas", "JavaScript", "Pixel Art"]);
            project.addImage("img/rav0.png");
            project.addImage("img/rav1.png");
            project.addImage("img/rav2.png");
            project.addImage("img/rav3.png");
            project.setDownloadLink("https://people.rit.edu/hfp1355/gamePrototype/prototype1.html");
            project.setDescription(
            "<p>Ravagen is my latest project, graphically inspired by older Metroid games. This current version is Ravagen's first prototype that I made for a 2-week class assignment back in late 2015. I loved working on this prototype because I got a chance to create all the assets, from graphics like the parallax background, to music and sounds, to programming and design.</p>" +
            "<p>Ravagen uses a quad-tree data structure for spatial partitioning so that fewer calculations are made when checking collisions. A basic particle effect is used for the ship's exhaust, however, in the future this will likely be changed to a style that's more \"pixel-art\" for the sake of consistency. A similar change in style is intended for the mini-map and other UI components.</p>" +
            "<p>Currently I'm working on an application that I could make games with, and my goal is to be able to create Ravagen with that creator.</p>");
            projects.push(project);

            project = new Project("Root Canal");
            project.setTags(["DirectX", "C++", "HLSL"]);
            project.addImage("img/rc0.png");
            project.addImage("img/rc1.png");
            project.setDescription(
            "<p>In early 2016, I worked with 3 others to create a small game in about 10 weeks with C++ and DirectX where you pilot a ship with the responsibility of drilling the cavities of a tooth as the bacteria tries to destroy you. We wrote some fun shaders for this assignment, like bloom, a toon shader, chromatic aberration, edge detection, and a neat CRT TV-looking shader with a scan line. We also used a computer shader to handle the opacity map of the drilled portions of the \"tooth\". Most of my efforts with the shaders were spent with the toon shader and the appropriate edge detection for it. I was the project lead for this game as I planned out the development timeline, scheduled meetings, and ensured that our scope was manageable. I worked together with the programming lead to create the engine after we planned out its design.</p>" +
            "<p>All in all, I wish we could have added more gamey components to Root Canal. This was a great experience for implementing basic shaders, but it needs some more content if it's going to be fun.<p>" +
            "<p>The game can be controlled with the arrow keys and the spacebar. The tab key toggles the x-ray effect to see the bacteria cannons beneath the \"tooth\", but it can only be used for a short amount of time before it needs to recharge.<p>");
            projects.push(project);
            
            project = new Project("A10ne Together");
            project.setTags(["Flash AS3", "User-Created Content", "Platformer"]);
            project.addImage("img/at0.png");
            project.addImage("img/at1.png");
            project.addImage("img/at2.png");
            project.addImage("img/at3.png");
            project.addImage("img/at4.png");
            project.addImage("img/at5.png");
            project.setDownloadLink("http://www.kongregate.com/games/Wooffull/test3_preview?guest_access_key=0aa9c657991a383f1bac752a49b72b8ca41e8c23a66412963f6c50bdeb628d2c");
            project.setDescription(
            "<p>A10ne Together (pronounced \"Alone Together\") was a Flash game I put together during my summer of 2013 and 2014 that used the Kongregate API to allow for shared user-created content. It was inspired by popular platformers like Super Meat Boy, but the title hints at its unique mechanic where the player is made up of pieces and must use them to navigate through the levels. The overworld is inspired by Super Mario World where the player can beat levels in different ways to unlock different paths.</p>" +
            "<p>A10ne Together also features a level maker that allows players to share custom-made levels, in addition to sharing impressive replays for in-game levels. Flash permissions must be enabled to access user-created content.<p>");
            projects.push(project);

            project = new Project("Guild of the Sparkle Dwarf");
            project.setTags(["XNA", "C#", "Puzzle Game"]);
            project.addImage("img/guild0.png");
            project.addImage("img/guild1.png");
            project.addImage("img/guild2.png");
            project.setDownloadLink("https://www.dropbox.com/s/9bdiada9lw0gzyj/Guild%20of%20the%20Sparkle%20Dwarf.zip?dl=0");
            project.setDescription(
            "<p>I worked in a team of four for ten weeks to create this " +
            "XNA game back in early 2013. This is the first game that I've ever made with a team. " +
            "Despite the challenge, it was such a great experience.</p>" +
            "<p>Guild of the Sparkle Dwarf is a puzzle game where players " +
            "race against the time to get a high score. Unfortunately, we " +
            "were pressed for time at the end, so our instructions/" +
            "tutorial section was pretty weak.</p>");
            projects.push(project);

            project = new Project("OpenGL Collect 'Em Up");
            project.setTags(["OpenGL", "C++", "GLSL"]);
            project.addImage("img/collect0.png");
            project.addImage("img/collect1.png");
            project.addImage("img/collect2.png");
            project.setDownloadLink("https://www.dropbox.com/s/izlgm80tyo5fbul/CollectEmUp.zip?dl=0");
            project.setDescription(
            "<p>In late 2015, I worked in a team of 9 people to create a small game in 15 weeks with C++ and OpenGL where you (a lizard) need to collect gears to create a machine to help you fly and become a \"dragon\". About half way through the project, we dropped down to 5 members, so our scope was cut drastically. I was the programming lead for this project and designed the software architecture. The shaders we wrote were basic vertex and pixel shaders for OpenGL.</p>" +
            "<p>My favorite part of this project is the skybox for some reason (probably because it was the first time I had to manually adjust the graphic by hand so that it wrapped properly, which turned out to be a fun exercise). It really adds an atmosphere, especially compared to a plain white background. We implemented an oct-tree for spatial partitioning, but we had issues using it successfully for collision detection. Since we were pressed for time and since there were very few entities, we resorted to simple collision detection with OBBs (Oriented Bounding Boxes) and the separating axis theorem. Also, I wish we could have added basic animation so the character didn't look so rigid, but alas that was out of our scope.</p>" +
            "<p>The character can be controlled with the WASD keys, and spacebar is used for jumping.</p>");
            projects.push(project);
            
            project = new Project("AnyBeat");
            project.setTags(["Flash AS3", "Adobe AIR", "Rhythm Game"]);
            project.addImage("img/anybeat0.png");
            project.addImage("img/anybeat1.png");
            project.addImage("img/anybeat2.png");
            project.addImage("img/anybeat3.png");
            project.addImage("img/anybeat4.png");
            project.addImage("img/anybeat5.png");
            project.setDownloadLink("https://www.dropbox.com/s/i52i4s41e5w6bev/AnyBEAT.zip?dl=0");
            project.setDescription(
            "<p>AnyBeat is a rhythm game engine I created using Adobe AIR with Flash AS3 throughout 2014. I have always loved combining music and gaming, like in popular rhythm games such as Dance Dance Revolution, StepMania, and Osu. The main purpose of AnyBeat was to create a rhythm game that used a unique controller to provide a fresh experience to the rhythm gaming scene. I wanted to use AnyBeat as a sort of rhythm game engine to create any kind of rhythm game I could imagine. Modern, casual rhythm games like the Rhythm Heaven series introduced a new spin to rhythm gaming that mirrored Wario Ware minigames, and I wanted to be able to create rhythm games as unique as those.<p>" +
            "<p>Currently, AnyBeat can mainly produce levels for rhythm games that require keyboard input. Rhythm games like StepMania were the main inspiration that led up to AnyBeat's current state.</p>");
            projects.push(project);

            project = new Project("3D Flash Engine");
            project.setTags(["Flash AS3", "3D Rendering"]);
            project.addImage("img/TDT0.png");
            project.addImage("img/TDT1.png");
            project.addImage("img/TDT2.png");
            project.setDownloadLink("https://www.dropbox.com/s/0mfy0uk27saosbl/ThirdDimensionTest.swf?dl=0");
            project.setDescription(
            "<p>During my first year at RIT (2012), I wondered " +
            "how 3D was handled in applications. I enjoy math, so I " +
            "attempted to take on the challenge of creating a basic 3D " +
            "engine from scratch, in Adobe's Flash environment. A friend of " +
            "mine was interested in the project and worked together with me " +
            "for a few months. The .swf in the download link provides an area where the user can " +
            "explore a basic 3D area where shapes are rotating and moving " +
            "around.</p>" +
            "<p>Unfortunately, we never finished with this project. " +
            "For example, we were never able to address the problem of " +
            "faces displaying incorrectly when it contains vertices both " +
            "behind and in front of the camera. Nonetheless, this was a " +
            "great learning experience for how a 3-dimensional world can " +
            "be programmatically portrayed on a 2-dimensional screen. Since then, I've been enlightened regarding 3D graphics after using OpenGL and DirectX.</p>");
            projects.push(project);

            if (isNaN(id) && idQsp === "") {
                for (var i = 0; i < projects.length; i++) {
                    var domElement = projects[i].getDomElement();

                    $("#content").append(domElement);
                    $(domElement).on(
                        "click",
                        [i],
                        function (e) {
                            window.location += "?id=" + e.data;
                        }
                    );
                }
            } else if (id >= 0 && id < projects.length) {
                var currentProject = projects[id];
                var projectPage = new ProjectPage(currentProject);

                $("#content").append(projectPage.getDomElement());
            } else {
                load404ErrorPage();
            }
            break;
        }
    };

    selectCurrentNavBarElement();
    fadeIn("#content");
    runCurrentMain();
});

})(); // End IIFE