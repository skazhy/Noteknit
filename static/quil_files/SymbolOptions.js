function SymbolOptions(gesture, canvas, currentSymbolIndex, mainStaff, pencil)
{
    const DEFAULT_LENGTH = 12;
    const DEFAULT_ITEM_HEIGHT = 30;
    const DEFAULT_SPACING_X = 10;
    const DEFAULT_SPACING_Y = 20;
//    const ROW_LENGTH = 6;
    const HIGHLIGHTED_INK_COLOR = "rgba(100, 0, 0, 1.0)";
    const DEFAULT_INK_COLOR = "rgba(0, 0, 0, 1.0)";
    
    this.length = DEFAULT_LENGTH;
    this.gesture = gesture;
    var self = this;
    var _canvas = canvas;
    this.disableAllEvents;
    this.targetAreas = [];
    this.selectedSymbolIndex = -1;
    this.currentSymbolIndex = currentSymbolIndex;
    this.mainStaff = mainStaff;
    this.pencil = pencil;
    
    this.init = function()
    {
        //TODO: fix this
        _canvas.addEventListener("mousemove", symbolOptionsEventCanvas, false);
        _canvas.addEventListener("mousedown", symbolOptionsEventCanvas, false);
        _canvas.addEventListener("mouseout", symbolOptionsEventCanvas, false);
        _canvas.addEventListener("mouseup", symbolOptionsEventCanvas, false);
    }
    this.render = function()
    {   
        var matchList = Match.cloneMatches(self.gesture.matches);
        //exclude current symbol from list ???
//        matchList.splice(this.currentSymbolIndex, 1);
        var ctx = _canvas.getContext("2d");
        var offsetX = DEFAULT_SPACING_X;
        var offsetY = DEFAULT_SPACING_Y;
        
        Utils.clearCanvas(_canvas);
        var staff = new Staff();
        //TODO: scale should be 1/4 staff scale
        //staff.setSize(mainStaff.getSize() / 4);
        //iterate through options    
        //always skip first match (index 0)
        var targetArea = null;      
        for (var i = 0; i < self.length; i++)
        {            
//            console.log(gesture.matches[i].symbol);
            var offsetPoint = new Point(offsetX, offsetY);
            highlightSymbolIndex = 2;
            targetArea = new Symbol(matchList[i].gesture.symbol).getBoundingBox(ctx, staff);
            targetArea.moveTo(new Point(offsetX, 0));
            if (self.selectedSymbolIndex == i)
            {
                staff.drawSymbol(ctx, offsetPoint, matchList[i].gesture.symbol, HIGHLIGHTED_INK_COLOR);
                Polygon.drawOnCanvas(_canvas, targetArea.getPolygon(), HIGHLIGHTED_INK_COLOR);
            }
            else
            {
                staff.drawSymbol(ctx, offsetPoint, matchList[i].gesture.symbol, DEFAULT_INK_COLOR);
            }
            offsetX += targetArea.getWidth() + DEFAULT_SPACING_X;
            self.targetAreas.push(targetArea);
        }
        //TODO: resize canvas to fit palette
        //_canvas.width = offsetX + DEFAULT_SPACING_X;
        //_canvas.height = staff.heightInPixels();
        
    }

    function symbolOptionsEventCanvas(event) 
    {
        if (self.disableAllEvents)
        {
            return;
        }
        //localize all point events to this canvas
//        var offsetPoint =  new Point(parseInt(_canvas.style.left), parseInt(_canvas.style.top));
        Utils.processEvent(event);
        //Call the event handler
        var func = self[event.type]; 
        if (func) 
        {
            func(event);
        }
    }
    
    this.mousemove = function(event)
    {
        //alert("mousemove");
        var mouseMovePoint = new Point(event._x, event._y);
        self.highlightSymbol(mouseMovePoint);
    }     

    this.mousedown = function(event)
    {
        var mouseDownPoint = new Point(event._x, event._y);
        _canvas.style.visibility = "hidden";
        self.disableAllEvents = true;
        self.selectSymbol();
    }
    this.mouseup = function(event)
    {
        _canvas.style.visibility = "hidden";
        self.disableAllEvents = true;
        self.selectSymbol();
    }
    this.mouseout = function(event)
    {
        _canvas.style.visibility = "hidden";
        self.disableAllEvents = false;
    }
    
    this.highlightSymbol = function (point)
    {
        for (var i = 0; i < self.targetAreas.length; i ++)
        {
            var targetArea = self.targetAreas[i];
            if (targetArea.contains(point))
            {
                //highlight target symbol
                self.selectedSymbolIndex = i;
                self.render();
                return;
            }
        }        
    }
    this.selectSymbol = function()
    {
        if (self.selectedSymbolIndex > 0)
        {
            //alert(self.selectedSymbolIndex);
//            self.gesture.symbol = 
            //give this symbol a score of best score + 1
            //Hack
            var pointDistanceFeature = self.gesture.matches[self.selectedSymbolIndex].getFeatureByType(Feature.POINT_DISTANCE_TYPE);
            pointDistanceFeature.score += 1.0;

            
            //...and re-sort symbol list
            self.gesture.matches.sort(Match.sortDescending);
            
            //replace ...
            var replacementSymbol = self.mainStaff.symbols[self.currentSymbolIndex].clone();
            replacementSymbol.name = self.gesture.matches[0].gesture.symbol;
            self.mainStaff.symbols.splice(self.currentSymbolIndex, 1, replacementSymbol);
            self.pencil.redrawCanvas();
            
            //crude implementation of autolearning
            if (useAutoLearn())
            {          
                //alert(self.mainStaff.symbols.length + " " + self.currentSymbolIndex + replacementSymbol.name);
                gestureClassifier.retrainGesture(replacementSymbol.name, this.pencil.ink.gestures[self.currentSymbolIndex].clone());
            }
        }
    }
    this.init();
}