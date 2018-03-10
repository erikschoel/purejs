define(function() {

  return this.enqueue({

    name: 'code-box',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'view' ],

      helpers: [ '$prism' ],

      templates: [ 'tmpl' ]

    }

  }, function() {

    return {
      ext: {
        main: function() {
          return this.deps('helpers.$prism').bind(this.bin(function(cb, pr) {
            cb.prismm();
            return cb;
          })).cont();
        },
        prismm: function() {
          this.set('$fn.prism', sys.klass('IO').pure(function(el) {
            Prism.highlightElement(el.querySelector('code'));
          }).ap(this.view().$el()));
        },
        render: function(arg) {
          this.$fn('replace').ap(this.view().tmpl('main')).run({ str: arg && arg.value ? arg.value : (arg || '') });
          this.highlight();
          this.$fn('display').run('');
        },
        highlight: function() {
          this.$fn('prism').run();
        },
        show: function(evt) {
          this.render(sys.link('items', 'show').prop('run', evt.value || evt).chain(function(raw) {
            return sys.get('utils.toString')(raw, true);
          }));
        },
        hide: function() {
          this.$fn('display').run('none');
        }
      },
      tmpl: {
        main: function() {
          var item = this.get('main');
          if (!item) {
            var elem = this.eff('div');
            var html = this.eff('html').ap(elem.ap(elem.of({ 'class' : 'code-content' }))).pure();
            item = this.set('main', html.ap(this.render('main')));
          }
          return item;
        }
      },
      events: {
        data: {
          'change:data.main.content': 'main'
        },
        dom: {
          'click:.close': 'hide'
        }
      }

    };

  });

});