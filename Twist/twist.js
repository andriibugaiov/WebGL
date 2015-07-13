"use strict";

var Demonstrator = function () {
    var setupWebGL = function (canvas) {
        var glctx = WebGLUtils.setupWebGL( canvas );
        if ( !glctx ) { 
            alert( "WebGL isn't available" ); 
        } else {
            configureWebGL(glctx, canvas);
        }
        return glctx;
    };

    var configureWebGL = function (glctx, canvas) { 
        glctx.viewport(0, 0, canvas.width, canvas.height);
        glctx.clearColor(1.0, 1.0, 1.0, 1.0 );
    };

    // mark - 

    var loadShaders = function (glctx) {
        var program = initShaders( glctx, "vertex-shader", "fragment-shader" );
        glctx.useProgram(program);
        return program;
    };

    // mark - 

    // counterclockwise
    // top, left, right
    var recursiveTriangleTessellation = function (v1, v2, v3, depth, vertices) {
        if (depth < 1) {
            vertices.push(v1);
            vertices.push(v2);

            vertices.push(v2);
            vertices.push(v3);

            vertices.push(v3);
            vertices.push(v1);            
            return;
        } 

        var v12 = vec2(0.5 *(v1[0] + v2[0]), 0.5 * (v1[1] + v2[1]));
        var v23 = vec2(0.5 *(v2[0] + v3[0]), 0.5 * (v2[1] + v3[1]));
        var v31 = vec2(0.5 *(v3[0] + v1[0]), 0.5 * (v3[1] + v1[1]));

        recursiveTriangleTessellation(v12, v2, v23, depth - 1, vertices);
        recursiveTriangleTessellation(v12, v23, v31, depth - 1, vertices); 
        recursiveTriangleTessellation(v31, v23, v3, depth - 1, vertices);
        recursiveTriangleTessellation(v1, v12, v31, depth - 1, vertices);
    };

    var generateGeometry = function (depth) {
        var sqrt3 = Math.sqrt(3);
        var edge = 1.5;
        var height = 0.5 * sqrt3 * edge;

        this.dScale = edge / sqrt3;

        var vertices = [];
        var initial = [vec2(0, edge / sqrt3), vec2(-0.5 * edge, edge / sqrt3 - height), vec2(0.5 * edge, edge / sqrt3 - height)];
        recursiveTriangleTessellation(initial[0], initial[1], initial[2], depth, vertices);

        var dimension = 2;
        var tesselated = false;
        var tesselatedVerticiesCount = vertices.length;
        var verticiesCount = vertices.length / 2;
        return {
            dimension: dimension,
            vertices: flatten(vertices),
            tesselated: tesselated,
            count: function () {
                return this.tesselated ? tesselatedVerticiesCount : verticiesCount;
            },
            stride: function () {
                return this.tesselated ? 0 : 2 * sizeof["vec2"];
            }
        };
    };

    var generateAttributes = function (depth) {
        var geometry = generateGeometry.call(this, depth);
        var attributes = {
            geometry: geometry
        };
        return attributes;
    };

    var generateUniforms = function (theta) {
        var centroid = vec4(0.0, 0.0, 0.0, 1.0);
        var uniforms = {
            centroid: centroid,
            theta: theta
        };
        return uniforms;
    };

    var generateData = function () {
        var depth = 0;
        var theta = 0.0;
        return {
            attributes: generateAttributes.call(this, depth),
            uniforms: generateUniforms.call(this, theta)
        };
    };

    // mark - 

    var loadUniforms = function (glctx, program, uniforms) {
        var centroid = uniforms.centroid;
        var centroidID = glctx.getUniformLocation(program, "centroid");
        glctx.uniform4f(centroidID, centroid[0], centroid[1], centroid[2], centroid[3]);

        var theta = uniforms.theta;
        var thetaID = glctx.getUniformLocation(program, "theta");
        glctx.uniform1f(thetaID, theta);
    };

    var associateAttributes = function (glctx, program, attributes) {
        var geometry = attributes.geometry;

        var vPositionID = glctx.getAttribLocation(program, "vPosition");
        glctx.vertexAttribPointer(vPositionID, geometry.dimension, glctx.FLOAT, false, geometry.stride(), 0);
        glctx.enableVertexAttribArray(vPositionID);
    };

    var loadAttributes = function (glctx, program, attributes) {
        var geometry = attributes.geometry;

        var bufferID = glctx.createBuffer();
        glctx.bindBuffer(glctx.ARRAY_BUFFER, bufferID);
        glctx.bufferData(glctx.ARRAY_BUFFER, geometry.vertices, glctx.STATIC_DRAW);

        associateAttributes.call(this, glctx, program, attributes);
    };

    var loadData = function (glctx, program, data) {
        // uniforms
        var uniforms = data.uniforms;
        loadUniforms(glctx, program, uniforms);

        // attributes
        var attributes = data.attributes;
        loadAttributes.call(this, glctx, program, attributes);
    };

    // mark -

    function render(glctx, data) {
        glctx.clear(glctx.COLOR_BUFFER_BIT);
        
        var geometry = data.attributes.geometry;
        var mode = geometry.tesselated ? glctx.LINES : glctx.TRIANGLES;
        glctx.drawArrays(mode, 0, geometry.count());
    }

    // mark - 

    this.data = null;
    this.gl = null;
    this.program = null;

    this.initDemonstrator = function () {
        var canvas = document.getElementById("gl-canvas");

        //  Configure WebGL
        var gl = setupWebGL.call(this, canvas);

        //  Load shaders and initialize attribute buffers
        var program = loadShaders.call(this, gl);

        // Load the data into the GPU
        var data = generateData.call(this);
        loadData.call(this, gl, program, data);

        render.call(this, gl, data);

        this.gl = gl;
        this.program = program;
        this.data = data;
    };
    this.initDemonstrator.call(this);

    this.onThetaChanged = function (theta) {
        this.data.uniforms = generateUniforms.call(this, theta / this.dScale);

        loadUniforms.call(this, this.gl, this.program, this.data.uniforms);
        render.call(this,this.gl, this.data);
    };

    this.onDepthChanged = function (depth) {
        var tesselated = this.data.attributes.geometry.tesselated;
        this.data.attributes = generateAttributes.call(this, depth);
        this.data.attributes.geometry.tesselated = tesselated;
        
        loadAttributes.call(this, this.gl, this.program, this.data.attributes);
        render.call(this, this.gl, this.data);
    };

    this.onShowTesselationChanged = function (show) {
        this.data.attributes.geometry.tesselated = show;

        associateAttributes.call(this, this.gl, this.program, this.data.attributes);
        render.call(this, this.gl, this.data);
    };
};
