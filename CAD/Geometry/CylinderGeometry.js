"use strict";

var CylinderGeometry = (function () {
    var CylinderGeometry = function () {
        Geometry.call(this);
    };
    inherit(CylinderGeometry, Geometry);
    
    CylinderGeometry.prototype.generateVertecies = function () {
        var data = [];
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
            var v3 = vec3(xCur, yTop, zCur);
            var v4 = vec3(xNext, yTop, zNext);

            data.push(top);
            data.push(v4);
            data.push(v3);

            // mark - 

            data.push(v4);
            data.push(v2);
            data.push(v3);

            // mark - 

            data.push(v3);
            data.push(v2);
            data.push(v1);

            // mark - 

            data.push(bottom);
            data.push(v1);
            data.push(v2);

            xCur = xNext;
            zCur = zNext;
        }
        return data;
    };

    var pm = Object.create(CylinderGeometry.prototype);
    // ...

    return CylinderGeometry;
})();
