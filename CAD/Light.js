
var Light = (function () {

	var Light = function () {
		Object3D.call(this);
	};
	inherit(Light, Object3D);

	Light.prototype.generateUniforms = function () {
		var uniforms = Object3D.prototype.generateUniforms.call(this);
		var light = {
			ambient: vec4(0.4, 0.0, 0.0, 1.0),
        	diffuse: vec4(1.0, 0.0, 0.0, 1.0),
        	specular: vec4(1.0, 1.0, 1.0, 1.0)
		};
		uniforms.light = light;
        return uniforms;
    };

	return Light;
})();
