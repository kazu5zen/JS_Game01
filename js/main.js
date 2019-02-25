enchant();

enchant.Sound.enabledInMobileSafari = true;

if(location.protocol == 'file:'){
    enchant.ENV.USE_WEBAUDIO = false;
    console.log('1');
}

var mainGame = mainGame || {}
    mainGame.titleScene = mainGame.titleScene || {}
    mainGame.gameScene = mainGame.gameScene || {}
    mainGame.clearScene = mainGame.clearScene || {}

mainGame.common = {
    SCREEN_WIDTH : 320,
    SCREEN_HEIGTH : 400,
    PLAYER_SPEED : 5,
    OBJECT_SPEED : 3,
    OBJECT_NUM : 5,
    ITEM_SPEED : 1,
    GAME_TIME : 300,

    // Labelラッパー関数
    createLabel : function(text, textAlign, posX, posY, color, font) {
        label = new Label(text);
        label.textAlign = textAlign;
        label.x = posX;
        label.y = posY;
        label.color = color;
        label.font = font;

        return label;
    },

    // Spriteラッパー関数
    createSprite : function(width, height, image, posX, posY, scaleX = 1.0, scaleY = 1.0) {
        var sprite = new Sprite(width, height);
        sprite.image = image;
        sprite.x = posX;
        sprite.y = posY;
        sprite.scale(scaleX, scaleY);

        return sprite;
    }
}

mainGame.titleScene.create = function(pGame) {

    var mgCommon = mainGame.common;
    var mgGameScene = mainGame.gameScene;

    var scene = new Scene();
    scene.backgroundColor = '#78C7E7';

    var titleImg = mgCommon.createLabel('スライム集め', 'center', 10, 120, '#ffffff', '28px Yu Gothic');
    var subTitleImg = mgCommon.createLabel('- スライムを集めるゲーム -', 'center', 10, 160, '#ffffff', '14px Yu Gothic');
    var startImg = mgCommon.createSprite(236, 48, pGame.assets['./img/start.png'], 42, 200);
    var touchStartMesImg = mgCommon.createLabel('↑タッチしてね↑', 'center', 10, 260, '#ffffff', '14px Yu Gothic');
    var licenseMesImg = mgCommon.createLabel('キャラクター素材制作：王国興亡記', 'center', 10, 360, '#ffffff', '10px Yu Gothic');

    scene.addChild(titleImg);
    scene.addChild(subTitleImg);
    scene.addChild(startImg);
    scene.addChild(touchStartMesImg);
    scene.addChild(licenseMesImg);

    startImg.addEventListener(Event.TOUCH_START, function(e) {
        pGame.replaceScene(mgGameScene.create(pGame));
    });

    return scene;
};

mainGame.gameScene.create =  function(pGame) {
    var mgCommon = mainGame.common;
    var mgClearScene = mainGame.clearScene;

    var scene = new Scene();

    var backgroundImg = mgCommon.createSprite(mgCommon.SCREEN_WIDTH, mgCommon.SCREEN_HEIGTH, pGame.assets['./img/bg.png'], 0, 0);
    scene.addChild(backgroundImg);

    // スコア欄を作成
    var pointCount = 0;
    var timer = mgCommon.GAME_TIME;

    var timeLimitImg = mgCommon.createLabel('残り:' + timer, 'center', 0, 20, '#ffffff', '14px Yu Gothic');
    scene.addChild(timeLimitImg);

    // プレイヤー
    var playerImg = mgCommon.createSprite(32, 32, pGame.assets['./img/d-princess_a05.png'], 100, 300);
    scene.addChild(playerImg);
    //playerImg.frame = [6, 6, 7, 7, 8, 8];
    scene.backgroundColor  = '#7ecef4';

    // プレイヤーの当たり判定用スプライトの設定
    var playerCollisionImg = mgCommon.createSprite(1, 1, null, playerImg.x + playerImg.width / 2, playerImg.y + playerImg.height / 2)
    scene.addChild(playerCollisionImg);

    // スライム生成関数
    var makeObImg = function() {
        var obImg = mgCommon.createSprite(64, 64, pGame.assets['./img/slime01.png'], Math.floor(Math.random() * 300), -16, 0.5, 0.5);
        scene.addChild(obImg);
        obImg.frame = [0, 0, 3, 3, 6, 6, 9, 9];
        return obImg;
    };

    // オブジェクトの生成
    var obArray = new Array(mgCommon.OBJECT_NUM);
    for (var i=0, len = obArray.length; i<len; i++) {
        obArray[i] = makeObImg();
    };

    var obSpeed = mgCommon.OBJECT_SPEED;

    // キーパッド
    var pad = new Pad();
    pad.x = mgCommon.SCREEN_WIDTH / 2 - 50;
    pad.y = mgCommon.SCREEN_HEIGTH / 2 + 100;
    scene.addChild(pad);

    playerImg.isMoving = false;
    playerImg.direction = 0;
    playerImg.walk = 1;
    var playerSpeed = mgCommon.PLAYER_SPEED;
    playerImg.addEventListener(Event.ENTER_FRAME, function () {
        this.frame = this.direction * 3 + this.walk;

        //プレイヤー移動
        if (pGame.input.left) {
            this.direction = 1;
            this.x -= playerSpeed;
            this.isMoving =true;
        }
        else if (pGame.input.right) {
            this.direction = 2;
            this.x += playerSpeed;
            this.isMoving =true;
        }
        else if (pGame.input.up) {
            this.direction = 3;
            this.y -= playerSpeed;
            this.isMoving =true;
        }
        else if (pGame.input.down) {
            this.direction = 0;
            this.y += playerSpeed;
            this.isMoving =true;
        }

        if (this.isMoving && (pGame.frame % 3) == 0) {
            this.walk++;
            this.walk %= 3;
            this.isMoving = false;
        }

        // TODO:プレイヤーの大きさを位置によって変更する（奥行きを出す）

        playerCollisionImg.x = this.x + this.width / 2;
        playerCollisionImg.y = this.y + this.height / 2;

        // プレイヤーの移動制限設定
        var left    = 0;
        var right   = mgCommon.SCREEN_WIDTH - this.width;
        var top     = mgCommon.SCREEN_HEIGTH / 2;
        var bottom  = mgCommon.SCREEN_HEIGTH - this.height;
        if (this.x <= left) { this.x = left; }
        else if (this.x >= right){ this.x = right; }
        if (this.y <= top) { this.y = top; }
        else if (this.y >= bottom) { this.y = bottom; }
    });

    // シーンに「毎フレーム実行イベント」を追加します。
    scene.addEventListener(Event.ENTER_FRAME, function() {
        timer--;
        timeLimitImg.text = '残り:' + timer;

        // 落下タイミングをずらす
        var speedCount = 0;
        for (var i=0, len = obArray.length; i<len; i++) {
            speedCount++;
            obArray[i].y += obSpeed + speedCount;
        };

        // 画面下部に来た再生成
        for (var i=0, len = obArray.length; i<len; i++) {
            if(obArray[i].y > mgCommon.SCREEN_WIDTH){
                scene.removeChild(obArray[i]);
                obArray[i] = makeObImg();
            }
        };

        // スライムの当たり判定
        for (var i=0, len = obArray.length; i<len; i++) {
            if (obArray[i].intersect(playerCollisionImg)) {
                scene.removeChild(obArray[i]);
                obArray[i] = makeObImg();
                pointCount += 10;
            }
        };

        //終了判定
        if( timer <= 0 ) {
            pGame.replaceScene(mgClearScene.create(pGame, pointCount));
        }
    });

    return scene;
};

mainGame.clearScene.create = function(pGame, pResultScore) {
    var mgCommon = mainGame.common;
    var mgTitleScene = mainGame.titleScene;

    var scene = new Scene();
    scene.backgroundColor = '#303030';

    var clearImg = mgCommon.createSprite(267, 48, pGame.assets['./img/clear.png'], 20, 160);
    var scoreImg = mgCommon.createLabel(pResultScore + 'Point', 'center', 0, 100, '#ffffff', '40px Yu Gothic');
    var retryImg = mgCommon.createLabel('もう一度挑戦する', 'center', 20, 250, '#ffffff', '20px Yu Gothic');

    scene.addChild(clearImg);
    scene.addChild(scoreImg);
    scene.addChild(retryImg);

    retryImg.addEventListener(Event.TOUCH_START, function(e) {
        pGame.replaceScene(mgTitleScene.create(pGame));
    });

    return scene;
};

window.onload = function() {
    var mgCommon = mainGame.common;
    var mgTitleScene = mainGame.titleScene;

    var game = new Game(mgCommon.SCREEN_WIDTH, mgCommon.SCREEN_HEIGTH);
    game.fps = 24;
    game.preload('./img/bg.png','./img/d-princess_a05.png','icon0.png',
                 './img/start.png','./img/clear.png','./img/slime01.png',
                 'pad.png','apad.png','font0.png');

    game.onload = function() {
        game.replaceScene( mgTitleScene.create(game) );
    }
    game.start();
};

window.onorientationchange = function() {
    switch( window.orientation ) {
        case 0:
            break;
        case 90:
            alert('画面を縦にしてください');
            break;
        case -90:
            alert('画面を縦にしてください');
            break;
    }
};