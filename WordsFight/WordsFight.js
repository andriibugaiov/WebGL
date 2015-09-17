var HashTable = function () {
	this.ht = {};
	this.size = 0;
};
HashTable.prototype.insert = function(key, value) {
	if (!this.ht.hasOwnProperty(key)) {
		++this.size;	
	} 
	this.ht[key] = value;
};
HashTable.prototype.remove = function(key) {
	if (this.ht.hasOwnProperty(key)) {
		delete this.ht[key];
		--this.size;
	}
};
HashTable.prototype.get = function(key) {
	if (this.ht.hasOwnProperty(key)) {
		return this.ht[key];
	}
	return null;
};
HashTable.prototype.contains = function(key) {
	if (this.ht.hasOwnProperty(key)) {
		return true;
	}
	return false;
};
HashTable.prototype.isEmpty = function() {
	return this.size < 1;
};
HashTable.prototype.getAllValues = function() {
	var all = [];
	for(var key in this.ht) {
		all.push(this.ht[key]);
	}	
	return all;
};	

var Helper = {};
Helper.getSVGTextImage = function(str, color, callback){
    var data = 'data:image/svg+xml,' + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="400" height="400" viewBox="0 0 400 400"><text x="200" y="200" fill="'+color+'" font-size="30" style="text-anchor: middle; dominant-baseline: bottom;">'+str+'</text></svg>';
    var img = new Image();
    var canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    var ctx = canvas.getContext("2d");
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        var pngImg = new Image();
        pngImg.onload = function(){
            svg = null;
            canvas = null;
            ctx = null;
            img = null;
            if(callback) 
            	callback(pngImg);
        }
        pngImg.src = canvas.toDataURL("image/png")
    };
    img.src = data;
};
Helper.positionImageText = function(text, color, parent) {
    this.getSVGTextImage(text, color, function(img){
        var sprite = new THREE.Texture(img);
        sprite.minFilter = THREE.LinearFilter;
        sprite.needsUpdate = true;
        var sp = new THREE.SpriteMaterial({
            map: sprite,
            color: 0xffffff
        });
        var mesh = new THREE.Sprite(sp);
        mesh.position.y = 30;
        mesh.scale.multiplyScalar(300);
        parent.add(mesh);
    });
};
Helper.keyToCharMap = new HashTable();
var keyCodesChars = ["a", 65,"b", 66,"c", 67,"d", 68,"e", 69,"f", 70,"g", 71,"h", 72,"i", 73,"j", 74,"k", 75,"l", 76,"m", 77,"n", 78,"o", 79,"p", 80,"q", 81,"r", 82,"s", 83,"t", 84,"u", 85,"v", 86,"w", 87,"x", 88,"y", 89,"z", 90];
for (var i = 1; i < keyCodesChars.length; i += 2) {
	Helper.keyToCharMap.insert(keyCodesChars[i], keyCodesChars[i - 1]);
}

// mark - 

var Player = function (name, hp) {
	this.name = name;
	this.hp = hp;

	// player object
	var size = 50;
	var geometryH = new THREE.BoxGeometry(size, 20, 20, 2, 2, 2); 
	var geometryV = new THREE.BoxGeometry(20, 20, size, 2, 2, 2); 
	var materialRed = new THREE.MeshLambertMaterial({ 
		color: 0x903535
	});

	var objectV = new THREE.Mesh(geometryV, materialRed);
	var objectH = new THREE.Mesh(geometryH, materialRed);
	objectH.add(objectV);

	this.object = new THREE.Object3D();
	this.object.position.y = 10;
	this.object.add(objectH);

	// player attack field
	var radius = 200;
	var geometry = new THREE.CylinderGeometry(radius, radius, 1, 32);
	var material = new THREE.MeshBasicMaterial({ 
		color: 0xff0000,
		transparent: true, 
		opacity: 0.2
	});
	this.attackField = new THREE.Mesh(geometry, material);
	this.attackField.radius = radius;
	this.object.add(this.attackField);

	// player contols
	this.movementControls = {
		movementParams: {
			// canJump: true,
			moveForward: false,
			moveBackward: false,
			moveLeft: false,
			moveRight: false,
			velocity: new THREE.Vector3()
		},
		onKeyDown: function (event) {
			var mp = this.movementParams;
			switch (event.keyCode) {
				case 38: // up
					mp.moveForward = true;
					break;
				case 37: // left
					mp.moveLeft = true; break;
				case 40: // down
					mp.moveBackward = true;
					break;
				case 39: // right
					mp.moveRight = true;
					break;
				// case 32: // space
				// 	if (mp.canJump === true ) 
				// 		mp.velocity.y += 350;
				// 	mp.canJump = false;
				// 	break;
			}
		},
		onKeyUp: function (event) {
			var mp = this.movementParams;
			switch(event.keyCode) {
				case 38: // up
					mp.moveForward = false;
					break;
				case 37: // left
					mp.moveLeft = false;
					break;
				case 40: // down
					mp.moveBackward = false;
					break;
				case 39: // right
					mp.moveRight = false;
					break;
			}
		}
	};

	var mc = this.movementControls;
	document.addEventListener('keydown', mc.onKeyDown.bind(mc), false);
	document.addEventListener('keyup', mc.onKeyUp.bind(mc), false);

	Helper.positionImageText(this.name, "red", this.object);
};
Player.prototype.kill = function () {
	if (this.hp > 0)
		--this.hp;
};
Player.prototype.isDead = function () {
	return this.hp < 1;
};

var Bot = function (word, id) {
	this.idx = 0;
	this.word = word;
	this.hp = this.word.length;
	this.id = id;

	this.rate = word.length;

	var size = Math.min(30, 4 * this.rate);
	var geometry = new THREE.BoxGeometry(size, size, size);
	var material = new THREE.MeshLambertMaterial({
		color: 0x808080
	});
	this.object = new THREE.Mesh(geometry, material);
	this.object.position.y = 10;

	Helper.positionImageText(this.word, "black", this.object);
};
Bot.prototype.canBeInjured = function (ch) {
	if (this.idx < this.word.length) {
		if (this.word[this.idx] == ch) {
			return true;
		}
	}
	return false;
};
Bot.prototype.injure = function (ch) {
	if (this.idx < this.word.length) {
		if (this.word[this.idx] == ch) {
			++this.idx;
		}
	}
};
Bot.prototype.kill = function () {
	if (this.hp > 0)
		--this.hp;
};
Bot.prototype.heal = function () {
	if (this.idx < this.word.length) {
		this.idx = 0;
		this.hp = this.word.length;
	}
};
Bot.prototype.isDead = function () {
	return this.hp < 1;
};
Bot.prototype.invalidate = function () {
	this.idx = this.word.length;
	this.hp = 0;
};

var Rocket = function (target, ch) {
	this.target = target;
	this.ch = ch;

	var size = 5;
	var geometry = new THREE.BoxGeometry(size, size, size);
	var materialRed = new THREE.MeshLambertMaterial({ 
		color: 0x903535
	});

	var object = new THREE.Mesh(geometry, materialRed);
	this.object = object;
};

// mark -

var GamePlay = function (settings) {
	this.settings = settings;

	// canvas
	this.aspect = window.innerWidth / window.innerHeight;
	this.buttleFieldWidthUsed = 1000;
	this.buttleFieldHeightUsed = 1000;
	this.buttleFieldRadiusUsed = 800;

	this.buttleFieldWidth = 1500;
	this.buttleFieldHeight = 1500;
	this.buttleFieldRadius = 1000;

	this.buttleFieldHeightTopDown = 1000;
	this.buttleFieldWidthTopDown = this.aspect * this.buttleFieldHeightTopDown;

	// graphics
	// this.raycaster = null;
	this.scene = null;
	this.cameraTopDown = null;
	this.renderer = null;

	// game play
	this.prevTime = performance.now();

	this.bots = [];
	this.botsInAttackField = new HashTable();

	this.rockets = [];
	this.player = null;

	// initialization
	this.init.call(this);
	this.animate.call(this);

	document.addEventListener('keydown', this.onKeyDown.bind(this), false);
};

GamePlay.prototype.onKeyDown = function (event) {
	var code = event.keyCode;
	if (Helper.keyToCharMap.contains(code)) {
		var ch = Helper.keyToCharMap.get(code);
		// console.log("Char to fire: ");
		// console.log(ch);

		if (!this.botsInAttackField.isEmpty()) {
			var allBots = this.botsInAttackField.getAllValues();
			for(var i = 0; i < allBots.length; ++i) {
				var bot = allBots[i];

				// TODO:
				if (bot.canBeInjured(ch)) {
					bot.injure(ch);

					var rocket = new Rocket(bot, ch);
					this.rockets.push(rocket);

					var pObject = this.player.object;
					var rObject = rocket.object;
					rObject.position.set(
						pObject.position.x, 
						pObject.position.y, 
						pObject.position.z
					);
					this.scene.add(rObject);
				}
			}
		}
	}
};

GamePlay.prototype.init = function () {
	this.initGraphics.call(this);

	this.initButtleField.call(this);
	this.initPlayer.call(this);
	this.initBots.call(this);
};
GamePlay.prototype.initGraphics = function () {
	// scene
	this.scene = new THREE.Scene();

	// camera
	var coef = 1;
	this.cameraTopDown = new THREE.OrthographicCamera(
		-0.5 * this.buttleFieldWidthTopDown * coef,
		0.5 * this.buttleFieldWidthTopDown * coef,
		0.5 * this.buttleFieldHeightTopDown * coef,
		-0.5 * this.buttleFieldHeightTopDown * coef,
		-0.00001, 1000000
	);
	this.cameraTopDown.position.set(1000, 1000, 1000);
	this.scene.add(this.cameraTopDown);

	this.cameraTopDown.lookAt(new THREE.Vector3());
	this.cameraTopDown.updateProjectionMatrix();
	

	// light
	var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
	light.position.set(0.5, 1, 0.75);
	this.scene.add(light);

	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(0.5, 1, 0.75);
	this.scene.add(directionalLight);
	
	// raycaster
	// this.raycaster = new THREE.Raycaster(
	// 	new THREE.Vector3(), 
	// 	new THREE.Vector3(), 
	// 	0, 1000000
	// );

	// renderer
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setClearColor(0xffffff);
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(this.renderer.domElement);
};
GamePlay.prototype.initButtleField = function () {
	// buttlefield
	var radius = this.buttleFieldRadius;
	var geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 64);
	// var geometry = new THREE.PlaneGeometry(this.buttleFieldWidth, this.buttleFieldHeight, 10, 10);
	// geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	var material = new THREE.MeshLambertMaterial({
		color: 0xcccccc
	});
	var buttleField = new THREE.Mesh(geometry, material);
	this.scene.add(buttleField);

	// background
	var geometryBG = new THREE.PlaneGeometry(1000000, 1000000, 10, 10);
	geometryBG.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	var materialBG = new THREE.MeshLambertMaterial({
		color: 0xeeeeee
	});
	var buttleFieldBackground = new THREE.Mesh(geometryBG, materialBG);
	buttleFieldBackground.position.y = -1;
	this.scene.add(buttleFieldBackground);

	// center
	var materialBlue = new THREE.MeshBasicMaterial({ 
		// color: 0x353E90,
		color: 0xeeeeee
	});
	var size = 40;				
	var geometry = new THREE.CylinderGeometry(size, size, 1, 32);
	var center = new THREE.Mesh(geometry, materialBlue);
	this.scene.add(center);
};
GamePlay.prototype.initPlayer = function () {
	// player
	var name = this.settings.playerName;
	var hp = 10;
	this.player = new Player(name, hp);
	var pObject = this.player.object;
	this.scene.add(pObject);
};
GamePlay.prototype.initBots = function () {
	var wordsPairs = this.settings.wordsPairs;
	for (var i = 0; i < wordsPairs.length; ++i) {
		var pair = wordsPairs[i];
		var word = pair.first;
		var id = i;

		var bot = new Bot(word, id);
		this.bots.push(bot);

		var w = this.buttleFieldWidthUsed;
		var h = this.buttleFieldHeightUsed;
		var radius = this.player.attackField.radius
		var x = Math.max(Math.floor(Math.random() * w - w * 0.5));
		var z = Math.floor(Math.random() * h - h * 0.5);
		var coord = [x, z];
		for (var j = 0; j < coord.length; ++j) {
			coord[j] = (coord[j] <= 0) ? Math.min(-radius, coord[j]) : Math.max(radius, coord[j]);
		}

		var bObject = bot.object;
		bObject.position.x = coord[0];
		bObject.position.y = 10;
		bObject.position.z = coord[1];
		this.scene.add(bObject);
	}
};		
GamePlay.prototype.animate = function () {
	requestAnimationFrame(this.animate.bind(this));
	if (this.player && !this.player.isDead()) {
		var time = performance.now();
		var delta = (time - this.prevTime) * 0.001;

		// player animation
		var pObject = this.player.object;
		var mp = this.player.movementControls.movementParams;
		mp.velocity.x -= mp.velocity.x * 10.0 * delta;
		mp.velocity.z -= mp.velocity.z * 10.0 * delta;
		// mp.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		if (mp.moveForward) 
			mp.velocity.z -= 400.0 * delta;
		if (mp.moveBackward) 
			mp.velocity.z += 400.0 * delta;
		if (mp.moveLeft) 
			mp.velocity.x -= 400.0 * delta;
		if (mp.moveRight) 
			mp.velocity.x += 400.0 * delta;

		// var down = new THREE.Vector3(0, -1, 0);
		// this.raycaster.set(pObject.position, down);
		// this.raycaster.ray.origin.y -= 10; // players foot
		// var intersections = this.raycaster.intersectObjects(this.bots);
		// var isOnObject = intersections.length > 0;
		// if (isOnObject === true) {
		// 	mp.velocity.y = Math.max(0, mp.velocity.y);
		// 	mp.canJump = true;
		// }
		
		// if (pObject.position.y < 10) {
		// 	mp.velocity.y = 0;
		// 	pObject.position.y = 10; // players center
		// 	mp.canJump = true;
		// }

		pObject.translateX(mp.velocity.x * delta);
		// pObject.translateY(mp.velocity.y * delta);
		pObject.translateZ(mp.velocity.z * delta);

		// this.cameraTopDown.translateX(mp.velocity.x * delta);
		// this.cameraTopDown.translateY(mp.velocity.y * delta);
		// this.cameraTopDown.translateZ(mp.velocity.z * delta);

		// TODO: destroy bots properly
		// bots animation
		var bots = [];
		for (var i = 0; i < this.bots.length; ++i) {
			var bot = this.bots[i];
			if (bot.isDead()) {
				this.botsInAttackField.remove(bot.id);
				continue;
			}

			var bObject = bot.object;
			var x = pObject.position.x - bObject.position.x;
			var y = 0;
			var z = pObject.position.z - bObject.position.z;

			var toPlayerFromBot = new THREE.Vector3(x, y, z);
			toPlayerFromBot.normalize();
			
			var toBotFromPlayer = new THREE.Vector3(-x, -y, -z);
			// toBotFromPlayer.normalize();

			// this.raycaster.set(pObject.position, toBotFromPlayer);
			// var intersections = this.raycaster.intersectObjects([bObject]);

			var target = toPlayerFromBot;
		    // if (intersections.length > 0 && intersections[0].distance > this.player.attackField.radius) { 
			if (toBotFromPlayer.length() > 5) {
			    if (toBotFromPlayer.length() > this.player.attackField.radius) { 
			    	var up = new THREE.Vector3(0, 1, 0);
			    	var toBotFromCenter = bObject.position;
			    	if (bot.id % 2) {
						target.crossVectors(toBotFromCenter, up);
			    	} else {
						target.crossVectors(up, toBotFromCenter);
			    	}
					target.normalize();

					bot.heal();
					this.botsInAttackField.remove(bot.id);
			    } else if (toBotFromPlayer.length() > 5) {
			    	this.botsInAttackField.insert(bot.id, bot);
			    }

			    bObject.translateX(target.x * 10.0 * delta);
				bObject.translateY(target.y * 10.0 * delta);
				bObject.translateZ(target.z * 10.0 * delta);
				bots.push(bot);
			} else {
				this.player.kill();
		    	bot.invalidate();

		    	this.botsInAttackField.remove(bot.id);
		    	this.scene.remove(bObject);
			}
		}
		this.bots = bots;

		// TODO: destroy rockets properly
		// rockets animation
		var rockets = [];
		for (var i = 0; i < this.rockets.length; ++i) {
			var rocket = this.rockets[i];
			var bot = rocket.target;

			var rObject = rocket.object;
			var bObject = bot.object;
			var x = bObject.position.x - rObject.position.x;
			var y = 0;
			var z = bObject.position.z - rObject.position.z;
			var toBotFromRocket = new THREE.Vector3(x, y, z);
			if (toBotFromRocket.length() > 5) {
					toBotFromRocket.normalize();

					var target = toBotFromRocket;
					rObject.translateX(target.x * 350.0 * delta);
				rObject.translateY(target.y * 350.0 * delta);
				rObject.translateZ(target.z * 350.0 * delta);
				rockets.push(rocket);
			} else {
				bot.kill();
				if (bot.isDead()) {
					this.botsInAttackField.remove(bot.id);
					this.scene.remove(bObject);
				}
				this.scene.remove(rObject);
			}
		}
		this.rockets = rockets;

		this.prevTime = time;
	}
	this.renderer.render(this.scene, this.cameraTopDown);
};