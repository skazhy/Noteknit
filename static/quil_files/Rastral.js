function Rastral()
{
    
}

//TODO: should have image backup version when font embed/context.fillText() not available?
//hexadecimal char codes... hack
Rastral.fetaKeyToHtml = function(fetaMapKey)
{
    if (!(fetaMapKey in _fetaMap))
    {
        //console.log("error: " + fetaMapKey + " not in _fetaMap");
        return false;
    }
    var charNumHex = _fetaMap[fetaMapKey].toString(16);
    var shib = document.createElement("div");
    shib.innerHTML = "&#x" + charNumHex + ";";
    return shib.innerHTML;
}

Rastral.drawAllFetaChars = function()
{
    var mft = document.getElementById("musicFontTest");
    for (var key in _fetaMap)
    {
        //console.log(key + " is " + Rastral.fetaKeyToHtml(_fetaMap[key]));
        //console.log(_fetaMap[key].toString(16));
        mft.innerHTML += "<span>" + key + ":</span><span class=\"emmentaler\">&#x" + _fetaMap[key].toString(16) + ";</span><br/>";
    }
}

Rastral.setContextDefaults = function (context)
{
    context.strokeStyle = Rastral.DEFAULT_COLOR;
    context.font = Rastral.DEFAULT_FONT_SIZE + "pt " + Rastral.DEFAULT_FONT_NAME;        
    context.fillStyle = Rastral.DEFAULT_COLOR;     
    context.lineWidth = Rastral.DEFAULT_LINE_WIDTH;       
}    

Rastral.setContextFontSize = function (context, fontSize)
{
    var availableFontSize = fontSize;
    if (Rastral.FONT_SIZES.indexOf(fontSize) <= 0)
    {
        availableFontSize = Rastral.FONT_SIZES[Rastral.FONT_SIZES.length - 1];   
    }
    //TODO: select version of Emmantaler closest to this point size
    context.font = fontSize + "pt " + Rastral.DEFAULT_FONT_NAME + availableFontSize;        
}    

Rastral.mapNameToFeta = function(name)
{
    var index = Rastral.ALL_SYMBOLS.indexOf(name);
    var fetaMapKey = Rastral.ALL_SYMBOLS_FETA[index];
    if (fetaMapKey in _fetaMap)
    {
        return Rastral.fetaKeyToHtml(fetaMapKey);        
    }
    
    //if not in fetamap, use literal character    
    return fetaMapKey;
}

Rastral.ALL_SYMBOLS = [
                       "clef_bass",
                       "clef_treble",
                       "accidental_flat",
                       "note_16th_stem_down",
                       "note_16th_stem_up",
                       "note_32nd_stem_down",
                       "note_32nd_stem_up",
                       "note_eighth_stem_down",
                       "note_eighth_stem_up",
                       "note_half_stem_down",
                       "note_half_stem_up",
                       "note_quarter_stem_down",
                       "note_quarter_stem_up",
                       "note_whole",
                       "rest_16th",
                       "rest_eighth",
                       "rest_half",
                       "rest_quarter",
                       "rest_whole",
                       "accidental_sharp",
                       "accidental_natural",
                       "barline",
//                       "leger_line",
                       "augmentation_dot",
                       "time_signature_9",
                       "time_signature_8",
                       "time_signature_7",
                       "time_signature_6",
                       "time_signature_5",
                       "time_signature_4",
                       "time_signature_3",
                       "time_signature_2",
                       "time_signature_1"
                       ];

//currently these are just used for determining symbol width
//this is pretty hacky and should be improved
Rastral.ALL_SYMBOLS_FETA = [
                       "clefs.F",
                       "clefs.G",
                       "accidentals.flat",
                       "noteheads.s2",
                       "noteheads.s2",
                       "noteheads.s2",
                       "noteheads.s2",
                       "noteheads.s2",
                       "noteheads.s2",
                       "noteheads.s1",
                       "noteheads.s1",
                       "noteheads.s2",
                       "noteheads.s2",
                       "noteheads.s0",
                       "rests.4",
                       "rests.3",
                       "rests.1",
                       "rests.2",
                       "rests.0",
                       "accidentals.sharp",
                       "accidentals.natural",
                       "dots.dot",
                       "|",//fix this
  //                     "-",//fix this
                       "9",//fix this
                       "8",//fix this
                       "7",//fix this
                       "6",//fix this
                       "5",//fix this
                       "4",//fix this
                       "3",//fix this
                       "2",//fix this
                       "1",//fix this
                        ];

Rastral.DEFAULT_FONT_NAME = "Emmentaler";
//TODO: variable staff size and font size
Rastral.DEFAULT_FONT_SIZE = "14"; //or 14pt to match point size?
Rastral.DEFAULT_COLOR = "black";
Rastral.DEFAULT_STEM_LENGTH = 20;
Rastral.DEFAULT_LINE_WIDTH = 0.5;
Rastral.DEFAULT_STEM_LINE_WIDTH = 0.6;
Rastral.DEFAULT_NOTEHEAD_WIDTH_QUARTER = 6.0;
Rastral.DEFAULT_NOTEHEAD_HEIGHT_QUARTER = 4.0;
Rastral.DEFAULT_NOTEHEAD_WIDTH_HALF = 6.2;
Rastral.DEFAULT_NOTEHEAD_HEIGHT_HALF = 4.0;
Rastral.DEFAULT_STEM_OFFSET = 0.4;
Rastral.DEFAULT_LEGER_LINE_WIDTH = 9;
Rastral.FONT_SIZES = [11, 13, 14, 16, 18, 20, 23, 26];

Rastral.DEFAULT_PITCH_Y_POSITIONGS = [
                                      0, //"clefs.F",
                                      0, //"clefs.G",
                                      0, //"accidentals.flat",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s1",
                                      0, //"noteheads.s1",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s2",
                                      0, //"noteheads.s0",
                                      0, //"rests.4",
                                      0, //"rests.3",
                                      0, //"rests.1",
                                      0, //"rests.2",
                                      0, //"rests.0",
                                      0, //"accidentals.sharp",
                                      0, //"accidentals.natural",
                                      0, //"dots.dot",
                                      0, //"|",
                                      0, //"-",
                                      0, //"9",
                                      0, //"8",
                                      0, //"7",
                                      0, //"6",
                                      0, //"5",
                                      0, //"4",
                                      0, //"3",
                                      0, //"2",
                                      0, //"1",
                                      ];
