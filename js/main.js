/**
 * Copyright 2014-2017, Hector Piñeiro II, All Rights Reserved
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
    this._downloadLink = null;
    this._tags = null;
	
	this._descriptionData = {
		background:  null,
		reflection:  null,
		duties:		 null,
		technology:  null,
		programming: null,
		graphics:    null,
		audio:       null,
		gallery:	 null,
	};

    DomElement.call(this);

    this._container = $("<div>");
    this._leftContainer = $("<div>");
    this._rightContainer = $("<div>");
    this._titleContainer = $("<div>");
    this._nameContainer = $("<h3>");
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
	
	setDescription: {
		value: function () {}	
	},

    getImages: {
        value: function () {
            return this._images;
        }
    },
	
	getBackgroundInfo: {
		value: function () {
			return this._descriptionData.background;
		}	
	},
	
	setBackgroundInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<p>" + entries[i] + "</p>";
			}
			
			value = entries.join("");
			this._descriptionData.background = value;
		}	
	},
	
	getReflectionInfo: {
		value: function () {
			return this._descriptionData.reflection;
		}	
	},
	
	setReflectionInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<p>" + entries[i] + "</p>";
			}
			
			value = entries.join("");
			
			this._descriptionData.reflection = value;
		}
	},
	
	getDutiesInfo: {
		value: function () {
			return this._descriptionData.duties;
		}
	},
	
	setDutiesInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<p>" + entries[i] + "</p>";
			}
			
			value = entries.join("");
			
			this._descriptionData.duties = value;
		}
	},
		
	getTechnologyInfo: {
		value: function () {
			return this._descriptionData.technology;
		}
	},
	
	setTechnologyInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<li>" + entries[i] + "</li>";
			}
			
			value = entries.join("");
			value = "<ul>" + value + "</ul>";
			
			this._descriptionData.technology = value;
		}	
	},
		
	getProgrammingInfo: {
		value: function () {
			return this._descriptionData.programming;
		}	
	},
	
	setProgrammingInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<p>" + entries[i] + "</p>";
			}
			
			value = entries.join("");
			
			this._descriptionData.programming = value;
		}	
	},
		
	getGraphicsInfo: {
		value: function () {
			return this._descriptionData.graphics;
		}	
	},
	
	setGraphicsInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<p>" + entries[i] + "</p>";
			}
			
			value = entries.join("");
			
			this._descriptionData.graphics = value;
		}	
	},
		
	getAudioInfo: {
		value: function () {
			return this._descriptionData.audio;
		}	
	},
	
	setAudioInfo: {
		value: function (value) {
			var entries = Array.prototype.slice.call(arguments);
			
			for (var i = 0; i < entries.length; i++) {
				entries[i] = "<p>" + entries[i] + "</p>";
			}
			
			value = entries.join("");
			
			this._descriptionData.audio = value;
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
				
				if (!_this._descriptionData.gallery) {
					_this._descriptionData.gallery = [];
				}
				
				_this._descriptionData.gallery.push(img)
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
			
			var descriptionHtml = "";
			if (this._descriptionData.background) {
            	descriptionHtml += this._descriptionData.background;
			}
			if (this._descriptionData.reflection) {
            	descriptionHtml += this._descriptionData.reflection;
			}
			this._descriptionContainer.html(descriptionHtml);

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
        this._downloadLink = $("<a href=\"" + this._project.getDownloadLink() + "\">").html("Click to play!");
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
			
			this.renderDescription();
			$('pre code').each(function(i, block) {
				hljs.highlightBlock(block);
			});

            this._imgContainer.html("");

            for (var i = 0; i < imgs.length; i++) {
                this._imgContainer.append(imgs[i]);
            }
        }
    },
	
	renderDescription: {
		value: function () {
			var desc = "";
			var data = this._project._descriptionData;
			
			if (data.background) {
				desc += "<h4>Background</h4>";
				desc += data.background;
			}
			
			if (data.reflection) {
				desc += "<h4>Reflection</h4>";
				desc += data.reflection;
			}
			
			if (data.technology) {
				desc += "<h4>Technology</h4>";
				desc += data.technology;
			}
			
			if (data.duties) {
				desc += "<h4>Duties</h4>";
				desc += data.duties;
			}
			
			if (data.programming) {
				desc += "<h4>Programming</h4>";
				desc += data.programming;
			}
			
			if (data.graphics) {
				desc += "<h4>Graphics</h4>";
				desc += data.graphics;
			}
			
			if (data.audio) {
				desc += "<h4>Audio</h4>";
				desc += data.audio;
			}
			
			if (data.gallery) {
				desc += "<h4>Gallery</h4>";
			}
			
			this._descriptionContainer.html(desc);
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
			hljs.initHighlightingOnLoad();
				
            var idQsp = getQspVal("id");
            var id = parseInt(idQsp);
            var projects = [];
            var project;
            
            project = new Project("Ravagen");
            project.setTags(["HTML5 Canvas", "JavaScript", "Game Engine Development"]);
            project.addImage("img/rav3.gif");
            project.addImage("img/rav0.png");
            project.addImage("img/rav1.png");
            project.addImage("img/rav2.png");
            project.setDownloadLink("./ravagen.html");
			project.setBackgroundInfo(
				"Futuristic space-shooter with a dash of <span class=\"keyword\">Metroid</span>.",
				"Humanity has neared its end with no success of relocating to a new home planet. The intellectual elite have created you, an AI to explore the corners of space in an effort to uncover the mysteries of life and start humanity anew.",
				"Ravagen is my latest solo project. The <span class=\"keyword\">\Click to play!\</span> link above contains Ravagen's second prototype that I made in my Level Design class in fall 2016. Its previous prototype started as a 2-week class assignment in fall 2015."
			);
			project.setReflectionInfo(
				"Through <span class=\"keyword\">playtesting</span>, I've been able to pinpoint some big issues with Ravagen's current prototype. For example, the game feels very zoomed-in, which makes it hard to maneuver through the level. As I mention in the Graphics section below, I attempt to use colors to help differentiate between areas and create mental landmarks for the player, but this didn't seem to fix the big issue at hand. Looks like I'll have to scale things down next!",
				"I faced some performance issues as I built the current version of Ravagen. (I discuss this in more detail in the Programming section below.) This piqued my interest in <span class=\"keyword\">game engine development</span>, and I actually pulled code optimizations from Ravagen to use in my current Web Game Engine (called Waffle). Creating Ravagen has led me to researching limitations of HTML5 Canvas's 2D context. Because of this, I've switched Waffle engine's rendering to a <span class=\"keyword\">WebGL</span> context by using PixiJS which has brought about significant render time improvements."
			);
			project.setDutiesInfo(
				"This is a solo project, so all duties were carried out by me."
			);
			project.setTechnologyInfo(
				"<span class=\"keyword\">HTML5 Canvas (2D)</span>",
				"<span class=\"keyword\">JavaScript</span>",
				"Personal Web Game Engine (Waffle)",
				"<span class=\"keyword\">GitHub</span>",
				"Adobe Photoshop CS5",
				"FL Studio 11"
			);
			project.setProgrammingInfo(
				"I use a <span class=\"keyword\">quadtree data structure</span> to partition the world into smaller sections. This reduces the amount of collision checks needed per frame since only nearby objects check each other for collisions.",
				"I also partition the world into <span class=\"keyword\">buckets</span> of equal size. The number of buckets depends on the size of the world. Only objects in the buckets surrounding the camera's current bucket are put in the quadtree so that building the quadtree is less expensive every frame. Consequently, not all objects in the world are updated every frame, but only those in nearby buckets (which includes everything on screen). This was a design decision to almost mimic older games that wouldn't update objects that moved off screen. Since that was mainly a hardware limitation in the past, I refrain from taking it to that extreme so that it doesn't interfere with <span class=\"keyword\">user experience</span>.",
				"I <span class=\"keyword\">batch draw calls</span> for objects with the same graphic to squeeze performance out of the 2D context with HTML5's Canvas.",
				"Here's a <span class=\"keyword\">code snippet</span> of how I acheived the camera effect that seeks ahead of the player when moving (as seen in the Gallery section below):",
				
				"<pre><code class=\"javascript hljs\">const CAMERA_FOLLOW_RATE = 0.055;\n" +
				"const MIN_SPEED_FOR_CAM_SEEK_AHEAD = 0.1; \n" +
				"const MAX_CAM_SEEK_AHEAD = 250.0; \n" +
				"const CAM_SEEK_AHEAD_SPEED_SCALE_FACTOR = 1000.0; \n" +
				"\n" +
				"/**\n" +
                " * Eases the camera's position toward the player, or ahead of the player\n" +
                " * if moving\n" +
                " */\n" +
                "function followPlayer() {\n" +
                "  var velocity = player.velocity;\n" +
                "  var velocityMag = velocity.getMagnitude();\n" +
                "\n" +
                "  // Halve the considered speed if the player's not moving very fast\n" +	
                "  if (velocityMag < MIN_SPEED_FOR_CAM_SEEK_AHEAD) velocityMag *= 0.5;\n" +
                "\n" +
                "  // Calculate the distance ahead of the player that the camera should be\n" +
                "  var seekAheadFactor = Math.min(\n" +
				"    MAX_CAM_SEEK_AHEAD,\n" +
				"    velocityMag * CAM_SEEK_AHEAD_SPEED_SCALE_FACTOR\n" +
				"  );\n" +
                "  var maxCamPos = velocity.clone().normalize().multiply(seekAheadFactor);\n" +
                "\n" +	
                "  // Calculate the camera's displacement to the new position then\n" +		
                "  // multiply it by a \"Follow rate\" to ease the camera to that position\n" +			
                "  // over time\n" +
                "  var cameraDisplacement = Vec2.subtract(\n" +				
                "    worldOffset,\n" +		
                "    player.position.clone().add(maxCamPos)\n" +					
                "  );\n" +					
                "  cameraDisplacement.multiply(CAMERA_FOLLOW_RATE);\n" +						
                "\n" +			
                "  // Move the camera to its final position\n" +			
                "  worldOffset.subtract(cameraDisplacement);\n" +				
                "}</code></pre>"
			);
			project.setGraphicsInfo(
				"I lightly referenced Metroid Fusion for the general aesthetic of Ravagen. I used Ravagen's first couple prototypes to jump into learning pixel art. Since then, I've continued my studies by analyzing art of games from older consoles (SNES, GBA, etc), and following pixel art Twitter prompts and occasionally posting my work <span class=\"keyword\">@Wooffull</span>.",
				"Since Ravagen's prototype only comprises of a single large level, I used differently colored wall tiles to differentiate between major sections of the level. For example: the green areas are only accessible once the player has found the bullet power up; the red area leads to the end as a \"cliffhanger\" until the next build of Ravagen is released. Also, the \"environmental art\" such as the crystals sticking out of the walls are specific to its tile's color. For instance, the red crystals only come out of the green tiles.",
				"The final version of Ravagen will have <span class=\"keyword\">lights/ shadows</span> to hone in on certain moods for different sections of the game."
			);
			project.setAudioInfo(
				"I have always been interested in composition, especially for games. I decided to explore some retro game sounds for Ravagen's initial prototype by using the FamiSynthII VST with FL Studio 11. The results from these experiments led to what you can hear in Ravagen's current soundtrack.",
				"I went on to create a new theme for Ravagen after I finished its current prototype &ndash; the new theme can be found in the <span class=\"keyword\">Music</span> section of my portfolio. I introduce a <span class=\"keyword\">minimalistic motif</span> that I intend to spread throughout Ravagen's soundtrack."
			);
            projects.push(project);
				
            
            project = new Project("A10ne Together");
            project.setTags(["Flash AS3", "User-Created Content", "Built-In Level Editor"]);
            project.addImage("img/at5.gif");
            project.addImage("img/at0.png");
            project.addImage("img/at1.png");
            project.addImage("img/at2.png");
            project.addImage("img/at3.png");
            project.addImage("img/at4.png");
            project.setDownloadLink("http://www.kongregate.com/games/Wooffull/test3_preview?guest_access_key=0aa9c657991a383f1bac752a49b72b8ca41e8c23a66412963f6c50bdeb628d2c");
			project.setBackgroundInfo(
				"Fast-paced platformer where you use the pieces that break off your character as platforms.",
				"A10ne Together (pronounced \"Alone Together\") is a Flash game I put together during my summer of 2013 and 2014 that used the Kongregate API to allow for shared <span class=\"keyword\">user-created content</span>. It was inspired by popular platformers like Super Meat Boy, but the title hints at its unique mechanic where the player is made up of pieces and must use them to navigate through the levels. The overworld is inspired by Super Mario World where the player can beat levels in different ways to unlock different paths.",
				"A10ne Together also features a level maker that allows players to share custom-made levels, in addition to sharing impressive <span class=\"keyword\">replays</span> for in-game levels. Flash permissions must be enabled to access user-created content."
			);
			project.setReflectionInfo(
				"I regrettably left A10ne Together in an unfinished state. The unique mechanic of parts falling off the player to be used as platforms (which come back after staying still) was met with ample bugs. In fact, there are still bugs with that feature that prevent me from releasing it.",
				"If I fixed the bugs with the block-breaking feature, I would have to flesh out the levels &ndash; fortunately, that would be easy since A10ne Together comes with a level editor.",
				"I never intended to include heavy narrative in A10ne Together, but instead I wanted to lightly introduce it through the dialogues that display before every level starts. Given the time, I would still like to put an ending on A10ne Together."
			);
			project.setTechnologyInfo(
				"<span class=\"keyword\">Adobe Flash Professional CS6</span>",
				"<span class=\"keyword\">ActionScript 3</span>",
				"Kongregate API",
				"Adobe Photoshop CS5"
			);
			project.setDutiesInfo(
				"This is a solo project, so all duties were carried out by me."
			);
            projects.push(project);
				

            project = new Project("Root Canal");
            project.setTags(["DirectX", "C++", "HLSL"]);
            project.addImage("img/rc2.gif");
            project.addImage("img/rc0.png");
            project.addImage("img/rc1.png");
			project.setBackgroundInfo(
				"Top-down exploration game where you drill a tooth in search of cavities.",
				"In Root Canal, you guide a small ship through a tooth in hope of destroying cavities. Use your x-ray vision to avoid the bacteria cannons as you drill as much as you can before inevitable destruction."
			);	
			project.setReflectionInfo(
				"Our team dynamic could have benefited from more frequent communication and stricter deadlines. As project lead, I should have created a more ambitious timeline to discourage everyone from treating the deadlines as flexible.",
				"Nonetheless, the focus of this project was to experiment with <span class=\"keyword\">DirectX</span> and <span class=\"keyword\">HLSL</span>. We prototyped the gameplay in <span class=\"keyword\">Unity 4</span> before we switched over to our own engine in <span class=\"keyword\">C++</span>. This allowed us to drill down the core features we needed. Regardless, Root Canal is missing its fun factor. By introducing a goal, some way to progress as a player, and more interactivity (with enemies, the world, etc), I think the fun factor will start to show."
			);
			project.setTechnologyInfo(
				"<span class=\"keyword\">DirectX</span>",
				"<span class=\"keyword\">C++</span>",
				"<span class=\"keyword\">HLSL (High-Level Shader Language)</span>",
				"<span class=\"keyword\">GitHub</span>",
				"Autodesk Maya 2014",
				"Adobe Photoshop CS5",
				"Slack"
			);
			project.setDutiesInfo(
				"I wrote the <span class=\"keyword\">toon shader</span> in <span class=\"keyword\">HLSL</span>, and tweaked the others so that they worked nicely with each other.",
				"I worked together with the programming lead to design and program the engine. Our resulting engine was a result of merging 2 of our OpenGL engines and the base DirectX engine we were given.",
				"I was the <span class=\"keyword\">project lead</span>. I planned out the development timeline, scheduled meetings, and ensured our scope was manageable."
			);	
			project.setProgrammingInfo(
				"Since I wrote the <span class=\"keyword\">toon shader</span>, I created a texture that defined the ramps for color banding. This was a simple texture that used four shades of gray (white, light gray, dark gray, black). The shade used for the \"toon shading\" calculation depends on how much light a certain pixel received. This was a simple mapping from percentage of light (as the x-coordinate) to the color defined at the <span class=\"keyword\">UV-coordinates</span> on the color ramp texture.",
				"Edge detection was used in both toon shading and as a way of outlining objects when using x-ray vision (as seen in the Gallery below).",
				"We used a <span class=\"keyword\">compute shader</span> to handle the <span class=\"keyword\">opacity map</span> of the drilled portions of the \"tooth\". <span class=\"keyword\">Bloom</span>, <span class=\"keyword\">chromatic aberration</span>, and a neat CRT TV-looking shader with a scan line were also used to give Root Canal the aesthetic is has."
			);	
			project.setGraphicsInfo(
				"I used Maya 2014 to create the simple models for the bacteria cannons and bullets. The ship and drill models were created by a teammate."
			);
			project.setAudioInfo(
				"The background music and sounds were composed by a teammate as a project for his music technology class."
			);
            projects.push(project);
				

            project = new Project("Guild of the Sparkle Dwarf");
            project.setTags(["XNA", "C#", "Puzzle Game"]);
            project.addImage("img/guild3.gif");
            project.addImage("img/guild4.gif");
            project.addImage("img/guild1.png");
            project.addImage("img/guild2.png");
            project.setDownloadLink("https://www.dropbox.com/s/9bdiada9lw0gzyj/Guild%20of%20the%20Sparkle%20Dwarf.zip?dl=0");
				
            project.setBackgroundInfo(
				"Puzzle game with a focus on Othello-like and block sliding puzzles.",
				"I worked in a team of four for ten weeks to create this XNA game back in early 2013. This is the first game that I've ever made with a team. Despite the challenge, it was such a great experience.",
				"Guild of the Sparkle Dwarf is a puzzle game where players race against the time to get a high score. Unfortunately, we were pressed for time at the end, so our instructions/ tutorial section was pretty weak."
			);
            projects.push(project);
				

            project = new Project("OpenGL Collect 'Em Up");
            project.setTags(["OpenGL", "C++", "GLSL"]);
            project.addImage("img/collect0.png");
            project.addImage("img/collect1.png");
            project.addImage("img/collect2.png");
            project.setDownloadLink("https://www.dropbox.com/s/izlgm80tyo5fbul/CollectEmUp.zip?dl=0");
            project.setBackgroundInfo(
				"3D platformer following a lizard on his journey to become a dragon.",
				"In late 2015, I worked in a team of 9 people to create a small game in 15 weeks with C++ and OpenGL where you (a lizard) need to collect gears to create a machine to help you fly and become a \"dragon\". About half way through the project, we dropped down to 5 members, so our scope was cut drastically. I was the programming lead for this project and designed the software architecture. The shaders we wrote were basic vertex and pixel shaders for OpenGL.",
				"My favorite part of this project is the skybox for some reason (probably because it was the first time I had to manually adjust the graphic by hand so that it wrapped properly, which turned out to be a fun exercise). It really adds an atmosphere, especially compared to a plain white background. We implemented an oct-tree for spatial partitioning, but we had issues using it successfully for collision detection. Since we were pressed for time and since there were very few entities, we resorted to simple collision detection with OBBs (Oriented Bounding Boxes) and the separating axis theorem. Also, I wish we could have added basic animation so the character didn't look so rigid, but alas that was out of our scope.",
				"The character can be controlled with the WASD keys, and spacebar is used for jumping."
			);
            projects.push(project);

			
            project = new Project("AnyBeat");
            project.setTags(["Flash AS3", "Adobe AIR", "Rhythm Game"]);
            project.addImage("img/anybeat1.gif");
            project.addImage("img/anybeat0.png");
            project.addImage("img/anybeat2.png");
            project.addImage("img/anybeat3.png");
            project.addImage("img/anybeat4.png");
            project.addImage("img/anybeat5.png");
            project.setDownloadLink("https://www.dropbox.com/s/i52i4s41e5w6bev/AnyBEAT.zip?dl=0");
            project.setBackgroundInfo(
				"Rhythm game engine used for creating experimental rhythm games.",
				"AnyBeat is a rhythm game engine I created using Adobe AIR with Flash AS3 throughout 2014. I have always loved combining music and gaming, like in popular rhythm games such as Dance Dance Revolution, StepMania, and Osu. The main purpose of AnyBeat was to create a rhythm game that used a unique controller to provide a fresh experience to the rhythm gaming scene. I wanted to use AnyBeat as a sort of rhythm game engine to create any kind of rhythm game I could imagine. Modern, casual rhythm games like the Rhythm Heaven series introduced a new spin to rhythm gaming that mirrored Wario Ware minigames, and I wanted to be able to create rhythm games as unique as those.",
				"Currently, AnyBeat can mainly produce levels for rhythm games that require keyboard input. Rhythm games like StepMania were the main inspiration that led up to AnyBeat's current state."
			);
			project.setDutiesInfo(
				"This is a solo project, so all duties were carried out by me."
			);
            projects.push(project);

				
            project = new Project("3D Flash Engine");
            project.setTags(["Flash AS3", "3D Rendering"]);
            project.addImage("img/TDT2.gif");
            project.addImage("img/TDT0.png");
            project.addImage("img/TDT1.png");
            project.setDownloadLink("https://www.dropbox.com/s/0mfy0uk27saosbl/ThirdDimensionTest.swf?dl=0");
            project.setBackgroundInfo(
				"Primitive 3D graphics rendering engine made in Flash.",
				"During my first year at RIT (2012), I wondered how 3D was handled in applications. I enjoy math, so I attempted to take on the challenge of creating a basic 3D engine from scratch, in Adobe's Flash environment. A friend of mine was interested in the project and worked together with me for a few months. The .swf in the download link provides an area where the user can explore a basic 3D area where shapes are rotating and moving around.",
				"Unfortunately, we never finished with this project. For example, we were never able to address the problem of faces displaying incorrectly when it contains vertices both behind and in front of the camera. Nonetheless, this was a great learning experience for how a 3-dimensional world can be programmatically portrayed on a 2-dimensional screen. Since then, I've been enlightened regarding 3D graphics after using OpenGL and DirectX."
			);
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