
var Object3D = (function () {

	var Object3D = function () {
		pm.init.call(this);
	};

    Object3D.prototype.generateAttributes = function () {
        return null;
    };
    Object3D.prototype.generateUniforms = function () {
        var uniforms = {
            position: vec3(0.0, 0.0, 0.0),
            scale: vec3(1.0, 1.0, 1.0),
            rotation: vec3(0.0, 0.0, 0.0),
            mvMatrix: null
        };
        return uniforms;
    };

	var pm = Object.create(Object3D.prototype);
	pm.init = function () {
        this.info = pm.generate.call(this);
    };

    pm.generate = function () {
        var attributes = this.generateAttributes.call(this);
        var uniforms = this.generateUniforms.call(this);
        return {
            attributes: attributes,
            uniforms: uniforms
        };
    };

    return Object3D;
})();
