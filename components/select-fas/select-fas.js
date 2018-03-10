define(function() {

  return this.enqueue({

    name: 'select-fas',

    deps: {

      parent: 'modal',

      templates: [ 'tmpl' ],

      json: [ 'select-fas' ]

    }

  }, function() {

    return {

      ext: {
        main: function() {
          return this.$parent('main');
        },
        bd: function() {
          return this.ctor.parent().prop('$bd');
        },
        toggle: function() {
          return this.$parent('toggle');
        }
      },

      control: {
        main: {
          select: function(evt) {
            var trg = evt.currentTarget;
            if (trg) {
              var item = trg.getAttribute('data-item');
              var root = this.root();
              console.log(item);
              root.state('value', item);
              root.hide();
            }
          }
        }
      },

      tmpl: {

        attr: function() {

          return { 'class' : 'modal modal-fas' };
        }

      },

      events: {
        dom: {
          'click:ul.icons li': 'data.control.main.select'
        }
      }
      
    };

  });

});
