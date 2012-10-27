/*
 * A symbol is a collection of glyphs that are composited to make a discrete notation symbol
 */
function Symbol(symbolName)
{
    //string representing the name of this symbol
    this.name = symbolName;

    this.position = new Point(0, 0);
    
    this.pitchLine = 0;
        
    var self = this;
    
    this.render = function(context, staff)
    {
        staff.drawSymbol(context, this.position, this.name, staff.scale);
    }
    
    this.getBoundingBox = function(context, staff)
    {
        var text = Rastral.mapNameToFeta(this.name);
        context.save();
        var charWidth = context.measureText(text).width;
        //create a rectangle
        var rectangle = new Rectangle(new Point (this.position.x, staff.lineY()),
                                      new Point (this.position.x + charWidth, staff.lineY()),
                                      new Point (this.position.x + charWidth, 
                                                 staff.lineY() + staff.heightInPixels()),
                                      new Point (this.position.x, staff.lineY() + staff.heightInPixels())
                                      );                                                                            
        context.restore();
        return rectangle;
    }
    
    //a pitchline is the horizontal line (y position) of the symbol that correspods to its pitch
    this.getPitchLine = function()
    {
        
        
    }
    

    this.clone = function()
    {
        var s = new Symbol(this.name);
        s.position = this.position;
        return s;
    }
    this.serialize = function()
    {
        var obj = {};
        obj.name = this.name;
        obj.position = this.position.serialize();
        obj.pitchLine = this.pitchLine;
        return obj;
    }
    
}

Symbol.cloneSymbols = function(symbolsArray)
{
    var cs = [];
    for (var i = 0; i < symbolsArray.length; i ++)
    {
        //console.log(symbolsArray[i]);
        cs.push(symbolsArray[i].clone());
    }
    return cs;
}

Symbol.serializeSymbols = function(symbolsArray)
{
    var cs = [];
    for (var i = 0; i < symbolsArray.length; i ++)
    {
        cs.push(symbolsArray[i].serialize());
    }
    return cs;    
}
Symbol.pitchLines = [




];