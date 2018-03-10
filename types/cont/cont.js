define(function() {

  return this.enqueue({

    name: 'types.cont',

    deps: {

      core: [ 'pure' ]

    }

  }, function() {

    return {

      ext: {
        test: function() {
          console.log('!CONT!');
        }
      }
    };

  });

});
