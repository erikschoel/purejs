define(function() {

  return this.enqueue({

    name: 'modules.admin.components.popup',

    deps: {

      parent: 'modules.admin.base',

      components: [ 'view' ]

    }

  }, function() {

    return {
      ext: {
        toggle: function() {
          return this.state('display', this.get('modal').toggle());
        },
        reload: function(item, toggle) {
          return this.parent().maybe().chain(function(app) {
            return app.get('loader').run(app, item, toggle);
          });
        }
      },
      control: {
        config: {
          modal: function(o) {
            return {
              title: sys.get(o.data.schema).lookup(o.data.name).chain(function(schema) {
                return schema.get('meta.desc');
              }) || 'attr.desc',
              attach: '#r0c2'
            };
          }
        }
      }
    };

  });

});
