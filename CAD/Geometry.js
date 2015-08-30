
var Geometry = (function () {

	var Geometry = function () {
		Object3D.call(this);
	};
	inherit(Geometry, Object3D);

	Object3D.prototype.generateVertecies = function () {
		return [];
    };
	Geometry.prototype.generateAttributes = function () {
        var attributes = {
            vertecies: {
                bufferID: null,
                data: this.generateVertecies.call(this)
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

	var pm = Object.create(Geometry.prototype);
	// ...

	return Geometry;
})();
