/*
 
 
 */
function Ink()
{
    //an array of strokes; each stroke is an array of points, pen down to pen up
    this.strokes = [];

    //as strokes are recognized, they are grouped by the recognition engine and 
    //pushed onto the gestures stack; each Gesture object has an array of strokes
    this.gestures = [];
    
    var self = this;
    
    this.staff;
    
    //remove gesture and associated original ink strokes
    this.removeGesture = function(gestureIndex)
    {
/*
       var gesture = self.gestures[gestureIndex];
        alert (gesture.originalStrokeIndices);        
        for (var i = 0; i < gesture.originalStrokeIndices.length; i++)
        {
            var strokeIdx = gesture.originalStrokeIndices[i];
            alert(strokeIdx);
            this.strokes.splice(strokeIdx, 1);            
        }
*/ 
        self.gestures.splice(gestureIndex, 1);
    }
    
    this.serializeStrokes = function()
    {
        if (this.strokes.length > 0)
        {
            //splice to prevent dangling extra stroke in serialization
            return Point.serializePointsNew(this.strokes.slice(0, this.strokes.length - 1));
        }
    }

    this.serializeGestureStrokes = function()
    {
        var allStrokes = [];
        
        for (var i = 0; i < this.gestures.length; i ++)
        {
            var gesture = this.gestures[i];
            for (var j = 0; j < gesture.strokes.length; j ++)
            {
                var stroke = gesture.strokes[j];
                if (stroke.length > 0)
                {
                    allStrokes.push(stroke);
                }
            }
        }
        
        if (allStrokes.length > 0)
        {
            //splice to prevent dangling extra stroke in serialization
            return Point.serializePointsNew(allStrokes);
        }
    }
    
    this.sortStrokesByLeadingEdge = function()
    {
        if (DEBUG_LEVEL > 0)
        {
            console.log(" this.strokes",  this.strokes);
        }
        var leastXs = [];
        //find leading edge
        for (var i = 0; i < this.strokes.length; i++)
        {
            leastXs[i] = {index: i, x: Number.MAX_VALUE};
            for (var j = 0; j < this.strokes[i].length; j++)
            {
                var point = this.strokes[i][j];
                if (point.x < leastXs[i].x)
                {
                    leastXs[i].x = point.x;
                }
            }
        }
        if (DEBUG_LEVEL > 0)
        {
            console.log("leastXs",  leastXs);
        }
        leastXs.sort(Ink.sortByXAcending);
            
        
        //create a new strokes array in order of leastXs (leading edges)
        var newStrokesAry = [];
        for (var i = 0; i < leastXs.length; i ++)
        {
            newStrokesAry.push(this.strokes[leastXs[i].index]);
        }
            
        this.strokes = newStrokesAry;
        if (DEBUG_LEVEL > 0)
        {
            console.log("leastXs",  leastXs);
            console.log(" this.strokes",  this.strokes);
        }
    }
    
    this.serialize = function()
    {
        var gestureStrokes = this.serializeGestureStrokes();
        if (gestureStrokes)
        {
            return {type: "ink", staffSize: this.staff.getSize(), strokes: gestureStrokes};
        }
    }
    
    this.clearAll = function()
    {
        this.strokes = [];
        this.gestures = [];
    }
}

Ink.sortByXAcending = function(obj1, obj2)
{
    return (obj1.x - obj2.x);
}
