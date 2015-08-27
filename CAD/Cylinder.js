"use strict";

var Cylinder = (function () {
    var Cylinder = function () {
        Shape.call(this);
    };
    inherit(Cylinder, Shape);
    Cylinder.prototype.generateVertecies = function (vertecies) {
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

            vertecies.data.push(top);
            vertecies.data.push(v4);

            vertecies.data.push(v4);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(top);

            // mark - 

            vertecies.data.push(v4);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(v4);

            // mark - 

            vertecies.data.push(v3);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v1);

            vertecies.data.push(v1);
            vertecies.data.push(v3);

            // mark - 

            vertecies.data.push(bottom);
            vertecies.data.push(v1);

            vertecies.data.push(v1);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(bottom);

            xCur = xNext;
            zCur = zNext;
        }
    };

    var pm = Object.create(Sphere.prototype);
    // ...

    return Cylinder;
})();
