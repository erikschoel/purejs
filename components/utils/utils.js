define(function() {

  return this.enqueue({

    name: 'utils',

    deps: {

      core: [ 'pure', 'dom' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {
            var eff = sys.eff('sys.eff.parse').run(app.eff);
            return app;
          }
        })(this);
      },

      eff: (function() {
        return {
          type: 'IO',
          path: 'utils',
          filter: [
            (function main($wrap, $make, $io) {
              return $wrap($make, $io());
            })(
              (function wrap($make, $io, $run) {
                return function regexp(expr) {
                  return $io.run($make(expr));
                }
              }),
              (function string(expr) {
                return new RegExp(expr.replace(/\*/g, '.*'), 'i');
              }),
              (function io() {
                return sys.klass('io').lift(function(regexp, value) {
                  return regexp.test(value);
                });
              })
            )
          ],
          factory: {
            filter: {}
          }
        };
      })
    };
  });

});
