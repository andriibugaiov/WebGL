
var Mesh = (function () {

	var Mesh = function (geometry, material) {
        this.geometry = geometry;
        this.material = material;

		Object3D.call(this);
	};
	inherit(Mesh, Object3D);

    Mesh.prototype.generateUniforms = function () {
        var uniforms = Object3D.prototype.generateUniforms.call(this);

        var materialData = this.material.generateMaterialData();
        uniforms.material = materialData;

        return uniforms;
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
