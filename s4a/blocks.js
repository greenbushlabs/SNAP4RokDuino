// labelPart() proxy

SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;
SyntaxElementMorph.prototype.labelPart = function(spec) {
    var part,
        block = this;


        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // Where the block menus are defined
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    switch (spec) {
        case '%servoValue':
            part = new InputSlotMorph(
                    null,
                    false,
                    {
                        'Clockwise' : 0,
                        'Counter-Clockwise' : 1
                    }
                    );
            break;
        case '%pinMode':
            part = new InputSlotMorph(
                    null,
                    false,
                    {
                        'digital input' : ['digital input'],
                        'digital output' : ['digital output'] ,
                        'PWM' : ['PWM'],
                        'servo' : ['servo']
                    },
                    true
                    );
            break;
        case '%servoPin':
            part = new InputSlotMorph(
                    null,
                    true,
                    function() {
                        // Get board associated to currentSprite
                        var sprite = ide.currentSprite,
                            board = sprite.arduino.board;

                        if (board) {
                            return sprite.arduino.pinsSettableToMode(board.MODES.SERVO);
                        } else {
                            return [];
                        }
                    }
                    );
            break;
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            // THIS IS THE DIGITAL PIN TO USE MENU - WE NEED TO TRANSLATE
            //  THE PIN NUMBER TO THE  ROKDUINO PORT !
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        case '%pwmPin':
            part = new InputSlotMorph(
              null,
              false,
              {
                  '1' : 11,
                  '2' : 6,
                  '3' : 3,
                  '4' : 13
              }
              );
            break;
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        case '%analogPin':
            part = new InputSlotMorph(
                    null,
                    true,
                    function() {
                        // Get board associated to currentSprite
                        var sprite = ide.currentSprite,
                            board = sprite.arduino.board;

                        if (board) {
                            return board.analogPins.map(
                                    function (each){
                                        return (each - board.analogPins[0]).toString();
                                    });
                        } else {
                            return [];
                        }
                    }
                    );
            part.originalChanged = part.changed;
            part.changed = function () { part.originalChanged(); if (block.toggle) { block.toggle.refresh(); } };
            break;
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // THIS IS THE DIGITAL PIN TO USE MENU - WE NEED TO TRANSLATE
        //  THE PIN NUMBER TO THE  ROKDUINO PORT !
        // convert RokDuino port - Arduino Leaonardo port
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        case '%digitalPin':
            part = new InputSlotMorph(
                null,
                false,
                {
                    '1' : 23,
                    '2' : 14,
                    '3' : 4,
                    '4' : 12
                }
                );
      break;
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        default:
            part = this.originalLabelPart(spec);
    }
    return part;
};

BlockMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        world = this.world(),
        myself = this,
        shiftClicked = world.currentKey === 16,
        alternatives,
        top,
        blck;

    menu.addItem(
        "help...",
        'showHelp'
    );

    if (shiftClicked) {
        top = this.topBlock();
        if (top instanceof ReporterBlockMorph) {
            menu.addItem(
                    "script pic with result...",
                    function () {
                        top.ExportResultPic();
                    },
                    'open a new window\n' +
                    'with a picture of both\nthis script and its result',
                    new Color(100, 0, 0)
                    );
        }
    }

    if (this.isTemplate) {
        if (!(this.parent instanceof SyntaxElementMorph)) {
            if (this.selector === 'reportGetVar') {
                addOption(
                    'transient',
                    'toggleTransientVariable',
                    myself.isTransientVariable(),
                    'uncheck to save contents\nin the project',
                    'check to prevent contents\nfrom being saved'
                );
            } else if (this.selector !== 'evaluateCustomBlock') {
                menu.addItem(
                    "hide",
                    'hidePrimitive'
                );
            }
            if (StageMorph.prototype.enableCodeMapping) {
                menu.addLine();
                menu.addItem(
                    'header mapping...',
                    'mapToHeader'
                );
                menu.addItem(
                    'code mapping...',
                    'mapToCode'
                );
            }
        }
        return menu;
    }

    menu.addLine();
    if (this.selector === 'reportGetVar') {
        blck = this.fullCopy();
        blck.addShadow();
        menu.addItem(
                'rename...',
                function () {
                    new DialogBoxMorph(
                            myself,
                            myself.setSpec,
                            myself
                            ).prompt(
                                "Variable name",
                                myself.blockSpec,
                                world,
                                blck.fullImage(), // pic
                                InputSlotMorph.prototype.getVarNamesDict.call(myself)
                                );
                }
                );
    } else if (SpriteMorph.prototype.blockAlternatives[this.selector]) {
        menu.addItem(
                'relabel...',
                function () {
                    myself.relabel(
                            SpriteMorph.prototype.blockAlternatives[myself.selector]
                            );
                }
                );
    } else if (this.definition && this.alternatives) { // custom block
        alternatives = this.alternatives();
        if (alternatives.length > 0) {
            menu.addItem(
                    'relabel...',
                    function () { myself.relabel(alternatives); }
                    );
        }
    }

    menu.addItem(
            "duplicate",
            function () {
                var dup = myself.fullCopy(),
                ide = myself.parentThatIsA(IDE_Morph);
                dup.pickUp(world);
                if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                }
            },
            'make a copy\nand pick it up'
            );
    if (this instanceof CommandBlockMorph && this.nextBlock()) {
        menu.addItem(
                this.thumbnail(0.5, 60, false),
                function () {
                    var cpy = this.fullCopy(),
                    nb = cpy.nextBlock(),
                    ide = myself.parentThatIsA(IDE_Morph);
                    if (nb) {nb.destroy(); }
                    cpy.pickUp(world);
                    if (ide) {
                        world.hand.grabOrigin = {
                            origin: ide.palette,
                            position: ide.palette.center()
                        };
                    }
                },
                'only duplicate this block'
                );
    }
    menu.addItem(
            "delete",
            'userDestroy'
            );
    menu.addItem(
            "script pic...",
            function () {
                window.open(myself.topBlock().fullImage().toDataURL());
            },
            'open a new window\nwith a picture of this script'
            );
    if (this.parentThatIsA(RingMorph)) {
        menu.addLine();
        menu.addItem("unringify", 'unringify');
        menu.addItem("ringify", 'ringify');
        return menu;
    }

    if (StageMorph.prototype.enableCodeMapping && this.selector == 'receiveGo') {
        menu.addLine();
        menu.addItem(
                'export as Arduino sketch...',
                'transpileToC'
                );
    }

    if (this.parent instanceof ReporterSlotMorph
            || (this.parent instanceof CommandSlotMorph)
            || (this instanceof HatBlockMorph)
            || (this instanceof CommandBlockMorph
                && (this.topBlock() instanceof HatBlockMorph))) {
        return menu;
    }
    menu.addLine();
    menu.addItem("ringify", 'ringify');

    return menu;
};

BlockMorph.prototype.transpileToC = function () {
    var fs = require('fs'),
        ide = this.parentThatIsA(IDE_Morph);
    try {
        saveFile(
                ide.projectName ? ide.projectName.replace(/[^a-zA-Z]/g,'') : 'snap4arduino',
                this.world().Arduino.transpile(
                    this.mappedCode(),
                    this.parentThatIsA(ScriptsMorph).children.filter(
                        function (each) {
                            return each instanceof HatBlockMorph &&
                                each.selector == 'receiveMessage';
                        })),
                '.ino',
                ide);
    } catch (error) {
        ide.inform('Error exporting to Arduino sketch!', error.message)
    }
};
