
var Shape = (function () {

	var Shape = function () {
		pm.init.call(this);
	};
	Shape.prototype.generateVertecies = function (vertecies) {
	};

	var pm = Object.create(Shape.prototype);
	pm.init = function () {
        this.info = pm.generate.call(this);
    };

	pm.generateAttributes = function () {
        var attributes = {
            vertecies: {
                bufferID: null,
                data: []
            },

            // TEMP!
            wireFrame: false,
            count: function () {
                return this.wireFrame ? this.vertecies.data.length : this.vertecies.data.length / 2;
            }, 
            stride: function () {
                return this.wireFrame ? 0 : 2 * sizeof["vec3"];
            },
            mode: function (glctx) {
                return this.wireFrame ? glctx.LINES : glctx.TRIANGLES;
            }
        };
        
        this.generateVertecies.call(this, attributes.vertecies);

        return attributes;
    };

	pm.generateUniforms = function () {
        var uniforms = {
            position: vec3(0.0, 0.0, 0.0),
            scale: vec3(1.0, 1.0, 1.0),
            rotation: vec3(0.0, 0.0, 0.0),
            matrix: null,

            // TEMP!
            wireFrame: false,
            color: function () {
                return this.wireFrame ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0, 0.0, 0.0, 1.0);
            }
        };
        return uniforms;
    };

    pm.generate = function () {
        var attributes = pm.generateAttributes.call(this);
        var uniforms = pm.generateUniforms.call(this);
        return {
            attributes: attributes,
            uniforms: uniforms,
            setWireFrame: function(wireFrame) {
                this.attributes.wireFrame = wireFrame;
                this.uniforms.wireFrame = wireFrame;
            }
        };
    };

    return Shape;
})();
