"use strict";

var Demonstrator = function () {
    // mark - 

    var setupWebGL = function (canvas) {
        var gl = WebGLUtils.setupWebGL(canvas);
        if ( !gl ) { 
            alert("WebGL isn't available"); 
        } else {
            configureWebGL(gl, canvas);
        }
        return gl;
    };

    var configureWebGL = function (gl, canvas) { 
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LEQUAL);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    };

    // mark - 

    var loadShaders = function () {
        var gl = this.gl;

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
        return program;
    };

    // mark - 


// ------------------


    // mark - 

    var subdivide = function (v1, v2, v3, depth, vertecies) {
        if (depth == 0) {
            vertecies.data.push(v1);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(v1);            
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

        var depth = 1;
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
                axis: vec3(0.0, 0.0, 0.0),
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


// ------------------

    // mark - 

    var applyUniforms = function(shapeUniforms, uniforms) {
        // TODO! DEEP COPY!
        shapeUniforms.position[0] = uniforms.position[0];
        shapeUniforms.position[1] = uniforms.position[1];
        shapeUniforms.position[2] = uniforms.position[2];

        shapeUniforms.scale[0] = uniforms.scale[0];
        shapeUniforms.scale[1] = uniforms.scale[1];
        shapeUniforms.scale[2] = uniforms.scale[2];

        shapeUniforms.rotation.axis[0] = uniforms.rotation.axis[0];
        shapeUniforms.rotation.axis[1] = uniforms.rotation.axis[1];
        shapeUniforms.rotation.axis[2] = uniforms.rotation.axis[2];

        shapeUniforms.rotation.angle = uniforms.rotation.angle;
    };

    // mark - 

    var generateVerteciesBuffer = function (vertecies) {
        var gl = this.gl;

        var bufferID = gl.createBuffer();
        vertecies.bufferID = bufferID;

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertecies.data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    // mark - 

    var generateShape = function (shapeID, uniforms) {
        var shape = null;
        switch(shapeID) {
            case 'sphereID': {
                shape = generateSphere.call(this);
                break;
            }
            case 'coneID': {
                shape = null;
                break;
            }
            case 'cylinderID': {
                shape = null;
                break;
            }
        }
        
        if (shape) {
            applyUniforms.call(this, shape.uniforms, uniforms);
            generateVerteciesBuffer.call(this, shape.attributes.vertecies);
            // TODO!
            // generateColorsBuffer.call(this, shape.attributes.colors);
        }
        return shape;
    };

    // mark - 


// ------------------


    // mark - 

    var updateUniforms = function (uniforms) {
        var t = uniforms.position;
        var tMatrix = translate(t);

        var s = uniforms.scale;
        var sMatrix = scale(s);

        var r = uniforms.rotation;
        var rMatrix = rotate(r.angle, r.axis);

        var tsMatrix = mult(tMatrix, sMatrix);
        var tsrMatrix = mult(tsMatrix, rMatrix);

        uniforms.matrix = tsrMatrix;
    };

    // mark -

    var loadUniforms = function (program, uniforms) {
        var gl = this.gl;

        var matrixID = gl.getUniformLocation(program, "matrix");
        gl.uniformMatrix4fv(matrixID, false, flatten(uniforms.matrix));

        var colorID = gl.getUniformLocation(program, "color");
        var color = uniforms.color();
        gl.uniform4f(colorID, color[0], color[1], color[2], color[3]);
    };

    var loadAttributes = function (program, attributes) {
        var gl = this.gl;

        var bufferID = attributes.vertecies.bufferID;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);

        var vPositionID = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPositionID, 3, gl.FLOAT, false, attributes.stride(), 0);
        gl.enableVertexAttribArray(vPositionID);

        // TODO!
        // var bufferID = attributes.colors.bufferID;
        // gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);

        // var vColorID = glctx.getAttribLocation(program, "vColor");
        // gl.vertexAttribPointer(vColorID, 3, glctx.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(vColorID);
    };

    var loadShape = function (program, shape) {
        // attributes
        var attributes = shape.attributes;
        loadAttributes.call(this, program, attributes);

        // uniforms
        var uniforms = shape.uniforms;
        updateUniforms.call(this, uniforms);
        loadUniforms.call(this, program, uniforms);
    };

    // mark -


// ------------------


    // mark -

    function render(program, shapes) {
        var gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (var i = 0; i < shapes.length; ++i) {
            var shape = shapes[i];
            var attributes = shape.attributes;

            shape.setWireFrame(false);
            loadShape.call(this, program, shape);
            gl.drawArrays(attributes.mode(gl), 0, attributes.count());

            shape.setWireFrame(true);
            loadShape.call(this, program, shape);
            gl.drawArrays(attributes.mode(gl), 0, attributes.count());
        }
    }

    // mark - 


// ------------------

    // mark - 

    this.gl = null;
    this.program = null;
    this.shapes = [];

    this.initDemonstrator = function () {
        var canvas = document.getElementById("gl-canvas");

        //  Configure WebGL
        var gl = setupWebGL.call(this, canvas);
        this.gl = gl;

        //  Load shaders and initialize attribute buffers
        var program = loadShaders.call(this);
        this.program = program;

        render.call(this, this.program, this.shapes);
    };
    this.initDemonstrator.call(this);

    // mark - 

    this.test = function () {
        var uniforms0 = {
            position: vec3(0.0, 0.5, -0.5),
            scale: vec3(0.5, 0.5, 0.5),
            rotation: {
                axis: vec3(1.0, 0.0, 0.0),
                angle: 0.0
            }        
        };
        var uniforms1 = {
            position: vec3(0.0, 0.0, 0.5),
            scale: vec3(0.5, 0.5, 0.5),
            rotation: {
                axis: vec3(1.0, 0.0, 0.0),
                angle: 0.0
            }        
        };
        var u = [uniforms0, uniforms1];

        for (var i = 0; i < u.length; ++i) {
            var uniforms = u[i];
            var shape = generateShape.call(this, 'sphereID', uniforms);
            if (shape) {
                this.shapes.push(shape);
            }
        }

        render.call(this, this.program, this.shapes);
    };
    // this.test.call(this);

    this.addShape = function (shapeID, uniforms) {
        var shape = generateShape.call(this, shapeID, uniforms);
        if (shape) {
            this.shapes.push(shape);
            render.call(this, this.program, this.shapes);
        }
    };
};
