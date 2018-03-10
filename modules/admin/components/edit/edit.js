define(function() {

  return this.enqueue({

    name: 'modules.admin.components.edit',

    deps: {

      parent: 'modules.admin.base',

      components: [ 'view' ],

      templates: [ 'tmpl' ]

    }

  }, function() {

    return {
      ext: {
        toggle: function() {
          var prnt  = this.parent();
          var data  = prnt.get('data.current');
          var curr  = data.get('modal');
          var next  = this.cid();
          if (curr && curr !== next) {
            prnt.get(curr).get('modal').toggle();
            data.set('modal', next);
            this.get('modal').toggle();
          }else if (!curr) {
            data.set('modal', next);
            this.get('modal').toggle();
          }else {
            var modal = prnt.get(curr).get('modal');
            if (modal.state('display') === 'none') {
              modal.toggle();
            }
          }
        },
        reload: function(item, code) {
          if (code === 'madi_1') {
            return this.closest('admin').control('state').current({ value: 'attributes.' + item.value });
          }else {
            return this.parent().control('main').load(item);
          }
        }
      },
      control: {
        config: {
          modal: function(o) {
            return {
              title: sys.get(o.data.schema).lookup(o.data.name).chain(function(schema) {
                return schema.get('meta.desc');
              }) || 'attr.desc',
              attach: '#r0c2',
              toggle: o.toggle
            };
          }
        }
      }
    };

  });

});
