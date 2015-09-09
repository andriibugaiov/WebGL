"use strict";

var TextureMaterial = (function () {

	// TODO:
	var TextureMaterial = function (texture) {
		this.texture = texture;
	};
	inherit(TextureMaterial, Material);

	TextureMaterial.prototype.generateMaterialData = function () {
		var materialData = Material.prototype.generateMaterialData.call(this);

		materialData.texture = {
    		bufferID: null,
    		textureID: this.texture.textureID,
    		image: this.texture.image,
    		size: this.texture.size
    	};

		return materialData;
    };

	return TextureMaterial;
})();