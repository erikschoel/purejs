define(function() {
  return this.enqueue({

    name: 'modules.auth',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'view', 'modal' ]

    }

  }, function() {

    return {

      ext: {
        main: function() {
          this.attach('#root');
          this.component('modal').run(function(mdl) {
            mdl.read = mdl.view().read().run('main', { title: 'Login' });
            mdl.addButton('login', 'Login');
            mdl.addForm(sys.get('schema.$app.login.fields'), 'form').run(function(f) {
              f.get('data.model').node('main');
              console.log(f);
            });

            mdl.read.attach.run();
            mdl.toggle();
            mdl.proxy('click', 'button', 'auth.login');
            return mdl;
          });
        },
        mounted: function() {
          self.setTimeout(this.get('modal').bin(function(mdl) {
            mdl.focus('[data-bind-name="attr.username"]');
          }), 500);
        },
        submit: function(evt) {
          if (evt.keys && evt.keys.code == 13) {
            this.login();
          }
        },
        login: function() {
          sys.get('user').login(this.get('modal.form.data.model.main.attr').values()).run(function(state) {
            if (state) {
              sys.get('router').navigate('home');
            }
          });
        },
        toggle: function(evt) {
          this.get('modal').toggle();
        }
      },
      schema: {
        login: {
          fields: {
            attr: {
              username: { type: 'text', elem: { tag: 'input', label: 'Username', type: 'text',  placeholder: 'username' } },
              password: { type: 'text', elem: { tag: 'input', label: 'Password', type: 'password',  placeholder: 'password' } }
            }
          }
        }
      },

      events: {
        data: {
          'change:state.display':'toggle',
          'change:auth.login':'login'
        },
        dom: {
          'keypress:*':'submit'
        }
      }

    };

  });
});
