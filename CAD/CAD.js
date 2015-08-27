"use strict";

var Demonstrator = (function () {

    var Demonstrator = function () {
        this.gl = null;
        this.program = null;
        this.shapes = [];
        
        pm.initDemonstrator.call(this);
    };
    Demonstrator.prototype.addShape = function (shapeID, uniforms) {
        var shape = pm.generateShape.call(this, shapeID, uniforms);
        if (shape) {
            this.shapes.push(shape);
            pm.render.call(this, this.program, this.shapes);
        }
    };

    var pm = Object.create(Demonstrator.prototype);
    pm.initDemonstrator = function () {
        var canvas = document.getElementById("gl-canvas");

        //  Configure WebGL
        var gl = pm.setupWebGL.call(this, canvas);
        this.gl = gl;

        //  Load shaders and initialize attribute buffers
        var program = pm.loadShaders.call(this);
        this.program = program;

        pm.render.call(this, this.program, this.shapes);
    };
    
    // mark - 

    pm.setupWebGL = function (canvas) {
        var gl = WebGLUtils.setupWebGL(canvas);
        if ( !gl ) { 
            alert("WebGL isn't available"); 
        } else {
            pm.configureWebGL(gl, canvas);
        }
        return gl;
    };

    pm.configureWebGL = function (gl, canvas) { 
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

    pm.loadShaders = function () {
        var gl = this.gl;

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
        return program;
    };

    // mark - 


// ------------------


    // mark - 

    pm.applyUniforms = function(shapeUniforms, uniforms) {
        shapeUniforms.rotation = uniforms.rotation.slice();
        shapeUniforms.scale = uniforms.scale.slice();
        shapeUniforms.position = uniforms.position.slice();
    };

    pm.generateVerteciesBuffer = function (vertecies) {
        var gl = this.gl;

        var bufferID = gl.createBuffer();
        vertecies.bufferID = bufferID;

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertecies.data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    // mark - 

    pm.generateShape = function (shapeID, uniforms) {
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
            pm.applyUniforms.call(this, info.uniforms, uniforms);
            pm.generateVerteciesBuffer.call(this, info.attributes.vertecies);
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

    pm.updateUniforms = function (uniforms) {
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

        // TEMP!
        // var pMatrix = perspective(45, 1, 0, 1);
        // tsrMatrix = mult(pMatrix, tsrMatrix);

        uniforms.matrix = tsrMatrix;
    };

    // mark -

    pm.loadUniforms = function (program, uniforms) {
        var gl = this.gl;

        var matrixID = gl.getUniformLocation(program, "matrix");
        gl.uniformMatrix4fv(matrixID, false, flatten(uniforms.matrix));

        var colorID = gl.getUniformLocation(program, "color");
        var color = uniforms.color();
        gl.uniform4f(colorID, color[0], color[1], color[2], color[3]);
    };

    pm.loadAttributes = function (program, attributes) {
        var gl = this.gl;

        var bufferID = attributes.vertecies.bufferID;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);

        var vPositionID = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPositionID, 3, gl.FLOAT, false, attributes.stride(), 0);
        gl.enableVertexAttribArray(vPositionID);
    };

    pm.loadShape = function (program, shape) {
        var info = shape.info;

        // attributes
        var attributes = info.attributes;
        pm.loadAttributes.call(this, program, attributes);

        // uniforms
        var uniforms = info.uniforms;
        pm.updateUniforms.call(this, uniforms);
        pm.loadUniforms.call(this, program, uniforms);
    };

    // mark -


// ------------------


    // mark -

    pm.render = function (program, shapes) {
        var gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (var i = 0; i < shapes.length; ++i) {
            var shape = shapes[i];
            var info = shape.info;

            info.setWireFrame(false);
            pm.loadShape.call(this, program, shape);
            gl.drawArrays(info.attributes.mode(gl), 0, info.attributes.count());

            shape.info.setWireFrame(true);
            pm.loadShape.call(this, program, shape);
            gl.drawArrays(info.attributes.mode(gl), 0, info.attributes.count());
        }
    };

    // mark - 

    return Demonstrator;
})();
