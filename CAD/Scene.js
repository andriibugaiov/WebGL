"use strict";

var Scene = (function () {

	var Scene = function () {
		Object3D.call(this);
		
		this.light = null;
	};
	inherit(Scene, Object3D);
	Scene.prototype.animate = function (time) {
		Object3D.prototype.animate.call(this, time);
		if (this.light) {
			this.light.animate(time);
		}
	};
	Scene.prototype.add = function (mesh) {
		if (mesh instanceof Mesh) {
			Object3D.prototype.add.call(this, mesh);
		} else if (mesh instanceof Light) {
			this.light = mesh;
		}
    };

	return Scene;
})();
