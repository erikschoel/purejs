define(function() {
  return this.enqueue({

    name: 'modules.home',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'title' ]

    }

  }, function() {

    return {

      ext: {
        refresh: function(evt) {
          if (evt.value === 'block') {
            this.get('title').control('main').anim().run();
          }
        },
        launch: function() {
          sys.get('router').navigate('app');
        }
      },

      init: function(deps) {

        return deps('core.pure')(function(sys) {
          return function(app) {

            var module = sys.get('components.home');
            var title  = app.deps('components.title').create('title', module);

            return [ title.pure() ].lift(function(t) {

              t.proxy('click', 'ul', 'title.run');
              t.render(sys.get('config.app.name'));
              t.attach();

              return app;

            }).cont();

          }
        })(this);
      },

      events: {
        data: {
          'change:state.display':'refresh',
          'change:title.run':'launch'
        }
      }

    };

  });
});
