define(function() {

  return this.enqueue({

    name: 'select-record',

    deps: {

      parent: 'modal',

      templates: [ 'tmpl' ]

    }

  }, function() {

    return {

      ext: {
        main: function() {
          return this.$parent('main');
        },
        toggle: function() {
          return this.$parent('toggle');
        },
        bd: function() {
          return this.ctor.parent().prop('$bd');
        },
        render: function(request) {
          return this.control('main').data(request).run(this.bin(function(comp, data) {
            comp.renderBody('items', { items: data instanceof Array ? data : [ data ] }, true);
            comp.state('value', '');
            comp.toggle();
          }));
        }
      },

      control: {
        main: {
          data: function(request) {
            return sys.get('api.db.data').request().run({ query: request.query }).bind(function(result) {
              return result.map(function(v) {
                return { desc: v.madr_desc || v.madr_code || v.madi_code, id: v.madr_id || v.madi_id, type: v.madr_id ? 'madr' : 'madi' };
              });
            });
          },
          extract: function(trg) {
            if (trg) {
              var item = trg.getAttribute('data-item');
              console.log(item);
              return item;
            }
          },
          select: function(evt) {
            var item = this.extract(evt.currentTarget);
            var root = this.root();
            if (item) {
              root.state('value', item);
              root.hide();
            }
          },
          open: function(evt) {
            var item = this.extract(evt.currentTarget ? evt.currentTarget.previousElementSibling : null);
            if (item) {
              return sys.lookup('components').map(function(app) {
                return app.get('loader').run(app, { value: item }, true);
              });
            }
          }
        }
      },

      tmpl: {

        attr: function() {

          return { 'class' : 'modal modal-record' };
        }

      },

      events: {
        dom: {
          'click:div.items .item': 'data.control.main.select',
          'click:div.items .btn': 'data.control.main.open'
        }
      }
      
    };

  });

});
