function Rectangle (topLeft, topRight, bottomRight, bottomLeft)
{
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomRight = bottomRight;
    this.bottomLeft = bottomLeft;
    var self = this;
    
    
    this.getWidth = function()
    {
        return this.topRight.x - this.topLeft.x;
    }

    this.getHeight = function()
    {
        return this.bottomLeft.y - this.topLeft.y;
    }
    
    this.getPoints = function()
    {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
    }
    
    this.moveTo = function(point)
    {
        this.topLeft = this.topLeft.add(point);
        this.topRight = this.topRight.add(point);
        this.bottomRight = this.bottomRight.add(point);
        this.bottomLeft = this.bottomLeft.add(point);
    }
    
    this.getPolygon = function()
    {
        var p = new Polygon();
        p.points = self.getPoints();
        //close rectangle
        p.points.push(this.topLeft);
        return p; 
    }
    
    this.contains = function(point)
    {        
        if (point.x >= this.topLeft.x && point.x <= this.topRight.x 
            && point.y >= this.topLeft.y && point.y <= this.bottomLeft.y)
        {
            return true;
        }
        return false;
    }
}