//a match acts as a simple classification broker
function Match(gesture)
{
    //this.score = score;
    this.gesture = gesture;
    //this.angleDifferences = 0;
    this.features = [];

    //returns a unified score
    this.getScore = function()
    {
        //weight and sum up all scores 
        var totalScore = 0;
        for (var i = 0; i < this.features.length; i ++)
        {
            totalScore += this.features[i].getWeightedScore();
        }
        if (DEBUG_LEVEL > 2)
        {
            console.log("totalScore", totalScore, "features length", this.features.length);
        }
        return totalScore;
        /*
        this.features.reduce(function (a, b)
                               {
                               return a.getWeightedScore() + b.getWeightedScore();         
                               });                            
         */
    }

    var self = this;    
    
    this.clone = function()
    {
        return new Match(self.gesture.clone(), self.score);
    }
    
    this.getFeatureByType = function(featureType)
    {
        for (var i = 0; i < this.features.length; i ++)
        {
            if (this.features[i].type == featureType)
            {
                return this.features[i];
            }
        }        
    }
}

Match.cloneMatches = function(matchesArray)
{   
    var ma = [];
    for (var i = 0; i < matchesArray.length; i++)
    {
        ma.push(matchesArray[i].clone());
    }
    return ma;
}

Match.sortDescending = function (a, b) 
{
    if (DEBUG_LEVEL > 3)
    {
        console.log("sortDescending", b.getScore(), a.getScore());
    }
    return (b.getScore() - a.getScore());
}