function Json()
{
    this.string;
    this.data;
    this.xmlHttp = XmlHttpRequest.create();
    this.loadedCallback = null;
}

Json.prototype.loadJson = function(fileName) 
{    
    var self = this;
    this.xmlHttp.overrideMimeType("text/json");
    this.xmlHttp.open("GET", fileName, true);
    this.xmlHttp.onreadystatechange = handleReadyStateChange;
    this.xmlHttp.send(null);

    function handleReadyStateChange() 
    {        
        if (self.xmlHttp.readyState == 4) 
        {
            self.string = self.xmlHttp.responseText;
            self.data = eval("(" + self.xmlHttp.responseText + ")");
            if (self.loadedCallback != null)
            {
                self.loadedCallback();
            }
        }
    }        
}    

//
/*Json.prototype.encode = function() 
{
//unimplemented
}*/
