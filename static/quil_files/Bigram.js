function Bigram(from, to, probability)
{
    var ngram = new Ngram();
    ngram.from = [from];
    ngram.to = [to];
    ngram.probabilities = [probability];
    
    this.getFrom = function()
    {
        return ngram.from[0];
    }
    this.getTo = function()
    {
        return ngram.to[0];
    }
    this.getProbability = function()
    {
        return ngram.probabilities[0];
    }
}

function BigramVector()
{
    this.bigrams = [];
    this.bigramsTable = {};
    this.froms = {};
    this.tos = {};
    this.push = function(bigram)
    {
        this.bigrams.push(bigram);
        //add second dimension object
        if (!(bigram.getFrom() in this.bigramsTable))
        {
            this.bigramsTable[bigram.getFrom()] = {};
        }
        
        if (bigram.getFrom() in this.froms)
        {
            this.froms[bigram.getFrom()] ++;
        }
        else
        {
            this.froms[bigram.getFrom()] = 1;            
        }
        
        if (bigram.getTo() in this.froms)
        {
            this.tos[bigram.getTo()] ++;
        }
        else
        {
            this.tos[bigram.getTo()] = 1;            
        }
        
        this.bigramsTable[bigram.getFrom()][bigram.getTo()] = bigram;
    }    
    
    this.getBigramFromTable = function(from, to)
    {
        return this.bigramsTable[from][to];
    }
    
    this.getBigramFromTableBySymbolNames = function(fromSymbolName, toSymbolName)
    {
        var from = "";
        var to = "";
        
        if (DEBUG_LEVEL > 1)
        {
            console.log("fromSymbolName, toSymbolName", fromSymbolName, toSymbolName);
        }
        //check for stop symbols
        if (Bigram.stopSymbolNames.indexOf(fromSymbolName) >= 0 || Bigram.stopSymbolNames.indexOf(toSymbolName) >= 0)
        {
            return new Bigram("", "", 0);
        }
        
        //lookup "from" symbol, fuzzy, kind of by notation class name
        for (var fromKey in this.froms)
        {
            if (fromSymbolName.match(fromKey))
            {               
                from = fromKey;
            }
        }
        //lookup "to" symbol, fuzzy, kind of by notation class name
        for (var toKey in this.froms)
        {
            if (toSymbolName.match(toKey))
            {
                to = toKey;
            }            
        }
        return this.getBigramFromTable(from, to);
    }
}

Bigram.stopSymbolNames = ["scale_test"];