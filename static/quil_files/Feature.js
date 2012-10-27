function Feature(type, score, weight)
{   
    this.type = type;
    this.score = score;
    this.weight = weight;
    
    this.getWeightedScore = function()
    {
        return this.score * this.weight;
    }
}

Feature.POINT_DISTANCE_TYPE = "pointDistanceType";
Feature.POINT_DISTANCE_WEIGHT = 0.8;

Feature.ANGLE_DIFFERENCE_TYPE = "angleDifferenceType";
Feature.ANGLE_DIFFERENCE_WEIGHT = 0.1;

//unused
Feature.LANGUAGE_BIGRAM_TYPE = "languageBigram";
Feature.LANGUAGE_BIGRAM_WEIGHT = 0.05;
