﻿'use strict';

var THICKNESS = 1;

var $drawing = document.getElementById('drawInput');
var $houghSp = document.getElementById('houghSp');

var ctx = $drawing.getContext('2d');
var HSctx = $houghSp.getContext('2d');

var drawingMode = false;

var drawingWidth = $drawing.width;
var drawingHeight = $drawing.height;

var numAngleCells = 360;
var rhoMax = Math.sqrt(drawingWidth * drawingWidth + drawingHeight * drawingHeight);
var accum = Array(numAngleCells);

// Set the size of the Hough space.
$houghSp.width = numAngleCells;
$houghSp.height = rhoMax;

HSctx.fillStyle = 'rgba(0,0,0,.01)';

$drawing.addEventListener('mousedown', function () {
    drawingMode = true;
});
$drawing.addEventListener('mouseup', function () {
    drawingMode = false;
});
$drawing.addEventListener('mouseout', function () {
    drawingMode = false;
});
$drawing.addEventListener('mousemove', function (e) {
    if (drawingMode) {
        var x = getX(e),
            y = getY(e);
        ctx.beginPath();
        ctx.fillRect(x - (THICKNESS / 2), y - (THICKNESS / 2), THICKNESS, THICKNESS);
        ctx.closePath();

        houghAcc(x, y);
    }

    /**
     * Extract the local X position from a mouse event.
     * @param  {Event} e A mouse event.
     * @return {number} The local X value of the mouse.
     */
    function getX(e) {
        return e.layerX != undefined && e.layerX - e.target.clientLeft - e.target.offsetLeft || e.offsetX != undefined && e.offsetX || e.clientX != undefined && e.clientX;
    }

    /**
     * Extract the local Y position from a mouse event.
     * @param  {Event} e A mouse event.
     * @return {number} The local Y value of the mouse.
     */
    function getY(e) {
        return e.layerY != undefined && e.layerY - e.target.clientTop - e.target.offsetTop || e.offsetY != undefined && e.offsetY || e.clientY != undefined && e.clientY;
    }
});

// Precalculate tables.
var cosTable = Array(numAngleCells);
var sinTable = Array(numAngleCells);
for (var theta = 0, thetaIndex = 0; thetaIndex < numAngleCells; theta += Math.PI / numAngleCells, thetaIndex++) {
    cosTable[thetaIndex] = Math.cos(theta);
    sinTable[thetaIndex] = Math.sin(theta);
}

// Implementation with lookup tables.
function houghAcc(x, y) {
    var rho;
    var thetaIndex = 0;
    x -= drawingWidth / 2;
    y -= drawingHeight / 2;
    for (; thetaIndex < numAngleCells; thetaIndex++) {
        rho = rhoMax + x * cosTable[thetaIndex] + y * sinTable[thetaIndex];
        rho >>= 1;
        if (accum[thetaIndex] == undefined) accum[thetaIndex] = [];
        if (accum[thetaIndex][rho] == undefined) {
            accum[thetaIndex][rho] = 1;
        } else {
            accum[thetaIndex][rho]++;
        }

        HSctx.beginPath();
        HSctx.fillRect(thetaIndex, rho, 1, 1);
        HSctx.closePath();
    }
}

// Classical implementation.
function houghAccClassical(x, y) {
    var rho;
    var theta = 0;
    var thetaIndex = 0;
    x -= drawingWidth / 2;
    y -= drawingHeight / 2;
    for (; thetaIndex < numAngleCells; theta += Math.PI / numAngleCells, thetaIndex++) {
        rho = rhoMax + x * Math.cos(theta) + y * Math.sin(theta);
        rho >>= 1;
        if (accum[thetaIndex] == undefined) accum[thetaIndex] = [];
        if (accum[thetaIndex][rho] == undefined) {
            accum[thetaIndex][rho] = 1;
        } else {
            accum[thetaIndex][rho]++;
        }

        HSctx.beginPath();
        HSctx.fillRect(thetaIndex, rho, 1, 1);
        HSctx.closePath();
    }
}