function Utils() 
{
    
}

Utils.levenshteinDistance = function(s1, s2)
{
    var matches = new Array(s1.length + 1);
    for (var i = 0; i <= s1.length; i++)
    {
        matches[i] = new Array(s2.length + 1);
        matches[i][0] = i; 
    }
    for (var j = 0; j <= s2.length; j++)
    {
        matches[0][j] = j;
    }
    var cost;
    for (i = 1; i <= s1.length; i++)
    {
        for (j = 1; j <= s2.length; j++)
        {
            if (s1.charAt(i) == s2.charAt(j))
            {
                cost = 0;
            } else
            {
                cost = 1;
            }
            //insertion, deletion
            matches[i][j] = Math.min(matches[i - 1][j] + 1, matches[i][j - 1]);
            //substitution
            matches[i][j] = Math.min(matches[i][j], matches[i - 1][j - 1] + cost); 
        }
    }    
    
    return matches[s1.length][s2.length];
    
}

Utils.clearCanvas = function(canvas)
{
    var context = canvas.getContext('2d');
//    console.log(canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height); 
}

Utils.geometricMean = function(numbers)
{
    var total = 1;
    for (var i = 0; i < numbers.length; i ++)
    {
        total *= numbers[i];
    }
    return Math.pow(total, (1 / numbers.length));
}

Utils.findNearestNumber = function(array, targetNum)
{
    var nearestNum = -1;
    var closestDistance = Number.MAX_VALUE;
    
    for (var i = 0; i < array.length; i++) 
    {
        //exact match
        if (array[i] == targetNum) 
        {
            return array[i];
        } 
        else //nearest match
        {       
            var distance = Math.abs(targetNum - array[i]);
            if (distance < closestDistance) 
            {
                nearestNum = array[i];
                closestDistance = distance;
            }
        }
    }
    return nearestNum;    
}

Utils.randColor = function()
{
    return "rgba(" +Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ", " + Math.floor(Math.random()*255) + ", 0.7);";
}

Utils.processEvent = function(event, offsetPoint)
{
    //standardize positioning coordinate attributes 
    //across multiple browser DOM implementations        
    if (event.targetTouches)
    { //iPhone
        if (event.targetTouches.length > 0)
        {
            event._x = event.targetTouches[0].pageX;
            event._y = event.targetTouches[0].pageY;
        }
        //prevent scrolling and other default gestural behaviors on iPhone
        if (isIphone)
        {
            event.preventDefault();
        }
        
    }
    else if (event.layerX || event.layerX == 0) 
    { //Firefox
        event._x = event.layerX;
        event._y = event.layerY;
    } 
    else if (event.offsetX || event.offsetX == 0) 
    { //Opera
        event._x = event.offsetX;
        event._y = event.offsetY;
    }

    //currently unused
    if (offsetPoint)
    {
        event._x -= offsetPoint.x;
        event._y -= offsetPoint.y;        
    }
}

Utils.isInt = function(number)
{
    return parseInt(number) == number;
}