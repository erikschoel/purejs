define(function() {

  return this.enqueue({

    name: 'helpers.prism',

    deps: {

      core: [ 'pure' ],

      scripts: [ 'prism' ],

      styles: [ 'prism' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps;
      }
    };

  });

});
