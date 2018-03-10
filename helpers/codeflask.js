define(function() {

  return this.enqueue({

    name: 'helpers.codeflask',

    deps: {

      core: [ 'pure' ],

      scripts: [ 'codeflask' ],

      styles: [ 'codeflask' ],

      helpers: [ '$prism' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(mod) {
            var CodeFlask  = mod.deps('scripts').codeflask();
            CodeFlask.make = mod.make = function(el, opts) {
              var cf = new CodeFlask;
              cf.run(el, opts);
              return cf;
            };
            return mod;
          }
        })(this);
      }
    };

  });

});
