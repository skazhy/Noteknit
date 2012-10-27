function Polygon()
{
    //TODO: refactor redundancies with Gesture...
    /* static */
    DEFAULT_NUM_POINTS = 52;
    MIN_NUM_POINTS = 4;
    MAX_NUM_POINTS = 4096;
    
    /* public */
    this.symbol = "";
    this.numNormalPoints = DEFAULT_NUM_POINTS;
    this.points = [];
    
    this.startingPoint = new Point();
    this.topLeft = new Point();
    this.bottomRight = new Point();
    this.height = 0;
    this.width = 0;
    this.closed = false;
    this.segmentIdx = 0;
    
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
    
    
    this.addPoint = function(x, y)
    {
        //console.log(this.segmentIdx);
        this.points.push(new Point(x, y));            
        _shapeNeedsUpdating = true;            
    }
    
    this.strokeLength = function()
    {
        var length = 0;
        for (var i = 1; i < this.points.length; i++)
        {
            length += Point.distance(this.points[i-1], this.points[i]);
        }
        return length;
    }
    
    this.normalizeShape = function()
    {
        var newPoints = [];
        
        var normalSegmentLength = this.strokeLength() / (this.numNormalPoints - 1);
        newPoints.push(this.points[0]);
        var startPoint = this.points[0];            
        var endPoint = this.points[0];
        
        var previousDistanceEnd = 0;
        var previousDistanceStart = 0;
        var distance = 0;
        var segmentLength = 0;
        var pointIdx = 1;
        var i = 0;
        while (i <= MAX_NUM_POINTS) 
        {
            i ++;
            var excess = previousDistanceEnd - distance;
            if (excess >= normalSegmentLength) 
            {                   
                distance += normalSegmentLength;
                var ratio = (distance - previousDistanceStart) / segmentLength;
                var newPoint = new Point((endPoint.x - startPoint.x) * ratio + startPoint.x,
                                         (endPoint.y - startPoint.y) * ratio + startPoint.y);
                newPoints.push(newPoint);
                
            }
            else 
            {
                if (pointIdx == this.points.length)
                {
                    break;
                }
                startPoint = endPoint;
                endPoint = this.points[pointIdx];
                previousDistanceStart = previousDistanceEnd;
                segmentLength = endPoint.subtract(startPoint).getLength();
                previousDistanceEnd += segmentLength;
                pointIdx ++;
            }
        }
        
        //add final point
        if (newPoints.length < this.numNormalPoints) 
        {
            newPoints.push(endPoint);
        }
        
        
        this.points = newPoints;
        
    }
    
    //center on average center point
    this.normalizeToAverageCenter = function()
    {
        for (var i = 0; i < this.points.length; i++)
        {
            var point = this.points[i];            
            point.x -= this.getAverageCenter().x;
            point.y -= this.getAverageCenter().y;
        }
        
    }          
    
    this.getAverageCenter = function()
    {
        if (_averageCenter != null)
        {
            return _averageCenter;
        }
        
        var centerX = 0;
        var centerY = 0;
        for (var i = 0; i < this.points.length; i++)
        {
            var point = this.points[i];
            centerX += point.x;
            centerY += point.y;
        }            
        
        centerX /= this.points.length;
        centerY /= this.points.length;
        
        return new Point(centerX, centerY);
    }
    
    this.getBoundingBox = function()
    {        
        var firstPoint = this.points[0];
        var minX = firstPoint.x;
        var minY = firstPoint.y;
        var maxX = firstPoint.x;
        var maxY = firstPoint.y;
        for (var i = 0; i < this.points.length; i++)
        {
            var point = this.points[i];
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
        
        var width = maxX - minX;
        var height = maxY - minY;
        this.width = width;
        this.height = height;
        this.topLeft = new Point(minX, minY);
        this.bottomRight = new Point(maxX, maxY);
        
    }
    
    //priveleged
    this.normalizeScale = function()
    {
        var firstPoint = this.points[0];
        var minX = firstPoint.x;
        var minY = firstPoint.y;
        var maxX = firstPoint.x;
        var maxY = firstPoint.y;
        for (var i = 0; i < this.points.length; i++)
        {
            var point = this.points[i];
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
        
        for (var i = 0; i < this.points.length; i++)
        {
            var point = this.points[i];
            point.x *= scale;
            point.y *= scale;
        }
    }
    
    this.scale = function (scaleFactor)
    {
        for (var i = 0; i < this.points.length; i++)
        {
            var point = this.points[i];
            point.scale(scaleFactor);
        }
    }
    
    
    this.getNumPoints = function()
    {
        return this.points.length;
    }
    
    this.startPolygon = function(x, y)
    {
        this.addPoint(x, y);
    }
    
    this.getLength = function()
    {            
        if (_length == -1 || _shapeNeedsUpdating)
        {
            _length = 0;
            var lastPoint;
            for (var i = 0; i < this.points.length; i ++)
            {
                var point = this.points[i];                
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
        //alert (obj.symbol);
        this.points = [];
        for (var i = 0; i < obj.points.length; i++)
        {
            this.points.push(new Point(point.x, point.y));
        }
    }
    
    this.newSegment = function()
    {
        this.segmentIdx ++;
    }
    this.normalize = function()
    {
        this.normalizeScale();
        this.normalizeShape();
        this.normalizeToAverageCenter();
    }
    
    this.getPoints = function()
    {
        return this.points;
    }
    
    this.toString = function()
    {
        var string = "polygon with " + this.points.length + " points \n:";
        for (var i = 0; i < this.points.length; i ++)
        {        
            string += this.points[i] + ",";
        }
        return string;
    }        
    
    //unimplemented
    this.getJson = function()
    {
        var json = new String();
        var pointsAry = [];            
        for (var i = 0; i < this.points.length; i ++)
        {
            var point = this.points[i];         
            pointsAry.push({ "x": point.x, "y": point.y});
        }
        return Json.encode(pointsAry);            
    }
    
    //sort points 
    this.sortPoints = function()
    {
        this.points.sort(Polygon.sortPointsByX);
        this.points.sort(Polygon.sortPointsByY);
        //alert (this.points);
    }
    
    this.sortPointsByDistance = function()
    {
        var points = [];
        //start with first point
        //alert(this.points);        
        var firstPoint = this.points.shift();
        
        points.push(firstPoint);
        var nearestPointIdx = -1;
        var nearestPointLength = Infinity;
        
        var prevPoint = firstPoint;
        //determine each next-nearest point, by distance
        while(this.points.length > 0)
        {
            //alert (this.points.length + " " + prevPoint + "\n" + points);
            for (var i = 0; i < this.points.length; i ++)
            {
                var pointLength = Point.distance(prevPoint, this.points[i]);
                //find nearest point
                if (nearestPointIdx == -1 || pointLength < nearestPointLength)
                {
                    nearestPointIdx = i;
                }
            }
            prevPoint = this.points.splice(nearestPointIdx, 1)[0];
            points.push(prevPoint);
            nearestPointIdx = -1;
            nearestPointLength = Infinity;
        }
        
        //close shape
        points.push(firstPoint);
        
        this.points = points;
    }
    
    //order points to resemble a convex polygon
    this.chainHull = function()
    {
        var P = this.points;
        var H = [];
        var bot = 0, top = -1;
        var i;
        n = P.length;
        var minmin = 0, minmax;
        var xmin = P[0].x;
        for (i = 1; i < n; i++)
        {
            if (P[i].x != xmin)
            {
                break;
            }
        }
        minmax = i - 1;
        if (minmax == n - 1) 
        {
            H[++top] = P[minmin];
            if (P[minmax].y != P[minmin].y) //segment
            {
                H[++top] = P[minmax];
            }
            H[++top] = P[minmin]; //endpoint
            //return top + 1;
            //return H;
            this.points = H;
        }
        
        var maxmin, maxmax = n - 1;
        var xmax = P[n-1].x;
        for (i = n - 2; i >= 0; i--)
        {
            if (P[i].x != xmax)
            {
                break;
            }
        }
        
        maxmin = i + 1;
        
        //lower hull
        H[++top] = P[minmin]; 
        i = minmax;
        while (++i <= maxmin)
        {
            if (Point.isLeft( P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
            {
                continue;
            }
            
            while (top > 0) // at least 2 points
            {
                if (Point.isLeft( H[top-1], H[top], P[i]) > 0)
                {
                    break;
                }
                else
                {
                    top--;
                }
            }
            H[++top] = P[i];
        }
        
        //upper hull
        if (maxmax != maxmin)
        {
            H[++top] = P[maxmax];
        }
        bot = top;
        i = maxmin;
        while (--i >= minmax)
        {
            if (Point.isLeft( P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
            {
                continue;
            }
            
            while (top > bot) 
            {
                if (Point.isLeft( H[top-1], H[top], P[i]) > 0)
                {
                    break;
                }
                else
                {                
                    top--;
                }
            }
            H[++top] = P[i];
        }
        if (minmax != minmin)
        {
            H[++top] = P[minmin];
        }        
        this.points = H;
    }

    this.monotoneHull = function()
    {
        var n = this.points.length;
        var k = 0;
        var hull = [];
        // Sort points
        this.sortPoints();

        // Lower hull
        for (var i = 0; i < n; i++) 
        {
            while (k >= 2 && Polygon.cross(hull[k-2], hull[k-1], this.points[i]) <= 0)
            {
                k--;
            }
            hull[k++] = this.points[i];
        }
            
        // Build upper hull
        for (var i = n-2, t = k+1; i >= 0; i--) 
        {
            while (k >= t && Polygon.cross(hull[k-2], hull[k-1], this.points[i]) <= 0) 
            {
                k--;
            }
            hull[k++] = this.points[i];
        }    
        
        this.points = hull;
    }
    
    this.close = function()
    {
        if (this.points.length <= 0)
        {
            this.closed = false;
            return false;
        }
        this.addPoint(this.points[0].x, this.points[0].y);
        this.closed = true;
    }
    
    this.open = function()
    {
        if (this.points.length <= 0)
        {
            return false;
        }
        this.points.pop();
        this.closed = false;
    }
        
    //Find a simple (non self-intersecting) closed polygonal chain from a series of unordered points
    this.findConcavePolygon = function()
    {
        if (this.closed)
        {
            this.open();
        }
        //TODO: get this working without global
        window._averageCenter = this.getAverageCenter();
        this.points.sort(this.sortAllPoints);
        this.close();
    }
    
    this.sortAllPoints = function(point1, point2)
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
    //useful for visual debugging
    this.drawOnNewCanvas = function(parentElementId, paddingPoint, text)
    {
        //create a new canvas
        var newCanvas = document.createElement("canvas");
        //set dimensions of new canvas        
        this.getBoundingBox();        
        newCanvas.setAttribute("width", 400 );
        newCanvas.setAttribute("height", 400);                
        //border around canvas
        newCanvas.setAttribute("style", "border: 1px solid #666;")
        
        var context = newCanvas.getContext('2d');        
        context.fillStyle = "black";
        context.fillText(text, 10, 10);                
        
        //draw the polygon to it
        Polygon.drawOnCanvas(newCanvas, this);
        //append the new canvas to the page
        document.getElementById(parentElementId).appendChild(newCanvas);        
    }   
    
    this.pointInPolygon = function(point) 
    {
        if (!this.checkPolygon())
        {
            return false;
        }
        intersections = 0;
        
        var points = this.points;
        // Check if the point is inside the polygon or on the boundary
        for (var i = 1; i < points.length; i++) 
        {
            p1 = points[i-1]; 
            p2 = points[i];
            var line = new Line(p1, p2);
            if (line.pointIsOnLine(point))
            {
                return Polygon.ON_POLYGON_BOUNDARY;
            }
            
            if (p1.y == p2.y && p1.y == point.y && point.x > Math.min(p1.x, p2.x) && 
                point.x < Math.max(p1.x, p2.x)) 
            {
                return Polygon.ON_POLYGON_BOUNDARY;
            }
            if (point.y > Math.min(p1.y, p2.y) && point.y <= Math.max(p1.y, p2.y) 
                && point.x <= Math.max(p1.x, p2.x) && p1.y != p2.y) 
            { 
                var xinters = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x; 
                if (xinters == point.x) 
                { // Check if point is on the polygon boundary (other than horizontal)
                    return Polygon.ON_POLYGON_BOUNDARY;
                }
                if (p1.x == p2.x || point.x <= xinters) 
                {
                    intersections++; 
                }
            } 
        } 
        // If the number of edges we passed through is even, then it's in the polygon. 
        if (intersections % 2 != 0) 
        {
            return Polygon.INSIDE_POLYGON;
        } else 
        {
            return Polygon.OUTSIDE_POLYGON;
        }
    }  
    
    //determine if two polygons intersect
    this.intersects = function(polygon)
    {
        
    }
    
}


Polygon.prototype.endPolygon = function()
{
    //return false if we don't have enough points to make a polygon
    return this.checkPolygon();
}

Polygon.prototype.checkPolygon = function()
{
    if (this.getPoints().length < MIN_NUM_POINTS)
    {
        return false;
    }
    return true;    
}

Polygon.drawOnCanvas = function(canvas, polygon, lineStyle)
{
    var points = polygon.getPoints();
    var context = canvas.getContext('2d');
    context.beginPath();
    if (lineStyle)
    {
        context.lineStyle = lineStyle;
    }
    for (var i = 0; i < points.length; i++)
    {
        var point = points[i];
        if (i == 0)
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



Polygon.dotProduct = function (points1, points2)
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


Polygon.drawAndScaleToCanvas = function(canvas, polygon)
{        
    polygon.getBoundingBox();
    //clear canvas
    Utils.clearCanvas(canvas);
    Polygon.drawOnCanvas(canvas, polygon);
    //crop and scale
    var context = canvas.getContext('2d');
    var border = 8;
    var imageData = context.getImageData(polygon.topLeft.x - border, polygon.topLeft.y - border, polygon.width + border, polygon.height + border);
    var tempCanvas = document.createElement("canvas");
    //Utils.clearCanvas(tempCanvas);
    tempCanvas.setAttribute("id",  new Date().getTime());
    tempCanvas.setAttribute("width",  imageData.width);
    tempCanvas.setAttribute("height",  imageData.height);
    tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
    Utils.clearCanvas(canvas);
    context.drawImage(tempCanvas,  0, 0, canvas.width, canvas.height);        
    ///alert(polygon.topLeft.x-border);
    //remove temp canvas??        
}

Polygon.cross = function(O, A, B)
{
	return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

Polygon.sortPointsByX = function(obj1, obj2) 
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

Polygon.sortPointsByY = function(obj1, obj2) 
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


Polygon.sortPointsByXY = function(obj1, obj2) 
{
    if (obj1.x > obj2.x && obj1.y > obj2.y)
    {
        return 3;
    }    
    else if (obj1.x > obj2.x && obj1.y == obj2.y)
    {
        return 2;
    }
    else if (obj1.x == obj2.x && obj1.y > obj2.y)
    {
        return 1;
    }
    else if (obj1.x == obj2.x && obj1.y < obj2.y)
    {
        return -1;
    }
    else if (obj1.x < obj2.x && obj1.y == obj2.y)
    {
        return -2;
    }
    else if (obj1.x < obj2.x && obj1.y < obj2.y)
    {
        return -3;
    }    
    
    return 0;
}


Polygon.ON_POLYGON_BOUNDARY = "boundary";
Polygon.INSIDE_POLYGON = "inside";
Polygon.OUTSIDE_POLYGON = "outside";
