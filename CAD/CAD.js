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
        gl.depthFunc(gl.LEQUAL);

        // TODO!
        gl.frontFace(gl.CW);
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

    var applyUniforms = function(shapeUniforms, uniforms) {
        // TODO! DEEP COPY!
        shapeUniforms.rotation[0] = uniforms.rotation[0];
        shapeUniforms.rotation[1] = uniforms.rotation[1];
        shapeUniforms.rotation[2] = uniforms.rotation[2];

        shapeUniforms.scale[0] = uniforms.scale[0];
        shapeUniforms.scale[1] = uniforms.scale[1];
        shapeUniforms.scale[2] = uniforms.scale[2];

        shapeUniforms.position[0] = uniforms.position[0];
        shapeUniforms.position[1] = uniforms.position[1];
        shapeUniforms.position[2] = uniforms.position[2];

        // shapeUniforms.rotation.axis[0] = uniforms.rotation.axis[0];
        // shapeUniforms.rotation.axis[1] = uniforms.rotation.axis[1];
        // shapeUniforms.rotation.axis[2] = uniforms.rotation.axis[2];

        // shapeUniforms.rotation.angle = uniforms.rotation.angle;
    };

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
                shape = new Sphere();
                break;
            }
            case 'coneID': {
                shape = new Cone();
                break;
            }
            case 'cylinderID': {
                shape = new Cylinder();
                break;
            }
        }
        
        if (shape) {
            var info = shape.info;
            applyUniforms.call(this, info.uniforms, uniforms);
            generateVerteciesBuffer.call(this, info.attributes.vertecies);
            // TODO!
            // generateColorsBuffer.call(this, info.attributes.colors);
        }
        return shape;
    };

    // mark - 


// ------------------


    // mark - 

    var axes = {
        "x": vec3(1.0, 0.0, 0.0),
        "y": vec3(0.0, 1.0, 0.0),
        "z": vec3(0.0, 0.0, 1.0)
    };

    var updateUniforms = function (uniforms) {
        var t = uniforms.position;
        var tMatrix = translate(t);

        var s = uniforms.scale;
        var sMatrix = scale(s);

        var r = uniforms.rotation;
        var rxMatrix = rotate(r[0], axes["x"]);
        var ryMatrix = rotate(r[1], axes["y"]);
        var rzMatrix = rotate(r[2], axes["z"]);

        var tsMatrix = mult(tMatrix, sMatrix);
        var tsrMatrix = mult(tsMatrix, rxMatrix);
        tsrMatrix = mult(tsrMatrix, ryMatrix);
        tsrMatrix = mult(tsrMatrix, rzMatrix);

        uniforms.matrix = tsrMatrix;
    };

    // mark -

    var loadUniforms = function (program, uniforms) {
        var gl = this.gl;

        var matrixID = gl.getUniformLocation(program, "matrix");
        gl.uniformMatrix4fv(matrixID, false, flatten(uniforms.matrix));

        var colorID = gl.getUniformLocation(program, "color");
        var color = uniforms.color();

        // TEMP!
        if (!uniforms.wireFrame) {
            var scale = uniforms.scale;
            color[0] = scale[0] + 2.5;
        }

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
        var info = shape.info;

        // attributes
        var attributes = info.attributes;
        loadAttributes.call(this, program, attributes);

        // uniforms
        var uniforms = info.uniforms;
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
            var info = shape.info;

            info.setWireFrame(false);
            loadShape.call(this, program, shape);
            gl.drawArrays(info.attributes.mode(gl), 0, info.attributes.count());

            shape.info.setWireFrame(true);
            loadShape.call(this, program, shape);
            gl.drawArrays(info.attributes.mode(gl), 0, info.attributes.count());
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

    this.addShape = function (shapeID, uniforms) {
        var shape = generateShape.call(this, shapeID, uniforms);
        if (shape) {
            this.shapes.push(shape);
            render.call(this, this.program, this.shapes);
        }
    };
};
