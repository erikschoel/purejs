define(function() {

  return this.enqueue({

    name: 'core.config',

    deps: {

      core: [ 'pure' ],

      config: [ 'config.json', 'data.json' ]

    }

  }, function() {

    return {

      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(conf) {
            var node, json;
            node = sys.get().node('config');
            json = conf.deps('config.config-json');
            if (json) node.parse(json, 1);
            json = conf.deps('config.data-json');
            if (json) node.parse(json, 1);
            return node;
          }
        })(this);
      }

    };

  });

});
