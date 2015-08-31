"use strict";

var ConeGeometry = (function () {
    var ConeGeometry = function () {
        Geometry.call(this);
    };
    inherit(ConeGeometry, Geometry);
    
    ConeGeometry.prototype.generateVerticesData = function () {
        var vertices = [];
        var normals = [];

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

            vertices.push(top);
            vertices.push(v2);
            vertices.push(v1);

            var n = normalize(cross(subtract(v1, v2), subtract(top, v2)));
            normals.push(n);
            normals.push(n);
            normals.push(n);

            // mark - 

            vertices.push(bottom);
            vertices.push(v1);
            vertices.push(v2);

            n = normalize(cross(subtract(v2, v1), subtract(bottom, v1)));
            normals.push(n);
            normals.push(n);
            normals.push(n);

            xCur = xNext;
            zCur = zNext;
        }
        return {
            vertices: vertices,
            normals: normals
        };
    };

    var pm = Object.create(ConeGeometry.prototype);
    // ...

    return ConeGeometry;
})();

