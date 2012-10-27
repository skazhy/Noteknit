function CouchServer()
{
}

CouchServer.DEFAULT_PROTOCOL = "http://";
CouchServer.DEFAULT_SERVER = "localhost";
CouchServer.DEFAULT_PORT = 5984;

CouchServer.defaultUri = function()
{    
    return (CouchServer.DEFAULT_PROTOCOL + CouchServer.DEFAULT_SERVER + ":" + CouchServer.DEFAULT_PORT);
}