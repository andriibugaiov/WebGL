"use strict";

var Sphere = function () {
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

    var generateSphereVertecies = function (vertecies) {
        var X  = 0.525731112119133606;
        var Z = 0.850650808352039932;

        var vData /*[12][3]*/ = [
            [-X, 0.0, Z], [X, 0.0, Z], [-X, 0.0, -Z], [X, 0.0, -Z],
            [0.0, Z, X], [0.0, Z, -X], [0.0, -Z, X], [0.0, -Z, -X],
            [Z, X, 0.0], [-Z, X, 0.0], [Z, -X, 0.0], [-Z, -X, 0.0]
        ];

        var tIndices /*[20][3]*/ = [
            [4, 0, 1], [9, 0, 4], [5, 9, 4], [5, 4, 8], [8, 4, 1],
            [10, 8, 1], [3, 8, 10], [3, 5, 8], [2, 5, 3], [7, 2, 3],
            [10, 7, 3], [6, 7, 10], [11, 7, 6], [0, 11, 6], [1, 0, 6],
            [1, 6, 10], [0, 9, 11], [11, 9, 2], [2, 9, 5], [2, 7, 11]
        ];

        var depth = 4;
        for (var i = 0; i < tIndices.length; ++i) {
            subdivide(vData[tIndices[i][0]],
                      vData[tIndices[i][1]],
                      vData[tIndices[i][2]], depth, vertecies);
        }
    };

    // mark - 

    var generateSphereAttributes = function () {
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

        generateSphereVertecies.call(this, attributes.vertecies);
        // TODO!
        // generateSphereColors.call(this, attributes.colors);

        return attributes;
    };

    var generateSphereUniforms = function () {
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

    var generateSphere = function () {
        var attributes = generateSphereAttributes.call(this);
        var uniforms = generateSphereUniforms.call(this);
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
        this.info = generateSphere.call(this);
    };
    this.init.call(this);
};
