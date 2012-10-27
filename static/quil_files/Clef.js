function Clef(staff)
{
    this.sign = Clef.G_SIGN;
    this.line = Clef.DEFAULT_LINE_G;
    this.staff = staff;
    this.render = function(context, anchorPoint)
    {
        //anchorPoint = anchorPoint.add(Clef.DEFAULT_CENTER_POINT);
        
//        alert(this.lineY() + " " + this.staff.spacing + " " + (this.staff.numLines - this.line) + " " +     anchorPoint.y);
        //place on fixed Y
        anchorPoint.y = this.lineY();
        
        context.fillText(Rastral.fetaKeyToHtml("clefs." + this.sign), anchorPoint.x, anchorPoint.y);
//        context.fillText("x", anchorPoint.x, anchorPoint.y);
        //set back to defaults
//        context.textBaseline = "alphabetic";
//        context.textAlign = "start";
}
    //TODO: fix this
    this.lineY = function()
    {
        return (this.staff.marginTop  + ((this.staff.numLines - this.line) * (this.staff.heightInPixels() / (this.staff.numLines - 1))));
    }    
}

Clef.G_SIGN = "G";
Clef.F_SIGN = "F";
Clef.C_SIGN = "C";
Clef.DEFAULT_LINE_G = 2;
Clef.DEFAULT_LINE_F = 4;