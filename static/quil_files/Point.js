function Point(x, y)
{
    this.length = 0;
    this.x = x || 0;
    this.y = y || 0;
    var self = this;
    
    this.subtract = function(pointB)
    {
        return (new Point (this.x - pointB.x, this.y - pointB.y));
    }
    this.add = function(pointB)
    {
        return (new Point (this.x + pointB.x, this.y + pointB.y));
    }                        
    this.toString = function()
    {
        return ("length: " + this.length + " x: " + this.x + " y: " + this.y);
    }

    this.toJson = function()
    {
        return ('{"x":' + this.x + ',"y":' + this.y + '}');
    }
    
    this.toSimpleObject = function()
    {
        return {x: this.x, y: this.y};
    }
    
    this.getLength = function()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.scale = function(scaleFactor)
    {
        this.x *= scaleFactor;
        this.y *= scaleFactor;        
    }
    this.scale2D = function(scaleFactorX, scaleFactorY)
    {
        this.x *= scaleFactorX;
        this.y *= scaleFactorY;        
    }
    this.clone = function()
    {
        var p = new Point(self.x, self.y);
        p.length = self.length;
        return p;
    }
    
    this.serialize = function()
    {
        var obj = {};
        obj.x = this.x;
        obj.y = this.y;
    }
}

//static, public
Point.distance = function(p1, p2)
{
    var dx, dy;
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

//determine if point is left of a given line
Point.isLeft = function (p0, p1, p2)
{
    return (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y);
}

Point.crossProduct = function (p1, p2)
{
    return point1.x * point2.y - point1.y * point2.x;    
}

Point.dotProduct = function (p1, p2)
{
    return point1.x * point2.x + point1.y * point2.y;
}

Point.scalePoints = function (points, scaleFactor, yOffset)
{
    for (var i = 0; i < points.length; i++)
    {
        var point = points[i];
        if (yOffset)
        {
            point.y -= yOffset;
        }
        point.scale(scaleFactor);
        if (yOffset)
        {
            point.y += yOffset;
        }
    }
}

Point.scalePoints2D = function (points, scaleFactorX, scaleFactorY)
{
    for (var i = 0; i < points.length; i++)
    {
        var point = points[i];
        point.scale(scaleFactorX, scaleFactorY);
    }
}

Point.clonePoints = function (points)
{
    var cPoints = [];
    for (var i = 0; i < points.length; i++)
    {
        cPoints.push(points[i].clone());
    }
    return cPoints;
}


Point.serializePoints = function (points)
{
    pointStr = '[';
    for (var i = 0; i < points.length; i ++)
    {
        if (points[i].length > 0)
        {
            pointStr += '[';
            for (var j = 0; j < points[i].length; j++)
            {
                var point = points[i][j];
                pointStr += point.toJson();
                if (j < points[i].length - 1)
                {
                    pointStr += ",";
                }
            }
            pointStr += ']\n';
            if (i < points.length - 1)
            {
                pointStr += ",";
            }
        }
    }
    pointStr += ']';
    return pointStr;
}

Point.serializePointsNew = function (points)
{
    var pointsAry = []
    for (var i = 0; i < points.length; i ++)
    {
        pointsAry[i] = [];
        for (var j = 0; j < points[i].length; j++)
        {
            pointsAry[i][j] = points[i][j].toSimpleObject();
        }
    }
    return pointsAry;
}

//unused
Point.clonePoints2D = function (points)
{
    var pointsAry = []
    for (var i = 0; i < points.length; i ++)
    {
        pointsAry[i] = [];
        for (var j = 0; j < points[i].length; j++)
        {
            pointsAry[i][j].push(points[i][j].clone());
        }
    }
    return pointsAry;
}

Point.angleDifference = function(point1, point2)
{
    var angle1 = Math.atan2(point1.y, point1.x);
    var angle2 = Math.atan2(point2.y, point2.x);
    return Math.abs(angle2 - angle1);
}


//returns mean of all angle difference in 2 vectors of points
Point.angleDifferences = function(points1, points2)
{
    var numPoints = points1.length;
    
    if (points2.length != numPoints)
    {
        numPoints = Math.min(points1.length, points2.length);
    }
    
    var totalDifferences = 0;
    for (var i = 0; i < numPoints - 1; i ++)
    {
        totalDifferences += Math.abs( Point.angleDifference(points1[i], points1[i + 1]) 
                                      - Point.angleDifference(points2[i], points2[i + 1]));
    }
    
    return totalDifferences / numPoints;
}

Point.findNearestPoint = function(point, points)
{
    var nearestIndex = 0;
    var nearestPointDistance = Number.MAX_VALUE;
    //    var POINT_THRESHOLD = 30;
    for (var i = 0; i < points.length; i ++)
    {
        var distance = Point.distance(point, points[i]);
        if (distance < nearestPointDistance)
        {
            nearestPointDistance = distance;
            nearestIndex = i;
        }
    }
    
    return points[nearestIndex];
}
