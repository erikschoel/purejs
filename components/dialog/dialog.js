define(function() {

  return this.enqueue({

    name: 'dialog',

    deps: {

      parent: 'modal',

      templates: [ 'tmpl' ]

    }

  }, function() {

    return {

      ext: {
        initialize: function() {
          this.addButton('Cancel');
          this.addButton('Submit');
        },
        choice: function(options) {
          return this.addForm({
            choice: { elem: { tag: 'radio', options: options } }
          }, 'choice');
        }
      },

      control: {
        main: {
          form: function() {
            return this.root().component('form');
          }
        }
      }
      
    };

  });

});