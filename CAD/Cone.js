"use strict";

var Cone = function () {
    // mark - 

    var subdivide = function (v1, v2, v3, depth, vertecies) {
        if (depth == 0) {
            vertecies.data.push(v1);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(v1);

            // console.log(v1);
            // console.log(v2);
            // console.log(v3);
            return;
        }
        
        var v12 = [];
        var v23 = [];
        var v31 = [];
        for (var i = 0; i < 3; ++i) {
            v12.push(v1[i] + v2[i]);
            v23.push(v2[i] + v3[i]);
            v31.push(v3[i] + v1[i]);
        }
        
        v12 = normalize(v12);
        v23 = normalize(v23);
        v31 = normalize(v31);
        
        subdivide(v1, v12, v31, depth - 1, vertecies);
        subdivide(v2, v23, v12, depth - 1, vertecies);
        subdivide(v3, v31, v23, depth - 1, vertecies);
        subdivide(v12, v23, v31, depth - 1, vertecies);
    };

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

            vertecies.data.push(top);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v1);

            vertecies.data.push(v1);
            vertecies.data.push(top);

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
