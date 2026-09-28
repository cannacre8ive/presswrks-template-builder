/* URL configurations are data. Validate before applying them to the form. */
var PWShare = (function () {
  var numeric = ['w','h','bleed','safe','overlap','circumference','radius'];
  function validate(c) {
    if(!c || typeof c !== 'object' || Array.isArray(c)) throw new Error('Invalid setup');
    if(typeof c.name !== 'string' || c.name.length > 80) throw new Error('Invalid template name');
    if(!Number.isInteger(c.product) || c.product < 0 || c.product > 5) throw new Error('Invalid product');
    if(!['White','Clear','Black'].includes(c.stock)) throw new Error('Invalid stock');
    if(typeof c.pdp !== 'boolean' || typeof c.measured !== 'boolean') throw new Error('Invalid options');
    var clean={name:c.name,product:c.product,shape:c.shape,stock:c.stock,pdp:c.pdp,measured:c.measured};
    numeric.forEach(k=>clean[k]=c[k]);
    var error=PW.validate(clean);if(error)throw new Error(error);
    return clean;
  }
  function parse(hash) {
    if(!hash.startsWith('#setup=')) return null;
    if(hash.length>5000)throw new Error('Setup link is too long');
    var payload=JSON.parse(decodeURIComponent(hash.slice(7)));
    if(payload.version!==1)throw new Error('Unsupported setup version');
    return validate(payload.config);
  }
  function encode(c) {return '#setup='+encodeURIComponent(JSON.stringify({version:1,config:validate(c)}));}
  return {validate:validate,parse:parse,encode:encode};
}());
