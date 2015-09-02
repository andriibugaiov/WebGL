
var Material = (function () {

	var Material = function () {
	};

	Material.prototype.generateMaterialData = function () {
		var materialData = {
            shininess: 5.0,
            ambient: vec4(1.0, 1.0, 1.0, 1.0),
            diffuse: vec4(1.0, 1.0, 1.0, 1.0),
            specular: vec4(1.0, 1.0, 1.0, 1.0)
        };
		return materialData;
    };

	return Material;
})();