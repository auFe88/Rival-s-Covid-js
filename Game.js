'use strict';

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var currentLevel = 0;
var target = [1, 1];
var playerMoveX = 0;
var tick_count = 0;

//Предметы
var player, obstacles, stairs, masks, points, pills, radios;

//Декорации
var bgDec;
var bgOpenDec;
var tableDec;
var chairDec;
var bgColorDec;
var textWindowDec;
var textRadioDec;

var CANVAS_WIDTH = 1280;
var CANVAS_HEIGHT = 720;
var FPS = 60;

var then, now, elapsed, fpsInterval;

//Матриалы
var playerr = new Image();
var playerl = new Image();
var playerf = new Image();
var bg = new Image();
var mask = new Image();
var playerr_mask = new Image();
var playerl_mask = new Image();
var playerf_mask = new Image();
var table = new Image();
var bgOpen = new Image();
var pill = new Image();
var chair = new Image();
var bgColor = new Image();
var radio = new Image();
var textWindow = new Image();
var textRadio = new Image();

//Аудио
var walking = new Audio();
var PJump = new Audio();
var bgAudio = new Audio();
var openWindow = new Audio();
var closeWindow = new Audio();
var breathe = new Audio();
var drink = new Audio();
var putOn = new Audio();
var putOff = new Audio();
var lamp = new Audio();
var radioAudio = new Audio();

//Прочее
mask.src = 'img/maska.png';
bg.src = 'img/bg.png';
playerl.src = 'img/playerl.png';
playerr.src = "img/playerr.png";
playerf.src = 'img/playerf.png';
playerl_mask.src = 'img/playerl_mask.png';
playerr_mask.src = "img/playerr_mask.png";
playerf_mask.src = 'img/playerf_mask.png';
table.src = 'img/table.png';
bgOpen.src = 'img/bgOpen.png';
pill.src = 'img/tabletka.png';
chair.src = 'img/chair.png';
bgColor.src = 'img/bgColor.png';
radio.src = 'img/radio.png';
textWindow.src = 'img/textWindow.png';
textRadio.src = 'img/textRadio.png';

//Аудио
bgAudio.src = 'audio/bgAudio.wav';
walking.src = 'audio/walk.wav';
PJump.src = 'audio/jump.wav';
openWindow.src = 'audio/openWindow.wav';
closeWindow.src = 'audio/closeWindow.wav';
breathe.src = 'audio/breathe.wav';
drink.src = 'audio/drink.wav';
putOn.src = 'audio/putOn.wav';
putOff.src = 'audio/putOff.wav';
lamp.src = 'audio/lamp.wav';
radioAudio.src = 'audio/radio.wav';

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

var setLevel = function(lvl) {
    if (lvl === 0) {
        player = {
            xPrev: 0,
            yPrev: 0,
            width: 160,
            height: 365,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT,
            xVelocity: 0,
            yVelocity: 0,
            jumping: true,
            masks: 0
        };
        pills = [
            {
                width: 50,
                height: 50,
                x: 700,
                y: 295
            }
        ];
        radios = [
            {
                width: 100,
                height: 100,
                x: 210,
                y: 530
            }
        ];
        points = [
            {
                x: 900,
                y: 400,
                width: 200,
                height: 100
            }
        ];
        textWindowDec = {
            x: 935,
            y: 125
        }
        textRadioDec = {
            x: 255,
            y: 470
        }
        chairDec = {
            x: 600,
            y: 400
        }
        bgDec = {
            x: 0,
            y: 0
        };
        bgOpenDec = {
            x: -1280,
            y: 0
        };
        masks = [
            {
                width: 50,
                height: 50,
                x: 470,
                y: 335
            }
        ];
        tableDec = {
            x: 450,
            y: 453
        },
        bgColorDec = {
            x: 0,
            y: 0,
        }
    }
    window.addEventListener("keydown", controller.KeyListener);
    window.addEventListener("keyup", controller.KeyListener);
}

var controller = {
    ause: false,
    use: false,
    takeoff: false,
    left: false,
    right: false,
    KeyListener: function(evt) {
        var keyState = (evt.type == "keydown") ? true : false;
        switch (evt.keyCode) {
            case 37:
                controller.left = keyState;
                break;
            case 39:
                controller.right = keyState;
                break;
            case 71:
                controller.takeoff = keyState;
                break;
            case 69:
                controller.use = keyState;
                break;
            case 82:
                controller.ause =keyState;
                break;
        }
    }
};

var startAnimation = function(fps) {
    setLevel(currentLevel);
    fpsInterval = 1000 / fps;
    then = window.performance.now();
    animation(then);
}

var animation = function(newTime) {
    window.requestAnimationFrame(animation);
    now = newTime;
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        update();
        draw();
    }
}

var isCollided = function(obst, obj) {
    if (obj.x + obj.width > obst.x 
    && obj.x < obst.x + obst.width
    && obj.y < obst.y + obst.height
    && obj.y + obj.height > obst.y) {
        return true;
    } else {
        return false;
    }
}

var collideHandler = function(obst, obj) {
    if (isCollided(obst, obj)) {
        if (obj.xPrev >= obst.x + obst.width) {
            obj.x = obst.x + obst.width;
            obj.xVelocity = 0;
        }
        if (obj.xPrev + obj.width <= obst.x) {
            obj.x = obst.x - obj.width;
            obj.xVelocity = 0;
        }
        if (obj.yPrev + obj.height <= obst.y) {
            obj.y = obst.y - obj.height;
            obj.yVelocity = 0;
            obj.jumping = false;
        }
        if (obj.yPrev >= obst.y + obst.height) {
            obj.y = obst.y + obst.height;
            obj.yVelocity = 0;
        }
    }
}
var maskHandler = function (mask, obj) {
    if(isCollided(mask, obj) && controller.use === true) {
        player.masks += 1;
        // alert('Надев маску вы обезопасите сотрудников магазинов, водителей общественного транспорта и служащих муниципальных организаций от тех, у кого коронавирус проходит без симптомов. Еще одним плюсом маски считается то, что ее ношение лишний раз напоминает, что не следует касаться руками лица, чтобы вирус не попал в слизистую оболочку рта, носа или глаз. Ну и последний аргумент — вид людей в масках заставляет серьезно воспринимать угрозу пандемии.');
        controller.use = false;
        putOn.volume = 0.25;
        putOn.play();
    }
};
var radioHandler = function (radio, obj) {
    if(isCollided(radio, obj) && controller.use === true) {
        // alert('С помощью средств массовой информации можно следить за развитием вируса и узнавать последние новости об этом.');
        controller.use = false;
        radioAudio.volume = 0.15;
        radioAudio.play();
    }
};
var pillHandler = function (pill, obj) {
    if(isCollided(pill, obj) && controller.use === true) {
        for (var i = 0; i < pills.length; i++) {
            pills[i].x = -1000;
        // alert('Выпив лекарство для укрепления иммунитета, вы защищаете организм от чужеродных вторжений: вирусов, микробов, грибков, бактерий, простейших и даже собственных клеток, которые изменились в ходе мутации. Тем самым вы защишаете себя от вируса.');
        controller.use = false;
        drink.volume = 0.5;
        drink.play();
        }
    }
};
var pointHandler = function (point, obj) {
    if (isCollided(point, obj) && controller.use === true && bgOpenDec.x === -1280) {
        bgOpenDec.x = 0;
        // alert('Открыв окно вы очищаете воздух от пыли, аллергенов, дыма и неприятных запахов. удаляют неприятные запахи, поглощают вредные вещества.');
        controller.use = false;
        openWindow.play();
            
    } 
    else if (isCollided(point, obj) && controller.ause === true && bgOpenDec.x === 0) {
        bgOpenDec.x = -1280;
        controller.use = false;
        closeWindow.play();
    }
};

//Лимит движения
var limitMoveing = function() {
    
    if (player.x < 230 - player.width) {
        player.x = 230 - player.width;
    }
    if (player.x > 1250 - player.width) {
        player.x = 1250 - player.width;
    }
    if (player.y < 450 - player.height) {
        player.y = 450 - player.height;
        player.yVelocity = 0;
        player.jumping = false;
    }
    if (player.y > 680 - player.height) {
        player.y = 680 - player.height;
        player.yVelocity = 0;
        player.jumping = false;
    }
}
var update = function () {
    player.xPrev = player.x;
    player.yPrev = player.y;

    if (controller.takeoff) {
        player.masks = 0;
        putOff.volume = 0.25;
        putOff.play();
    };
    if (controller.left) {
        player.xVelocity -= 1;
    };
    if (controller.right) {
        player.xVelocity += 1;
    };
    player.yVelocity += 1.5;
    player.x += player.xVelocity;
    player.y += player.yVelocity;
    player.xVelocity *= 0.825;
    player.yVelocity *= 0.9;

    // Звук только при соприкосновении
    if (controller.left) {
        player.jumping = true;
        walking.volume = 0.75;
        walking.play();

    }
    if (controller.right) {
        player.jumping = true;
        walking.volume = 0.75;
        walking.play();
    }

    if (player.x < 0) {
        player.x = 0;
    }

    limitMoveing();

    //Соприкосновения
    for (var i = 0; i < radios.length; i++) {
        radioHandler(radios[i],  player );
    }
    for (var i = 0; i < pills.length; i++) {
        pillHandler(pills[i],  player );
    }
    for (var i = 0; i < masks.length; i++) {
        maskHandler(masks[i], player);
    }
    for (var i = 0; i < points.length; i++) {
        pointHandler(points[i], player);
    }
};

var drawObject = function(obj, style) {
    context.fillStyle = style;
    context.fillRect(obj.x, obj.y, obj.width, obj.height);
}
playerl,playerr,playerl_mask,playerr_mask.onload = function () {
    tick();
    requestAnimationFrame(tick);
};
var tick = function () {
    if (tick_count > 2) {
        draw();
        tick_count = 0;
    }
    tick_count += 1;
    requestAnimationFrame(tick);
};
var spriteLeft = function() {
    if (player.masks >= 1) {
    playerMoveX = (playerMoveX === 152 ? 0 : playerMoveX + 152);
    context.drawImage(playerl_mask, playerMoveX, 0, 152, 350, player.x, player.y, 152, 330);
    breathe.volume = 0.15;
    breathe.play();
    } else {
        playerMoveX = (playerMoveX === 152 ? 0 : playerMoveX + 152);
        context.drawImage(playerl, playerMoveX, 0, 152, 350, player.x, player.y, 152, 330);
    }
};
var spriteRight = function() {
    if (player.masks >= 1) {
        playerMoveX = (playerMoveX === 152 ? 0 : playerMoveX + 152);
        context.drawImage(playerr_mask, playerMoveX, 0, 152, 350, player.x, player.y, 152, 330);
        breathe.volume = 0.15;
        breathe.play();
    } else {
        playerMoveX = (playerMoveX === 152 ? 0 : playerMoveX + 152);
        context.drawImage(playerr, playerMoveX, 0, 152, 350, player.x, player.y, 152, 330);
    }
};
//Движения игрока
var playerMove = function() {
    if (controller.right && controller.left === false) {
        spriteRight();
        bgAudio.volume = 0.05;
        bgAudio.loop = true;
        bgAudio.play();
        lamp.volume = 0.35;
        lamp.loop = true;
        lamp.play();
    }
    else if (controller.left && controller.right === false) {
        spriteLeft();
        bgAudio.volume = 0.05;
        bgAudio.loop = true;
        bgAudio.play();
        lamp.volume = 0.35;
        lamp.loop = true;
        lamp.play();
    }
    else if (player.masks >= 1) {
        context.drawImage(playerf_mask, player.x, player.y, 100, 315);
        breathe.volume = 0.15;
        breathe.play();
    } else {
        context.drawImage(playerf, player.x, player.y, 100, 315);
    }
};  

//----------------------------------------------------------------------------------
var draw = function() {
    for (var i = 0; i < points.length; i++) {
        context.fillRect(points[i].x, points[i].y, points[i].width, points[i].height);
    }
    //Фон
    context.drawImage(bgColor, bgColorDec.x, bgColorDec.y);
    context.drawImage(bg, bgDec.x, bgDec.y);
    context.drawImage(bgOpen, bgOpenDec.x, bgOpenDec.y);
    //Стол
    context.drawImage(table, tableDec.x, tableDec.y);
    //Стул
    context.drawImage(chair, chairDec.x, chairDec.y);
    //Текст
    context.drawImage(textWindow, textWindowDec.x, textWindowDec.y);
    context.drawImage(textRadio, textRadioDec.x, textRadioDec.y);
    //Маски
    for (var i = 0; i < masks.length; i++) {
        context.drawImage(mask, masks[i].x, masks[i].y);
    };
    //Таблетки
    for (var i = 0; i < pills.length; i++) {
        context.drawImage(pill, pills[i].x, pills[i].y);
    };
    for (var i = 0; i < radios.length; i++) {
        context.drawImage(radio, radios[i].x, radios[i].y);
    };
    //Справочник
    context.fillStyle = 'white';
    context.font = 'normal 20px Arial';
    // context.fillText('🠔 🠖 - двигаться        E - использовать        R - закрыть окно        G - снять маску', 285, 38);
    // Движения игрока
    playerMove();
}
startAnimation(FPS);