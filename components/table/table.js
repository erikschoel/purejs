define(function() {

  return this.enqueue({

    name: 'table',

    deps: {

      core: [ 'pure', 'dom' ],

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {

      ext: {
        hide: function() {
          this.$fn('display').run('none');
        }
      },
      control: {
        main: {
          render: function(data) {

            var view = this.root().view();
            var make = view.tmpl('main', 'header', 'column');
            var rndr = make.run();
            this.of(data).reduce(function(v, k) {
              v.id = k;
              return rndr.run(v);
            }, data);

            return this.root();
          },
          click: function(evt) {
          }
        }
      },
      tmpl: {
        main: function(name, type) {
          var view = this;
          var rndr = view.parent('$fn.render');
          var elem = rndr.run('table').run({ 'id': 'header', 'class': 'table-header table-responsive' });
          var find = view.eff('find').run(elem).toIO();
          var body = find.ap('tbody');
          var wrap = view.eff('append').ap(body).pure().ap(view.eff('tr').ap(view.render(type)));
          var rclc = wrap.ctor.of(function() {
            return this.ctor.pure(view.eff('recycle').run(wrap, body));
          }).pure();
          return view.set(name, rclc);
        }
      },
      events: {
        dom: {
          'click:tr': 'data.control.main.click'
        }
      }

    };

  });

});
