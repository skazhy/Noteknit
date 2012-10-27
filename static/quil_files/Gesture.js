function Gesture()
{
    /* static */
    DEFAULT_NUM_POINTS = 52;
    MIN_NUM_POINTS = 4;
    MAX_NUM_POINTS = 4096;
    
    /* public */
    //TODO: rename this to symbolName
    this.symbol = "";
    this.numNormalPoints = DEFAULT_NUM_POINTS;
    this.strokes = [];
    this.strokes.push(new Array());
//    for (var i = 0; i < Gesture.MAX_STROKES; i++)
//    {
//        this.strokes[i] = [];
//    }
       
    this.matches = [];
    this.originalStrokeIndices = [];
    this.startingPoint = new Point();
    this.topLeft = null;
    this.bottomRight = null;
    this.height = null;
    this.width = null;
//    this.
    this.strokeIdx = 0;

    this.bagOfPointsSorted = false;
    //hack
    this.staffSize = 128;

    /* private */
    var _offsetX = 0;
    var _offsetY = 0;
    var _shapeNeedsUpdating = false;
    var _lineThickness = 7;
    var _lineColor = 0x000000;
    var _shapeMarginTop = 10;
    var _shapeMarginLeft = 10;
    var _length = -1;
    var _averageCenter;
    

    var MAX_SCALE_X = 1.15;
    var MIN_SCALE_X = 1 / MAX_SCALE_X;

    var MAX_SCALE_Y = 1.15;
    var MIN_SCALE_Y = 1 / MAX_SCALE_Y;
    
    var MAX_ASPECT_RATIO_DELTA = 1.0;
    
    this.getTopLeft = function()
    {
        if (!this.topLeft)
        {
            this.getBoundingBox();
        }
        
        return this.topLeft;
    }

    this.getBottomRight = function()
    {
        if (!this.bottomRight)
        {
            this.getBoundingBox();
        }
        return this.bottomRight;
    }

    this.getWidth = function()
    {
        if (!this.width)
        {
            this.getBoundingBox();
        }
        
        return this.width;
    }
    
    this.getHeight = function()
    {
        if (!this.height)
        {
            this.getBoundingBox();
        }
        
        return this.height;
    }
    
    this.addPoint = function(x, y)
    {
        //console.log(this.strokeIdx);
        this.strokes[this.strokeIdx].push(new Point(x, y));            
        //console.log(this.strokes[this.strokeIdx].length);
        //console.log(this.strokes);
        _shapeNeedsUpdating = true;            
    }

    this.strokeLength = function()
    {
        var length = 0;
        for (var i = 0; i < this.strokes.length; i++)
        {
            for (var j = 1; j < this.strokes[i].length; j++)
            {
                length += Point.distance(this.strokes[i][j-1], this.strokes[i][j]);
            }
        }
        return length;
    }

    //unused
    this.strokeSegmentLength = function(strokeIdx)
    {
        var length = 0;
        for (var j = 1; j < this.strokes[strokeIdx].length; j++)
        {
            length += Point.distance(this.strokes[strokeIdx][j-1], this.strokes[segmentIdx][j]);
        }
        return length;
    }
    
    this.normalizeShape = function()
    {
        
        var normalStrokeLength = this.strokeLength() / (this.numNormalPoints - 1);
        for (var i = 0; i < this.strokes.length; i ++)
        {
            var newPoints = [];
            if (this.strokes[i].length <= 0)
            {
                continue;
            }
            newPoints.push(this.strokes[i][0]);
            var startPoint = this.strokes[i][0];            
            var endPoint = this.strokes[i][0];
            
            var previousDistanceEnd = 0;
            var previousDistanceStart = 0;
            var distance = 0;
            var strokeLength = 0;
            var pointIdx = 1;
            var j = 0;
            while (j <= MAX_NUM_POINTS) 
            {
                j ++;
                var excess = previousDistanceEnd - distance;
                if (excess >= normalStrokeLength) 
                {                   
                    distance += normalStrokeLength;
                    var ratio = (distance - previousDistanceStart) / strokeLength;
                    var newPoint = new Point((endPoint.x - startPoint.x) * ratio + startPoint.x,
                                                   (endPoint.y - startPoint.y) * ratio + startPoint.y);
                    newPoints.push(newPoint);
                    
                }
                else 
                {
                    if (pointIdx == this.strokes[i].length)
                    {
                        break;
                    }
                    startPoint = endPoint;
                    endPoint = this.strokes[i][pointIdx];
                    previousDistanceStart = previousDistanceEnd;
                    strokeLength = endPoint.subtract(startPoint).getLength();
                    previousDistanceEnd += strokeLength;
                    pointIdx ++;
                }
            }
            
            //add final point
            if (newPoints.length < this.numNormalPoints) 
            {
                newPoints.push(endPoint);
            }
            
            this.strokes[i] = newPoints;
        }
    }
    
    //center on average center point
    this.normalizeToAverageCenter = function()
    {
        for (var i = 0; i < this.strokes.length; i ++)
        {
            for (var j = 0; j < this.strokes[i].length; j++)
            {
                var point = this.strokes[i][j];
                point.x -= this.getAverageCenter().x;                
                point.y -= this.getAverageCenter().y;
            }
        }        
    }          

    this.normalizeToFixedPoint = function(centerPoint, recalculateCentroid, offsetPoint)
    {
        //unused?
        if (offsetPoint == undefined)
        {
            offsetPoint = new Point(0, 0);
        }
        if (recalculateCentroid == undefined)
        {
            recalculateCentroid = false;
        }
        if (DEBUG_LEVEL > 1)
        {
//            console.log("this.normalizeToFixedPoint called by " + this.normalizeToFixedPoint.caller);
        }
        var averageCenter = this.getAverageCenter(recalculateCentroid);
        for (var i = 0; i < this.strokes.length; i ++)
        {
            for (var j = 0; j < this.strokes[i].length; j++)
            {
                var point = this.strokes[i][j];            
                //only user vertical offset for staff margin?
                point.x = offsetPoint.x + point.x + (centerPoint.x - averageCenter.x);
                point.y = offsetPoint.y + point.y + (centerPoint.y - averageCenter.y);
            }        
        }
    }          

    //Something is buggy about this
    this.setTopLeftToZero = function()
    {
        var offsetPoint = this.topLeft;
        var averageCenter = this.getAverageCenter();
//        alert(offsetPoint);
        for (var i = 0; i < this.strokes.length; i ++)
        {
            for (var j = 0; j < this.strokes[i].length; j++)
            {
                var point = this.strokes[i][j];            
                point.x -= offsetPoint.x
                point.y -= offsetPoint.y;
            }        
        }
    }          
    
    
    this.getAverageCenter = function(recalculate)
    {
        if (DEBUG_LEVEL > 0)
        {
//            console.log("recalculate", recalculate, "_averageCenter", _averageCenter);
        }
        if (!recalculate && _averageCenter != null)
        {
            if (DEBUG_LEVEL > 0)
            {
//                console.log("returning previously calculated _averageCenter");
            }            
            return _averageCenter;
        }
        
        var centerX = 0;
        var centerY = 0;
        if (this.strokes == undefined || this.strokes.length <= 0 || this.strokes[0] == undefined)
        {
            if (DEBUG_LEVEL > 0)
            {
//                console.log("getAverageCenter called on gesture without strokes by", this.getAverageCenter.caller, this);
            }
            return new Point(0, 0);
        }
        
        for (var i = 0; i < this.strokes[0].length; i++)
        {
            var point = this.strokes[0][i];
            centerX += point.x;
            centerY += point.y;
        }            
        
        centerX /= this.strokes[0].length;
        centerY /= this.strokes[0].length;
        
         _averageCenter = new Point(centerX, centerY);
        //global for sort function
        window._averageCenter = _averageCenter;
        return (_averageCenter);
    }
    
    this.getBoundingBox = function()
    {    
        if (this.strokes[0].length < 1)
        {
            return false;
        }
        var firstPoint = this.strokes[0][0];
        var minX = firstPoint.x;
        var minY = firstPoint.y;
        var maxX = firstPoint.x;
        var maxY = firstPoint.y;
        for (var i = 0; i < this.strokes.length; i++)
        {
            for (var j = 0; j < this.strokes[i].length; j++)
            {
                var point = this.strokes[i][j];
                if (point.x < minX)
                {
                    minX = point.x;
                }    
                if (point.y < minY)
                {
                    minY = point.y;
                }    
                if (point.x > maxX)
                {
                    maxX = point.x;
                }    
                if (point.y > maxY)
                {
                    maxY = point.y;
                }    
            }
        }
        
        //account for fuzz
        var margin = 10;
        minX -= margin;
        minY -= margin;
        maxX += margin;
        maxY += margin;
        
        var width = maxX - minX;
        var height = maxY - minY;
        this.width = width;
        this.height = height;
        this.topLeft = new Point(minX, minY);
        this.bottomRight = new Point(maxX, maxY);
    }

    //match this gesture's scale to another gesture
    this.matchScale = function (matchGesture)
    {
        //width
        var scaleX =  matchGesture.getWidth() / this.getWidth();
        //height
        var scaleY = matchGesture.getHeight() / this.getHeight();
        
        //always leave these ordered x:y
        var oldAspectRatio = this.getWidth() / this.getHeight();
        var newAspectRatio = matchGesture.getWidth() / matchGesture.getHeight();
        var aspectRatioDelta = Math.abs(newAspectRatio - oldAspectRatio);
        
        //TODO limit aspect ratio to maximum
        if (aspectRatioDelta > MAX_ASPECT_RATIO_DELTA)
        {
        }
        
        console.log("this.matchScale, x, y, aspect ratio", scaleX, scaleY, scaleX / scaleY, aspectRatioDelta);
        
        if (scaleX > MAX_SCALE_X)
        {
            scaleX = MAX_SCALE_X;
        }
        if (scaleX < MIN_SCALE_X)
        {
            scaleX = MIN_SCALE_X;
        }

        if (scaleY > MAX_SCALE_Y)
        {
            scaleY = MAX_SCALE_Y;
        }
        if (scaleY < MIN_SCALE_Y)
        {
            scaleY = MIN_SCALE_Y;
        }
                
                
        for (var i = 0; i < this.strokes.length; i ++)
        {
            Point.scalePoints2D(this.strokes[i], scaleX, scaleY);
        }
        
    }
    
    //priveleged
    this.normalizeScale = function()
    {
        for (var i = 0; i < this.strokes.length; i ++)
        {
            if (this.strokes[i].length <= 0)
            {
                continue;
            }
            var firstPoint = this.strokes[i][0];
            var minX = firstPoint.x;
            var minY = firstPoint.y;
            var maxX = firstPoint.x;
            var maxY = firstPoint.y;
            for (var j = 0; j < this.strokes[i].length; j++)
            {
                var point = this.strokes[i][j];
                if (point.x < minX)
                {
                    minX = point.x;
                }    
                if (point.y < minY)
                {
                    minY = point.y;
                }    
                if (point.x > maxX)
                {
                    maxX = point.x;
                }    
                if (point.y > maxY)
                {
                    minY = point.y;
                }    
            }
            
            var width = maxX - minX;
            var height = maxY - minY;
            this.width = width;
            this.height = height;
            var scale = (width > height) ? width : height;
            
            if (scale <= 0)
            {
                return;
            }
            
            scale /= 1;
            
            Point.scalePoints(this.strokes[i], scale);
        }
    }
    
    this.scale = function(scaleFactor)
    {

        for (var i = 0; i < this.strokes.length; i ++)
        {
            for (var j = 0; j < this.strokes[i].length; j++)
            {
//                console.log("before: ", point);
                var point = this.strokes[i][j];
                point.x *= scaleFactor;
                point.y *= scaleFactor;
//                console.log("after: ", point);
            }        
        }
    }
    
    this.getNumPoints = function()
    {
        return this.strokes[0].length;
    }
 
/*
    this.startGesture = function(x, y)
    {
        _offsetX = x;
        _offsetY = y;             
        this.addPoint(0, 0);
    }
*/

    this.startGesture = function(x, y)
    {
        this.addPoint(x, y);
    }
    
    this.getLength = function()
    {            
        if (_length == -1 || _shapeNeedsUpdating)
        {
            _length = 0;
            var lastPoint;
            for (var i = 0; i < this.strokes[0].length; i ++)
            {
                var point = this.strokes[0][i];                
                if (lastPoint != null)
                {
                    _length += Point.distance(lastPoint, point);
                }
                lastPoint = point;
            }
        }
        return _length;
    }
        
    this.createFromJson = function(obj)
    {
        this.symbol = obj.symbol;
        if ("staffSize" in obj)
        {
            this.staffSize = obj.staffSize;
        }
            
        //alert (obj.symbol);
        this.strokes = [];
        for (var i = 0; i < obj.strokes.length; i++)
        {
            this.strokes[i] = [];
            for (var j = 0; j < obj.strokes[i].length; j++)
            {
                var point = obj.strokes[i][j];
                this.strokes[i].push(new Point(point.x, point.y));
            }
        }
    }
    
/* 
    this.continueGesture = function(x, y)
    {
        this.addPoint(x - _offsetX, y - _offsetY);
    }
 */

    this.continueGesture = function(x, y)
    {
        this.addPoint(x, y);
    }
    
    this.newStroke = function()
    {
        if (this.strokes.length > Gesture.MAX_STROKES)
        {
            return false;
        }
        this.strokes.push(new Array());
        this.strokeIdx ++;
    }

    this.popStroke = function()
    {
        if (this.strokeIdx <= 0)
        {
            return null;
        }
        this.strokeIdx --;
        return this.strokes.pop();
    }
    
    
    this.normalize = function()
    {
//        this.normalizeScale();
        this.normalizeShape();
        //this.normalizeToAverageCenter();
    }
    
    this.getPoints = function()
    {
        //alert (this.strokes[0].length);
        return this.strokes[0];
    }

    this.getAllPoints = function()
    {
        //alert (this.strokes[0].length);
        return this.strokes;
    }
    
    this.toString = function()
    {
        var string = "gesture with " + this.strokes.length + "points \n:";
        for (var i = 0; i < this.strokes.length; i ++)
        {        
            string += this.strokes[i] + ",";
        }
        return string;
    }        
    //unimplemented
    this.getJson = function()
    {
        var json = new String();
        var pointsAry = [];            
        for (var i = 0; i < this.strokes.length; i ++)
        {
            var point = this.strokes[i];         
            pointsAry.push({ "x": point.x, "y": point.y});
        }
        return Json.encode(pointsAry);            
    }    

    //need this, does avaerage center make a difference over (0,0)?
    this.pointAngleDifference = function(point1, point2)
    {
        var angle1 = Math.atan2(this.getAverageCenter().y - point1.y, this.getAverageCenter().x - point1.x);
        var angle2 = Math.atan2(this.getAverageCenter().y - point2.y, this.getAverageCenter().x - point2.x);
        return Math.abs(angle2 - angle1);
    }
    
    this.sortAllPointsByAngleFromCentroid = function(point1, point2)
    {
        var angle1 = Math.atan2(window._averageCenter.y - point1.y, window._averageCenter.x - point1.x);
        var angle2 = Math.atan2(window._averageCenter.y - point2.y, window._averageCenter.x - point2.x);
        
        if (angle1 > angle2)
        {
            return 1;
        }
        else if (angle1 < angle2)
        {
            return -1;
        }
        
        return 0;        
    }
    //create an array of all points in all gestures
    this.bagOfPoints = function()
    {
        var bagOfPoints = [];
        for (var i = 0; i < this.strokes.length; i ++)
        {        
            bagOfPoints = bagOfPoints.concat(Point.clonePoints(this.strokes[i]));
        }
        
        return bagOfPoints;
    }

    
    //useful for visual debugging
    this.drawGestureOnNewCanvas = function(parentElementId, text)
    {
        //create a new canvas
        var newCanvas = document.createElement("canvas");
        //set dimensions of new canvas
        
        this.getBoundingBox();
        
        newCanvas.setAttribute("width", parseInt(this.width) * 4);
        newCanvas.setAttribute("height", parseInt(this.height) * 4);
        //newCanvas.setAttribute("width", 2000);
        //newCanvas.setAttribute("height", 2000);
        
        
        
        //border around canvas
        newCanvas.setAttribute("style", "border: 1px solid #666;")
        
        var context = newCanvas.getContext('2d');        
        context.fillStyle = "black";
        context.fillText(text, 10, 10); 
        context.lineWidth = 5;

        //center gesture on new canvas
        //really, set top left to 0,0
        //this.setTopLeftToZero();
       // this.normalizeToFixedPoint(new Point(0,0));
        //draw index to canvas...

        //draw the gesture to it
        var marginPoint = this.getBottomRight().clone();
        console.log("marginPoint", marginPoint);
        Gesture.drawOnCanvas(newCanvas, this, null, marginPoint);
        //append the new canvas to the page
        document.getElementById(parentElementId).appendChild(newCanvas);
        return newCanvas;
        
    }
    
    this.clone = function()
    {
        var clonedObj = new Gesture();

        clonedObj.symbol = this.symbol;
        clonedObj.numNormalPoints = this.numNormalPoints;
        
        //deep copy of points
        clonedObj.strokes = this.cloneStrokes();
        clonedObj.startingPoint = this.startingPoint;
        clonedObj.topLeft = this.topLeft;
        clonedObj.bottomRight = this.bottomRight;
        clonedObj.height = this.height;
        clonedObj.width = this.width;
        clonedObj.strokeIdx = this.strokeIdx;
        clonedObj.bagOfPointsSorted = this.bagOfPointsSorted;

        clonedObj.getAverageCenter();
        
        return clonedObj;
    }
    
    this.cloneStrokes = function(startIdx, endIdx)
    {
        if (!startIdx || startIdx < 0)
        {
            startIdx = 0;            
        }
        if (!endIdx || endIdx > this.strokes.length)
        {
            endIdx = this.strokes.length;
        }
        var strokes = [];
        for (var i = startIdx; i < endIdx; i ++)
        {
            if (this.strokes[i].length > 0)
            {
                strokes[i] = Point.clonePoints(this.strokes[i]);
            }
        }
        return strokes;
    }
    
}

Gesture.prototype.endGesture = function()
{
    //return false if we don't have enough points to make a gesture
    return this.checkGesture();
}

Gesture.prototype.checkGesture = function()
{
    if (this.getPoints().length < MIN_NUM_POINTS)
    {
        return false;
    }
    return true;    
}

Gesture.drawOnCanvas = function(canvas, gesture, strokeStyle, offsetPoint)
{
    var points = gesture.getAllPoints();
    //alert(gesture.symbol + " " + points[0].length);
    var context = canvas.getContext('2d');
//    context.clearRect(0, 0, canvas.width, canvas.height);
//    context.shadowOffsetX = 0;
//    context.shadowOffsetY = 0;
//    context.shadowColor = "black";
  //  context.shadowColor   = 'rgba(0, 0, 0, 1.0)';
  //  context.shadowBlur = 7;
  //  context.lineWidth = 5;
    context.strokeStyle = strokeStyle;
    context.lineWidth = 5;
    //check to see that there are points
    if (points.length < 1 || points[0].length < 1)
    {
        return;
    }
    //move position to first point
    //context.moveTo(points[0][0].x, points[0][0].y);
    //_then_ begin the path
    //console.log(gesture.strokes);
    //                    normalizedFactor = 
    //console.log("DRAw on Canvas");
    for (var i = 0; i < points.length; i++)
    {
        context.beginPath();
        //console.log("points[i].length" + points[i].length);
        for (var j = 0; j < points[i].length; j++)
        {
            var point = points[i][j];
            if (offsetPoint)
            {
                point.add(offsetPoint);
            }
            if (j == 0)
            {
                context.moveTo(point.x, point.y);
            } 
            else
            {                            
                context.lineTo(point.x, point.y);
            }                        
        }
        context.stroke();        
    }
   // context.shadowBlur = 0;
    context.lineWidth = 1;
}

//bitmap comparison
Gesture.bitmapRank = function (gesture1, gesture2)
{
    //console.log("center point is " + gesture1.getAverageCenter().toString());

    var width = 300;
    var height = 340;
    
    var canvas1 = document.getElementById("canvas1");
    Utils.clearCanvas(canvas1);
//    Gesture.drawOnCanvas(canvas1, gesture1);
    Gesture.drawAndScaleToCanvas(canvas1, gesture1);

    var canvas2 = document.getElementById("canvas2");
    Utils.clearCanvas(canvas2);
    Gesture.drawAndScaleToCanvas(canvas2, gesture2);
   
    // Get the CanvasPixelArray from the given coordinates and dimensions.
    var imgData1 = canvas1.getContext('2d').getImageData(0, 0, width, height);
    var pixels1 = imgData1.data;
    var imgData2 = canvas2.getContext('2d').getImageData(0, 0, width, height);
    var pixels2 = imgData2.data;
    //console.log("lengths " + pixels1.length + " " + pixels2.length)
  
    var score = 0;
    // Loop over each pixel
    //score += (pixels1[i] * pixels2[i]) 
//    for (var i = 0; i < pixels1.length; i ++)    
    
    //for some reason only alpha channel seems to work with vector data...
    //is it enough?
    //0 1 2 3
    //R G B A

    for (var i = 3; i < pixels1.length; i += 4)
    {
        score += Math.abs(pixels1[i] - pixels2[i]);
//        score += pixels1[i] * pixels2[i];
//        score += ((pixels1[i] + pixels1[i + 1] + pixels1[i + 2]) * (pixels2[i] + pixels2[i + 1] + pixels2[i + 2]));
    }
    
    //console.log(gesture1.symbol + " " + score);
/*    
    for (var i = 0, n = pixels1.length; i < n; i += 4) 
    {
        //            console.log(pix[i]);
        //R G B

//            score += ( Math.abs (pixels1[i] - pixels2[i]) + 
//                Math.abs (pixels1[i + 1] - pixels2[i + 1]) +
//            Math.abs (pixels1[i + 2] - pixels2[i + 2])) / 3;

        var gray1 = (pixels1[i] + pixels1[i + 1] + pixels1[i + 2])/3;
        var gray2 = (pixels2[i] + pixels2[i + 1] + pixels2[i + 2])/3;
        
        score += Math.abs(gray1 - gray2);
        // i+3 is alpha (the fourth element)
    }
*/
    
    //draw?
//    context.putImageData(imgd, 0, 0);    
    return score;
}

//returns best (highest) score for a symbol

Gesture.pointDistanceRank = function (gesture1, gesture2, canvas1, canvas2)
{    
    //TODO: get to work without globals
    //alert(window._averageCenter);
    //gesture1.normalize();
    //gesture2.normalize();
    var bagOfPoints1 = gesture1.bagOfPoints();
    var bagOfPoints2 = gesture2.bagOfPoints();
    
    if (DEBUG_LEVEL > 2)
    {
//        console.log("gesture1, gesture2", gesture1, gesture2);
//        Gesture.visualDistanceNearest(gesture1, gesture2, bagOfPoints1, bagOfPoints2);
    }

    var totalDistance = 0;
    //1 -> 2
    //Gesture.drawOnCanvas(canvas1, gesture1);        
    for (var i = 0; i < bagOfPoints1.length; i ++)
    {    
        //var distance = Point.distance(bagOfPoints1[i], bagOfPoints2[i]); 
        totalDistance += Gesture.getNearestDistance(bagOfPoints1[i], bagOfPoints2);
    }
    
    //2 -> 1
    //Gesture.drawOnCanvas(canvas2, gesture2);        
    for (i = 0; i < bagOfPoints2.length; i ++)
    {        
        totalDistance += Gesture.getNearestDistance(bagOfPoints2[i], bagOfPoints1);
    }
    
    //console.log("score", totalDistance);
    var score =  1 / (totalDistance / (bagOfPoints1.length + bagOfPoints2.length));
    //console.log(score);
    return score;
    
}

Gesture.visualDistance = function (gesture1, gesture2, bagOfPoints1, bagOfPoints2)
{    
    //bag of points
//    var bagOfPoints1 = gesture1.bagOfPoints();
//    var bagOfPoints2 = gesture2.bagOfPoints();
    //1 -> 2
    var canvas1 = gesture1.drawGestureOnNewCanvas(MAIN_CONTAINER_ID, gesture1.symbol);                
    var context1 = canvas1.getContext("2d");        
    var color1 = Utils.randColor();
    context1.fillStyle = color1;
    context1.strokeStyle = color1;
    context1.lineWidth = 3;

    // 1 -> 2
    for (i = 0; i < bagOfPoints1.length; i ++)
    {    
        context1.fillText("x", bagOfPoints1[i].x, bagOfPoints1[i].y);                
        context1.beginPath();
        context1.moveTo(bagOfPoints1[i].x,  bagOfPoints1[i].y);
        //console.log(bagOfPoints1[i], bagOfPoints2[i]);
        if (bagOfPoints2[i])
        {
            context1.lineTo(bagOfPoints2[i].x,  bagOfPoints2[i].y);
        }
        context1.closePath();
        context1.stroke();        
    }

    var color2 = Utils.randColor();
    context1.fillStyle = color2;
    context1.strokeStyle = color2;
    Gesture.drawOnCanvas(canvas1, gesture2);
    
    // 2 -> 1
    for (i = 0; i < bagOfPoints2.length; i ++)
    {    
        context1.fillText("x", bagOfPoints2[i].x, bagOfPoints2[i].y);                
        context1.beginPath();
        context1.moveTo(bagOfPoints2[i].x,  bagOfPoints2[i].y);
//        console.log(bagOfPoints2[i], bagOfPoints1[i]);
//        context1.lineTo(bagOfPoints1[i].x,  bagOfPoints1[i].y);
        context1.closePath();
        context1.stroke();        
    }
    
}


Gesture.visualDistanceNearest = function (gesture1, gesture2, bagOfPoints1, bagOfPoints2)
{    
    //bag of points
    //    var bagOfPoints1 = gesture1.bagOfPoints();
    //    var bagOfPoints2 = gesture2.bagOfPoints();
    //1 -> 2
    var canvas1 = gesture1.drawGestureOnNewCanvas(MAIN_CONTAINER_ID, gesture1.symbol);                
    var context1 = canvas1.getContext("2d");        
    var color1 = Utils.randColor();
    context1.fillStyle = color1;
    context1.strokeStyle = color1;
    context1.lineWidth = 3;
    
    // 1 -> 2
    for (i = 0; i < bagOfPoints1.length; i ++)
    {    
        context1.fillText("x", bagOfPoints1[i].x, bagOfPoints1[i].y);                
        context1.beginPath();
        context1.moveTo(bagOfPoints1[i].x,  bagOfPoints1[i].y);
        //console.log(bagOfPoints1[i], bagOfPoints2[i]);
        if (bagOfPoints2[i])
        {
            var toPoint = Point.findNearestPoint(bagOfPoints1[i], bagOfPoints2);
            context1.lineTo(toPoint.x,  toPoint.y);
        }
        //console.log("arctangent", gesture1.pointAngleDifference(bagOfPoints1[i], toPoint));
//        console.log(Math.atan2(toPoint.y,  toPoint.x));
        context1.closePath();
        context1.stroke();        
    }
    
    var color2 = Utils.randColor();
    context1.fillStyle = color2;
    context1.strokeStyle = color2;
    Gesture.drawOnCanvas(canvas1, gesture2);
    
    // 2 -> 1
    for (i = 0; i < bagOfPoints2.length; i ++)
    {    
        context1.fillText("x", bagOfPoints2[i].x, bagOfPoints2[i].y);                
        context1.beginPath();
        context1.moveTo(bagOfPoints2[i].x,  bagOfPoints2[i].y);
        //        console.log(bagOfPoints2[i], bagOfPoints1[i]);
        //        context1.lineTo(bagOfPoints1[i].x,  bagOfPoints1[i].y);
        var toPoint = Point.findNearestPoint(bagOfPoints2[i], bagOfPoints1);
        context1.lineTo(toPoint.x,  toPoint.y);
        //console.log("arctangent", gesture2.pointAngleDifference(bagOfPoints2[i], toPoint));
//        console.log(Math.atan2(toPoint.y,  toPoint.x));
        context1.closePath();
        context1.stroke();        
    }
    
}



Gesture.dotProduct = function (points1, points2)
{
    if (points1.length != points2.length)
    {
        throw new Error("length mismatch while trying to calculate dot product " + points1.length + " " + points2.length);
    }   
    var dotProduct = 0;
    
    for (var i = 0; i < points1.length; i++)
    {
        var point1 = points1[i];
        var point2 = points2[i];
        
        dotProduct += point1.x * point2.x + point1.y * point2.y;
    }
    return dotProduct;
}

Gesture.drawAndScaleToCanvas = function(canvas, gesture)
{       
    //alert (gesture);
    gesture.getBoundingBox();
    //clear canvas
    Utils.clearCanvas(canvas);
    Gesture.drawOnCanvas(canvas, gesture);
    //crop and scale
    var context = canvas.getContext('2d');
    var border = 8;
    var imageData = context.getImageData(gesture.topLeft.x - border, gesture.topLeft.y - border, gesture.width + border, gesture.height + border);
    var tempCanvas = document.createElement("canvas");
    //Utils.clearCanvas(tempCanvas);
    tempCanvas.setAttribute("id",  new Date().getTime());
    tempCanvas.setAttribute("width",  imageData.width);
    tempCanvas.setAttribute("height",  imageData.height);
    tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
    Utils.clearCanvas(canvas);
    context.drawImage(tempCanvas,  0, 0, canvas.width, canvas.height);        
    //alert(gesture.topLeft.x-border);
    //remove temp canvas??        
}


Gesture.sortPointsByX = function(obj1, obj2) 
{
    if (obj1.x > obj2.x)
    {
        return 1;
    }    
    else if (obj1.x < obj2.x)
    {
        return -1;
    }
    
    return 0;
}

Gesture.sortPointsByY = function(obj1, obj2) 
{
    if (obj1.y > obj2.y)
    {
        return 1;
    }    
    else if (obj1.y < obj2.y)
    {
        return -1;
    }
    
    return 0;
}

Gesture.getNearestDistance = function(point, points)
{
    return Point.distance(Point.findNearestPoint(point, points), point);
}

//Maximum strokes allowed in a single symbol
Gesture.MAX_STROKES_PER_SYMBOL = 4;
//Maximum strokes allowed
Gesture.MAX_STROKES = 128;
