function Line(p1, p2)
{
    this.p1 = p1;
    this.p2 = p2;
    SLOPE_MATCH_TOLERANCE = 0.2;
    
    this.getSlope = function()
    {
        return (p1.y - p2.y) / (p1.x - p2.x);
    }
    
    this.pointIsOnLine = function(point)
    {
        var slope1 = this.getSlope();
        var slope2 = new Line(p1, point).getSlope();
        var minX = Math.min(p1.x, p2.x);
        var minY = Math.min(p1.y, p2.y);
        var maxX = Math.max(p1.x, p2.x);
        var maxY = Math.max(p1.y, p2.y);
        
        var isBetween = (point.x >= minX && point.x <= maxX  &&
                         point.y >= minY && point.y <= maxY);
        return isBetween &&
               slope1 + SLOPE_MATCH_TOLERANCE >= slope2 &&
               slope1 - SLOPE_MATCH_TOLERANCE <= slope2;
    }
    
    this.toString = function()
    {
        return "line from " + p1.toString() + " to " + p2.toString();
    }    
    
}