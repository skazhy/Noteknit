function Language ()
{
    //hardwire a rough set of bigrams
    this.bigramVector = new BigramVector();
    bv = this.bigramVector;
    bv.push(new Bigram("clef", "clef", 0.0));
    bv.push(new Bigram("clef", "rest", 1.0));
    bv.push(new Bigram("clef", "note", 1.0));
    bv.push(new Bigram("clef", "accidental", 1.0));
    bv.push(new Bigram("clef", "line", 0.5));
    bv.push(new Bigram("clef", "augmentation", 0.0));
    bv.push(new Bigram("clef", "time_signature", 1.0));

    bv.push(new Bigram("rest", "clef", 0.1));
    bv.push(new Bigram("rest", "rest", 1.0));
    bv.push(new Bigram("rest", "note", 1.0));
    bv.push(new Bigram("rest", "accidental", 1.0));
    bv.push(new Bigram("rest", "line", 1.0));
    bv.push(new Bigram("rest", "augmentation", 1.0));
    bv.push(new Bigram("rest", "time_signature", .01));

    bv.push(new Bigram("note", "clef", 0.01));
    bv.push(new Bigram("note", "rest", 1.0));
    bv.push(new Bigram("note", "note", 1.0));
    bv.push(new Bigram("note", "accidental", 1.0));
    bv.push(new Bigram("note", "line", 1.0));
    bv.push(new Bigram("note", "augmentation", 1.0));
    bv.push(new Bigram("note", "time_signature", 0.0));

    bv.push(new Bigram("accidental", "clef", 0.01));
    bv.push(new Bigram("accidental", "rest", 1.0));
    bv.push(new Bigram("accidental", "note", 1.0));
    bv.push(new Bigram("accidental", "accidental", 1.0));
    bv.push(new Bigram("accidental", "line", 1.0));
    bv.push(new Bigram("accidental", "augmentation", 1.0));
    bv.push(new Bigram("accidental", "time_signature", 0.0));

    bv.push(new Bigram("time_signature", "clef", 1.0));
    bv.push(new Bigram("time_signature", "rest", 1.0));
    bv.push(new Bigram("time_signature", "note", 1.0));
    bv.push(new Bigram("time_signature", "accidental", 1.0));
    bv.push(new Bigram("time_signature", "line", 1.0));
    bv.push(new Bigram("time_signature", "augmentation", 1.0));
    bv.push(new Bigram("time_signature", "time_signature", 1.0));

    bv.push(new Bigram("line", "clef", 1.0));
    bv.push(new Bigram("line", "rest", 1.0));
    bv.push(new Bigram("line", "note", 1.0));
    bv.push(new Bigram("line", "accidental", 1.0));
    bv.push(new Bigram("line", "line", 0.0));
    bv.push(new Bigram("line", "augmentation", 0.0));
    bv.push(new Bigram("line", "time_signature", 1.0));

    bv.push(new Bigram("augmentation", "clef", 0.5));
    bv.push(new Bigram("augmentation", "rest", 1.0));
    bv.push(new Bigram("augmentation", "note", 1.0));
    bv.push(new Bigram("augmentation", "accidental", 1.0));
    bv.push(new Bigram("augmentation", "line", 1.0));
    bv.push(new Bigram("augmentation", "augmentation", 0.6));
    bv.push(new Bigram("augmentation", "time_signature", 0.0));
    
}

