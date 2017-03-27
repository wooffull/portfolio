"use strict";

var app = app || {};

(function () {

    /**
     * A text field to be displayed in the game world
     * (Useful for tutorial text)
     */
    var TextField = function (text) {
        if (typeof text !== "string") {
            text = "";
        }

        app.PhysicsObject.call(this);

        this.text = text;
        this.font = TextField.DEFAULT_FONT;
        this.fontSize = TextField.DEFAULT_FONT_SIZE;
        this.fillStyle = TextField.DEFAULT_FILL_STYLE;
        this.strokeStyle = TextField.DEFAULT_STROKE_STYLE;
        this.textAlign = TextField.DEFAULT_TEXT_ALIGN;
        this.minAlpha = TextField.DEFAULT_MIN_ALPHA;
        this.maxAlpha = TextField.DEFAULT_MAX_ALPHA;
        this.maxGlowTimer = TextField.DEFAULT_MAX_GLOW_TIMER;
        this.fixed = true;
        this.glowTimer = 0;
        
        // Temporary values -- so that text doesn't get cut off when it's half off the screen
        this.width = 300;
        this.height = 20;
    };
    Object.defineProperties(TextField, {
        DEFAULT_FONT : {
            value : "Ubuntu"
        },

        DEFAULT_FONT_SIZE : {
            value : 20
        },

        DEFAULT_FILL_STYLE : {
            value : "rgb(255, 255, 255)"
        },

        DEFAULT_STROKE_STYLE : {
            value : "transparent"
        },

        DEFAULT_TEXT_ALIGN : {
            value : "center"
        },

        DEFAULT_MAX_GLOW_TIMER : {
            value : 120
        },

        DEFAULT_MIN_ALPHA : {
            value : 0.4
        },

        DEFAULT_MAX_ALPHA : {
            value : 0.85
        }
    });
    TextField.prototype = Object.freeze(Object.create(app.PhysicsObject.prototype, {
        update : {
            value : function (dt) {
                app.PhysicsObject.prototype.update.call(this, dt);

                this.glowTimer++;

                if (this.glowTimer >= this.maxGlowTimer) {
                    this.glowTimer = 0;
                }
            }
        },

        draw : {
            value : function (ctx) {
                ctx.save();

                ctx.rotate(this.rotation);

                var alpha = Math.abs(Math.cos(2 * Math.PI * this.glowTimer / this.maxGlowTimer)) * (this.maxAlpha - this.minAlpha) + this.minAlpha;

                ctx.textAlign = this.textAlign;

                // Draw normal text
                ctx.globalAlpha = alpha;
                ctx.textBaseline = "middle";
                ctx.font = this.fontSize + "px " + this.font;
                ctx.fillStyle = this.fillStyle;
                ctx.strokeStyle = this.strokeStyle;

                ctx.fillText(this.text, 0, 0);
                ctx.strokeText(this.text, 0, 0);

                ctx.restore();
            }
        }
    }));
    Object.freeze(TextField);
    
    
    
    var TextControl = function () {
        TextField.call(this, "Use arrow keys to move");
        this.id = TextControl.id;
    };
    Object.defineProperties(TextControl, {
        name : {
            value : "TextControl"
        },
        id : {
            value : 5000
        }
    });
    TextControl.prototype = Object.freeze(Object.create(TextField.prototype, {}));
    
    
    var TextPulse = function () {
        TextField.call(this, "Use Z key to shoot pulse");
        this.id = TextPulse.id;
    };
    Object.defineProperties(TextPulse, {
        name : {
            value : "TextPulse"
        },
        id : {
            value : 5001
        }
    });
    TextPulse.prototype = Object.freeze(Object.create(TextField.prototype, {}));
    
    
    var TextBullet = function () {
        TextField.call(this, "Use X key to shoot bullet");
        this.id = TextBullet.id;
    };
    Object.defineProperties(TextBullet, {
        name : {
            value : "TextBullet"
        },
        id : {
            value : 5002
        }
    });
    TextBullet.prototype = Object.freeze(Object.create(TextField.prototype, {}));

    
    /**
     * Used to alert the player of in-game notifications
     * (Useful for notifying when the player picked up a new item
     */
    var NotificationBox = function (text, subtext, item) {
        app.GameObject.call(this);

        this.textField = new TextField(text);
        this.textField.fontSize = 16;

        this.subTextField = new TextField(subtext);
        this.subTextField.fontSize = 12;

        this.graphic = this.createImageFromSrc(app.IMAGES['notificationBox']);
        this.itemGraphic = item.graphic;

        this.canClose = false;
    };
    NotificationBox.prototype = Object.freeze(Object.create(app.GameObject.prototype, {
        draw : {
            value : function (ctx) {
                ctx.save();

                ctx.drawImage(this.graphic, -this.graphic.width * 0.5, -this.graphic.height * 0.5);

                ctx.fillStyle = "#c776fa";
                ctx.fillRect(-18, -34, 36, 36);

                ctx.fillStyle = "#192427";
                ctx.fillRect(-16, -32, 32, 32);

                var imgOffset = {
                    x : -(20) * 0.5,
                    y : -(20 + 32) * 0.5
                };

                ctx.drawImage(this.itemGraphic, imgOffset.x, imgOffset.y, 20, 20);

                ctx.translate(0, 20);
                this.textField.draw(ctx);

                if (this.canClose === true) {
                    ctx.translate(0, this.textField.fontSize);
                    this.subTextField.draw(ctx);
                }

                ctx.restore();
            }
        }
    }));
    Object.freeze(NotificationBox);

    app.TextField = TextField;
    app.NotificationBox = NotificationBox;
    
    app.TextControl = TextControl;
    app.TextPulse = TextPulse;
    app.TextBullet = TextBullet;

})();