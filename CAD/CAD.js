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

    var generateGeometry = function () {
        var vertices = [];
        var colors = [];

        var count = 0;
        var capacity = 100000;
        for (var i = 0; i < capacity; ++i) {
            vertices.push(vec2(0, 0));
            colors.push(vec3(0, 0, 0));
        }

        return {
            vertices: vertices,
            colors: colors,
            dimension: function (id) {
                if (id === 'v') {
                    return 2;
                } else if (id === 'c') {
                    return 3;
                }
                console.log('Error!');
                return 0;
            },
            capacity: capacity,
            count: count,
            evenCount: function () {
                return Math.floor(0.5 * this.count) * 2;
            }
        };
    };

    var generateAttributes = function () {
        var geometry = generateGeometry.call(this);
        var attributes = {
            geometry: geometry
        };
        return attributes;
    };

    var generateUniforms = function () {
        var uniforms = {
        };
        return uniforms;
    };

    var generateData = function () {
        return {
            attributes: generateAttributes.call(this),
            uniforms: generateUniforms.call(this)
        };
    };

    // mark - 

    var loadUniforms = function (glctx, program, uniforms) {
    };

    var loadAttributes = function (glctx, program, attributes) {
        var geometry = attributes.geometry;

        var vBufferID = glctx.createBuffer();
        glctx.bindBuffer(glctx.ARRAY_BUFFER, vBufferID);
        glctx.bufferData(glctx.ARRAY_BUFFER, flatten(geometry.vertices), glctx.STATIC_DRAW);
        this.vBufferID = vBufferID;

        var vPositionID = glctx.getAttribLocation(program, "vPosition");
        glctx.vertexAttribPointer(vPositionID, geometry.dimension('v'), glctx.FLOAT, false, 0, 0);
        glctx.enableVertexAttribArray(vPositionID);

        var cBufferID = glctx.createBuffer();
        glctx.bindBuffer(glctx.ARRAY_BUFFER, cBufferID);
        glctx.bufferData(glctx.ARRAY_BUFFER, flatten(geometry.colors), glctx.STATIC_DRAW);
        this.cBufferID = cBufferID;

        var vColorID = glctx.getAttribLocation(program, "vColor");
        glctx.vertexAttribPointer(vColorID, geometry.dimension('c'), glctx.FLOAT, false, 0, 0);
        glctx.enableVertexAttribArray(vColorID);
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
        var mode = glctx.LINES;
        glctx.drawArrays(mode, 0, geometry.evenCount());
    }

    // mark - 

    this.data = null;
    this.gl = null;
    this.program = null;

    this.vBufferID = null;
    this.cBufferID = null;

    this.color = vec3(0, 0, 0);

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

    this.onPointTrackStarted = function (point) {
        var tColor = this.color;

        if (this.data) {
            var geometry = this.data.attributes.geometry;
            var count = geometry.count;
            var capacity = geometry.capacity;
            if (count < capacity && this.vBufferID && this.cBufferID) {
                if (geometry.evenCount() < geometry.count) {
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferID);
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec2'] * count, flatten(point));
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec2'] * (count + 1), flatten(point));
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferID);
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec3'] * count, flatten(tColor));
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec3'] * (count + 1), flatten(tColor));

                    geometry.count += 2;
                } else {
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferID);
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec2'] * count, flatten(point));
                    
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferID);
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec3'] * count, flatten(tColor));

                    geometry.count += 1;
                }
            }
        }
    };

    this.onPointTrackEnded = function (point) {
        var tColor = this.color;

        if (this.data) {
            var geometry = this.data.attributes.geometry;
            var count = geometry.count;
            var capacity = geometry.capacity;
            if (count < capacity && this.vBufferID && this.cBufferID) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferID);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec2'] * count, flatten(point));

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferID);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec3'] * count, flatten(tColor));

                geometry.count += 1;

                render.call(this, this.gl, this.data);
            }
        }
    };

    this.onPointTracked = function (point) {
        var tColor = this.color;
        
        if (this.data) {
            var geometry = this.data.attributes.geometry;
            var count = geometry.count;
            var capacity = geometry.capacity;
            if (count < capacity && this.vBufferID && this.cBufferID) {
                var points = [point, point];
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferID);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec2'] * count, flatten(points));

                var colors = [tColor, tColor];
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferID);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, sizeof['vec3'] * count, flatten(colors));

                geometry.count += 2;

                render.call(this, this.gl, this.data);
            }
        }
    };

    this.onColorSelected = function (color) {
        this.color = color;
    };
};
