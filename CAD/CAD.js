"use strict";

var Demonstrator = (function () {

    var Demonstrator = function () {
        this.gl = null;
        this.program = null;

        this.camera = null;
        this.scene = null;
        
        pm.initDemonstrator.call(this);
    };

    Demonstrator.prototype.addShape = function (shapeID, uniforms) {
        var mesh = pm.generateMesh.call(this, shapeID, uniforms);
        if (mesh) {
            this.scene.push(mesh);
            pm.render.call(this, this.scene, this.camera);
        }
    };

    var pm = Object.create(Demonstrator.prototype);
    pm.initDemonstrator = function () {
        var canvas = document.getElementById("gl-canvas");

        // TODO:
        var gl = pm.setupWebGL.call(this, canvas);
        this.gl = gl;
        var program = pm.loadShaders.call(this, gl);
        this.program = program;


        // TODO:
        this.scene = [];
        this.camera = new Camera();

        var xRot = 0.0;
        var yRot = 0.0;
        var zRot = 0.0;
        var s = 1.0;
        var xPos = -0.0;
        var yPos = 0.0;
        var zPos = -1.0;

        var uniforms = {
            rotation: vec3(xRot, yRot, zRot),
            scale: vec3(s, s, s),
            position: vec3(xPos, yPos, zPos) 
        };

        var cameraInfo = this.camera.info;
        pm.applyUniforms.call(this, cameraInfo.uniforms, uniforms);
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

        gl.frontFace(gl.CCW);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    };

    pm.loadShaders = function (gl) {
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
        return program;
    };

    // mark - 


// ------------------


    // mark - 

    pm.applyUniforms = function(toUniforms, fromUniforms) {
        toUniforms.rotation = fromUniforms.rotation.slice();
        toUniforms.scale = fromUniforms.scale.slice();
        toUniforms.position = fromUniforms.position.slice();
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

    pm.generateMesh = function (shapeID, uniforms) {
        var mesh = null;
        // TODO:
        switch(shapeID) {
            case 'sphereID': {
                mesh = new SphereGeometry();
                break;
            }
            case 'coneID': {
                mesh = new ConeGeometry();
                break;
            }
            case 'cylinderID': {
                mesh = new CylinderGeometry();
                break;
            }
        }
        
        if (mesh) {
            var meshInfo = mesh.info;
            pm.applyUniforms.call(this, meshInfo.uniforms, uniforms);
            pm.generateVerteciesBuffer.call(this, meshInfo.attributes.vertecies);
        }
        return mesh;
    };

    // mark - 


// ------------------


    // mark - 

    pm.matrixFromUniforms = function (uniforms) {
        var t = uniforms.position;
        var tMatrix = translate(t);        

        var s = uniforms.scale;
        var sMatrix = scalem(s);

        var r = uniforms.rotation;
        var rxMatrix = rotateX(r[0]);
        var ryMatrix = rotateY(r[1]);
        var rzMatrix = rotateZ(r[2]);
        var rzyxMatrix = mult(rzMatrix, ryMatrix);
        var rzyxMatrix = mult(rzyxMatrix, rxMatrix);

        var tsMatrix = mult(tMatrix, sMatrix);
        var matrix = mult(tsMatrix, rzyxMatrix);
        return matrix;
    };

    // mark -

    pm.loadUniforms = function (program, meshUniforms, cameraUniforms) {
        var gl = this.gl;

        var mvMatrixID = gl.getUniformLocation(program, "mvMatrix");
        gl.uniformMatrix4fv(mvMatrixID, false, flatten(meshUniforms.mvMatrix));

        // TODO:
        var pMatrixID = gl.getUniformLocation(program, "pMatrix");
        gl.uniformMatrix4fv(pMatrixID, false, flatten(cameraUniforms.pMatrix));

        // TODO:
        var colorID = gl.getUniformLocation(program, "color");
        var color = vec4(1.0, 0.0, 0.0, 1.0);
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

    pm.loadMesh = function (mesh, camera) {
        // TODO:
        var program = this.program;

        var meshInfo = mesh.info;
        var meshUniforms = meshInfo.uniforms;
        meshUniforms.mvMatrix = pm.matrixFromUniforms(meshUniforms);

        var cameraInfo = camera.info;
        var cameraUniforms = cameraInfo.uniforms;

        // attributes
        var attributes = meshInfo.attributes;
        pm.loadAttributes.call(this, program, attributes);

        // uniforms
        var vMatrix = cameraUniforms.mvMatrix;
        var mMatrix = meshUniforms.mvMatrix
        meshUniforms.mvMatrix = mult(vMatrix, mMatrix);

        pm.loadUniforms.call(this, program, meshUniforms, cameraUniforms);
    };

    // mark -


// ------------------


    // mark -

    pm.render = function (scene, camera) {
        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var cameraInfo = camera.info;
        var cameraUniforms = cameraInfo.uniforms;
        cameraUniforms.mvMatrix = pm.matrixFromUniforms(cameraUniforms);

        for (var i = 0; i < scene.length; ++i) {
            var mesh = scene[i];
            pm.loadMesh.call(this, mesh, camera);

            // TODO:
            var meshInfo = mesh.info;
            gl.drawArrays(gl.TRIANGLES, 0, meshInfo.attributes.count());
        }
    };

    // mark - 

    return Demonstrator;
})();
