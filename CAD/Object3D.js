
var Object3D = (function () {

	var Object3D = function () {
        this.children = [];
        
		pm.init.call(this);
	};
    Object3D.prototype.add = function (mesh) {
        this.children.push(mesh);
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
    Object3D.prototype.updateMatrix = function () {
        var info = this.info;
        var uniforms = info.uniforms;

        var t = uniforms.position;
        var tMatrix = translate(t);        

        var s = uniforms.scale;
        var sMatrix = scalem(s);

        var r = uniforms.rotation;
        var rxMatrix = rotateX(r[0]);
        var ryMatrix = rotateY(r[1]);
        var rzMatrix = rotateZ(r[2]);
        var rzyxMatrix = mult(rzMatrix, ryMatrix);
        var rzyxMatrix = mult(rzyxMatrix, rxMatrix);

        var tsMatrix = mult(tMatrix, sMatrix);
        var matrix = mult(tsMatrix, rzyxMatrix);

        uniforms.mvMatrix = matrix;
    };
    Object3D.prototype.setUniforms = function (uniforms) {
        var info = this.info;
        var toUniforms = info.uniforms;
        var fromUniforms = uniforms;

        toUniforms.rotation = fromUniforms.rotation.slice();
        toUniforms.scale = fromUniforms.scale.slice();
        toUniforms.position = fromUniforms.position.slice();
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
