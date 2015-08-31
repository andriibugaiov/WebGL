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
            this.scene.objects.push(mesh);
            pm.render.call(this, this.scene, this.camera);
        }
    };

    var pm = Object.create(Demonstrator.prototype);
    pm.initDemonstrator = function () {
        var canvas = document.getElementById("gl-canvas");

        // TODO:
        var gl = pm.setupWebGL.call(this, canvas);
        this.gl = gl;

        // TODO:
        var program = pm.loadShaders.call(this, gl);
        this.program = program;

        pm.initGraphics.call(this);
    };

    pm.initGraphics = function () {
        // scene
        this.scene = new Scene();

        // light
        var light = new Light();
        this.scene.light = light;

        var lightInfo = light.info;
        var lightUniforms = lightInfo.uniforms;

        // TODO:
        var setLight = function () {
            var xRot = 0.0;
            var yRot = 0.0;
            var zRot = 0.0;
            var s = 1.0;
            var xPos = 1.0;
            var yPos = 1.0;
            var zPos = 1.0;

            var uniforms = {
                rotation: vec3(xRot, yRot, zRot),
                scale: vec3(s, s, s),
                position: vec3(xPos, yPos, zPos) 
            };
 
            pm.applyUniforms.call(this, lightUniforms, uniforms);
        };
        setLight.call(this);

        // camera
        this.camera = new Camera();
        var cameraInfo = this.camera.info;
        var cameraUniforms = cameraInfo.uniforms;

        // TODO:
        var setCamera = function () {
            var xRot = 0.0;
            var yRot = 0.0;
            var zRot = 0.0;
            var s = 1.0;
            var xPos = 0.0;
            var yPos = 0.0;
            var zPos = -1.0;

            var uniforms = {
                rotation: vec3(xRot, yRot, zRot),
                scale: vec3(s, s, s),
                position: vec3(xPos, yPos, zPos) 
            };
 
            pm.applyUniforms.call(this, cameraUniforms, uniforms);
        };
        setCamera.call(this);
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

    pm.generateBuffer = function (data) {
        var gl = this.gl;

        var bufferID = gl.createBuffer();
        data.bufferID = bufferID;

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data.data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    // mark - 

    pm.generateMesh = function (shapeID, uniforms) {
        var mesh = null;
        switch(shapeID) {
            case 'sphereID': {
                mesh = new Mesh(new SphereGeometry(), null);
                break;
            }
            case 'coneID': {
                mesh = new Mesh(new ConeGeometry(), null);
                break;
            }
            case 'cylinderID': {
                mesh = new Mesh(new CylinderGeometry(), null);
                break;
            }
        }
        
        if (mesh) {
            var meshInfo = mesh.info;
            var meshUniforms = meshInfo.uniforms;
            var meshAttributes = meshInfo.attributes;

            pm.applyUniforms.call(this, meshUniforms, uniforms);

            pm.generateBuffer.call(this, meshAttributes.vertices);
            pm.generateBuffer.call(this, meshAttributes.normals);
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

    pm.loadUniforms = function (program, meshUniforms, cameraUniforms, lightUniforms) {
        var gl = this.gl;

        // model view
        var mvMatrixID = gl.getUniformLocation(program, "mvMatrix");
        gl.uniformMatrix4fv(mvMatrixID, false, flatten(meshUniforms.mvMatrix));

        // projection
        var pMatrixID = gl.getUniformLocation(program, "pMatrix");
        gl.uniformMatrix4fv(pMatrixID, false, flatten(cameraUniforms.pMatrix));

        // light
        var lPositionID = gl.getUniformLocation(program, "lPosition");
        var position = lightUniforms.position;
        gl.uniform3f(lPositionID, position[0], position[1], position[2]);

        var light = lightUniforms.light;

        var pAmbientID = gl.getUniformLocation(program, "pAmbient");
        var ambient = light.ambient;
        gl.uniform4f(pAmbientID, ambient[0], ambient[1], ambient[2], ambient[3]);

        var pDiffuseID = gl.getUniformLocation(program, "pDiffuse");
        var diffuse = light.diffuse;
        gl.uniform4f(pDiffuseID, diffuse[0], diffuse[1], diffuse[2], diffuse[3]);

        var pSpecularID = gl.getUniformLocation(program, "pSpecular");
        var specular = light.specular;
        gl.uniform4f(pSpecularID, specular[0], specular[1], specular[2], specular[3]);
    };

    pm.loadAttributes = function (program, attributes) {
        var gl = this.gl;

        // vertices
        var vBufferID = attributes.vertices.bufferID;
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferID);

        var vPositionID = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPositionID, 3, gl.FLOAT, false, attributes.stride(), 0);
        gl.enableVertexAttribArray(vPositionID);

        // normals
        var nBufferID = attributes.normals.bufferID;
        gl.bindBuffer(gl.ARRAY_BUFFER, nBufferID);

        var vNormalID = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormalID, 3, gl.FLOAT, false, attributes.stride(), 0);
        gl.enableVertexAttribArray(vNormalID);
    };

    pm.loadMesh = function (mesh, camera, light) {
        // TODO:
        var program = this.program;

        var meshInfo = mesh.info;
        var meshUniforms = meshInfo.uniforms;
        var meshAttributes = meshInfo.attributes;

        var cameraInfo = camera.info;
        var cameraUniforms = cameraInfo.uniforms;

        var lightInfo = light.info;
        var lightUniforms = lightInfo.uniforms;        

        // attributes
        pm.loadAttributes.call(this, program, meshAttributes);

        var vMatrix = cameraUniforms.mvMatrix;
        var mMatrix = pm.matrixFromUniforms(meshUniforms);
        meshUniforms.mvMatrix = mult(vMatrix, mMatrix);

        // uniforms
        pm.loadUniforms.call(this, program, meshUniforms, cameraUniforms, lightUniforms);
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

        for (var i = 0; i < scene.objects.length; ++i) {
            var mesh = scene.objects[i];
            var meshInfo = mesh.info;
            var meshAttributes = meshInfo.attributes;

            pm.loadMesh.call(this, mesh, camera, scene.light);

            // TODO:
            gl.drawArrays(gl.TRIANGLES, 0, meshAttributes.count());
        }
    };

    // mark - 

    return Demonstrator;
})();
