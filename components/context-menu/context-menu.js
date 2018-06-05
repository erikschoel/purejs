define(function() {

  return this.enqueue({

    name: 'context-menu',

    deps: {

      parent: 'dropdown',

      core: [ 'pure' ],

      templates: [ 'tmpl' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(comp) {
            return comp.klass;
          }
        })(this);
      },
      klass: {
        ext: {
          initialize: function() {
            this.control('main').init();
          },
          highlight: function() {

          },
          render: function(val) {
            var cf = this.control('main').init();
            cf.update(val || '');
          }
        },
        control: {
          main: {
            init: function() {
              returnthis.root())));
            },
            change: function(evt) {
              this.init().update(evt.value);
            }
          }
        }
      }
    };

  });

});