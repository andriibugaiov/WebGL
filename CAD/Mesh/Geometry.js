"use strict";

var Geometry = (function () {

	var Geometry = function () {
	};

	Geometry.prototype.generateVerticesData = function () {
		return {
			vertices: [],
			normals: [],
			texels: []
		};
    };

	return Geometry;
})();