"use strict";

var Camera = (function () {

	var Camera = function () {
		Object3D.call(this);
	};
	inherit(Camera, Object3D);

	Camera.prototype.generateUniforms = function () {
		var uniforms = Object3D.prototype.generateUniforms.call(this);
        uniforms.pMatrix = ortho(-1, 1, -1, 1, 0, 2);
        // uniforms.pMatrix = perspective(150, 1, 0, 2);
        return uniforms;
    };

	return Camera;
})();
