"use strict";

var Cylinder = function () {
    // mark - 

    var generateVertecies = function (vertecies) {
        var yTop  = 1.0;
        var yBottom = -1.0;
        var r = 1.0;

        var top = vec3(0.0, yTop, 0.0);
        var bottom = vec3(0.0, yBottom, 0.0);
        
        var depth = 100;
        var delta = 2 * Math.PI / depth;

        var xCur = r;
        var zCur = 0.0;
        for (var i = 0; i < depth; ++i) {
            var a = delta * (i + 1);
            var xNext = Math.cos(a) * r;
            var zNext = Math.sin(a) * r;

            var v1 = vec3(xCur, yBottom, zCur);
            var v2 = vec3(xNext, yBottom, zNext);
            var v3 = vec3(xCur, yTop, zCur);
            var v4 = vec3(xNext, yTop, zNext);

            vertecies.data.push(top);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(v4);

            vertecies.data.push(v4);
            vertecies.data.push(top);

            // mark - 

            vertecies.data.push(v4);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(v4);

            // mark - 

            vertecies.data.push(v3);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v1);

            vertecies.data.push(v1);
            vertecies.data.push(v3);

            // mark - 

            vertecies.data.push(bottom);
            vertecies.data.push(v1);

            vertecies.data.push(v1);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(bottom);

            xCur = xNext;
            zCur = zNext;
        }
    };

    // mark - 

    var generateAttributes = function () {
        var attributes = {
            vertecies: {
                bufferID: null,
                data: []
            },
            // colors: {
            //     bufferID: null,
            //     data: []
            // },

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

        generateVertecies.call(this, attributes.vertecies);
        // TODO!
        // generateColors.call(this, attributes.colors);

        return attributes;
    };

    var generateUniforms = function () {
        var uniforms = {
            position: vec3(0.0, 0.0, 0.0),
            scale: vec3(1.0, 1.0, 1.0),
            rotation: {
                axis: vec3(0.0, 1.0, 0.0),
                angle: 0.0
            },
            matrix: null,

            // TEMP!
            wireFrame: false,
            color: function () {
                return this.wireFrame ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0, 0.0, 0.0, 1.0);
            }
        };
        return uniforms;
    };

    var generate = function () {
        var attributes = generateAttributes.call(this);
        var uniforms = generateUniforms.call(this);
        return {
            attributes: attributes,
            uniforms: uniforms,
            setWireFrame: function(wireFrame) {
                this.attributes.wireFrame = wireFrame;
                this.uniforms.wireFrame = wireFrame;
            }
        };
    };


// mark - 
    this.info = null;

    this.init = function () {
        this.info = generate.call(this);
    };
    this.init.call(this);
};
