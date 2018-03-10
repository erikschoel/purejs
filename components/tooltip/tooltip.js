define(function() {

  return this.enqueue({

    name: 'tooltip',

    deps: {

      core: [ 'pure', 'dom' ],

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {
            app.ext.$io = { name: '$io', value: app.make.call(sys) };
            return app;
          }
        })(this);
      },
      make: function() {
        return this.klass('io').lift(function(lft, evt) {
          return lft.run(evt).prop('getAttribute', evt.currentTarget.getAttribute('data-tooltip'));
        }).run(this.klass('io').pure(function(evt) {
          return evt.target.matches('li') ? evt.target : evt.target.closest('li');
        }).toMaybe());
      },
      ext: {
        main: function() {
          this.view().body('mouseover', '.tooltip-enabled > *', this.handler('tooltip'), 20);
          this.view().body('mouseout', '.tooltip-enabled', this.handler('watcher'), 200);
          this.attach(document.body);
          this.$fn('render').run('main').run({});
          this.$wtc = this.control('main').watch();
          this.$tip = this.control('main').io();
        },
        tooltip: function(evt) {
          this.$tip.raf(evt);
        },
        watcher: function(evt) {
          this.$wtc.ap(evt).raf(100);
        }
      },
      control: {
        main: {
          io: function() {
            return this.root().$el().map(function(trg) {
              return function(info) {
                trg.firstElementChild.innerHTML = info.text;
                trg.style.left = (info.x - 20) +'px';
                trg.style.top  = (info.y + 20) +'px';
                trg.style.display = 'block';
                return true;
              };
            }).pipe().run().ap(
              this.klass('io').pure(function(evt) {
                return this.$fn.maybe(evt.target).map(function(elm) {
                  return elm.matches('li') ? elm : elm.closest('li');
                }).prop('getAttribute', evt.currentTarget.getAttribute('data-tooltip')).chain(function(text) {
                  return { text: text, x: evt.x, y: evt.y };
                });
              })
            );
          },
          watch: function() {
            return this.root().$el().lift(function(el, evt) {
              var trg = evt.relatedTarget || evt.target;
              if (!trg.matches('[data-tooltip]') && !trg.closest('[data-tooltip]')) {
                el.style.display = 'none';
              }
              return true;
            });
          }
        }
      },
      events: {
        dom: {
          'click:ul' : 'data.control.main.click',
          'keypress:*':'data.control.main.click'
        }
      }
    };

  });

});
