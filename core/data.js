var parseURI = sys.get('binds.make')('store')('fold', function(r, v, k, i, o) {
  if (v instanceof Function) {
    r = v(r, k);                             
  }else if (typeof v == 'object') {
    if (v.$$map) {
      r = v.$$map(r);
    }else if (r.$$map) {
      r = r.$$map(r, k);
    }else if (v.base) {
      r = v.base(r, k);
    }
  }
  return r;
}); 
