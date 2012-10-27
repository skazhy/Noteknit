/*
 *
 */
//TODO: touch and hold...

function Pencil(trainingCallback, context, staff)
{
    const COUNTDOWN_INTERVAL = 1.7;        //seconds
    const TOUCH_AND_HOLD_INTERVAL = 1.0;
    const STAFF_EXTENSION_WIDTH = 120;
    const STAFF_EXTENSION_TOLERANCE = 60;
    const DEFAULT_BACKGROUND_LAYER_ALPHA = 0.5;
    const DRAG_THRESHOLD = 5;
    const TOUCH_AND_HOLD_TOLERANCE = 4;
    
    const DEFAULT_INK_COLOR_RGBA = [0, 0, 0, 0.5];
    this.inKColor = "";
    var self = this;
    var _staffInitialized = false;
    var _showInk = true;
    var _showSymbols = true;
    this.started = false;
    this.drawing = false;
    this.dragging = false;
    this.gesture = new Gesture();
    this.activeGestureTimeout = null;
    this.trainingCallback = trainingCallback;
    this.staff = staff;
    this.ink = new Ink();
    this.ink.staff = staff;
    this.autoExtend = true;
    this.clickedSymbolIndex = -1;
    this.clickPositionOffset = new Point();
    this.touchAndHoldTimeout = null;
    this.touchAndHoldActive = false;
    this.symbolOptionsCanvas = null;
        
    //finger/mouse down
    this.touchstart = function (event) 
    {
        if (!_staffInitialized)
        {
            self.setInkColor(DEFAULT_INK_COLOR_RGBA[0], DEFAULT_INK_COLOR_RGBA[1], 
                             DEFAULT_INK_COLOR_RGBA[2], DEFAULT_INK_COLOR_RGBA[3] );
            staff.startLayout(context);
            _staffInitialized = true;
        }
        //clear out previous gesture/symbol
        //context.clearRect(0, 0, canvas.width, canvas.height);
        //self.gesture = new Gesture();
        context.beginPath();
        context.moveTo(event._x, event._y);
        //console.log(event._x, event._y);
        //self.gesture.startingPoint = 
        self.gesture.startGesture(event._x - staff.marginLeft, event._y - staff.marginTop);
        self.started = true;
        
        // keep track of whether or not user is still drawing by resetting timeout with 
        // every new stroke
        if (self.activeGestureTimeout != null)
        {
            clearTimeout(self.activeGestureTimeout);            
        }

        //clear touch and hold timer
        if (self.touchAndHoldTimeout != null)
        {
            clearTimeout(self.touchAndHoldTimeout);            
        }        
        
        self.mouseDownPoint = new Point(event._x, event._y);

        self.clickedSymbolIndex = self.getSymbolIndexFromPoint(self.mouseDownPoint.clone());
//        console.log(self.clickedSymbolIndex);

        if (self.clickedSymbolIndex >= 0)
        {
            //BUG?
            self.clickPositionOffset = staff.symbols[self.clickedSymbolIndex].position.clone().add(self.clickedSymbolIndex);
//            alert (self.clickPositionOffset.x);
//            console.log(self.clickPositionOffset.toString);
            self.touchAndHoldTimeout = setTimeout(self.handleTouchAndHoldOnSymbol, TOUCH_AND_HOLD_INTERVAL * 1000);
        }
        //console.log("this.mouseDownPoint", this.mouseDownPoint);
        
        //TODO: check if mousedown point coincides with a symbol on the canvas
        
        //mouse down and hold to user-correct recognized gesture
        
        //mouse and release quickly to delete recognized symbol and its ink?
                
        //alert("this.mousedown: " + this.mouseDownPoint);
        self.mouseIsDown = true;
    }
    //alias event handler reference for non-mobileSafari browsers
    this.mousedown = this.touchstart;
    
    //finger/mouse move
    this.touchmove = function (event)
    {
        self.mouseMovePoint = new Point(event._x, event._y);

        if (self.touchAndHoldActive)
        {            
            return;
        }
        
        if (self.started)
        {
            var mouseDownToMouseMoveDistance = Point.distance(self.mouseDownPoint, self.mouseMovePoint);
            if (mouseDownToMouseMoveDistance > TOUCH_AND_HOLD_TOLERANCE)
            {
                clearTimeout(self.touchAndHoldTimeout);            
            }
            //drag gesture
            if (self.clickedSymbolIndex >= 0)
            {                
///                 = staff.symbols[self.clickedSymbolIndex].position.add(self.mouseMovePoint);
//                console.log(staff.symbols[self.clickedSymbolIndex].position.toString());

                //change symbol position                
                var position = staff.symbols[self.clickedSymbolIndex].position;
                position.x = self.mouseMovePoint.x - self.clickPositionOffset.x;
                position.y = staff.snapToLineY(self.mouseMovePoint.y - self.clickPositionOffset.y - staff.marginTop)

                //change ink position, only move horizontally
                var inkPosition = self.ink.gestures[self.clickedSymbolIndex].getAverageCenter(true);
                inkPosition.x = self.mouseMovePoint.x;
//                alert (inkPosition.x + " " + position.x);
//                inkPosition.x += position.x;
//                var inkPosition = position.clone();
//                inkPosition.x = self.ink.gestures[self.clickedSymbolIndex].getAverageCenter(true).x;
                
                self.ink.gestures[self.clickedSymbolIndex].normalizeToFixedPoint(inkPosition, true);                
                self.dragging = true;
                self.redrawCanvas();
            }
            else //no dragging
            {
                context.lineTo(event._x, event._y);
                context.stroke();            
                if (mouseDownToMouseMoveDistance > DRAG_THRESHOLD) 
                {
                    self.drawing = true;
                    //(0,0) is top left corner of staff, so substract margins
                    self.gesture.continueGesture(event._x - staff.marginLeft, event._y - staff.marginTop);
                }
            }
        }
        else //pencil is not down
        {
            //if mouse is within right margin, extend staff
            if (self.autoExtend && event._x > context.canvas.width - (STAFF_EXTENSION_TOLERANCE))
            {            
                self.extendCanvas(STAFF_EXTENSION_WIDTH);
            }
        }
        
        //check for out of bounds, and end gesture
        //TODO: check maximum bounds
        if (self.mouseMovePoint.x <= 10 || self.mouseMovePoint.y <= 10)
        {   
            self.touchend(event);
        }
    }
    //alias event handler reference for non-mobileSafari browsers
    this.mousemove = this.touchmove;
    
    //finger/mouse up
    //TODO: set a timer to only 
    this.touchend = function (event)
    {
        self.mouseUpPoint = new Point(event._x, event._y);
        self.mouseIsDown = false;
        self.started = false;
        
        
        //add erase gesture?

        if (self.touchAndHoldActive)
        {
            self.gesture = new Gesture();
            self.hideSymbolOptions();
            self.touchAndHoldActive = false;            
            return;
        }
        
        clearTimeout(self.touchAndHoldTimeout);


        //click, no drag, delete gesture
        if (!self.drawing && !self.dragging)
        {            
            if (self.clickedSymbolIndex >= 0)
            {
                //TODO: fix bug with this stack getting fubared
                staff.symbols.splice(self.clickedSymbolIndex, 1);
                self.ink.removeGesture(self.clickedSymbolIndex);
                self.redrawCanvas();
                //reset
                self.clickedSymbolIndex = -1;
            }
            //context.endPath()
            //alert('no drag');
            //clear out gesture...
            self.gesture = new Gesture();
        }
        else if (self.dragging) //dragging an existing symbol
        {
            //clear out gesture...
            self.gesture = new Gesture();            
            self.dragging = false;
            //reset
            self.clickedSymbolIndex = -1;
        }
        else //gesture recognition
        {
            //kickoff timer for gesture recognition
            self.activeGestureTimeout = setTimeout(self.endGesture, COUNTDOWN_INTERVAL * 1000);
            //add a new stroke
            self.drawing = false;
            self.gesture.newStroke();
            self.dragging = false;
            
        }
        
    }
    //alias event handler reference for non-mobileSafari browsers
    this.mouseup = this.touchend;
    
    this.handleTouchAndHoldOnSymbol = function()
    {
        var soCanvas = document.getElementById("symbolOptions");
        Utils.clearCanvas(soCanvas);
        self.touchAndHoldActive = true;
//        console.log(self.ink.gestures[self.clickedSymbolIndex].matches);
        //TODO update this when selected symbol changes
        var currentSymbolIndex = 0;
        var so = new SymbolOptions(self.ink.gestures[self.clickedSymbolIndex], soCanvas, self.clickedSymbolIndex, staff, self);
//        console.log("rendering options " + currentSymbolIndex);
        //currentSymbolIndex argument unused, unimplemented
        so.render(currentSymbolIndex);
        soCanvas.style.top = self.mouseDownPoint.y + "px";
        soCanvas.style.left = self.mouseDownPoint.x + "px";
        soCanvas.style.visibility = "visible";
        self.symbolOptionsCanvas = soCanvas;
        
        //
//        alert ("touch and hold");                
    }
    this.hideSymbolOptions = function()
    {

        self.symbolOptionsCanvas.style.visibility = "hidden";
    }
    //regular mode, not training
    if (!self.trainingCallback)
    {
        this.endGesture = function (event)
        {            
            //alert (self.activeGestureTimeout);
            if (self.activeGestureTimeout != null) 
            {
                if (self.gesture.endGesture())
                {
                    //append gesture to running ink
                    for (var i = 0; i < self.gesture.strokes.length; i ++)
                    {
                        self.ink.strokes.push(Point.clonePoints(self.gesture.strokes[i].slice(0)));
                    }
                    
                    //clone pencil gesture
                    
                    //get top left point of drawn gesture before normalization
                    //TODO: cache a deep copy of symbol for recognition manipulation
                    //var drawnRegistrationPoint = self.gesture.getTopLeft();
                    //use centroid for now, hack...
                    var drawnRegistrationPoint = self.gesture.getAverageCenter();
                    
                    //alert(drawnRegistrationPoint.y);
                    //console.log(outputPoints(self.gesture.getAllPoints()));
                    //self.gesture.normalize();
                    
                    //console.log (matchList);
                    //matchList.sort
                    var canvas1 = document.getElementById("canvas1");
                    var canvas2 = document.getElementById("canvas2");
                    //DYNAMIC...
                    //                        var bestGestures = gestureClassifier.dynamicMatchNew(self.gesture, canvas1, canvas2, staff.heightInPixels());
                    
                    //                        var bestGestures = gestureClassifier.dynamicMatch(self.gesture, canvas1, canvas2, staff.heightInPixels());
                    
                    if (DEBUG_LEVEL > 0)
                    {
                        //self.ink.sortStrokesByLeadingEdge();
                    }
                    //TODO: perpetually append strokes to Ink object, and move this work to Ink (should kick off a background thread),
                    if (useScaleTestMode()) //scale test mode
                    {
                        gestureClassifier.scaleTest(self.gesture, staff.getSize());
                    }
                    else //normal mode
                    {
                        gestureClassifier.dynamicMatchHull(self.gesture, canvas1, canvas2, staff.getSize(), staff, context, self);
//                        gestureClassifier.dynamicMatchBruteForce(self.gesture, canvas1, canvas2, staff.getSize(), staff, context, self);  
                        // gestureClassifier.dynamicMatch(self.gesture, canvas1, canvas2, staff.getSize());
                    }

                    
                    //                        for (var i = 0; i < bestGestures.length; i++)
                    //                        {
                    //                            alert(bestGestures[i].getAverageCenter());
                    //                            console.log(bestGestures[i].drawnGesture.getAverageCenter());
                    //                            drawNotationSymbol(bestGestures[i].symbol, bestGestures[i].drawnGesture.getAverageCenter());                            
                    //                        }
                    
                    //SINGLE
                    
                    //                        alert( staff.spacingInPixels());
                    //                         var matchList = gestureClassifier.match(self.gesture, staff.heightInPixels());
                    //                         var bestSymbol = matchList[0].symbol;
                    //                         var bestGesture = matchList[0].gesture;                        
                    //                        console.log("bestSymbol", bestSymbol);
                    //                        drawNotationSymbol(bestSymbol, drawnRegistrationPoint);
                    
                    /*UNUSED:                        
                     //draw best symbol match
                     //draw normalized gesture to screen
                     //Utils.clearCanvas(canvas);
                     //Utils.drawStaff(canvas);
                     //self.gesture = new Gesture();
                     //Utils.drawPointsOnCanvas(canvas, self.gesture.getAllPoints());
                     */                        
                    //drawBoundingBox(self.gesture.getTopLeft(), self.gesture.getBottomRight());
//                    Utils.clearCanvas(canvas1);
//                    Gesture.drawOnCanvas(canvas1, self.gesture);
                    
                    //clear canvas
//                    Utils.clearCanvas(canvas2);
//                    Gesture.drawOnCanvas(canvas2, bestGesture);
                    
                    
                    //clear out gesture...
                    self.gesture = new Gesture();
                    //getImage();
                }
            }            
        }
    }
    else
    { //training mode
        //alert (self.activeGestureTimeout);
        this.endGesture = function (event)
        {            
            if (self.activeGestureTimeout != null) 
            {
                if (self.gesture.endGesture())
                {
                    //console.log(outputPoints(self.gesture.getAllPoints()));
                    //TODO: allow explicit call, rather than timeout?
                    self.trainingCallback(Point.serializePoints(self.gesture.getAllPoints()));
                }
            }                
        }
    }

    /* TODO: need to maintain ink state for redraw */
    this.extendCanvas = function(width)
    {
        context.canvas.width += width;
        self.redrawCanvas();
    }
    
    //TODO: maintain canvas state
    this.redrawCanvas = function(scaleIndexDelta)
    {
        var scaleFactor = 1.0;
        if (scaleIndexDelta)
        {
            scaleFactor = staff.adjustScale(scaleIndexDelta);
        }
        var canvas = context.canvas;
        //clear canvas
        Utils.clearCanvas(canvas);         
        //scale canvas
        canvas.width *= scaleFactor;
        canvas.height = staff.heightInPixels() + staff.marginTop + staff.marginBottom;
        
        staff.render(context, !_showSymbols);
        scaleInk(scaleFactor);
        if (_showInk)
        {
            //var alpha = DEFAULT_BACKGROUND_LAYER_ALPHA;
            staff.startLayout(context, self.getInkColor());
            drawInk();
            staff.endLayout(context);
        }
    }

    this.toggleShowInk = function()
    {
        _showInk = !_showInk;
        self.redrawCanvas();
    }
    this.toggleShowSymbols = function()
    {
        _showSymbols = !_showSymbols;
        self.redrawCanvas();
    }

    this.setInkColor = function(r, g, b, a)
    {
        //validation?
        self.inkColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        self.redrawCanvas();        
    }
    
    this.getInkColor = function()
    {
        return self.inkColor;
    }
    
    this.resizeToNearestStaffSize = function(staffSize)
    {
        var nearestIndex = staff.getNearestSizeIndex(staffSize);
        var scaleIndexDelta = nearestIndex - staff.staffSizeIndex;
        //       alert(staff.scaleIndex + " " + nearestIndex);
        self.redrawCanvas(scaleIndexDelta);
    }
    
    this.getSymbolIndexFromPoint = function(point)
    {
        //construct a convex polygon from gesture ink and symbol
        for (var i = 0; i < staff.symbols.length; i ++)
        {
            var targetPolygon = new Polygon();
            
            //start with symbol bounding box
            targetPolygon.points = staff.symbols[i].getBoundingBox(context, staff).getPoints();
            
            //concatenate all ink points for this gesture
            targetPolygon.points =  targetPolygon.points.concat(self.ink.gestures[i].bagOfPoints());
            
            //get convex hull of all points   
            targetPolygon.sortPoints();
            targetPolygon.chainHull();
            
//            Polygon.drawOnCanvas(context.canvas, targetPolygon);            
            
            //determine if point is inside polygon
            //console.log(point, targetPolygon.points)
            if (targetPolygon.pointInPolygon(point) == Polygon.INSIDE_POLYGON)
            {
                return i;
            }
        }        
        
        return -1;
    }
    
    this.clearAll = function()
    {
        self.gesture = new Gesture();
        self.ink.clearAll();
        self.staff.clearAll();
        self.redrawCanvas();
    }
    
    //TODO: fix this up... scaling is still fubared
    function scaleInk(scaleFactor)
    {        
        if (!scaleFactor)
        {
            return;
        }
        for (var i = 0; i < self.ink.strokes.length; i++)
        {
            //staff.marginTop
            Point.scalePoints(self.ink.strokes[i], scaleFactor);
        }        
        
        //scale gestures, and their strokes
        for (var i = 0; i < self.ink.gestures.length; i++)
        {
            self.ink.gestures[i].scale(scaleFactor);
        }
    }
    
    //redraw existing ink
    this.drawInkFromStrokes = function(strokes, staffSize, marginOffset)
    {        
        var strokePoints = [];
        for (var i = 0; i < strokes.length; i++)
        {
            strokePoints[i] = [];
            for (var j = 0; j < strokes[i].length; j ++)
            {
                var point = new Point (strokes[i][j].x, strokes[i][j].y);
                point.x -= marginOffset.x;
                point.y -= marginOffset.y;
                strokePoints[i][j] = point;
                if (staffSize != this.staff.getSize())
                {
                    point.scale(this.staff.getSize() / staffSize);
                }
                if (j == 0)
                {
                    context.moveTo(point.x, point.y);                        
                    //console.log("1stpoint ink from ink", point);
                }
                else
                {
                    context.lineTo(point.x, point.y);
                }
            }
        }
        context.stroke();
        return strokePoints;
    }

    /* replay ink */
    this.replayInk = function(inkObj)
    {
        var strokes = inkObj.strokes;
        var staffSize = inkObj.staffSize;
        self.gesture = new Gesture();
        
        var marginPoint = new Point(0, 0);            
        if (!("version" in inkObj) || inkObj.version < CURRENT_INK_VERSION)
        {
            //old versions of test ink contain margin, so offset all points by that
            marginPoint = new Point(10, 92);            
        }
        var strokePoints = this.drawInkFromStrokes(strokes, staffSize, marginPoint);

        for (var i = 0; i < strokePoints.length; i ++)
        {
            for (var j = 0; j < strokePoints[i].length; j++)
            {                
                //console.log(strokePoints[i][j].x, strokePoints[i][j].y);
                self.gesture.continueGesture(strokePoints[i][j].x, strokePoints[i][j].y);
            }
            self.gesture.newStroke();
            self.ink.strokes.push(Point.clonePoints(strokePoints[i].slice(0)));
        }
        var canvas1 = document.getElementById("canvas1");
        var canvas2 = document.getElementById("canvas2");
        gestureClassifier.dynamicMatchHull(self.gesture, canvas1, canvas2, staff.getSize(), staff, context, self);
//        gestureClassifier.dynamicMatch(self.gesture, canvas1, canvas2, staff.getSize());
//        self.redrawCanvas();        
    }
        
    //draw from segmented gestures instead of original ink
    function drawInk()
    {
        for (var i = 0; i < self.ink.gestures.length; i++)
        {
            var strokes =  self.ink.gestures[i].strokes;
            for (var j = 0; j < strokes.length; j ++)
            {
                var stroke = strokes[j]; 
                for (var k = 0; k < stroke.length; k++)
                {
                    var point = new Point(stroke[k].x + staff.marginLeft, stroke[k].y + staff.marginTop);
                    
                    if (k == 0)
                    {
                        context.moveTo(point.x, point.y);                        
                        //console.log("1stpoint ink", point);
                    }
                    else
                    {
                        context.lineTo(point.x, point.y);
                    }
                }
            }
        }
        context.stroke();
    }
    
}

