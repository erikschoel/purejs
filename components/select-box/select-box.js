define(function() {

  return this.enqueue({

    name: 'select-box',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'view' ],

      templates: [ 'tmpl' ]

    }

  }, function() {

    return {
      ext: {
        left: function(items) {
          return this.items(items, '.panel-left .panel-body');
        },
        right: function(items) {
          return this.items(items, '.panel-right .panel-body');
        },
        render: function(items, to) {
          return this.$fn('render').run('items', to || '.panel-left .panel-body').run({ items: items });
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
