define(function() {

  return this.enqueue({

    name: 'helpers.bezier',

    deps: {

      core: [ 'pure' ],

      scripts: [ 'bezier' ]

    }

  }, function() {

    return {

      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(mod) {
            mod.makefn = mod.deps('scripts.bezier').bind(function(fn) {
              return function $_pure(k) {
                k(mod.makefn = sys.run().fn.pure(fn));
              }
            });
            return mod;
          }
        })(this);
      }

    };

  });

});
