"use strict";

var app = app || {};

(function () {
    var EntityBuilder = function () {
    };
    Object.defineProperties(EntityBuilder, {
        ENTITIES : {
            value : (function () {
                var entities = [];
                var create = function (className) {
                    entities[className.id] = className;
                };

                create(app.FullBlock);
                create(app.FullBlock2);
                create(app.FullBlock3);
                create(app.FullBlock4);
                create(app.HalfBlock);
                create(app.HalfBlock2);
                create(app.HalfBlock3);
                create(app.BlockPillar5);
                create(app.BlockPillar5R);
                create(app.NeedBlock1);
                create(app.NeedBlock2);
                create(app.NeedBlock3);
                create(app.NeedBlock4);
                create(app.NeedBlock5);
                create(app.ExitBlock);
                create(app.RavageMite);
                create(app.ExVisionist);
                create(app.Drainer);
                create(app.ReachWall);
                create(app.WallGel);
                create(app.Expandium);
                create(app.HealthOrb);
                create(app.PowerUpBullet);
                create(app.SpawnPoint);
                create(app.CheckPoint);
                create(app.Plant1);
                create(app.Plant2);
                create(app.Plant3);
                create(app.Plant4);
                create(app.Plant5);
                create(app.TextControl);
                create(app.TextPulse);
                create(app.TextBullet);

                return entities;
            })()
        },

        build : {
            value : function (options) {
                var entityClass = EntityBuilder.ENTITIES[options.id];

                var entity = new entityClass();
                entity.position.x = options.position.x;
                entity.position.y = options.position.y;
                entity.velocity.x = options.velocity.x;
                entity.velocity.y = options.velocity.y;
                entity.acceleration.x = options.acceleration.x;
                entity.acceleration.y = options.acceleration.y;
                entity.setRotation(options.rotation);

                return entity;
            }
        }
    });
    Object.freeze(EntityBuilder);

    app.EntityBuilder = EntityBuilder;
})();