
var Scene = (function () {

	var Scene = function () {
		Object3D.call(this);
		
		this.light = null;
	};
	inherit(Scene, Object3D);

	return Scene;
})();
