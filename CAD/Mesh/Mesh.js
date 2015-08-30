
var Mesh = (function () {

	var Mesh = function (geometry, material) {
        this.geometry = geometry;
        this.material = material;
        
		Object3D.call(this);
	};
	inherit(Mesh, Object3D);

	Mesh.prototype.generateAttributes = function () {
        var attributes = {
            vertecies: {
                bufferID: null,
                data: this.geometry.generateVertecies()
            },
            count: function () {
                return this.vertecies.data.length;
            }, 
            stride: function () {
                return 0;
            }
        };
        return attributes;
    };

	var pm = Object.create(Mesh.prototype);
	// ...

	return Mesh;
})();
