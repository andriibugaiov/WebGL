"use strict";

var Light = (function () {

	var Light = function () {
		Object3D.call(this);
	};
	inherit(Light, Object3D);

	// TODO:
	Light.prototype.animate = function (time) {
		Object3D.prototype.animate.call(this, time);

		var t = time - 2 * Math.floor(time / 2);

        var lightUniforms = this.info.uniforms;
        var position = lightUniforms.position;

        var r = Math.sqrt(position[0] * position[0] + position[2] * position[2]);
        position[0] = r * Math.cos(t * Math.PI);
        position[2] = r * Math.sin(t * Math.PI);
    };
	Light.prototype.generateUniforms = function () {
		var uniforms = Object3D.prototype.generateUniforms.call(this);
		var light = {
			ambient: vec4(0.2, 0.2, 0.2, 1.0),
        	diffuse: vec4(1.0, 1.0, 1.0, 1.0),
        	specular: vec4(1.0, 1.0, 1.0, 1.0)
		};
		uniforms.light = light;
        return uniforms;
    };

	return Light;
})();
