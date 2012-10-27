function Staff(marginTopLeftPoint)
{
    this.numLines = Staff.DEFAULT_NUM_LINES;
    this.spacing = Staff.DEFAULT_SPACING;
    if (!marginTopLeftPoint)
    {    
        marginTopLeftPoint = Staff.getDefaultMarginPoint();
    }
    this.marginLeft = marginTopLeftPoint.x;
    this.marginTop = marginTopLeftPoint.y;
    this.marginBottom = 110;
    this.marginRight = 10;
    this.lineWidth = Staff.DEFAULT_LINE_WIDTH;
    this.symbols = [];
    this.staffSizeIndex = Staff.DEFAULT_STAFF_SIZE_INDEX;
    this.stemLength = Rastral.DEFAULT_STEM_LENGTH;
    this.stemOffset = Rastral.DEFAULT_STEM_OFFSET;
    this.noteheadWidthQuarter = Rastral.DEFAULT_NOTEHEAD_WIDTH_QUARTER;
    this.noteheadHeightQuarter = Rastral.DEFAULT_NOTEHEAD_HEIGHT_QUARTER;
    this.noteheadWidthHalf = Rastral.DEFAULT_NOTEHEAD_WIDTH_HALF;
    this.noteheadHeightHalf = Rastral.DEFAULT_NOTEHEAD_HEIGHT_HALF;
    this.legerLineWidth = Rastral.DEFAULT_LEGER_LINE_WIDTH;
    this.stemLineWidth = Rastral.DEFAULT_STEM_LINE_WIDTH;

    //        "marginTop"                           

    this.scaledElements = [
        "stemLength",
        "stemOffset",
        "noteheadWidthQuarter",
        "noteheadWidthHalf",
        "legerLineWidth",
        "lineWidth",
    ]
        
    //this.scale = Staff.DEFAULT_STAFF_SIZE;

    this.previousLineWidth = this.lineWidth;
    this.startLayout = function(context, inkStyle, alpha)
    {
        if (alpha)
        {
            context.globalAlpha = alpha;
        }
        if (inkStyle)
        {
            context.fillStyle = inkStyle;
            context.strokeStyle = inkStyle;
        }
        context.textAlign = "start";
        context.textBaseline = "alphabetic";
        Rastral.setContextFontSize(context, Staff.STAFF_SIZES[this.staffSizeIndex]);
        context.beginPath();
        this.spacing = Staff.PIXEL_SIZES[this.staffSizeIndex] / (this.numLines - 1);
        //alert (this.spacing);
        this.previousLineWidth = context.lineWidth;
        context.lineWidth = this.lineWidth;        
    }
    this.endLayout = function(context)
    {
        //restore previous linewidth
        context.lineWidth = this.previousLineWidth;        
    }
    
    this.render = function(context, hideAllSymbols)
    {
        this.startLayout(context);
        for (var i = 0; i < this.numLines; i ++)
        {
            var lineY = this.marginTop + (i * this.spacing);
            context.moveTo(this.marginLeft, lineY);
            context.lineTo(context.canvas.width - this.marginRight, lineY); 
        }
        context.stroke();
        
        //render all symbols on this staff
        if (!hideAllSymbols)
        {
            for (var i = 0; i < this.symbols.length; i ++)
            {
                var symbol = this.symbols[i];
    //            symbol.scale = this.scale;
                
                symbol.render(context, this);
            }
        }
        this.endLayout(context);        
    }

    //returns the factor by which the staff was scaled
    this.adjustScale = function(staffSizeIndexDelta)
    {
        var prevstaffSizeIndex = this.staffSizeIndex;
        this.staffSizeIndex += staffSizeIndexDelta;
        if (this.staffSizeIndex < 0)
        {
            this.staffSizeIndex = 0;
        }
        else if (this.staffSizeIndex >= Staff.STAFF_SIZES.length)
        {
            this.staffSizeIndex = Staff.STAFF_SIZES.length - 1;
        }             
        scaleFactor = Staff.STAFF_SIZES[this.staffSizeIndex] / Staff.STAFF_SIZES[prevstaffSizeIndex];

        for (var i = 0; i < this.scaledElements.length; i ++)
        {
            this[this.scaledElements[i]] *= scaleFactor;
        }

        
        this.stemLineWidth *= scaleFactor;
        
        //TODO: improve accuracy of this scaling...
        for (var i = 0; i < this.symbols.length; i ++)
        {
            var symbol = this.symbols[i];
            symbol.position.x -= this.marginLeft;
            symbol.position.y -= this.marginTop;
            symbol.position.x *= scaleFactor;
            symbol.position.y *= scaleFactor;
            //re-add offset (TODO: manage this seperately)
            symbol.position.x += this.marginLeft;
            symbol.position.y += this.marginTop;
        }        
        return scaleFactor;        
    }

    this.getSize = function()
    {
        return Staff.STAFF_SIZES[this.staffSizeIndex];
    }
    
    this.setSize = function(staffSize)
    {
        var prevstaffSizeIndex = this.staffSizeIndex;
        var staffSizeIndex = prevstaffSizeIndex;
        if (Staff.STAFF_SIZES.indexOf(staffSize) < 0)
        {
            //attempt to find nearest size to given number
            staffSizeIndex = this.getNearestSizeIndex(staffSize);
        }
        else
        {
            staffSizeIndex = Staff.STAFF_SIZES.indexOf(staffSize);
        }
        this.adjustScale(staffSizeIndex - prevstaffSizeIndex);
    }
    
    this.getNearestSizeIndex = function(staffSize)
    {
        //attempt to find nearest staff size to given number        
        var nearestSize = Utils.findNearestNumber(Staff.STAFF_SIZES, staffSize);
        if (Staff.STAFF_SIZES.indexOf(nearestSize) >= 0)
        {
            return Staff.STAFF_SIZES.indexOf(nearestSize);
        }
        //give up, return current index
        return this.staffSizeIndex;        
    }
    
    this.heightInPixels = function()
    {
        return Math.round(Staff.PIXEL_SIZES[this.staffSizeIndex]);
    }

    this.drawBassClef = function(context, anchorPoint)
    {
        //bass clef
        var bc = new Clef(this);
        bc.sign = Clef.F_SIGN;
        bc.line = Clef.DEFAULT_LINE_F;
        bc.render(context, anchorPoint);
//        context.fillText(Rastral.fetaKeyToHtml("clefs.F"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawTrebleClef = function(context, anchorPoint)
    {
        //context.fillText(Rastral.fetaKeyToHtml("clefs.G"), anchorPoint.x, anchorPoint.y);
        var tc = new Clef(this);
        tc.render(context, anchorPoint);
    }
    
    this.drawFlat = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("accidentals.flat"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawSharp = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("accidentals.sharp"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawQuarterNoteStemDown = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.stemOffset, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        //alert (this.stemLength);
        context.stroke();        
        if (this.hasLegerLine(anchorPoint.y))
        {
            var legerPoint = anchorPoint.clone();
            legerPoint.x -= this.noteheadWidthQuarter / 4;
            this.drawLegerLine(context, legerPoint);
        }
        
    }
    
    this.drawEighthNoteStemDown = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.stemOffset, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.fillText(Rastral.fetaKeyToHtml("flags.d3"), anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.stroke();        
    }
    
    this.drawEighthNoteStemUp = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y - this.stemLength);
        context.fillText(Rastral.fetaKeyToHtml("flags.u3"), anchorPoint.x + this.noteheadWidthQuarter + this.stemOffset, anchorPoint.y - this.stemLength);
        context.stroke();        
    }
    
    this.draw16thNoteStemDown = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.stemOffset, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.fillText(Rastral.fetaKeyToHtml("flags.d4"), anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.stroke();        
    }
    
    this.draw16thNoteStemUp = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y - this.stemLength);
        context.fillText(Rastral.fetaKeyToHtml("flags.u4"), anchorPoint.x + this.noteheadWidthQuarter + this.stemOffset, anchorPoint.y - this.stemLength);
        context.stroke();        
    }
    
    this.draw32ndNoteStemDown = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.stemOffset, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.fillText(Rastral.fetaKeyToHtml("flags.d5"), anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.stroke();        
    }
    
    this.draw32ndNoteStemUp = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y - this.stemLength);
        context.fillText(Rastral.fetaKeyToHtml("flags.u5"), anchorPoint.x + this.noteheadWidthQuarter  + this.stemOffset, anchorPoint.y - this.stemLength);
        context.stroke();        
    }
    
    
    this.drawQuarterNoteStemUp = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s2"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.noteheadWidthQuarter, anchorPoint.y - this.stemLength);
        context.stroke();        
    }
    
    this.drawHalfNoteStemUp = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s1"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();        
        context.moveTo(anchorPoint.x + this.noteheadWidthHalf, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.noteheadWidthHalf, anchorPoint.y - this.stemLength);
        context.stroke();        
    }
    
    this.drawHalfNoteStemDown = function(context, anchorPoint)
    {
        //quarter note head
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s1"), anchorPoint.x, anchorPoint.y);
        //stem
        context.lineWidth = this.stemLineWidth;
        context.beginPath();
        context.moveTo(anchorPoint.x + this.stemOffset, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.stemOffset, anchorPoint.y + this.stemLength);
        context.stroke();        
    }
    
    this.drawWholeNote = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("noteheads.s0"), anchorPoint.x, anchorPoint.y);
    }
    
    this.draw16thRest = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("rests.4"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawEighthRest = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("rests.3"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawHalfRest = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("rests.1"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawQuarterRest = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("rests.2"), anchorPoint.x, anchorPoint.y);
    }
    
    this.drawWholeRest = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("rests.0"), anchorPoint.x, anchorPoint.y);
    }
    this.drawAugmentationDot = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("dots.dot"), anchorPoint.x, anchorPoint.y);
    }
    this.drawLegerLine = function(context, anchorPoint)
    {
        context.beginPath();
        context.moveTo(anchorPoint.x, anchorPoint.y);
        context.lineTo(anchorPoint.x + this.legerLineWidth, anchorPoint.y);
        context.stroke();        
    }    

    this.drawNatural = function(context, anchorPoint)
    {
        context.fillText(Rastral.fetaKeyToHtml("accidentals.natural"), anchorPoint.x, anchorPoint.y);
    }    
    
    this.drawBarline = function(context, anchorPoint)
    {
        context.beginPath();
        context.moveTo(anchorPoint.x, this.marginTop);
        context.lineTo(anchorPoint.x, this.marginTop + this.heightInPixels());
        context.stroke();        
    }    

    this.drawTimeSignatureNumber = function(context, anchorPoint, number)
    {
        context.fillText(number, anchorPoint.x + this.spacing, anchorPoint.y + this.spacing);
    }    

    this.drawSymbol = function(context, anchorPoint, symbolString, inkStyle)
    {
        this.startLayout(context, inkStyle);
 
        /*switch (symbolString)
        {            
            case "clef_bass":
                this.drawBassClef(context, anchorPoint);
                break;
            case "clef_treble":
                this.drawTrebleClef(context, anchorPoint);
                break;            
            case "accidental_flat":
                this.drawFlat(context, anchorPoint);
                break;            
            case "accidental_sharp":
                this.drawSharp(context, anchorPoint);
                break;            
            case "note_16th_stem_down":
                this.draw16thNoteStemDown(context, anchorPoint);
                break;            
            case "note_16th_stem_up":
                this.draw16thNoteStemUp(context, anchorPoint);
                break;            
            case "note_32nd_stem_down":
                this.draw32ndNoteStemDown(context, anchorPoint);
                break;            
            case "note_32nd_stem_up":
                this.draw32ndNoteStemUp(context, anchorPoint);
                break;            
            case "note_eighth_stem_down":
                this.drawEighthNoteStemDown(context, anchorPoint);
                break;            
            case "note_eighth_stem_up":
                this.drawEighthNoteStemUp(context, anchorPoint);
                break;            
            case "note_half_stem_down":
                this.drawHalfNoteStemDown(context, anchorPoint);
                break;            
            case "note_half_stem_up":
                this.drawHalfNoteStemUp(context, anchorPoint);
                break;            
            case "note_quarter_stem_down":
                this.drawQuarterNoteStemDown(context, anchorPoint);
                break;            
            case "note_quarter_stem_up":
                this.drawQuarterNoteStemUp(context, anchorPoint);
                break;            
            case "note_whole":
                this.drawWholeNote(context, anchorPoint);
                break;            
            case "rest_16th":
                this.draw16thRest(context, anchorPoint);
                break;            
            case "rest_eighth":
                this.drawEighthRest(context, anchorPoint);
                break;            
            case "rest_half":
                this.drawHalfRest(context, anchorPoint);
                break;            
            case "rest_quarter":
                this.drawQuarterRest(context, anchorPoint);
                break;            
            case "rest_whole":
                this.drawWholeRest(context, anchorPoint);
                break;            
            case "augmentation_dot":
                this.drawAugmentationDot(context, anchorPoint);
                break;            
            case "leger_line":
                this.drawLegerLine(context, anchorPoint);                    
                break;
            case "accidental_natural":
                this.drawNatural(context, anchorPoint);
                break;
            case "barline":
                this.drawBarline(context, anchorPoint);                    
                break;
            case "time_signature_1":
                this.drawTimeSignatureNumber(context, anchorPoint, 1);
                break;
            case "time_signature_2":
                this.drawTimeSignatureNumber(context, anchorPoint, 2); 
                break;
            case "time_signature_3":
                this.drawTimeSignatureNumber(context, anchorPoint, 3);
                break;
            case "time_signature_4":
                this.drawTimeSignatureNumber(context, anchorPoint, 4);
                break;
            case "time_signature_5":
                this.drawTimeSignatureNumber(context, anchorPoint, 5);
                break;
            case "time_signature_6":
                this.drawTimeSignatureNumber(context, anchorPoint, 6);
                break;
            case "time_signature_7":
                this.drawTimeSignatureNumber(context, anchorPoint, 7);
                break;
            case "time_signature_8":
                this.drawTimeSignatureNumber(context, anchorPoint, 8);
                break;
            case "time_signature_9":
                this.drawTimeSignatureNumber(context, anchorPoint, 9);
                break;
                
        }   */
        switch (symbolString) {
            case "clef_bass":
                this.drawBassClef(context, anchorPoint);
                break;
            case "clef_treble":
                this.drawTrebleClef(context, anchorPoint);
                break;
            case "accidental_flat":
                this.drawFlat(context, anchorPoint);
                break;
            case "accidental_sharp":
                this.drawSharp(context, anchorPoint);
                break;
            case "note_16th_stem_down":
                this.draw16thNoteStemDown(context, anchorPoint);
                break;
            case "note_16th_stem_up":
                this.draw16thNoteStemUp(context, anchorPoint);
                break;
            case "note_32nd_stem_down":
                this.draw32ndNoteStemDown(context, anchorPoint);
                break;
            case "note_32nd_stem_up":
                this.draw32ndNoteStemUp(context, anchorPoint);
                break;
            case "note_eighth_stem_down":
                this.drawEighthNoteStemDown(context, anchorPoint);
                break;
            case "note_eighth_stem_up":
                this.drawEighthNoteStemUp(context, anchorPoint);
                break;
            case "note_half_stem_down":
                this.drawHalfNoteStemDown(context, anchorPoint);
                break;
            case "note_half_stem_up":
                this.drawHalfNoteStemUp(context, anchorPoint);
                break;
            case "note_quarter_stem_down":
                this.drawQuarterNoteStemDown(context, anchorPoint);
                break;
            case "note_quarter_stem_up":
                this.drawQuarterNoteStemUp(context, anchorPoint);
                break;
            case "note_whole":
                this.drawWholeNote(context, anchorPoint);
                break;
            case "rest_16th":
                this.draw16thRest(context, anchorPoint);
                break;
            case "rest_eighth":
                this.drawEighthRest(context, anchorPoint);
                break;
            case "rest_half":
                this.drawHalfRest(context, anchorPoint);
                break;
            case "rest_quarter":
                this.drawQuarterRest(context, anchorPoint);
                break;
            case "rest_whole":
                this.drawWholeRest(context, anchorPoint);
                break;
            case "augmentation_dot":
                this.drawAugmentationDot(context, anchorPoint);
                break;
            case "leger_line":
                this.drawLegerLine(context, anchorPoint);
                break;
            case "accidental_natural":
                this.drawNatural(context, anchorPoint);
                break;
            case "barline":
                this.drawBarline(context, anchorPoint);
                break;
            case "time_signature_1":
                this.drawTimeSignatureNumber(context, anchorPoint, 1);
                break;
            case "time_signature_2":
                this.drawTimeSignatureNumber(context, anchorPoint, 2);
                break;
            case "time_signature_3":
                this.drawTimeSignatureNumber(context, anchorPoint, 3);
                break;
            case "time_signature_4":
                this.drawTimeSignatureNumber(context, anchorPoint, 4);
                break;
            case "time_signature_5":
                this.drawTimeSignatureNumber(context, anchorPoint, 5);
                break;
            case "time_signature_6":
                this.drawTimeSignatureNumber(context, anchorPoint, 6);
                break;
            case "time_signature_7":
                this.drawTimeSignatureNumber(context, anchorPoint, 7);
                break;
            case "time_signature_8":
                this.drawTimeSignatureNumber(context, anchorPoint, 8);
                break;
            case "time_signature_9":
                this.drawTimeSignatureNumber(context, anchorPoint, 9);
                break;

        }
        this.endLayout(context);
    
    }

    
    //TODO: fix this
    this.lineY = function (lineIndex)
    {
        if (!lineIndex)
        {
            lineIndex = 0;
        }
        return (this.marginTop + (lineIndex * this.spacing));
    }

    this.hasLegerLine = function (lineY)
    {
        //Utils.isInt(lineY) && 
        if (lineY < this.marginTop - (this.spacing) || lineY > this.getHeight() + this.marginTop)
        {
            return true;
        }
        
        return false;
    }
    
    this.clearAll = function()
    {
        this.symbols = [];
    }
    
    this.pitchToLineIndex = function(pitch)
    {
        
    }
    
    this.getHeight = function()
    {
        return (this.numLines * this.spacing);
    }
    
    //TODO: add leger lines, both above and below
    this.snapToLineY = function (lineY)
    {
        var lineYs = [];
        //generate an array of lineYs of all lines and spaces
        for (var i = -this.numLines * 2; i < this.numLines * 2; i += 0.5)
        {
            lineYs.push(this.spacing * i);
        }
        var lineYSnapped = Utils.findNearestNumber(lineYs, lineY);
        return lineYSnapped + this.marginTop;
    }
    
    //set up some defaults    
    this.setSize(Staff.DEFAULT_STAFF_SIZE);
    
 
    this.serializeSymbols = function()
    {
        return Symbol.serializeSymbols(this.symbols);
    }
}



Staff.DEFAULT_NUM_LINES = 5;
//in pixels
Staff.DEFAULT_SPACING = 4.5;
Staff.DEFAULT_LINE_WIDTH = 0.4;

Staff.STAFF_SIZES = [11, 13, 14, 16, 18, 20, 23, 26, 
                             28, 32, 36, 40, 46, 52, 
                             56, 64, 72, 80, 92, 104,
                             112, 128, 144, 160];
Staff.STAFF_HEIGHTS = [11.22, 12.60, 14.14, 15.87, 17.82, 20, 22.45, 25.2];

Staff.DEFAULT_MARGIN_LEFT = 10;
Staff.DEFAULT_MARGIN_TOP = 10;
//Note: these might not be accurate, need to adjust all ...
/*Staff.PIXEL_SIZES = [15, 17, 19, 22, 24, 26, 29, 35,
                             36, 44, 48, 52, 58, 70,
                             72, 88, 96, 104, 116, 140,
                             144, 172, 192, 212];
*/
//HACK
Staff.PIXEL_SIZES = [];
for (var i = 0; i < Staff.STAFF_SIZES.length; i++)
{
    
    Staff.PIXEL_SIZES[i] = Staff.STAFF_SIZES[i] * 1.42;
}

Staff.DEFAULT_STAFF_SIZE = 14;
Staff.DEFAULT_STAFF_SIZE_INDEX = Staff.STAFF_SIZES.indexOf(Staff.DEFAULT_STAFF_SIZE);

Staff.getDefaultMarginPoint = function()
{
    return new Point(Staff.DEFAULT_MARGIN_LEFT, Staff.DEFAULT_MARGIN_TOP);
}
/*
 feta11 11.22
 feta13 12.60
 feta14 14.14
 feta16 15.87
 feta18 17.82
 feta20 20
 feta23 22.45
 feta26 25.2
 
 11pt	15px
 13pt	17px
 14pt	19px
 16pt	22px
 18pt	24px
 20pt	26px
 23pt	29px
 26pt	35px
 
 var PIXELS_PER_INCH = 1/72;
 
 */
