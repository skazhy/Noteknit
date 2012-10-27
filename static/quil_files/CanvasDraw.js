function CanvasDraw(trainingCallback, staffSize, staffOffsetPoint) 
{
    var _canvas, _context, _pencil;
    var _staff = null;
//    var _scale = 1.0;
    this.trainingCallback = trainingCallback;
    
    this.disableAllEvents = false;

    var canvasDraw = this;
    var self = this;
//    if (initialScale)
//    {
//        _scale = initialScale;
//    }

    this.getContext = function()
    {
        return _context;
    }
    this.getCanvas = function()
    {
        return _canvas;
    }

    this.getPencil = function()
    {
        return _pencil;
    }

    this.getStaff = function()
    {
        return _staff;
    }
    
    function initialize()
    {
        // Find the canvas element.
        _canvas = document.getElementById("canvasView");
        _context = _canvas.getContext("2d");
        
//        _context.save();
//        _context.scale(_scale, _scale);
//        _context.restore();
        Rastral.setContextDefaults(_context);
        
        //Utils.drawStaff(_canvas);
        _staff = new Staff(staffOffsetPoint);
//        _staff.marginTop = 10;
        if (!staffSize)
        {
            staffSize = Staff.DEFAULT_STAFF_SIZE;
        }
        _staff.setSize(staffSize);
        _staff.render(_context);
        this.trainingCallback = trainingCallback;
        
        _pencil = new Pencil(this.trainingCallback, _context, _staff);
        
        //iphone
        if (isIphone)
        {			
			document.body.addEventListener("touchmove", function(e) {
										   e.preventDefault();
										   });
			event.preventDefault();
			
            _canvas.addEventListener("touchstart", eventCanvas, false);
            _canvas.addEventListener("touchmove", eventCanvas, false);
            _canvas.addEventListener("touchend",   eventCanvas, false);
        }
        else
        {
            _canvas.addEventListener("mousedown", eventCanvas, false);
            _canvas.addEventListener("mousemove", eventCanvas, false);
            _canvas.addEventListener("mouseup",   eventCanvas, false);
            //prevent menu from showing on right click
//            _canvas.addEventListener("contextmenu",   eventCanvas, false);
        }
        
        //should also add IE support?
    }
    
    this.drawNotationSymbol = function(symbolName, topLeftPoint)
    {    
        //_context.drawImage(notationImages[symbolName], topLeftPoint.x, topLeftPoint.y);
        _staff.drawSymbol(_context, topLeftPoint, symbolName);
    }

    function drawBoundingBox(topLeftPoint, bottomRightPoint)
    {    
        _context.strokeRect(topLeftPoint.x, topLeftPoint.y, bottomRightPoint.x - topLeftPoint.x, bottomRightPoint.y - topLeftPoint.y);
    }
    
    //set scale, maintaining aspect ratio 1.0 is normal size, 100%
    //TODO: need to redraw all once scale is reset
    this.setScale = function (scale) 
    {
        _context.scale(scale, scale);        
    }
                     
//    function getImage()
//    {
//        alert(_context.getImageData().data.length);
//    }
        
    function eventCanvas (event) 
    {
        if (self.disableAllEvents)
        {
            return;
        }
        Utils.processEvent(event);

        //console.log(event._x, event._y);
        //Call the event handler
        var func = _pencil[event.type];
        if (func) 
        {
            func(event);
        }
    }
    
    initialize();

    
}



