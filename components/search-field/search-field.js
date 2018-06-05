define(function() {

  return this.enqueue({

    name: 'search-field',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [

        'view'

      ]

    }

  }, function() {

    return {
      ext: {
        main: function() {
          this.view().render('main').run();
        }
      }
    };

  });
