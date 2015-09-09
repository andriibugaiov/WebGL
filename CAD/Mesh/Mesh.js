"use strict";

var Mesh = (function () {

	var Mesh = function (geometry, material) {
        this.geometry = geometry;
        this.material = material;

		Object3D.call(this);
	};
	inherit(Mesh, Object3D);

    // TODO:
    Mesh.prototype.animate = function (time) {
        Object3D.prototype.animate.call(this, time);

        var meshUniforms = this.info.uniforms;
        var rotation = meshUniforms.rotation;
        rotation[1] = 20 * time;
    };
    Mesh.prototype.generateUniforms = function () {
        var uniforms = Object3D.prototype.generateUniforms.call(this);

        var materialData = this.material.generateMaterialData();
        uniforms.material = materialData;

        return uniforms;
    };
    Mesh.prototype.setUniforms = function (uniforms) {
        Object3D.prototype.setUniforms.call(this, uniforms);

        // TODO:
        // var info = this.info;
        // var toUniforms = info.uniforms;
        // var fromUniforms = uniforms;
        // this.material.setUniforms(fromUniforms, toUniforms);
    };

	Mesh.prototype.generateAttributes = function () {
        var verticesData = this.geometry.generateVerticesData();

        var attributes = {
            vertices: {
                bufferID: null,
                data: verticesData.vertices
            },
            normals: {
                bufferID: null,
                data: verticesData.normals
            },
            texels: {
                bufferID: null,
                data: verticesData.texels
            },
            count: function () {
                return this.vertices.data.length;
            }, 
            stride: function () {
                return 0;
            }
        };
        return attributes;
    };

	return Mesh;
})();
