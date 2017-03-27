"use strict";

var app = app || {};

(function () {

    var Level = function () {
        this.collectedExpandium = 0;
        this.neededExpandium = 0;
        this.gameObjects = [];
        this.checkPoint = null;
        this.startPosition = new app.Vec2();
        this.id = -1;
    };
    Object.defineProperties(Level, {
        TILE_SIZE : {
            value : 128
        },

        importJson : {
            value : function (data, _isEditor) {
                if (typeof _isEditor !== "boolean") {
                    _isEditor = false;
                }

                var prevLevel = app.main.currentLevel;
                var level = new Level();
                var prevCheckPoint = null;

                if (prevLevel && prevLevel.checkPoint) {
                    prevCheckPoint = prevLevel.checkPoint;
                }

                try {
                    var json = JSON.parse(data);
                    var gameObjects = json.gameObjects;

                    app.main.reset();

                    for (var i = 0; i < gameObjects.length; i++) {
                        var cur = gameObjects[i];

                        // For spawnpoints, just set the startPosition
                        if (!_isEditor && cur.id === app.SpawnPoint.id) {
                            if (prevCheckPoint) {
                                level.startPosition = prevCheckPoint.position.clone();
                            } else {
                                level.startPosition = new app.Vec2(
                                    cur.position.x,
                                    cur.position.y
                                );
                            }

                        } else {
                            var entity = app.EntityBuilder.build(cur);

                            if (entity) {
                                if (_isEditor) {
                                    app.main.addGameObject(entity);
                                } else {
                                    level.gameObjects.push(entity);

                                    // Activate the checkpoint if necessary
                                    if (prevCheckPoint && (entity instanceof app.CheckPoint) &&
                                        entity.position.x === prevCheckPoint.position.x && entity.position.y === prevCheckPoint.position.y) {

                                        level.checkPoint = entity;
                                        level.checkPoint.inUse = true;
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log("JSON Parse Error: " + e);
                }

                return level;
            }
        },

        exportJson : {
            value : function () {
                var json = {
                    gameObjects : []
                };
                var gameObjects = app.main.gameObjects;

                for (var i = 0; i < gameObjects.length; i++) {
                    var cur = gameObjects[i];
                    var gameObjectData = {};

                    gameObjectData.id = cur.id;
                    gameObjectData.position = cur.position;
                    gameObjectData.velocity = cur.velocity;
                    gameObjectData.acceleration = cur.acceleration;
                    gameObjectData.rotation = cur.rotation;

                    json.gameObjects.push(gameObjectData);
                }

                return JSON.stringify(json);
            }
        },

        selectLevel : {
            value : function (id) {
                var level = new Level();

                switch (id) {
                case -1:
                    level.id = -1;
                    level.neededExpandium = 5;
                    level.setStartTile(6, 9);

                    level.addAtTile(new app.FullBlock(), 3, 0);
                    level.addAtTile(new app.FullBlock(), 3, 1);
                    level.addAtTile(new app.FullBlock(), 3, 2);
                    level.addAtTile(new app.FullBlock(), 3, 3);
                    level.addAtTile(new app.FullBlock(), 3, 4);
                    level.addAtTile(new app.FullBlock(), 3, 5);
                    level.addAtTile(new app.FullBlock(), 3, 6);
                    level.addAtTile(new app.FullBlock(), 3, 7);
                    level.addAtTile(new app.FullBlock(), 3, 8);
                    level.addAtTile(new app.FullBlock(), 3, 9);
                    level.addAtTile(new app.FullBlock(), 3, 10);
                    level.addAtTile(new app.FullBlock(), 3, 11);

                    level.addAtTile(new app.FullBlock(), 4, 0);
                    level.addAtTile(new app.HalfBlock(), 4, 1, 0, 0, Math.PI * 0.5);
                    level.addAtTile(new app.HalfBlock(), 4, 3);
                    level.addAtTile(new app.FullBlock(), 4, 4);
                    level.addAtTile(new app.FullBlock(), 4, 5);
                    level.addAtTile(new app.FullBlock(), 4, 6);
                    level.addAtTile(new app.FullBlock(), 4, 7);
                    level.addAtTile(new app.FullBlock(), 4, 8);
                    level.addAtTile(new app.FullBlock(), 4, 9);
                    level.addAtTile(new app.FullBlock(), 4, 10);
                    level.addAtTile(new app.FullBlock(), 4, 11);

                    level.addAtTile(new app.FullBlock(), 5, 0);
                    level.addAtTile(new app.HalfBlock(), 5, 4);
                    level.addAtTile(new app.FullBlock(), 5, 5);
                    level.addAtTile(new app.HalfBlock(), 5, 6, 0, 0, Math.PI * 0.5);
                    level.addAtTile(new app.HalfBlock(), 5, 9);
                    level.addAtTile(new app.FullBlock(), 5, 10);
                    level.addAtTile(new app.FullBlock(), 5, 11);

                    level.addAtTile(new app.FullBlock(), 6, 0);
                    level.addAtTile(new app.TextField("Press Z to Shoot"), 6, 3);
                    level.addAtTile(new app.Expandium(), 6, 7);
                    level.addAtTile(new app.TextField("Move with the Arrow Keys"), 6, 8);
                    level.addAtTile(new app.FullBlock(), 6, 10);
                    level.addAtTile(new app.FullBlock(), 6, 11);

                    level.addAtTile(new app.FullBlock(), 7, 0);
                    level.addAtTile(new app.HalfBlock(), 7, 4, 0, 0, -Math.PI * 0.5);
                    level.addAtTile(new app.FullBlock(), 7, 5);
                    level.addAtTile(new app.HalfBlock(), 7, 6, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 7, 9, 0, 0, -Math.PI * 0.5);
                    level.addAtTile(new app.FullBlock(), 7, 10);
                    level.addAtTile(new app.FullBlock(), 7, 11);

                    level.addAtTile(new app.FullBlock(), 8, 0);
                    level.addAtTile(new app.HalfBlock(), 8, 1, 0, 0, Math.PI);
                    level.addAtTile(new app.RavageMite(), 8, 2);
                    level.addAtTile(new app.HalfBlock(), 8, 3, 0, 0, -Math.PI * 0.5);
                    level.addAtTile(new app.FullBlock(), 8, 4);
                    level.addAtTile(new app.FullBlock(), 8, 5);
                    level.addAtTile(new app.FullBlock(), 8, 6);
                    level.addAtTile(new app.FullBlock(), 8, 7);
                    level.addAtTile(new app.FullBlock(), 8, 8);
                    level.addAtTile(new app.FullBlock(), 8, 9);
                    level.addAtTile(new app.FullBlock(), 8, 10);
                    level.addAtTile(new app.FullBlock(), 8, 11);

                    level.addAtTile(new app.FullBlock(), 9, 0);
                    level.addAtTile(new app.FullBlock(), 9, 1);
                    level.addAtTile(new app.HealthOrb(), 9, 2);
                    level.addAtTile(new app.FullBlock(), 9, 3);
                    level.addAtTile(new app.FullBlock(), 9, 4);
                    level.addAtTile(new app.FullBlock(), 9, 5);
                    level.addAtTile(new app.FullBlock(), 9, 6);
                    level.addAtTile(new app.FullBlock(), 9, 7);
                    level.addAtTile(new app.FullBlock(), 9, 8);
                    level.addAtTile(new app.FullBlock(), 9, 9);
                    level.addAtTile(new app.FullBlock(), 9, 10);
                    level.addAtTile(new app.FullBlock(), 9, 11);

                    level.addAtTile(new app.Expandium(), 10, 2);

                    level.addAtTile(new app.ExVisionist(), 11, 2);
                    break;

                case 0:
                    level.id = 0;
                    level.neededExpandium = 3;
                    level.setStartTile(3, 20);

                    level.addAtTile(new app.ExitBlock(), 4, 0);

                    level.addAtTile(new app.TextField("Move with the Arrow Keys"), 3, 19);
                    level.addAtTile(new app.TextField("Press Z to Shoot"), 3, 12);

                    // Add top and bottom borders
                    for (var i = -1; i < 25; i++) {
                        if (i !== 4) {
                            level.addAtTile(new app.FullBlock(), i, 0);
                        }

                        level.addAtTile(new app.FullBlock(), i, 21);
                        level.addAtTile(new app.FullBlock(), i, 22);
                    }

                    // Add left and right borders
                    for (var j = 1; j < 21; j++) {
                        level.addAtTile(new app.FullBlock(), -1, j);
                        level.addAtTile(new app.FullBlock(), 24, j);
                    }

                    // Add Expandium
                    level.addAtTile(new app.Expandium(), 3, 18);
                    level.addAtTile(new app.Expandium(), 18, 4);
                    level.addAtTile(new app.Expandium(), 17, 15);

                    // Add Health Orbs
                    level.addAtTile(new app.HealthOrb(), 3, 9);
                    level.addAtTile(new app.HealthOrb(), 13, 11);
                    level.addAtTile(new app.HealthOrb(), 14, 3);
                    level.addAtTile(new app.HealthOrb(), 22, 2);
                    level.addAtTile(new app.HealthOrb(), 21, 7);
                    level.addAtTile(new app.HealthOrb(), 21, 19);

                    // Add Drainers
                    level.addAtTile(new app.Drainer(), 2, 12);
                    level.addAtTile(new app.Drainer(), 3, 11);
                    level.addAtTile(new app.Drainer(), 4, 12);
                    level.addAtTile(new app.Drainer(), 6, 1);
                    level.addAtTile(new app.Drainer(), 6, 2);
                    level.addAtTile(new app.Drainer(), 16, 16);

                    // Add Ravage Mites
                    level.addAtTile(new app.RavageMite(), 15, 7);
                    level.addAtTile(new app.RavageMite(), 15, 11);
                    level.addAtTile(new app.RavageMite(), 17, 2);
                    level.addAtTile(new app.RavageMite(), 18, 14);
                    level.addAtTile(new app.RavageMite(), 21, 17);

                    level.addAtTile(new app.Absorber(), 14, 7);

                    // Add Ex-Visionists
                    level.addAtTile(new app.ExVisionist(), 13, 19);
                    level.addAtTile(new app.ExVisionist(), 20, 4);

                    // Add Half Blocks (Top-Left)
                    level.addAtTile(new app.HalfBlock(), 0, 3, 0, 0, 0.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 1, 1, 0, 0, 0.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 1, 10, 0, 0, 0.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 1, 17, 0, 0, 0.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 20, 18, 0, 0, 0.5 * Math.PI);

                    // Add Half Blocks (Top-Right)
                    level.addAtTile(new app.HalfBlock(), 3, 6, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 4, 7, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 5, 10, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 5, 17, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 14, 16, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 16, 18, 0, 0, Math.PI);
                    level.addAtTile(new app.HalfBlock(), 16, 6, 0, 0, Math.PI);

                    // Add Half Blocks (Bottom-Right)
                    level.addAtTile(new app.HalfBlock(), 3, 3, 0, 0, 1.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 5, 13, 0, 0, 1.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 5, 20, 0, 0, 1.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 14, 12, 0, 0, 1.5 * Math.PI);
                    level.addAtTile(new app.HalfBlock(), 23, 9, 0, 0, 1.5 * Math.PI);

                    // Add Half Blocks (Bottom-Left)
                    level.addAtTile(new app.HalfBlock(), 0, 6);
                    level.addAtTile(new app.HalfBlock(), 1, 7);
                    level.addAtTile(new app.HalfBlock(), 1, 13);
                    level.addAtTile(new app.HalfBlock(), 1, 20);
                    level.addAtTile(new app.HalfBlock(), 12, 3);
                    level.addAtTile(new app.HalfBlock(), 13, 8);
                    level.addAtTile(new app.HalfBlock(), 17, 5);
                    level.addAtTile(new app.HalfBlock(), 20, 9);
                    level.addAtTile(new app.HalfBlock(), 20, 12);

                    // Add Full Blocks
                    level.addAtTile(new app.FullBlock(), 0, 1);
                    level.addAtTile(new app.FullBlock(), 0, 2);
                    level.addAtTile(new app.FullBlock(), 0, 7);
                    level.addAtTile(new app.FullBlock(), 0, 8);
                    level.addAtTile(new app.FullBlock(), 0, 9);
                    level.addAtTile(new app.FullBlock(), 0, 10);
                    level.addAtTile(new app.FullBlock(), 0, 11);
                    level.addAtTile(new app.FullBlock(), 0, 12);
                    level.addAtTile(new app.FullBlock(), 0, 13);
                    level.addAtTile(new app.FullBlock(), 0, 14);
                    level.addAtTile(new app.FullBlock(), 0, 15);
                    level.addAtTile(new app.FullBlock(), 0, 16);
                    level.addAtTile(new app.FullBlock(), 0, 17);
                    level.addAtTile(new app.FullBlock(), 0, 18);
                    level.addAtTile(new app.FullBlock(), 0, 19);
                    level.addAtTile(new app.FullBlock(), 0, 20);

                    level.addAtTile(new app.FullBlock(), 1, 8);
                    level.addAtTile(new app.FullBlock(), 1, 9);
                    level.addAtTile(new app.FullBlock(), 1, 14);
                    level.addAtTile(new app.FullBlock(), 1, 15);
                    level.addAtTile(new app.FullBlock(), 1, 16);

                    level.addAtTile(new app.FullBlock(), 3, 4);
                    level.addAtTile(new app.FullBlock(), 3, 5);

                    level.addAtTile(new app.FullBlock(), 4, 3);
                    level.addAtTile(new app.FullBlock(), 4, 4);
                    level.addAtTile(new app.FullBlock(), 4, 5);
                    level.addAtTile(new app.FullBlock(), 4, 6);

                    level.addAtTile(new app.FullBlock(), 5, 3);
                    level.addAtTile(new app.FullBlock(), 5, 4);
                    level.addAtTile(new app.FullBlock(), 5, 5);
                    level.addAtTile(new app.FullBlock(), 5, 6);
                    level.addAtTile(new app.FullBlock(), 5, 7);
                    level.addAtTile(new app.FullBlock(), 5, 8);
                    level.addAtTile(new app.FullBlock(), 5, 9);
                    level.addAtTile(new app.FullBlock(), 5, 14);
                    level.addAtTile(new app.FullBlock(), 5, 15);
                    level.addAtTile(new app.FullBlock(), 5, 16);

                    level.addAtTile(new app.FullBlock(), 6, 3);
                    level.addAtTile(new app.FullBlock(), 6, 4);
                    level.addAtTile(new app.FullBlock(), 6, 5);
                    level.addAtTile(new app.FullBlock(), 6, 6);
                    level.addAtTile(new app.FullBlock(), 6, 7);
                    level.addAtTile(new app.FullBlock(), 6, 8);
                    level.addAtTile(new app.FullBlock(), 6, 9);
                    level.addAtTile(new app.FullBlock(), 6, 10);
                    level.addAtTile(new app.FullBlock(), 6, 11);
                    level.addAtTile(new app.FullBlock(), 6, 12);
                    level.addAtTile(new app.FullBlock(), 6, 13);
                    level.addAtTile(new app.FullBlock(), 6, 14);
                    level.addAtTile(new app.FullBlock(), 6, 15);
                    level.addAtTile(new app.FullBlock(), 6, 16);
                    level.addAtTile(new app.FullBlock(), 6, 17);
                    level.addAtTile(new app.FullBlock(), 6, 18);
                    level.addAtTile(new app.FullBlock(), 6, 19);
                    level.addAtTile(new app.FullBlock(), 6, 20);


                    for (var j = 3; j < 21; j++) {
                        level.addAtTile(new app.FullBlock(), 7, j);
                        level.addAtTile(new app.FullBlock(), 8, j);
                        level.addAtTile(new app.FullBlock(), 9, j);
                        level.addAtTile(new app.FullBlock(), 10, j);
                        level.addAtTile(new app.FullBlock(), 11, j);
                    }

                    level.addAtTile(new app.FullBlock(), 12, 4);
                    level.addAtTile(new app.FullBlock(), 12, 5);
                    level.addAtTile(new app.FullBlock(), 12, 6);
                    level.addAtTile(new app.FullBlock(), 12, 7);
                    level.addAtTile(new app.FullBlock(), 12, 8);
                    level.addAtTile(new app.FullBlock(), 12, 9);

                    level.addAtTile(new app.FullBlock(), 13, 9);

                    level.addAtTile(new app.FullBlock(), 14, 9);
                    level.addAtTile(new app.FullBlock(), 14, 13);
                    level.addAtTile(new app.FullBlock(), 14, 14);
                    level.addAtTile(new app.FullBlock(), 14, 15);

                    level.addAtTile(new app.FullBlock(), 15, 9);
                    level.addAtTile(new app.FullBlock(), 15, 12);
                    level.addAtTile(new app.FullBlock(), 16, 9);
                    level.addAtTile(new app.FullBlock(), 16, 12);

                    level.addAtTile(new app.FullBlock(), 17, 9);
                    level.addAtTile(new app.FullBlock(), 17, 12);
                    level.addAtTile(new app.FullBlock(), 17, 18);
                    level.addAtTile(new app.FullBlock(), 18, 9);
                    level.addAtTile(new app.FullBlock(), 18, 12);
                    level.addAtTile(new app.FullBlock(), 18, 18);
                    level.addAtTile(new app.FullBlock(), 19, 9);
                    level.addAtTile(new app.FullBlock(), 19, 12);
                    level.addAtTile(new app.FullBlock(), 19, 18);

                    level.addAtTile(new app.FullBlock(), 20, 13);
                    level.addAtTile(new app.FullBlock(), 20, 14);
                    level.addAtTile(new app.FullBlock(), 20, 15);
                    level.addAtTile(new app.FullBlock(), 20, 16);
                    level.addAtTile(new app.FullBlock(), 20, 17);

                    level.addAtTile(new app.FullBlock(), 23, 10);
                    level.addAtTile(new app.FullBlock(), 23, 11);
                    level.addAtTile(new app.FullBlock(), 23, 12);
                    level.addAtTile(new app.FullBlock(), 23, 13);
                    level.addAtTile(new app.FullBlock(), 23, 14);
                    level.addAtTile(new app.FullBlock(), 23, 15);
                    level.addAtTile(new app.FullBlock(), 23, 16);
                    level.addAtTile(new app.FullBlock(), 23, 17);
                    level.addAtTile(new app.FullBlock(), 23, 18);
                    level.addAtTile(new app.FullBlock(), 23, 19);
                    level.addAtTile(new app.FullBlock(), 23, 20);

                    level.addAtTile(new app.FullBlock(), 16, 3);
                    level.addAtTile(new app.FullBlock(), 16, 4);
                    level.addAtTile(new app.FullBlock(), 16, 5);

                    level.addAtTile(new app.FullBlock(), 17, 6);
                    level.addAtTile(new app.FullBlock(), 18, 6);

                    break;
                }

                return level;
            }
        }
    });
    Level.prototype = Object.freeze(Object.create(Level.prototype, {
        start : {
            value : function () {
                // Clear objects from the previous level
                //app.main.reset();

                var collectedKeyItems = app.main.collectedKeyItems;

                this.collectedExpandium = 0;
                this.neededExpandium = 0;

                app.main.player.position.x = this.startPosition.x;
                app.main.player.position.y = this.startPosition.y;

                // Add the objects from this level
                for (var i = 0; i < this.gameObjects.length; i++) {
                    var cur = this.gameObjects[i];
                    var mustAdd = true;

                    if (cur instanceof app.Expandium) {
                        this.neededExpandium++;
                    }

                    for (var j = 0; j < collectedKeyItems.length; j++) {
                        if (collectedKeyItems[j].position.x === cur.position.x && collectedKeyItems[j].position.y === cur.position.y) {
                            mustAdd = false;

                            if (collectedKeyItems[j] instanceof app.Expandium) {
                                this.collectedExpandium++;
                            }
                            if (collectedKeyItems[j] instanceof app.PowerUpBullet) {
                                app.main.canShootBullet = true;
                            }
                        }
                    }

                    if (mustAdd) {
                        app.main.addGameObject(cur);
                    }
                }
                
                // Init all objects that were added
                for (var i = 0; i < this.gameObjects.length; i++) {
                    this.gameObjects[i].init();
                }
            }
        },

        addAtTile : {
            value : function (gameObject, tileX, tileY, offsetX, offsetY, rotation) {
                if (isNaN(offsetX)) offsetX = 0;
                if (isNaN(offsetY)) offsetY = 0;
                if (isNaN(rotation)) rotation = 0;

                gameObject.position.x = tileX * Level.TILE_SIZE + offsetX;
                gameObject.position.y = tileY * Level.TILE_SIZE + offsetY;
                gameObject.rotate(rotation);
                this.gameObjects.push(gameObject);
            }
        },

        setStartTile : {
            value : function (tileX, tileY) {
                this.startPosition.x = tileX * Level.TILE_SIZE;
                this.startPosition.y = tileY * Level.TILE_SIZE;
            }
        }
    }));
    Object.freeze(Level);
    app.Level = Level;

})();