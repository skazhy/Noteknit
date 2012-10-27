function PolygonIntersect ()
{    
    function Box (min, max)
    {
        this.min = min; 
        this.max = max;
    }
    function Rng (mn, mx)
    {
        this.mn = mn; 
        this.mx = mx;
    }
    
    function IPoint()
    {
        this.x;
        this.y;
    }
    
    function Vertex()
    {
        this.ip = new IPoint();
        this.rx = new Rng();
        this.ry = new Rng();
        this.inn;
    }
    
    var gamut = 500000000.;
    var mid = gamut / 2.;
    
    //--------------------------------------------------------------------------
    
    function range(points, c, bbox)
    {
        while (c-- > 0) 
        {
            bbox.min.x = Math.min(bbox.min.x, points[c].x);
            bbox.min.y = Math.min(bbox.min.y, points[c].y);
            bbox.max.x = Math.max(bbox.max.x, points[c].x);
            bbox.max.y = Math.max(bbox.max.y, points[c].y);
        }
    }
    
    function area(a, p, q) 
    {
        return p.x * q.y - p.y * q.x + a.x * (p.y - q.y) + a.y * (q.x - p.x);
    }
    
    function ovl(p, q) 
    {
        return p.mn < q.mx && q.mn < p.mx;
    }
    
    //--------------------------------------------------------------------------
    
    var ssss = 0;
    var sclx = 0;
    var scly = 0;
    
    function cntrib(f_x, f_y, t_x, t_y, w) 
    {
        ssss += w * (t_x - f_x) * (t_y + f_y) / 2;
    }
    
    function fit( x, cx, ix, fudge, B)
    {
        c = cx;
        while (c-- > 0) 
        {
            ix[c] = new Vertex();
            ix[c].ip = new IPoint();
            ix[c].ip.x = (((x[c].x - B.min.x) * sclx - mid) & ~7)
            | fudge | (c & 1);
            ix[c].ip.y = (((x[c].y - B.min.y) * scly - mid) & ~7)
            | fudge;
        }
        
        ix[0].ip.y += cx & 1;
        ix[cx] = ix[0];
        
        c = cx;
        while (c-- > 0) 
        {
            ix[c].rx = ix[c].ip.x < ix[c + 1].ip.x ?
            new Rng(ix[c].ip.x, ix[c + 1].ip.x) :
            new Rng(ix[c + 1].ip.x, ix[c].ip.x);
            ix[c].ry = ix[c].ip.y < ix[c + 1].ip.y ?
            new Rng(ix[c].ip.y, ix[c + 1].ip.y) :
            new Rng(ix[c + 1].ip.y, ix[c].ip.y);
            ix[c].inn = 0;
        }
    }
    
    function cross(a, b, c, d, a1, a2, a3, a4)
    {
        var r1 = a1 / ( a1 + a2);
        var r2 = a3 / ( a3 + a4);
        
        cntrib((a.ip.x + r1 * (b.ip.x - a.ip.x)),
               (a.ip.y + r1 * (b.ip.y - a.ip.y)),
               b.ip.x, b.ip.y, 1);
        cntrib(d.ip.x, d.ip.y,
               (c.ip.x + r2 * (d.ip.x - c.ip.x)),
               (c.ip.y + r2 * (d.ip.y - c.ip.y)),
               1);
        ++a.inn;
        --c.inn;
    }
    
    function inness(P, cP, Q, cQ)
    {
        var s = 0;
        var c = cQ;
        var p = P[0].ip;
        
        while (c-- > 0) 
        {
            if (Q[c].rx.mn < p.x && p.x < Q[c].rx.mx) 
            {
                var sgn = 0 < area(p, Q[c].ip, Q[c + 1].ip);
                s += (sgn != Q[c].ip.x < Q[c + 1].ip.x) ? 0 : (sgn ? -1 : 1);
            }
        }
        for (j = 0; j < cP; ++j) 
        {
            if (s != 0)
                cntrib(P[j].ip.x, P[j].ip.y,
                       P[j + 1].ip.x, P[j + 1].ip.y, s);
            s += P[j].inn;
        }
    }
    
    //-------------------------------------------------------------------------
    
    this.intersection = function(a,  b)
    {
        var na = a.length;
        var nb = b.length;
        var ipa = new Array(na + 1);
        var ipb = new Array(nb + 1);
        var bbox = new Box(new Point(Number.MAX_VALUE, Number.MAX_VALUE),
                           new Point(-Number.MAX_VALUE, -Number.MAX_VALUE));
        
        if (na < 3 || nb < 3)
        {
            return 0;
        }
        
        range(a, na, bbox);
        range(b, nb, bbox);
        
        var rngx = bbox.max.x - bbox.min.x;
        sclx = gamut / rngx;
        rngy = bbox.max.y - bbox.min.y;
        scly = gamut / rngy;
        ascale = sclx * scly;
        
        fit(a, na, ipa, 0, bbox);
        fit(b, nb, ipb, 2, bbox);
        
        for (j = 0; j < na; ++j) 
        {
            for (k = 0; k < nb; ++k) 
            {
                if (ovl(ipa[j].rx, ipb[k].rx) && ovl(ipa[j].ry, ipb[k].ry)) 
                {
                    var a1 = -area(ipa[j].ip, ipb[k].ip, ipb[k + 1].ip);
                    var a2 = area(ipa[j + 1].ip, ipb[k].ip, ipb[k + 1].ip);
                    var o = a1 < 0;
                    if (o == a2 < 0) 
                    {
                        var a3 = area(ipb[k].ip, ipa[j].ip, ipa[j + 1].ip);
                        var a4 = -area(ipb[k + 1].ip, ipa[j].ip, ipa[j + 1].ip);
                        if (a3 < 0 == a4 < 0) 
                        {
                            if (o)
                            {
                                cross(ipa[j], ipa[j + 1], ipb[k], ipb[k + 1], a1, a2, a3, a4);
                            }
                            else
                            {
                                cross(ipb[k], ipb[k + 1], ipa[j], ipa[j + 1], a3, a4, a1, a2);
                            }
                        }
                    }
                }
            }
        }
        
        inness(ipa, na, ipb, nb);
        inness(ipb, nb, ipa, na);
        return ssss / ascale;
    }
}