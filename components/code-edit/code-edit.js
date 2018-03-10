define(function() {

  return this.enqueue({

    name: 'code-edit',

    deps: {

      parent: 'code-box',

      core: [ 'pure', 'dom' ],

      components: [ 'view' ],

      helpers: [ 'codeflask' ],

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
              return (this._cf || (this._cf = this.root().$el().lift(function(el, rt) {
                var flsk = rt.deps('helpers.codeflask').make(el, { language: 'javascript', lineNumbers: true });
                var name = el.parentElement.id;
                flsk.textarea.setAttribute('data-bind-name', name);
                var ext  = el.closest('[data-bind-ext]');
                var full = ext ? [ ext.getAttribute('data-bind-ext'), name ] : [ name ];
                var view = rt.view().closest('[data-bind-path]');
                view.parent('data.model').lift(function(parent, path) {
                  full.unshift(path);
                  flsk.update(parent.get(full) || '');
                  rt.observe(parent, 'change', full.join('.'), 'data.control.main.change');
                }).ap(view.bindpath());
                return flsk;
              }).run(this.root())));
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