"use strict";

var Sphere = (function () {
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

    var Sphere = function () {
        Shape.call(this);
    };
    inherit(Sphere, Shape);
    Sphere.prototype.generateVertecies = function (vertecies) {
        var depth = 3;
        for (var i = 0; i < tIndices.length; ++i) {
            pm.subdivide(vData[tIndices[i][0]],
                         vData[tIndices[i][1]],
                         vData[tIndices[i][2]], depth, vertecies);
        }
    };

    var pm = Object.create(Sphere.prototype);
    pm.subdivide = function (v1, v2, v3, depth, vertecies) {
        if (depth == 0) {
            vertecies.data.push(v1);
            vertecies.data.push(v2);

            vertecies.data.push(v2);
            vertecies.data.push(v3);

            vertecies.data.push(v3);
            vertecies.data.push(v1);

            // console.log(v1);
            // console.log(v2);
            // console.log(v3);
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
        
        pm.subdivide(v1, v12, v31, depth - 1, vertecies);
        pm.subdivide(v2, v23, v12, depth - 1, vertecies);
        pm.subdivide(v3, v31, v23, depth - 1, vertecies);
        pm.subdivide(v12, v23, v31, depth - 1, vertecies);
    };

    return Sphere;
})();
