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
            this.scene.add(mesh);
        }
    };

    var pm = Object.create(Demonstrator.prototype);
    pm.initDemonstrator = function () {
        pm.initWebGL.call(this);
        pm.initGraphics.call(this);

        pm.animate.call(this);
    };
    pm.initWebGL = function () {
        var canvas = document.getElementById("gl-canvas");

        // TODO:
        var gl = pm.setupWebGL.call(this, canvas);
        this.gl = gl;

        // TODO:
        var program = pm.loadShaders.call(this, gl);
        this.program = program;
    };
    pm.initGraphics = function () {
        // scene
        this.scene = new Scene();

        // light
        var light = new Light();
        this.scene.add(light); 

        // TODO:
        var setLight = function () {
            var xRot = 0.0;
            var yRot = 0.0;
            var zRot = 0.0;
            var s = 1.0;
            var xPos = 1.0;
            var yPos = 5.0;
            var zPos = 1.0;

            var uniforms = {
                rotation: vec3(xRot, yRot, zRot),
                scale: vec3(s, s, s),
                position: vec3(xPos, yPos, zPos) 
            };
        
            light.setUniforms(uniforms);
        };
        setLight.call(this);

        // camera
        this.camera = new Camera();

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
 
            this.camera.setUniforms(uniforms);
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

    pm.generateAttributeBuffer = function (attribute) {
        var gl = this.gl;

        var bufferID = gl.createBuffer();
        attribute.bufferID = bufferID;

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(attribute.data), gl.STATIC_DRAW);
    };

    pm.generateTextureBuffer = function (texture) {
        if (!texture.image || !texture.textureID)
            return;

        var gl = this.gl;

        var bufferID = gl.createTexture();
        texture.bufferID = bufferID;

        gl.bindTexture(gl.TEXTURE_2D, bufferID);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        switch (texture.textureID) {
            case "standardID": {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                break;
            }
            case "regularID": {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture.size, texture.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
            }
        }

        gl.activeTexture(gl.TEXTURE0);
    };

    // mark - 

    pm.generateMesh = function (shapeID, uniforms) {
        var mesh = null;
        switch(shapeID) {
            case 'sphereID': {
                // TODO:
                if (uniforms.material.hasOwnProperty("texture")) {
                    var texture = uniforms.material.texture;
                    mesh = new Mesh(new SphereGeometry(), new TextureMaterial(texture));
                } else {
                    mesh = new Mesh(new SphereGeometry(), new Material());
                }
                break;
            }
            case 'coneID': {
                mesh = new Mesh(new ConeGeometry(), new Material());
                break;
            }
            case 'cylinderID': {
                mesh = new Mesh(new CylinderGeometry(), new Material());
                break;
            }
        }
        
        if (mesh) {
            mesh.setUniforms(uniforms);

            var meshInfo = mesh.info;
            var meshUniforms = meshInfo.uniforms;
            var meshMaterial = meshUniforms.material;
            if (meshMaterial.hasOwnProperty("texture")) {
                pm.generateTextureBuffer.call(this, meshMaterial.texture);    
            }

            var meshAttributes = meshInfo.attributes;
            pm.generateAttributeBuffer.call(this, meshAttributes.vertices);
            pm.generateAttributeBuffer.call(this, meshAttributes.normals);
            pm.generateAttributeBuffer.call(this, meshAttributes.texels);
        }
        return mesh;
    };

    // mark - 

// ------------------

    // mark -

    pm.loadUniforms = function (program, meshUniforms, cameraUniforms, lightUniforms) {
        var gl = this.gl;

        // position
        var umvMatrixID = gl.getUniformLocation(program, "umvMatrix");
        gl.uniformMatrix4fv(umvMatrixID, false, flatten(meshUniforms.mvMatrix));

        var upMatrixID = gl.getUniformLocation(program, "upMatrix");
        gl.uniformMatrix4fv(upMatrixID, false, flatten(cameraUniforms.pMatrix));

        // light
        var lPositionID = gl.getUniformLocation(program, "uLight.position");
        gl.uniform3fv(lPositionID, lightUniforms.position);

        var light = lightUniforms.light;
        
        var lAmbientID = gl.getUniformLocation(program, "uLight.ambient");
        gl.uniform4fv(lAmbientID, light.ambient);

        var lDiffuseID = gl.getUniformLocation(program, "uLight.diffuse");
        gl.uniform4fv(lDiffuseID, light.diffuse);

        var lSpecularID = gl.getUniformLocation(program, "uLight.specular");
        gl.uniform4fv(lSpecularID, light.specular);


        // material
        var meshMaterial = meshUniforms.material;

        var mAmbientID = gl.getUniformLocation(program, "uMaterial.ambient");
        gl.uniform4fv(mAmbientID, meshMaterial.ambient);

        var mDiffuseID = gl.getUniformLocation(program, "uMaterial.diffuse");
        gl.uniform4fv(mDiffuseID, meshMaterial.diffuse);

        var mSpecularID = gl.getUniformLocation(program, "uMaterial.specular");
        gl.uniform4fv(mSpecularID, meshMaterial.specular);

        var mShininessID = gl.getUniformLocation(program, "uMaterial.shininess");
        gl.uniform1f(mShininessID, meshMaterial.shininess);

        if (meshMaterial.hasOwnProperty("texture")) {
            var tBufferID = meshMaterial.texture.bufferID;
            gl.bindTexture(gl.TEXTURE_2D, tBufferID);

            var umTextureID = gl.getUniformLocation(program, "umTexture");
            gl.uniform1i(umTextureID, 0);
        }
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

        // texels
        var tBufferID = attributes.texels.bufferID;
        gl.bindBuffer(gl.ARRAY_BUFFER, tBufferID);

        var vTexelID = gl.getAttribLocation(program, "vTexel");
        gl.vertexAttribPointer(vTexelID, 2, gl.FLOAT, false, attributes.stride(), 0);
        gl.enableVertexAttribArray(vTexelID);
    };

    pm.loadMesh = function (mesh, camera, light) {
        // TODO:
        var program = this.program;

        mesh.updateMatrix();
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
        var mMatrix = meshUniforms.mvMatrix
        meshUniforms.mvMatrix = mult(vMatrix, mMatrix);

        // uniforms
        pm.loadUniforms.call(this, program, meshUniforms, cameraUniforms, lightUniforms);
    };

    // mark -

// ------------------

    // mark -

    // TODO:
    var time = 0.0;
    pm.animate = function () {
        time += 0.01;

        this.scene.animate(time);
        this.camera.animate(time);

        pm.render.call(this, this.scene, this.camera);
        requestAnimationFrame(pm.animate.bind(this));
    };

    pm.render = function (scene, camera) {
        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.updateMatrix();

        // TODO:
        for (var i = 0; i < scene.children.length; ++i) {
            var mesh = scene.children[i];
            var meshInfo = mesh.info;
            var meshAttributes = meshInfo.attributes;

            pm.loadMesh.call(this, mesh, camera, scene.light);
            gl.drawArrays(gl.TRIANGLES, 0, meshAttributes.count());
        }
    };

    // mark - 

    return Demonstrator;
})();
