(function() {
  return sys.load('parse').run([].slice.call(arguments));
})(

  (function MakeDispatcher() {

    return [].slice.call(arguments);
  })(
    (function $$DISPATCHER($wrap, $clean, $schedule, $main, $info, $run, $proc, $shift, $enqueue, $next, $sto) {

      var root = this.store();
      var sys  = root.get('sys');
      var proc = root.get('process');
      var info = $info.call(proc);
      proc.set('clean',    $clean);
      proc.set('schedule', $schedule);
      proc.set('run',      $run);
      proc.set('shift',    $shift);
      proc.set('proc',     $proc);

      var shared = { tick: false, rafNext: 0, isWorker: sys.isWorker };
      var tick   = proc.set('nextTick', $clean('nxt', shared));

      tick.raf   = !sys.isWorker;
      tick.fn    = $proc;
      tick.run   = $run(tick, $wrap);

      if (sys.isWorker) {
        tick.schedule = $schedule(proc.get('native.nxt'), Function.prototype.bind.call($main, tick));
      }else {
        tick.schedule = shared.nextTick = proc.get('native.nxt')(Function.prototype.bind.call($main, tick));

        var raf      = proc.set('animFrame', $clean('raf', shared));
        raf.fn       = $shift;
        raf.run      = $run(raf, $wrap);
        raf.schedule = $schedule(proc.get('native.raf'), Function.prototype.bind.call($main, raf));
        raf.enqueue  = sys.ctor.base.prototype.raf = $enqueue(raf.store,  raf.schedule);
      }
      tick.enqueue = sys.ctor.base.prototype.enqueue = $enqueue(tick.store, tick.schedule);
      tick.next    = $next;
      tick.timeout = sys.ctor.base.prototype.timeout = $sto(tick.enqueue);

      sys.klass('Cont').prop('next', tick.next);
      return proc;
    }),

    // wrapper //
    (function() {
      try {
        return this.fn();
      }catch(e) {
        console.log(e);
        this.store.splice(this.index, 1);
        this.index = 0;
        if (this.store.length) this.schedule();
        return true;
      }
    }),

    // getCleanInfo //
    (function(code, shared) {
      return {
        currts: 0, prevts: 0, donets: 0, lastts: 0, done: 0,
        count: 0, size: 0, length: 0, frameid: 0, index: 0,
        code: code, isRaf: code == 'raf',
        store: [], shared: shared, maxlen: 0
      };
    }),

    // createSchedule //
    (function(timer, fn) {
      return function() {
        return timer(fn);
      }
    }),

    // createMain //
    (function() {
      this.currts = self.now();
      this.prevts = this.length ? this.lastts : this.currts;
      this.donets+= this.currts - this.prevts;
      if (this.isRaf) {
        if (this.store.length && (this.shared.rafNext = (this.currts + 16.667))) {
          this.schedule();
          this.run();
        }else this.shared.rafNext = 0;
        if (this.shared.tick && !(this.shared.tick = 0)) this.shared.nextTick();
      }else if (this.shared.rafNext && (this.limit = this.shared.rafNext - 2)) {
        if ((this.limit - this.currts) > 3) {
          if (!this.run()) {
            if ((this.shared.rafNext - this.lastts) > 6) this.schedule();
            else this.shared.tick = this.shared.rafNext;
          }
        }else this.shared.tick = this.shared.rafNext;
      }else if ((this.limit = this.currts + 8) && !this.run()) {
        if (!this.shared.rafNext || ((this.shared.rafNext - this.lastts) > 6)) this.schedule();
        else this.shared.tick = this.shared.rafNext;
      }
      this.suspend = false;
    }),

    // createInfo //
    (function() {
      return this.set('stats', (function() {
        var time = 0, lim = 0, len = 0, idx = 0, handle = 0;
        var info = {},
          count   = info.count   = 0,
          size    = info.size    = 0,
          length  = info.length  = 0,
          maxlen  = info.maxlen  = 0,
          frameid = info.frameid = 10000,
          runid   = info.runid   = frameid,
          ts      = info.ts      = 0,
          prev    = info.prev    = 0,
          toggle  = 0,
          buffer  = info.buffer = 0,
          handle  = info.handle = 1,
          next    = [],
          id      = 0;
        var refs = [ frameid, time, lim, len, idx ];
        return info;
      })(
        this.node('native').parse({
          sto: self.setTimeout,
          cto: self.clearTimeout,
          raf: self.requestAnimationFrame,
          caf: self.cancelAnimationFrame,
          siv: self.setInterval,
          civ: self.clearInterval,
          nxt: (function(msgchan, sim) {
            return self.isWorker ? sim() : msgchan;
          })(
            (function(process_messages) {
              var message_channel = new MessageChannel();
              var message_state   = { queued: false, running: false };
              function queue_dispatcher()  {
                if (!(message_state.queued && message_state.running)) {
                  message_state.queued = true;
                  message_channel.port2.postMessage(0);
                }
              };
              message_channel.port1.onmessage = function(_) {
                if (!(message_state.queued = false)
                  && (message_state.running = true) && !process_messages())
                    message_state.running = false;//queue_dispatcher();
                else message_state.queued = message_state.running = false;
              };
              return queue_dispatcher;
            }),
            (function() {
              return self.setImmediate;
            })
          )
        })
      ));
    }),

    // createRun //
    (function(info, fn) {
      return Function.prototype.bind.call(fn, info);
    }),

    // coreProc //
    (function() {
      this.maxlen = (this.size = this.length = this.store.length) > this.maxlen ? this.size : this.maxlen;
      this.done   = this.count;
      this.frameid++;

      while(++this.count && this.store.length) {
        if ((this.item = this.store[this.index]) && ++this.item.count && (this.item.frameid || (this.item.frameid = this.frameid)) && this.item.next(this)) {
          if (this.index == 0) {
            this.store.shift();
          }else if (this.store.length - this.index == 1) {
            this.store.pop(); this.index = 0;
          }else {
            this.store.splice(this.index, 1);
          }
          this.index < this.size || (this.index = 0);
        }else if (this.item.frameid < this.frameid) {
          ++this.item.frameid;
        }else if (this.store.length > 1) {
          ++this.index < this.store.length || (this.index = 0);
        }else {
          this.index = 0;
        }
        // if (this.suspend || (this.limit < (this.lastts = self.now()))) break;
        if (this.suspend || ((this.lastts = self.now()) > this.limit)) break;
      };
      this.done = this.count - this.done;
      return (!(this.length = this.store.length));
    }),

    // coreShift //
    (function() {
      this.index   = 0;
      this.maxlen  = ((this.size = this.length = this.store.length) > this.maxlen ? this.size : this.maxlen);
      this.frameid++;
      while(!this.suspend && ++this.count && this.store.length) {
        if (this.store[this.index].next(this)) {
          this.store.splice(this.index, 1);
          this.index < this.store.length || (this.index = 0);
        }else {
          ++this.index < this.store.length || (this.index = 0);
        }
      };
      return (this.lastts = self.now()) && (!(this.length = this.store.length));
    }),

    // enqueue //
    (function(store, run) {
      return function enqueue(item) {
        if (item && (!(store.length * store.push(item.next ? item : { count: 0, frameid: 0, next: item })))) run();
      };
    }),

    // next //
    (function(combine) {
      return function $_next(body) {
        return combine(body);
      };
    })(
      (function $combine($body) {
        return function $_pure($cont) {
          return function() {
             $body($cont);
             return true;
          };
        }
      })
    ),

    // sto //
    (function(enqueue) {
      return function(fn, ms) {
        return self.setTimeout(function() {
          enqueue(function() {
            fn();
            return true;
          });
        }, ms);
      }
    })
  ),

  (function MakeAsync() {

    return [].slice.call(arguments);
  })(
    // === IMPORT / PARSE === //
      (function $$ASYNC(lazy, then, frcb) {
        var utils   = this.store('utils');
        var process = this.store('process');
        var $async  = this.store('async');
        var $cont   = this.klass('Cont');

        $cont.prop('lazy', $async.set('lazy', lazy(process, 'nextTick.enqueue')));
        $async.set('then', then($async.get('lazy')));
        $cont.prop('then', utils.get('andThen')(process.get('lazy')));
        utils.set('fromCallback', frcb.call(process));

        return $async;
      }),
      (function scheduledBindWrap() {
        return [].slice.call(arguments).apply();
      })(
        (function wrapDispatcher(wrap, make, start, cont, done, pure) {
          return function bindDispatch(scheduler, timer) {
            var wrapped = scheduler.set('wrapped', wrap(scheduler));
            scheduler.set('lazy', wrapped(make(pure, cont, timer)));
            return wrapped(make(done, start, timer));
          }
        }),
        (function WrapTimers(scheduler) {
          return function $schedulerWrap(fn) {
            return fn(scheduler);
          }
        }),
        (function MakeWrap(wrapper, starter, path) {
          return function(scheduler) {
            return starter(scheduler.get(path), wrapper);
          }
        }),
        (function StartWrap(schedule, wrapper) {
          return function enqueue(succ) {
            return function $_cont(result) {
              return schedule(wrapper(succ, result));
            }
          }
        }),
        (function ContWrap(schedule, wrapper) {
          return function lazyR(result) {
            return function $_pure(succ) {
              return schedule(wrapper(succ, result));
            }
          }
        }),
        (function $_next(succ, result) {
          return function() {
            return succ(result) || true;
          };
        }),
        (function $_pure(succ, pure) {
          return function() {
            return pure(succ) || true;
          };
        })
      ),
      (function monadicBindWrap() {
        return [].slice.call(arguments).apply();
      })(
        (function makeBind(make, box) {
          return function then(enqueue) {
            return make(box, enqueue);
          }
        }),
        (function make(box, enqueue) {
          return function then(x, f) {
            return function $_pure(succ, fail) {
              return x(box(f, enqueue(succ), fail), fail);
            }
          };
        }),
        (function box(f, succ, fail) {
          return function(t) {
            return f(t)(succ, fail);
          };
        })
      ),
      (function fromCallback(run, list, make, wrap, tick) {
        return function $_fromCallback() {
          return make(list(run, this.get('nextTick.enqueue')), wrap(tick));
        }
      })(
        (function $run(tick, enqueue, list) {
          return function run() {
            if (!(list.length * list.push.apply(list, Array.prototype.slice.call(arguments))))
              enqueue(tick);
            if (!arguments.length) return run;
          };
        }),
        (function $list(run, enqueue) {
          return function(tick) {
            return function(list) {
              return run(tick, enqueue, list);
            };
          };
        }),
        (function $make(next, from) {
          return function fromCallback(continuation) {
            var arr = [];
            return next(from(arr)(continuation))(arr);
          };
        }),
        (function $wrap(fn) {
          return function(arg1) {
            return function(arg2) {
              return fn(arg1, arg2);
            };
          };
        }),
        (function $tick(arr, continuation) {
          return function tick() {
            if (arr.length) continuation(arr.shift());
            return !arr.length;
          };
        })
      )
  ),

  (function MakeTypes1() {

    return [].slice.call(arguments);
  })(
    // === State === //
      (function() {
        return {
          klass: function StateT(f, x) {
            this.$$init(f, x);
          },
          ext: [
            (function $$init(s, m) {
              this.id = this.ctor.$id = this.id();
              this.runStateT  = s;
              this.innerMonad = m;
            }),
            (function map(f) {
              var runStateT = this.runStateT;
              return this.of(function(state) {
                var m = runStateT(state);
                return m.map(function(s) {
                  return { value: f(s.value), state: s.state };
                });
              }, this.innerMonad);
            }),
            (function bind(f) {
              var runStateT = this.runStateT;
              return this.of(function(state) {
                var m = runStateT(state);
                return m.bind(function(s) {
                  return f(s.value).runStateT(s.state);
                });
              }, this.innerMonad);
            }),
            (function join() {
              return this.bind(function(s) {
                return s;
              });
            }),
            (function evalStateT(initState) {
              var st = this.runStateT(initState),
                im = this.innerMonad;
              return st.bind(function(result) {
                return im.pure(result.value);
              });
            }),
            (function execStateT(initState) {
              var st = this.runStateT(initState),
                im = this.innerMonad;
              return st.bind(function(result) {
                return im.pure(result.state);
              });
            })
          ],
          $fn: function(ctor) {
            function pure(v, im) {
              return ctor.of(function(state) {
                return im.pure({ value: v, state: state });
              }, im);
            };
            function lift(m, im) {
              return ctor.of(function(state) {
                return m.bind(function(v) {
                  return im.pure({ value: v, state: state });
                });
              }, im);
            };
            function get(im) {
              return ctor.of(function(state) {
                return im.pure({ value: state, state: state });
              }, im);
            };
            function put(newState, im) {
              return ctor.of(function(state) {
                return im.pure({ value: undefined, state: newState });
              }, im);
            };
            function modify(f, im) {
              return get(im).bind(function(state) {
                var newState = f(state);
                return put(newState, im);
              });
            };
            function gets(f, im) {
              return get(im).bind(function(state) {
                var valFromState = f(state);
                return pure(valFromState, im);
              });
            };
            return {
              pure: pure, lift: lift, get: get, put: put, modify: modify, gets: gets
            };
          },
          init: function(type, klass, sys) {
            klass.attr('$fn', klass.prop('$fn', type.$fn(klass)));
            klass.prop('of', this.find('Functor').prop('of'));
          }
        };
      }),
    // === IO === //
      (function IO() {
        return {
          parent: 'Functor',
          klass: function IO(x) {
            this.$$init(x);
          },
          ext: [
            (function $$init(x) {
              this.id = this.ctor.$id = this.id();
              this.unsafePerformIO = x;
            }),
            (function fx(f) {
              return new this.constructor(f);
            }),
            (function of(x) {
              return new this.constructor(function() {
                return x;
              });
            }),
            (function unit() {
              return this;
            }),
            (function $pure(x) {
              return x ? (x instanceof this.__ ? x : this.constructor.$pure(x)) : this.constructor.$pure;
            }),
            (function $lift(f) {
              return this.constructor.lift(f);
            }),
            (function pure() {
              return this.bind(this.$pure());
            }),
            (function nest() {
              return this.of(this);
            }),
            (function map(f) {
              var thiz = this;
              return this.fx(function(v) {
                return f(thiz.unsafePerformIO(v));
              });
            }),
            (function value(x) {
              return this.pipe().run(x instanceof this.constructor ? x.run() : x);
            }),
            (function filter(f) {
              var thiz = this;
              return this.fx(function(v) {
                return f(v) ? thiz.unsafePerformIO(v) : undefined;
              });
            }),
            (function join() {
              var thiz = this;
              return this.fx(function() {
                return thiz.unsafePerformIO().unsafePerformIO();
              });
            }),
            (function sequence(io) {
              var thiz = this;
              return this.fx(function(v) {
                return thiz.unsafePerformIO(v).ap(io.unsafePerformIO(v)).unit();
              });
            }),                        
            (function bind(f) {
              var thiz = this;
              return this.fx(function(v) {
                return f(thiz.unsafePerformIO()).run(v);
              });
            }),
            (function chain() {
              return this.unsafePerformIO.apply(this, [].slice.call(arguments));
            }),
            (function raf() {
              return this.$fn.raf(Function.prototype.apply.bind(this.unsafePerformIO, this, [].slice.call(arguments)));
            }),
            (function delay() {
              var args = [].slice.call(arguments);
              var time = args.length ? args.shift() : 10;
              return self.setTimeout(Function.prototype.apply.bind(this.unsafePerformIO, this, args), time);
            }),
            (function run() {
              return this.unsafePerformIO.apply(this, [].slice.call(arguments));
            }),
            (function runIO() {
              var args = [].slice.call(arguments);
              if (args.length && args[0] instanceof this.constructor) {
                return this.unsafePerformIO(args.first().run.apply(args.shift(), args));
              }else {
                return this.unsafePerformIO.apply(this, args);
              }
            }),
            (function ap(monad) {
              return this.test(monad) ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
            }),
            (function apply(monad) {
              return monad.ap(this);
            }),
            (function pipe(f) {
              return this.fx(this.$fn.compose(this.unsafePerformIO)(f || this.$pure()));
            }),
            (function lift(f) {
              return f ? this.map(function(v1) {
                return function(v2) {
                  return f.call(this, v1, v2);
                };
              }).pure() : this.lift(this.unsafePerformIO);
            }),
            (function curry() {
              return this.fx(this.$fn.curry(this.unsafePerformIO)).pipe();
            }),
            (function liftIO() {
              return this.nest().lift(function(thiz, next) {
                return this.fx(function(ref) {
                  return thiz.run(ref).ap(thiz.$pure(next));
                });
              });
            }),
            (function flip() {
              return this.constructor.lift(this.$fn.flip(this.unsafePerformIO));
            }),
            (function prop(name) {
              return this.map(this.$fn.prop(name));
            })
          ],
          attrs: (function() {
            return [].slice.call(arguments);
          })(
            (function of(x) {
              return new this(function() {
                return x;
              });
            }),
            (function pure(x) {
              return x instanceof Function ? new this(x) : this.of(x);
            }),
            (function lift(f) {
              return this.of(function(v1) {
                var thiz = this;
                return this.of(function(v2) {
                  return f.call(thiz, v1, v2);
                }).pure();
              }).pure();
            })
          ),
          findType: function(type, name) {
            return type.find(name);
          },
          findStore: function() {
            var find = this.pure(this.$store.db.bin(function(db, uid) {
              return db.find(uid);
            }));
            return find.cache('find', find);
          },
          bindIO: function(io) {
            return io instanceof Function ? this.bindIO(this.fx(io)) : this.fx(this.bin(function(thiz, v) {
              return io.unsafePerformIO(thiz.unsafePerformIO(), v);
            }));
          },
          wrapIO: function(io) {
            return Function.prototype.call.bind(io.unsafePerformIO, io);
          },
          make: function() {
            return {
              klass: [].slice.call(arguments).shift(),
              $$init: function(make) {
                return function(x) {
                  this.unsafePerformIO = make(x()).wrapIO();
                }
              },
              make: [].slice.call(arguments).pop(),
              init: function(type, klass, sys) {
                var io = klass.find('io').proto();
                klass.prop('$$init', type.$$init(type.make));
                klass.prop('$pure', io.$pure.bind(io));
                klass.prop('fx', io.fx.bind(io));
                klass.prop('of', io.of.bind(io));
              }
            };
          },
          makeIO: function(make) {
            return function() {
              var args  = [].slice.call(arguments);
              var klass = args[0] instanceof Function ? args.shift() : this.named(args.shift(), false, false, true);
              return this.parse(make(klass, args.pop()));
            }
          },
          propIO: function(prop) {
            return function(x) {
              return this.pure(prop(x));
            }
          },
          funcIO: function(io) {
            return function(v) {
              return io.of(io.run(v));
            }
          },
          init: function(type, klass, sys) {
            klass.prop('wrapIO', sys.get('utils.call')(type.wrapIO));
            klass.prop('bindIO', type.bindIO);
            klass.attr('make', type.makeIO(type.make));
            klass.prop('funcIO', sys.get('utils.call')(type.funcIO));
            klass.prop('$fn', {
              compose: klass.find('Compose').prop('$fn'),
              enqueue: sys.get('process.nextTick.enqueue'),
              raf: sys.get('process.animFrame.enqueue'),
              flip: sys.get('utils.flip'),
              prop: sys.get('utils.property'),
              curry: sys.get('utils.curry'),
              bind: sys.get('utils.andThen')(klass.$ctor.$pure)
            });
            klass.$ctor.prop = type.propIO(sys.get('utils.property'));
            this.root().prop('$find', klass.pure(this.root).lift(type.findType));
            type.findStore.call(klass);
          }
        };
      }),
    // === Obj === //
      (function() {
        return {
          klass: function Obj(x, r, p) {
            if (!(this instanceof Obj)) return new Obj(x, r, p);
            this._root   = r && r.name == '$_const' ? r : this.konst(r || this);
            this._parent = p || this._root;
            Object.assign(this, this.reduce(unit, x));
          },
          ext: [
            (function of(x, r) {
              if (r) {
                return new this.constructor(x, r === true ? null : r);
              }else {
                return new this.constructor(x, this._root, this.konst(this));
              }
            }),
            (function konst(v) {
              return function $_const() {
                return v;
              }
            }),
            (function isBase(v) {
              return (v || (v = this)).constructor === Function;
            }),
            (function pick() {
              return this.keys().reduce(function(r, k, i) {
                if (r.keys.indexOf(k) > -1) r.res[k] = r.self[k];
                return r;
              }, { self: this, keys: [].slice.call(arguments).flat(), res: {} }).res;
            }),
            (function omit() {
              return this.keys().reduce(function(r, k, i) {
                if (r.keys.indexOf(k) < 0) r.res[k] = typeof r.self[k] === 'object' ? r.self[k].object(true) : r.self[k];
                return r;
              }, { self: this, keys: [].slice.call(arguments).flat(), res: {} }).res;
            }),
            (function map(f, r) {
              return this.keys().reduce(function(r, k, i) {
                if (r.arr) r.res.push(f(r.obj[k], k, i, r.obj));
                else r.res = f(r.res, r.obj[k], k, i, r.obj);
                return r;
              }, { res: r || [], arr: !r || r instanceof Array, obj: this }).res;
            }),
            (function keys(index) {
              var keys = Object.keys(this).filter(function(v, i, o) {
                return v.substr(0, 1) != '_';
              });
              return typeof index === 'undefined' ? keys : (index < keys.length ? keys[index] : null);
            }),
            (function values() {
              return this.keys().reduce(function(r, k, i, a) {
                r.v.push(r.o[k]);
                return r;
              }, { v: [], o: this }).v;
            }),
            (function object(recur) {
              return this.keys().reduce(function(r, k, i, a) {
                r.v[k] = recur && typeof r.o[k] === 'object' ? r.o[k].object(recur === true || (recur - 1)) : r.o[k];
                return r;
              }, { v: {}, o: this }).v;
            }),
            (function get() {
              var args = [].slice.call(arguments);
              return args.length > 1 ? this.path(args.join('.')) : this[args.shift()];
            }),
            (function set(key, value) {
              return this[key] = value;
            }),
            (function call() {
              var args = [].slice.call(arguments);
              if (args.length && args.unshift('fn')) return this.path.call(this._root(), args.join('.'));
              return this._root();
            }),
            (function root(path) {
              return path ? this.path.call(this._root(), path) : this._root();
            }),
            (function parentt(path) {
              return path ? this.path.call(this._parent(), path) : this._parent();
            }),
            (function extend(v, u) {
              Object.assign(this, this.reduce(unit, v, u || false));
              return this;
            }),
            (function update(v) {
              Object.assign(this, this.reduce(unit, v, true));
              return this;
            }),
            (function reduce(f, v, u) {
              return this.keys.call(v).reduce(function(r, k, i, o) {
                var x = f(v[k], k, i, r);
                if (r[k] && r.is(r[k])) {
                  r[k].extend(x, u);
                }else if (u && r[k]) {
                  // update so no overwrites
                }else {
                  r[k] = x instanceof Array
                    ? x : (r.isObject(x) ? r.of(x) : x);
                }
                return r;
              }, this);
            }),
            (function bind(b, m) {
              return function bind(f, r) {
                return b(f, this, m)(r || this.of({}), this, 0);
              }
            })(
              (function(f, o, m) {
                return function $bind(x, r, l) {
                  return o.keys.call(r).bind(function(k, i) {
                    var v = f(x, r[k], k, i, r, l);
                    return v instanceof Array
                      ? v.bind(m(f, (x[k] = o.of({})), i, r[k], l+1, x))
                        : (o.isObject(v) ? $bind((x[k] = o.of({})), v, l+1) : v);
                  }).chain(o.konst(x));//.bind(unit);
                }
              }),
              (function(f, x, t, j, l, o) {
                return function(r, v, k, i) {
                  return f(x, r, v, t, j, l, o);
                }
              })
            ),
            (function fold(b, m) {
              return function fold(f, r) {
                return b(f, this, m)(r || this.of({}), this, 0);
              }
            })(
              (function(f, o, m) {
                return function $fold(x, r, l) {
                  return o.keys.call(r).map(function(k, i, o) {
                    var v = f(x, r[k], k, i, r, l);
                    return v instanceof Array ? v.map(m(f, (x[k] = {}), i, r[k], l+1, x))
                      : (r.isObject(v) ? $fold((x[k] = r.of({})), v, l+1) : v);
                  });                                    
                }
              }),
              (function(f, x, t, j, l, o) {
                return function(r, v, k, i) {
                  return f(x, r, v, t, j, l, o);
                }
              })
            ),
            (function is(x) {
              return x instanceof this.__;//x instanceof Array || typeof x != 'object' ? false : true;
            }),
            (function isObject(x) {
              return x && typeof x == 'object' && (x.constructor == Object || x instanceof this.__) ? true : false;
            }),
            (function info(/* recur, opts */) {
              var args  = [].slice.call(arguments);
              var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
                    (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
              var bind  = this.bind(function(r, v, k, i, o) {
                if (o.is(v)) {
                  console.log([ k ].append(v.values()));
                }else {
                  console.log([ k, v, i ]);
                }
                return v;
              }, args.length && typeof args[0] == 'object' ? args.shift() : null);
              return bind;//recur ? bind.bind(unit) : bind;
            })
          ],
          attrs: [
            (function of(x, r) {
              return x instanceof this ? x : new this(x, r);
            }),
            (function $of() {
              var ctor = this;
              return function() {
                return ctor.of.apply(ctor, arguments);
              }
            })
          ],
          map: function(f) {
            return f(this);
          },
          init: function(type, klass, sys) {
            klass.prop('path', sys.root.get('utils.path'));
            Object.prototype.keys  = sys.get('utils.call')(Object.keys);
            Object.prototype.clone = sys.get('utils.update');
            Object.prototype.obj = sys.get('utils.call')(klass.fromConstructor('$pure'));
            Object.prototype.map = type.map;
            Object.prototype.konst = sys.get('utils.call')()
          }
        };
      }),
    // === Maybe === //
      (function Maybe() {
        return {
          parent: 'Functor',
          klass: function Maybe(x) {
            this.id = this.ctor.$id = this.id();
            if (x || typeof x != 'undefined') this._x = x;
          },
          ext: [
            (function prop() {
              var args = Array.prototype.slice.call(arguments);
              return this.map(this.$fn.prop(args.shift()).apply(undefined, args));
            }),
            (function get(key) {
              return this.map(this.$fn.pget(key));
            }),
            (function values(recur) {
              return this.map(this.$fn.pval(recur));
            }),
            (function find(key) {
              return this.map(this.$fn.pfind(key));
            }),
            (function isValue(value) {
              return this.$isNothing(value) ? null : { value: value };
            }),
            (function $isNothing(v) {
              return v === null || v === undefined || v === false;
            }),
            (function isNothing() {
              return this._x === null || this._x === undefined || this._x === false;
            }),
            (function isSome() {
              return !this.isNothing();
            }),
            (function ifSome(mf) {
              return this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
            }),
            (function ifNone(mf) {
              return !this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
            }),
            (function filter(f) {
              return this.map(function(v) {
                if (f(v)) return v;
              });
            }),
            (function chain(f) {
              if (f instanceof Function) {
                return this.ifSome(f || unit);
              }else if (this._x instanceof Function) {
                return this.ifSome(this.$fn.pure(f));
              }else {
                return this.ifSome(f);
              }
            }),
            (function orElse(mv, ctx) {
              return this.isNothing() ? new this.constructor(mv instanceof Function ? mv.call(ctx) : mv) : this;
            }),
            (function map(mf) {
              return this.ctor.of(this.chain(mf));
            }),
            (function run(f) {
              return this.chain(f || unit);
            }),
            (function ap(other) {
              return this.is(other) ? this.map(function(x) {
                return x instanceof Function ? (this.test(other) ? other.chain(x) : other.map(x)) : (x.ap ? x.ap(other) : other.run(x));
              }) : (other instanceof Function ? this.of(other).ap(this._x) : this.ap(this.of(other)));
            }),
            (function apply(other) {
              return other.ap(this);
            }),
            (function unit() {
              return this._x;
            }),
            (function join() {
              return this._x;
            }),
            (function toIO() {
              return this.chain(this.$fn.io.pure);
            }),
            (function isIO() {
              return this.chain(function(x) {
                return this.$fn.io.is(x);
              });
            }),
            (function toMaybeIO() {
              return this.$fn.io.of(this).lift(function(mbfn, value) {
                return mbfn.chain(function(fn) {
                  return this.of(value).chain(fn);
                });
              });
            })
          ],
          attrs: [
            (function of(x) {
              return x && x instanceof this ? x : new this(x);
            }),
            (function list(x) {
              return this.of(x.map(this.ctor.of).filter(function(x) {
                return x.isSome();
              })).filter(function(x) {
                return x.length;
              }).map(function(x) {
                return x instanceof Array ? x.map(item => item instanceof this.__ ? item.unit() : item) : x;
              });
            }),
            (function pure(x) {
              return new this(x);
            })
          ],
          toMaybe: function($maybe) {
            return function() {
              return this.map($maybe.of);
            }
          },
          runMaybe: function($maybe) {
            return function(v) {
              return $maybe.of(this.run(v));
            }
          },
          maybe: function($maybe) {
            return function(cache) {
              return cache !== false ? (this._maybe || (this._maybe = $maybe.of(this))) : $maybe.of(this);
            }
          },
          lookup: function($maybe) {
            return function() {
              var args = [].slice.call(arguments).flat().filter(unit);
              return args.length ? this.lookup(args.join('.')) : (this._maybe || (this._maybe = $maybe.of(this)));
            }
          },
          cont: function() {
            return this.chain(this.$fn.cont.pure);
          },
          init: function(type, klass, sys) {
            var root = this.$store.root, utils = root.get('utils');
            var prop = utils.get('property');
            var IO   = this.find('IO');
            klass.prop('$fn', {
              prop: prop,
              pget: prop('get'),
              pval: prop('values'),
              pfind: prop('find'),
              pure: sys.get('async.pure'),
              io: IO, cont: this.find('Cont')
            });
            klass.prop('curry', utils.get('curry'));
            this.find('Functor').prop('toMaybe',  type.toMaybe(klass));
            IO.prop('runMaybe', type.runMaybe(klass));
            IO.prop('$fn').maybe = klass.of;
            // this.root().base
            Object.prototype.maybe = type.maybe(klass);
            this.find('Node').prop('maybe', type.lookup(klass));
          }
        };
      }),
    // === List === //
      (function List() {
        return {
          parent: 'Maybe',
          klass: function List(x) {
            this.$$init(x);
          },
          ext: [
            (function unit() {
              return this._x && this._x instanceof Array ? this._x.map(mb => mb.unit ? mb.unit() : mb) : this._x;
            })
          ],
          of: function($maybe, $list) {
            return function(x) {
              return x && x instanceof $maybe ? x : new $list(x);
            }
          },
          init: function(type, klass, sys) {
            klass.$ctor.list = this.$ctor.list;
            klass.of = klass.prop('of', klass.$ctor.$of = klass.$ctor.of = type.of(this.$ctor, klass.$ctor));
          }
        };
      }),
    // === Either === //
      (function Either() {
        return {
          parent: 'Maybe',
          klass: function Either(x) {
            this.$$init(x);
          },
          ext: [
            (function $$init(x) {
              return this._x = this.$fn.either(x);
            })
          ],
          left: {
            klass: function Left(x) {
              this.__value = x;
            },
            ext: [
              (function map(f) {
                return this;
              })
            ],
            of: function(Left) {
              return (Left.of = function(x) {
                return new Left(x);
              });
            },
            init: function(type, klass, sys) {
              klass.$ctor.of = type.of;
            }
          },
          right: {
            klass: function Right(x) {
              this.__value = x;
            },
            ext: [
              (function map(f) {
                return Right.of(f(this.__value));
              })
            ],
            of: function(Right) {
              return (Right.of = function(x) {
                return new Right(x);
              });
            },
            init: function(type, klass, sys) {
              klass.$ctor.of = type.of;
            }
          },
          either: function() {
            var Either = this.Either = this.prop('curry')(function(f, g, e) {
              if (!e) return f();
              else if (!e.constructor) return f(e);
              else if (e instanceof Left) return f(e.__value);
              else if (e instanceof Right) return g(e.__value);
              else return f(e);
            });
            this.prop('toEither', function(failVal) {
              return this.isNothing() ? this.left(failVal) : this.right(this.mv);
            });
            return Either;
          },
          init: function(type, klass, sys) {
            var either = type.either.call(this);
            klass.prop('$fn', {
              left: this.parse(type.left),
              right: this.parse(type.right),
              either: either
            });
          }
        };
      }),
    // === Bind === //
      (function() {
        return {
          klass: function Bind(f, x, m) {
            if (f) this._f = f;
            if (x) this._x = x;
            if (m) this._m = m;
          },
          ext: [
            (function collect() {
              return [].slice.call(arguments).apply();
            })(
              (function wrap(_$_const, _$_close, $wrap, $cont, $collect, $make, $pure, $run, $set, $next) {
                function collect(scheduler, async) {
                  return _$_close.call({}, $wrap, $collect, $cont(
                    $pure($next, scheduler.get('nextTick.enqueue')),
                      $run, $set, _$_const, async.lazy), scheduler.parent('utils.extend'),
                        { pure: true, arr: true, cont: false, val: true, other: true, done: true }, $make)
                };
                collect['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                  r[v.name] = v;
                  return r;
                }, {});
                return collect;
              }),
              (function _$_const() {
                return undefined;
              }),
              (function _$_close(wrap, collect, make, extend, proc, run) {
                this.make = make;
                this.wrap = collect(this.make, extend, proc);
                this.collect = wrap(this.wrap, run);
                return this;
              }),
              (function _$_wrap($collect, $make) {
                return function collect(x, p, f) {
                  return p || f ? $make($collect(x), p, f) : $collect(x);
                } 
              }),
              (function _$_cont($pure, $run, $set, $empty, $lazy) {
                return function wrap(x, k, p, f) {
                  return $pure(x.slice(0),
                    $run(wrap, p), [], $set(x.length, $lazy(k), f || unit));
                }
              }),
              (function _$_run($run, $extend, $proc) {
                return function run(x) {
                  return function $_pure(k, p, f) {
                    return $run(x, k, p ? (p.done ? p : $proc.clone(p)) : $proc, f);
                  }
                };
              }),
              (function _$_make(x, p, f) {
                return function $_pure(k) {
                  return x(k, p, f);
                };
              }),
              (function pure(next, enqueue) {
                return function(x, f, v, s) {
                  enqueue(next(x, f, v, s));
                }
              }),
              (function get(run, proc) {
                return function collect(x, s) {
                  if (proc.pure && x && x.name == '$_pure' && x instanceof Function) {
                    return x(function(r) { collect(r, s); });
                  }else if (proc.arr && x instanceof Array) {
                    return x.length ? (x.length == 1
                      ? collect(x.shift(), s)
                        : run(x, s, proc))
                      : s(x);
                  }else if (proc.val) {
                    return s(x);
                  }
                };
              }),
              (function set(c, k, f) {
                return function(v, i) {
                  return function(r) {
                    v[i] = r;
                    if (c && !--c) {
                      k(f(v));
                    }
                  }
                }
              }),
              (function next(x, f, v, s) {
                return function() {
                  if (x.length) {
                    f(x.shift(), s(v, v.push(undefined) - 1));
                  }
                  return !x.length;
                }
              })
            ),
            (function each(map, bind) {
              return function each(x, f) {
                return x.chain(bind(map(f)));
              };
            })(
              (function(f) {
                return function(x) {
                  return x instanceof Array ? x.flatten().chain(f) : x;
                }
              }),
              (function(f) {
                return function each(x) {
                  if (x instanceof Array) {
                    return x.map(f);
                  }else {
                    return x;
                  }
                };
              })
            ),
            // === Monadic Bind Array == //
            (function bind() {
              var args = [].slice.call(arguments);
              return function(extend, proc) {
                return args.append(extend, proc).apply();
              }
            })(
              (function make(main, init, make, bind, $_map, $_make, $_bind, $_wrap, extend, proc) {
                return bind(main($_wrap, extend, proc), init($_map, $_bind), make($_make, $_map));
              }),
              (function main($_wrap, $extend, $proc) {
                function $_main(f, p) {
                  return $_wrap(f, !p.done ? $extend(p, $proc) : p);
                };
                $_main['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                  if (v && v.name && v instanceof Function) r[v.name] = v;
                  return r;
                }, {});
                return $_main;
              }),
              (function init($_map, $_bind) {
                return function $_init(w) {
                  return $_bind(w, $_map);
                }
              }),
              (function make($_bind, $_map) {
                function $_make(f, x) {
                  return $_map(f, x);
                };
                $_make['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                  r[v.name] = v;
                  return r;
                }, {});
                return $_make;
              }),
              (function(main, init, make) {
                function bind(f, p) {
                  p || (p = this.aid());
                  return make(init(main(f, p)), this).aid(p);
                };
                bind['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                  r[v.name] = v;
                  return r;
                }, {});
                return bind;
              }),
              (function map(f, x) {
                return x && x instanceof Array ? x.map(f(x)) : x;
              }),
              (function make(x, f, m) {
                return function $_pure(k) {
                  return k(m(f, x.slice(1)));
                }
              }),
              (function bind(f, m) {
                return function next(o) {
                  return function bound(x, i) {
                    return f(x, i, o);//x instanceof Array ? m(next, x) : f(x, i, o);
                  };
                };
              }),
              (function $_closed(f, p) {
                return function closed(x, i, o) {
                  return function $_pure(k) {
                    if (p.pure && x instanceof Function && x.name == '$_pure') {
                      return x(function(r) {
                        return closed(r, i, o)(k);
                      });
                    }else if (p.arr && x instanceof Array) {
                      return x.length == 1 ? closed(x.shift(), i, o)(k)
                      : (!x.length ? k(x) : x.map(closed).make(k, p));//x.bind(m(x), p).run(k));
                    }else if (p.cont && x && x.cont instanceof Function && x.cont.name == '$_cont') {
                      return closed(x.cont(), i, o)(k);
                    }else if (p.val) {
                      return k(f(x, i, o));
                    }
                  }
                }
              })
            ),
            (function cont() {
              return sys.klass('Cont').of(this, function(a) {
                return function $_pure(k) {
                  return a.wrap(k);
                }
              });
            }),
            (function make(cnst, bind, run) {
              return function make(b, m, c) {
                return bind(run, b, m || unit, c || cnst);
              }
            })(
              (function cnst(v) {
                return function() {
                  return v;
                }
              }),
              (function bind(r, b, m, c) {
                return function(f, g) {
                  return r(b(f, g, m), g, c);
                }
              }),
              (function run(f, g, c) {
                return function(v, r) {
                  r || (r = {});
                  return g.run(v).bind(f(r, v, 0)).chain(c(r));
                }
              })
            ),
            (function run(f) {
              return this.make(this._f, this._m)(f, this._x);
            })
          ],
          attrs: [
            (function pure(f, g, m) {
              return new this(f, g, m);
            })
          ],
          make: function(binds) {
            return binds.set('make', function(type) {
              return function(impl) {
                return binds.get('data', type)(binds.get('types', type).run(

                  typeof impl == 'string'
                    ? binds.get('impl', type, impl).apply(undefined, [].slice.call(arguments, 1))
                      : impl
                ));
              }
            });
          },
          binds: function() {
            return this.parse({
              types: {

                store: this.klass('Bind').pure(function(f, g, m) {

                  // f --> effect function
                  // g --> input adapter (optional)
                  // m --> level change assistant (optional)

                  function $next(k, r, l) {
                    return function(x) {
                      return function(v) {
                        if (r && r.is && r.is(v))
                          return v.vals().bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                        else if (v instanceof Array)
                          return v.bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                        else return v;
                      }
                    }
                  };

                  function $kont(l) {
                    return function(x, r) {
                      return m($bind(x, r, l+1));
                    }
                  }

                  function $bind(x, r, l) {

                    return function $fn(v, i, o) {
                      var k = r && r.keys ? r.keys(i) : v.name;
                      return f(x, v, k, i, r || o)($next(k, r, l), $kont(l));
                    };

                  };

                  return $bind;

                }, this.ctor.$find.ap('Store').lift(function(node, value) {

                  return node.is(value) ? value.vals() : (value instanceof Array ? value : [ value ]);

                }), function(f) {

                  return function(x, v, k, i, o) {
                    return f(v, i, o);
                  }

                }),

                object: this.klass('Bind').pure(function(f, g, m) {

                  return function $bind(x, r, l) {

                    return function $fn(k, i, o) {
                      var v = f(x, r[k], k, i, r, l);
                      return v instanceof Array ? v.bind(m(f, (x[k] = {}), k, v, l+1))
                      : (typeof v == 'object' && v.constructor.name == 'Object' ? g(v).bind($bind((x[k] = {}), v, l+1)) : v);
                    };

                  };

                }, this.ctor.$find.ap('Obj').lift(function(node, value) {

                  return node.is(value) ? value.keys()
                    : (value instanceof Array ? value
                      : (typeof value == 'object' ? Object.keys(value) : [ value ]));

                }), function(f, t, j, x, l) {

                  return function(v, i, o) {
                    return f(t, v, j, x, l);
                  }

                })
              },
              impl: {

                store: {

                  fold: function(f) {
                    return function(r, v, k, i, o) {
                      if (f) {
                        return f(r, v, k, i, o);
                      }else if (r instanceof Array) {
                        if (v && v.name) {
                          r.push(v);
                        }else {
                          r[r.push({})-1][k] = v;
                        }
                      }else {
                        r[k] = v;
                      }
                      return v;
                    }
                  },

                  filter: function(expr) {
                    return function(r, v, k, i, o) {
                      if ((v && typeof v == 'string' && v.like(expr))
                        || (k && typeof k == 'string' && k.like(expr))
                        || (o && o.isStore && o.identifier && o.identifier().like(expr))) {
                        r[k] = v;
                      }
                      return v;
                    }
                  },

                  info: function() {
                    return function(r, v, k, i, o) {
                      r[k] = v;
                      console.log('Bind', o && o.is ? [ o.identifier(), k, v, i ] : [ v, o, i ]);
                      return v;
                    }
                  }
                },
                object: {

                  fold: function(f) {
                    return function(r, v, k, i, o) {
                      if (f) {
                        r = f(r, v, k, i, o) || r;
                      }else if (r instanceof Array) {
                        if (v && v.name) {
                          r.push(v);
                        }else {
                          r[r.push({})-1][k] = v;
                        }
                      }else {
                        r[k] = v;
                      }
                      return v;
                    }
                  },

                  info: function() {
                    return function(r, v, k, i, o) {
                      r[k] = v;
                      console.log(v, k, i);
                      return typeof v == 'string' ? ('!!' + v + '!!') : v;
                    }
                  }
                }
              },
              data: {

                store: function(bind) {

                  return function(store) {

                    return function(value) {

                      return bind(store.store(), value);
                    };
                  };
                },
                path: function(bind) {

                  return function(path, value) {

                    return bind(sys.get(path).store(), value).bind(unit);

                  };
                },
                object: function(bind) {

                  return function(obj, value) {

                    return bind(obj, value || {});

                  };
                }
              }
            });
          },
          init: (function(wrap, set, make, ext) {
            return function(type, klass, sys) {
              return type.make(type.binds.call(sys.get().child('binds'), ext(make.call(set(wrap({
                klass: klass,
                scheduler: sys.get('process'),
                enqueue: sys.get('process.nextTick.enqueue'),
                Cont: klass.find('Cont').of,
                functor: klass.find('Functor'),
                maybe: klass.find('Maybe'),
                list: klass.find('List'),
                aid: this.makeID('arr'),
                log: sys.log,
                utils: sys.get('utils').select('atom', 'call', 'call1', 'call2', 'andThen', 'pass', 'target', 'extend'),
                async: sys.get('async').select('pure', 'cast', 'make', 'select', 'get', 'next', 'combine', 'flatmap', 'fmap', 'wrap', 'then', 'lazy')
              }))))));
            };
          })(
            (function(ext) {
              ext.cont = ext.utils.andThen(ext.async.cast);
              return ext;
            }),
            (function(ext) {
              var set = ext.klass.prop('collect')(ext.scheduler, ext.async);
              Array.prototype.__      = ext.functor.$ctor;
              Array.prototype.maybe   = ext.utils.call(ext.maybe.fromConstructor('list'));
              Array.prototype.collect = ext.utils.call2(set.collect);
              Array.prototype.wrap    = ext.utils.pass(set.wrap);
              Array.prototype.make    = ext.utils.call2(set.make);
              Array.prototype.arrid   = ext.aid;
              Array.prototype.info    = ext.utils.call(sys.get('utils.point.map')(ext.log));
              Array.prototype.klass   = ext.functor.find;
              Array.prototype.to      = ext.functor.to;
              Array.prototype.functor = ext.utils.call(ext.functor.pure);
              return ext;
            }),
            (function() {
              Array.prototype.aid = function(aid) {
                return aid && (this._aid = aid) ? this : (this._aid || (this._aid = { aid: this.arrid() }));
              };
              Array.prototype.each    = this.utils.call1(this.klass.prop('each'));
              Array.prototype.bind    = this.klass.prop('bind');
              Array.prototype.next    = this.utils.call2(this.async.next);
              Array.prototype.combine = this.utils.call2(this.async.combine);
              Array.prototype.target  = this.utils.target;
              Array.prototype.select  = this.async.select;
              Array.prototype.dequeue = this.utils.atom(function(f) {
                return f ? f() : null;
              }, function(x) {
                return x.shift();
              });
              Array.prototype.call = function() {
                return (function() {
                  return this.arr.length ? this.fn(this.arr.shift()) : null;
                }).bind({ arr: this, fn: [].slice.call(arguments).shift() || unit });
              };
              Array.prototype.ap = function() {
                var args = [].slice.call(arguments);
                if (args.length > 1) {
                  return this.combine(function(x, y) {
                    return y.run(x);
                  }, args);
                }else {
                  return [ function(a, x) {
                    return a.bind(function(v, i) {
                      return x.run(v, i);
                    });
                  }, this, args.shift() ].apply();
                }
              };
              Array.prototype.lift = function(f) {
                return [ this.fmap(function(xs) {
                  return f.apply(undefined, xs);
                }) ];
              };
              Array.prototype.fold = function(f, r) {
                return [ this.fmap(function(xs) {
                  return f.apply(undefined, xs);
                }) ];
              };
              Array.prototype.flatten = function() {
                return this.flatmap(unit);
              };
              Array.prototype.chain = function(f) {
                return [ this.fmap(function(r) {
                  return f(r && r.length == 1 ? r.first() : r);
                }) ];
              };
              Array.prototype.list = this.utils.call(this.list.fromConstructor('list'));
              return this;
            }),
            (function(ext) {
              Array.prototype.run = function(/* k, o, f */) {
                var args = [].slice.call(arguments), k, o, f;
                while (args.length) {
                  if (typeof args[0] == 'object') o = args.shift();
                  else if (args[0] instanceof Function) {
                    if (!k) k = args.shift(); if (!f) f = args.shift();
                  }else {
                    args.shift();
                  }
                }
                o || (o = {}); o.aid || (o.aid = this.arrid());
                return (f ? this.bind(f, o) : this).wrap(ext.async.get(k || unit), o);
              };
              Array.prototype.fmap = function(f, p) {
                return ext.async.then(this.collect(p), ext.cont(f));
              };
              Array.prototype.flatmap = function(f) {
                return this.bind(f).chain(ext.async.flatmap(unit));
              };
              Array.prototype.cont = function() {
                return this.length == 1 && this[0] instanceof Function && this[0].name == '$_pure'
                ? ext.Cont(this.first()) : ext.Cont(this.collect(), function(r) {
                  return function $_pure(k) {
                    return k(r && r.length == 1 ? r.first() : r);
                  }
                });
              };
              Array.prototype.kont = function() {
                return this.cont().cont();
              };
              return ext;
            })
          )
        };
      }),
    // === Index === //
      (function() {
        return {
          parent: 'Store',
          klass: function Index(x) {
            this.$super(x, 'index');
          },
          attrs: [
            (function of(x) {
              return (new this(x)).maybe();
            })
          ],
          make: function(cid, uid) {
            if (uid && !this._idx.get(cid)) this._idx.set(cid, uid);
            return this._idx.get(cid);
          },
          index: function($index, $make) {
            return function(cid, node) {
              this._idx = $index.of(this);
              return (this.$index = $make).call(this, cid, node ? node.uid() : null);
            }
          },
          node: function(key, value) {
            return this._store.$index(key, value);
          },
          init: function(type, klass, sys) {
            this.prop('$index', type.index(klass, type.make));
            this.find('$node').prop('$index', type.node);
          }
        };
      }),
    // === Link === //
      (function() {
        return {
          parent: 'Store',
          klass: function Link(x, name) {
            this.$super.call(this, x, name || 'link');
          },
          ext: [
            (function cid() {
              return this._cid;
            }),
            (function mode(mode) {
              return this.get(this.set('mode', mode)) || this.child(mode);
            }),
            (function use(arg) {
              var args = arg instanceof Array ? arg : [].slice.call(arguments);
              var key  = this.set('key', typeof args[0] == 'string' ? args.shift() : 'vals');
              return this.get(key) || this.node(key);
            }),
            (function pick(key) {
              return this.use(key).ref();
            }),
            (function add() {
              var args = [].slice.call(arguments);
              var rec  = this.use(args);
              rec.push(this.data.get(this.cid()).apply(this, args));
              return this;
            }),
            (function make(path, type, items) {
              var root  = this.initial();
              var parts = path.split('.');
              var name  = parts.pop();
              var store = parts.length ? (root.get(parts) || root.ensure(parts)).store() : root.node(name).store();
              if (items) store.parse(this.klass('Obj').of(items));
              return store.link(type);
            }),
            (function coyo() {
              var args = [].slice.call(arguments);
              var node = this.initial(args.pop());
              node.parse(this.klass('Obj').of({
                base: {
                  run: function(r, k) {
                    var v = this.root(k);
                    if (v instanceof Function) {
                      r = v(r);                             
                    }else if (typeof v == 'object') {
                      if (v.$$map && v.$$run) {
                        r = v.$$run(r).call(v, r);
                      }else if (v.$$map) {
                        r = v.$$map(r);
                      }else if (r.$$map) {
                        r = r.$$map(r);
                      }else if (v.base) {
                        r = v.base(r);
                      }
                    }
                    return r;
                  }
                },
                node: this.konst(node.get('node') || node),
                $$link: this.konst(this),
                $$run: function(v) {
                  return this[this.$$map(v)] || unit;
                }
              }).extend(args.shift()));
              return this.klass('Coyoneda').of(function(base) {
                return function(evt) {
                  return base.run(evt);
                }
              }, this.add(node.cid(), args.shift() || {}, 'base', node.cid()).resolve(node.cid(), 'base'));
            }),
            (function run() {
              var args = [].slice.call(arguments), rec, path, link;
              if (typeof args[0] == 'string') {
                if (args.length > 1 && args[0].indexOf('.') > 0) {
                  path = args.shift().split('.');
                  link = this.idx.get(path.slice(0, -1).join('.'));
                  return link.run.apply(link, args.prepend(path.last()));
                }else if (this.has(args[0]) && this.is(this.get(args[0]))) {
                  this.pick(args);
                }else if (this.has('idx')) {
                  link = this.get('idx').get('valueMap');
                  return link.run.apply(link, args);
                }
              }
              return this.ops.get(this.cid()).apply(this.current(), args);
            })
          ],
          link: function() {
            var args = [].slice.call(arguments);
            var mode = args.shift(), path, node, link, name;
            if (args.length) {
              path = args.shift();
              name = path.split('.').first();
              node = (this.get(path) && this.get(name)) || (this.ref().ensure(path).set('node', this.ref()).get(name).store());
              if (args.length) node.parse(args.shift());
            }else {
              node = this;
            }
            link = node._link || (node._link = node.$link(node, mode));
            return mode ? link.mode(mode) : link;
          },
          vmap: function(/* path, objs */) {
            var args = [].slice.call(arguments);
            var path = args.shift();
            var coyo = this.get(path.concat('.coyo'));
            if (coyo) return coyo;

            var link = this.link('valueMap', path);
            var name = path.split('.').last();
            var coyo = link.coyo(args.shift() || {}, name);
            return this.get(path).set('coyo', coyo);
          },
          haslink: function() {
            return this._link;
          },
          ops: function() {
            this.set('mapF', function(value) {
              var rec = this.current() || [], idx = 0, key = this._cid, val = this.initial(key);
              while (idx < rec.length) {
                if (rec[idx].filter(value)) break;
              }
              return val instanceof Function
                ? (idx < rec.length ? val(rec[idx].map(value)) : val(value))
                : (idx < rec.length ? rec[idx].map(val || value) : (val || value));
            });
            this.set('valueMap', function(value, maponly) {
              var rec = this.current().first();
              var arg = value.split('.');
              var fst = arg.shift();
              var map = rec.map.lookup(fst).chain(function(val) {
                return arg.length ? val.get(arg.join('.')) : val;
              }) || (rec.def ? (rec.map.get(rec.def) || value || rec.def) : null);
              //var map = rec.map.get(value || rec.def) || (rec.def ? (rec.map.get(rec.def) || value || rec.def) : null);// || value;
              if (maponly) return map;
              var ini = rec.lookup ? this.initial(rec.lookup === true ? value : value.path(rec.lookup, true)) : this.initial();
              return map instanceof Array ? ini.select(map) : (ini.get(map) || (rec.def && ini.get(rec.def)));
            });
            this.set('typeMap', function(value) {
              var rec = this.current().first();
              return rec.map.get(this.initial(value || rec.def) || this.initial(rec.def) || rec.def);
            });
            return this;
          },
          data: function() {
            this.set('mapF', function(map, filter) {
              return { filter: filter || (function() { return true; }), map: map || unit };
            });
            this.set('filterM', function(filter, map) {
              return { filter: filter || (function() { return true; }), map: map || unit };
            });
            this.set('valueMap', function(map, def, lookup) {
              var rec = this.get(this.get('key'));
              return { map: rec.node('map').parse(map, true), def: def, lookup: lookup || false };
            });
            this.set('typeMap', function(map, def, lookup) {
              var rec = this.get(this.get('key'));
              return { map: rec.node('map').parse(map, true), def: def, lookup: lookup || false };
            });
            return this;
          },
          idx: function() {
            this.child('store');
            this.child('mapF');
            this.child('filterM');
            this.child('valueMap');
            this.child('typeMap');
            this.child('other');
            return this;
          },
          child: function($child, $maintype, $store) {
            return function(name, ctor, ref) {
              if ($maintype.test(name)) {
                return $store.set(''+this.uid(), this.set(name, $child.call(this, name, ctor, ref)));
                //return this.set(name, this.idx.get(name));// || this.idx.$child.call(this, name, ctor, ref);
              }else if ($maintype.test(this._cid)) {
                var link = this.idx.get(this._cid) || this.idx.get('other');
                var inst = link.get(name) || link.set(name, $child.call(this, name, ctor, ref));
                return this.set(name, inst);
              }else {
                return $child.call(this, name, ctor, ref);
              }
            }
          },
          $$_of: function($ctor, $idx, $store) {
            return function $$_of(ref, name) {
              if (ref instanceof $ctor) {
                return $store.get(''+ref.uid()) || $store.set(''+ref.uid(), new this(ref, ref.cid()));
              }else if (typeof ref == 'string') {
                return this.$$_of($store.root.get(ref) || sys.get().ensure(ref).store(), name);
              }else {
                return new this(ref, name);
              }
            }
          },
          ask: function() {
            return this.run.apply(this, [].slice.call(arguments).append(true));
          },
          attrs: [
            (function of(ref, name) {
              return this.$$_of(ref, name);
            })
          ],
          init: function(type, klass, sys) {
            var $store = klass.$store.ctor;
            $store.prop('$link', klass.of);
            $store.prop('link', type.link);
            $store.prop('vmap', type.vmap);
            $store.prop('haslink', type.haslink);
            var link = klass.prop('root').child('link', klass.$ctor).store();
            klass.prop('data', type.data.call(link.child('data')));
            klass.prop('ops', type.ops.call(link.child('ops')));
            var $idx = klass.prop('idx', type.idx.call(link.child('idx')));
            var $str = $idx.get('store');
            klass.prop('child', type.child($store.prop('child'), new RegExp(/(mapF|filterM|valueMap|typeMap|foldMap)/), $str));
            klass.$ctor.$$_of = type.$$_of($store.$ctor, $idx, $str);

            klass.prop('ask', sys.fn.curry(type.ask, true, 2));
            klass.prop('resolve', sys.fn.curry(klass.prop('run'), true, 2));
          }
        };
      }),
    // === Record === //
      (function() {
        return {
          parent: 'Node',
          klass: function Record(x) {
            this.$super(x);
            this.store().lock();
          },
          ext: [
            { name: '_children', value: 'nodes' },
            (function parent() {
              if (this._parent.cid() === 'nodes') {
                return this._parent.parent();
              }else {
                return this._parent;
              }
            }),
            (function current() {
              var args = [].slice.call(arguments);
              return args.length ? this.get(args.flat().join('.')) : this;
            }),
            (function dbid() {
              if (!this.get('dbid')) {
                this.set('dbid', this.lookup('madi').prop('replace', 'madi', 'create').unit());
              }
              return this;
            }),
            (function mare() {
              return this.lookup('dbid').lift((dbid, madi) => {
                return madi.replace('madi', 'mare') === dbid ? madi : dbid;
              }).ap(this.lookup('madi'));
            }),
            (function madi() {
              return this.lookup('marl').filter(m => m.indexOf('_') > 0).orElse(this.get('madi')).orElse(this.cid()).unit();
            }),
            (function load() {
              return this.lookup(this.madi());
            }),
            (function object(recur) {
              return this.children().reduce(function $reduce(r, v, k, o) {
                if (o.is(v)) {
                  if (k === 'attr') {
                    r.result[k] = v.values(true);
                  }else if (recur !== false && k.indexOf('madi') === 0) {
                    if ((r.key = r.record.code(k)) === 'options') {
                      r.result[r.key] = v.ref().children().map(function(opt) {
                        return { id: 'attr.answer', value: opt.get('dbid'), label: opt.get('attr.desc') };
                      });
                    }else {
                      r.result[r.key] = v.ref().object();
                    }
                  }
                }else {
                  r.result[k] = v;
                }
                return r;
              }, { result: {}, record: this }).result;
            }),
            (function retrieve(dbid) {
              return this.$model.retrieve(dbid);
            }),
            (function toJSON(recur) {
              var data = this.object(recur === true).clone(this.select('dbid', 'madi', 'marl', 'madr', 'marr','count','attr'));
              return data.keys().reduce(function(r, k) {
                if (typeof data[k] === 'object') {
                  r = r.clone(data[k]);
                }else {
                  r[k] = data[k];
                }
                return r;
              }, { uid: this.uid(), count: this.children().filter((v, k) => k.match(/^(madi|mare)\_[0-9]+$/) && v.length()).length });
            }),
            (function code(key) {
              return this.$schema.get('$app').lookup(key).map(function(schema) {
                return schema.get('attr.name') || schema.get('attr.code');
              }).chain(function(code) {
                return code.split('.').pop();
              }) || key;
            }),
            (function schema() {
              return this.$schema.lookup('$app').lift(function(schema, code) {
                return schema.get(code);
              }).ap(this.madi());
            }),
            (function related(code, first) {
              return this.maybe().lift(function(node, schema) {
                return node.get(schema.cid()) || node.get(node.children().keys(0), schema.cid());
              }).ap(this.$schema.get('$app').getByCode(code)).map(function(madi) {
                return first ? madi.children().first() : madi;
              });
            }),
            (function reference(code) {
              return this.schema().prop('reference', code).ap(this.lookup(code));
            }),
            (function insert(dbid, node) {
              if (!this.$dbid.get(dbid)) {
                this.$dbid.set(dbid, node.uid());//{ uid: node.uid(), refs: [] });
              }
              return node;
            }),
            (function nodes() {
              return this.children().filter(function(node, key) {
                return key.indexOf('mare') === 0;//node.cid().indexOf('madi') === 0;
              }).map(function(node) {
                return node.ref();
              });
            }),
            (function model() {
              return this.closest(this.$model.ctor);
            }),
            (function root() {
              var node = this;
              while (node && !this.$model.ctor.is(node.parent())) {
                node = node.parent();
              }
              return node;
            }),
            (function find(dbid) {
              return this.model().retrieve(dbid);
            }),
            (function source(client) {
              return client.lookup('*model').orElse(() => {
                var c = this.model().create(client.nid());
                client.set('*model', c.uid()); c.source();
                return c;
              }, this).prop('$ref', this).unit();
            }),
            (function client(client) {
              return (this._source || (this._source = this.model().source().run(this))).run(client);
            }),
            (function append() {
              return this.$append.run(this);
            }),
            (function locate() {
              return this.$locate.run(this);
            }),
            (function push(code, values) {
              return this.lookup(code, function(node) {
                return values ? node.current('*' + values.dbid) : null;
              }).orElse(function() {
                //console.log('model.push.madi:', code, values.dbid, this.cid());
                return this.child({ name: code, dbid: values.dbid });
              }, this).lift(function(node, data) {
                if (values) {
                  if (values.dbid && values.dbid.indexOf('mare') === 0) {
                    return data.find(values.dbid).orElse(function() {
                      //console.log('model.push: create new record', values.dbid);
                      return node.child(values.dbid);
                    }).map(function(child) {
                      node.children().set('*' + child.cid(), child.uid());
                      return child;
                    }).map(function(record) {
                      //console.log('model.push: found existing', values.dbid);
                      record.refs().prop('run');
                      return record;
                    }).lift(function(c, v) {
                      return c.$parse(v);
                    }).ap(values);
                  }else {
                    return node.maybe().lift(function(c, v) {
                      return c.$parse(v).clone({ nodes: v.nodes });
                    }).ap(values);
                  }
                }else {
                  return data.schema().prop('related', code).lift(function(empty, child) {
                    return child.parse(empty, true).dbid();
                  }).ap(node.tmp()).map(function(child) {
                    node.children().set(child.cid(), child.uid());
                    return child;
                  });
                }
              }).ap(this.maybe());
            }),
            (function read() {
              return this.maybe();
            }),
            (function tmp() {
              return this.child(this.$fn.dbid());
            })
          ],
          append: function() {
            return sys.klass('io').pure(function(record) {
              return this.fx(function(data) {
                return record.push(data ? (data.marl || data.madi || record.get('madi')) : record.get('madi'), data.obj());
              });
            });
          },
          locate: function() {
            return sys.klass('io').pure(function(ref) {
              return this.fx(function(data) {
                return data.dbid.indexOf('mare') === 0 ? ref.find(data.dbid).prop('$ref', ref) : ref.lookup(data.marl || data.madi).prop('$ref', ref);
              });
            });
          },
          exists: function($exists) {
            return function exists(options) {
              var dbid = this.extractID(options), exists;
              if (dbid.indexOf('mare') === 0) {
                return this.$dbid.get(dbid);
              }else {
                return $exists.call(this, options);
              }
            };
          },
          record: function($klass) {
            return function(opts) {
              return this.child(opts, $klass.$ctor);
            }
          },
          parse: function($nodes, $control) {
            return function(data) {
              return $nodes(data, this.parse(this.$schema.get('$app').control('main').add(data.marl || data.madi, data, true), true));
            }
          },
          nodes: function($nodes) {
            return function(data, record) {
              return $nodes(data, record).orElse(data).unit();
            }
          },
          $nodes: function(data, record) {
            //console.log('$nodes', [ data.marl || data.madi, data.dbid, data, record ]);
            if (data && data.format === 'named' && data.nodes && data.nodes.length) {
              return Array.prototype.concat.apply([], data.nodes.map((name) => record.append().ap(data[name].length ? data[name] : []))).list();
            }else if (data && data.format === 'nodes' && data.nodes && data.nodes.length) {
              return record.append().ap(data.nodes).list();
            }else { 
              return record.klass('Obj').of(data).omit('nodes').maybe(false);
            }
          },
          $refs: function(handler) {
            return function refs(withHandler) {
              var refs = this.ctor.lookup('refs', this.cid());
              return withHandler === false ? refs : refs.map(refs => refs.list()).map(refs => refs.ap(handler));
            }
          },
          $handler: function() {
            return this.klass('io').pure(function(ref) {
              return ref.ctor.is(ref.parent()) ? ref.parent().update(ref.cid()) : ref;
            });
          },
          init: function(type, klass, sys) {
            klass.find('Node').prop('$record', type.record(klass));
            klass.prop('$dbid', klass.prop('$index', sys.root.node('index')).child('dbid'));
            klass.prop('$append', type.append());
            klass.prop('$locate', type.locate());
            klass.prop('$parse', type.parse(type.nodes(type.$nodes)));
            klass.prop('exists', klass.proto('exists'));
            klass.prop('refs', type.$refs(type.$handler.call(sys)));
            klass.prop('$fn', {
              args: sys.get('utils.getArgs'), toString: sys.get('utils.toString'),
              dbid: klass.makeID('*mare_0', 1000), tmpid: klass.makeID('tmp_', 1000)
            });
          }
        };
      }),
    // === Ref === //
      (function() {
        return {
          parent: 'Record',
          klass: function Ref(opts) {
            this.$super(opts);
            this.set('*dbid', (this._dbid = this.cid()));
          },
          ext: [
            (function identifier(asArray) {
              var idtf = this._parent.identifier(true).concat([ this._cid ]);
              return asArray ? idtf : idtf.join('.');
            }),
            (function parentinfo() {
              return this.schema().get('parent_id').lift(function(pid, schema) {
                return schema.get(pid);
              }).ap(this.$schema.get('$app'));
            }),
            (function read(key, value) {
              if (key && key === '*dbid') {
                return this.$index.lookup(value).map(uid => sys.find(uid));
              }else {
                return this.$model.retrieve(this.cid());
              }
            }),
            (function update(key) {
              if (key) {
                return this.lookup(key).map((child) => {
                  return this.emit('change', child.cid(), 'update', child) || child;
                });
              }else {
                return this.read().chain((record) => {
                  var keys = this.children().map(function(child) {
                    return child.cid();
                  });
                  var keep = record.children().filter(function(node, key) {
                    return key.indexOf('madi') === 0;
                  }).map(function(child) {
                    return child.ref().children().keys().map(k => k.replace('*', ''));
                  }).flat();
                  keys.exclude(keep).map((key) => {
                    console.log([ 'clear:', key, 'from', this.identifier() ]);
                    this.clear(key);
                  });
                  keep.exclude(keys).map((key) => {
                    console.log([ 'add:', key, 'to', this.identifier() ]);
                    this.emit('change', key, 'update', this.$ref(key).chain(ref => this.children().set(key, ref.store()).ref()));
                  });
                  return this.parent().update(this.cid());
                });
                //return ref.read().prop('children').prop('emit', 'change', this.cid(), 'update', '').orElse(this);
              }
            }),
            (function set(key, value) {
              var parts = key.split('.');
              if (parts.length > 1 && parts[0].indexOf('mare') === 0) {
                return this.lookup(parts.shift()).prop('set', parts.join('.'), value).unit();
              } else if (parts.length === 1) {
                return this.__.prototype.set.call(this, key, value);
              } else {
                var record = this.ctor.is(this.parent()) ? this.parent() : this;
                record.read().prop('children').prop('emit', 'change', this.cid(), 'update', '');
                return this.read().prop('set', parts.join('.'), value).unit();
              }
            }),
            (function nodes() {
              return this.children().filter(function(node, key) {
                return key.indexOf('*') === 0;
              }).map(function(node) {
                return node.ref();
              });
            }),
            (function values(recur, children, nodes) {
              return this.read().orElse(this).lift(function(rec, list) {
                return list.vals().reduce(function(r, v, i) {
                  return v.ref().read().orElse(v.ref()).prop('madi').map(function(code) {
                    if (nodes) {
                      r.nodes || (r.nodes = []);
                      if (!r.nodes.find(n => n === code)) {
                        r.nodes.push(code);
                      }
                    }
                    return r[code] || (r[code] = {});
                  }).map(function(rr) {
                    if (v.cid().indexOf('madi') === 0) {
                      r[v.cid()] = v.ref().values(recur, children, nodes);
                    }else {
                      rr[v.cid()] = v.ref().values(recur, children, nodes);
                    }
                    return r;
                  }).orElse(r).unit();
                }, rec.reduce(function $values(r, v, k, o) {
                  if (o.is(v)) {
                    if (k === 'nodes') {
                      return v.filter((n, k) => {
                        return k.indexOf('madi') < 0 && k.indexOf('mare') < 0;
                      }).reduce(function(r, n) {
                        r[n.cid()] = n.values(true);
                        return r;
                      }, r) || {};
                    }else if (k.indexOf('madi') === 0) {
                      debugger;
                    }else {
                      r[k] = v.values(true);
                    }
                  }else {
                    r[k] = v;
                  }
                  return r;
                }, {}) || {});
              }).ap(this.children().maybe()).unit();
            })
          ],
          locate: function() {
            return sys.klass('io').pure(function(ref) {
              return this.fx(function(data) {

                var dbid = data.dbid.indexOf('mare') === 0;
                var name = dbid ? data.dbid : (data.marl || data.madi);
                return ref.read().map(function(record) {
                  record.push(data ? (data.marl || data.madi || this.get('madi').unit()) : this.get('madi').unit(), data.obj().omit([ 'nodes' ].concat(data.nodes ? data.nodes : []))).unit();
                  return this.prop('find', name).unit();
                }).chain((record) => {
                  return ref.lookup(name).orElse(function() {
                    return dbid ? ref.model().$ref(record, ref) : ref.child(name).parse(data);
                  });
                });
              });
            });
          },
          store: function(klass, store) {
            return function(cid, parent) {
              return store.push(cid, parent.child(cid, klass.$ctor)) && store.get(cid).last();
            }
          },
          ref: function(store) {
            return function(model, parent) {
              return store(this.cid(), parent || model);
            }
          },
          $ref: function(dbid) {
            return this.retrieve(dbid).map((record) => {
              return this.model().$ref(record, this);
            });
          },
          child: function($make) {
            return function(opts, ctor) {
              var dbid = this.extractID(opts), child;
              if (dbid.indexOf('mare') === 0) {
                child = this.insert(dbid, $make.call(this, opts, ctor || this.constructor, this.$model.$db));
              }else if (dbid.indexOf('madi') === 0 && opts.dbid && opts.dbid.indexOf('madi') === 0) {
                child = this.insert(dbid, $make.call(this, opts, ctor || this.constructor, this.$model.$db));
              }else if (dbid.indexOf('tmp') === 0) {
                child = this.insert(dbid, $make.call(this, opts, ctor || this.constructor, this.$model.$db));
              }else {
                child = $make.apply(this, arguments);
              }
              return child;
            }
          },
          init: function(type, klass, sys) {
            var node = klass.find('Node');
            klass.prop('$locate', type.locate());
            klass.prop('exists', node.proto('exists'));
            node.prop('$ref', type.ref(type.store(klass, this.$store.node('refs'))));
            klass.prop('$ref', type.$ref);
            this.prop('child', type.child(node.prop('child')));
            klass.prop('child', node.prop('child'));
          }
        };
      }),
    // === Schema === //
      (function() {
        return {
          parent: 'Node',
          klass: function Schema(x) {
            this.$super(x);
            this.configure(x);
            if (x.code) {
              this.$index.val(x.code, this.uid());
            }
          },
          ext: [
            (function getByCode(code) {
              return this.$index.lookup(code).chain(function(uid) {
                return sys.find(uid);
              });
            }),
            (function related(code, first) {
              return this.schema(code).prop('cid').lift(function(madi, schema) {
                return schema.control('main').add(madi, {});
              }).ap(this.$schema.lookup('$app')).prop('clone', { marl: code }).map(function(madi) {
                return first ? madi.children().first() : madi;
              });
            }),
            (function schema(code) {
              return this.lookup([ 'nodes', code, 'madi' ]).orElse(code).lift(function(madi, schema) {
                return schema.get(madi);
              }).ap(this.$schema.lookup('$app'));
            }),
            (function reference(code) {
              return this.$index.lookup(['sys',code]).map(function(uid) {
                return sys.find(uid);
              }).get('options').lift(function(options, value) {
                return options.get(value, 'attr.code');
              });
            }),
            (function transformer(name, transformer) {
              var node = this.$store.node(name);
              node.set('instance', transformer);
              this.set(name, node.uid());
              return this;
            })
          ],
          conf: {
            control: {
              main: {
                run: function(type, values, norecur) {
                  var root = this.root(), node = {}, def = values === true, vals = typeof values == 'object' ? values : {};
                  main = root.control('main'),
                  node = root.lookup(type).chain(function(schema) {
                    return schema.lookup('fields').map(function(fields) {
                      return fields.length() ? fields : root.getByCode('sys.type.any').get('fields');
                    }).chain(function(fields) {
                      return fields.reduce(function(r, v, k, n) {
                        if (def) {
                          r[k] = v.reduce(function(rr, vv, kk) {
                            var opts = root.get(vv.dbid, 'options');
                            if (opts && opts.length()) {
                              vv.elem.data = [ 'options:', opts.identifier() ].join('');
                            }
                            rr[kk] = vv;
                            return rr;
                          });
                        }else {
                          r[k] = v.reduce(function(r, v, k) {
                            r.res[k] = r.vals[k] || '';
                            return r;
                          }, { res: {}, vals: vals[k] || {} }).res;
                        }
                        return r;
                      }, def ? {} : schema.select('lnid'));
                    });
                  }) || node;
                  if (!norecur) {

                    node = root.lookup(type).get('nodes').chain(function(nodes) {
                      return nodes.reduce(function(r, v, k, n) {
                        if (def) {
                          return v.lookup('marl').map(function(name) {
                            r[name] = { schema: name, fields: main.merge(name, k, true, true) };
                            return r;
                          }).orElse(function() {
                            r[k] = { schema: k, fields: main.run(k, true, true) };
                            return r;
                          }).unit();
                        }else {
                          r[k] = (vals[k] || (vals[k] = [])).map(function(x) {
                            return main.run(k, x, true);
                          });
                        }
                        return r;
                      }, node);
                    }) || node;
                  }
                  if (values !== true) {
                    node = this.defvals(type, node, values);
                  }
                  return node;
                },
                defvals: function(type, node, values) {
                  ['lnid','madi','dbid','marl','madr','marr','count'].reduce((r, k) => {
                    node[k] || (node[k] = values[k] || r[k]);
                    return r;
                  }, { madi: type, dbid: '', madr: 0, marl: '', marr: 0, count: 0 });
                  if (!node.type && values.dimension) node.type = values.dimension;
                  return node;
                },
                merge: function(type, ext, values, norecur) {
                  return this.root().extend(this.run(type, values || true, norecur), this.root().lookup(ext).chain(this.bin(function(control, node) {
                    return control.run(ext, values || true, norecur);
                  })) || {}, true);
                },
                extend: function(type, ext, map, def) {
                  return this.make(this.merge(type, ext, true), map, def);
                },
                map: function(type, map, def) {
                  return this.make(this.add(type, true), map, def);
                },
                make: function(fields, map, def) {
                  return this.of(fields).map(function(r, v, k) {
                    if (!r.result[r.map[k] || r.def]) r.result[r.map[k] || r.def] = {};
                    r.result[r.map[k] || r.def][k] = v.object(true);
                    return r;
                  }, { result: this.of({}), map: map, def: def || '' }).result;
                },
                create: function(type, values, client) {
                  var vals  = values || {};
                  var data  = this.add(type, vals, true);
                  data.dbid = vals.dbid || vals.name || 'mare_0';
                  if (client) {
                    var inst = client.set('model', sys.get('model').create(client.cid()).create(type, 'schema.$app'));
                    var src  = inst.source(client);
                    var node = inst.record(data.dbid);
                    if (node.children().length()) {
                      node.children().clear();
                    }
                    node.clear();
                    return node.parse(data, true);
                  }else {
                    return data;
                  }
                },
                add: function(type, values, norecur) {
                  return this.root().lookup(type).map(function(schema) {
                    return schema.get('meta.parent') || schema.get('child');
                  }).orElse(type).lift(function(child, root) {
                    if (child !== type) {
                      return root.merge(child, type, values, norecur);//.clone({ marl: parent });
                    }else {
                      return root.run(type, values, norecur);
                    }
                  }).ap(this.maybe()).unit();
                }
              }
            }
          },
          attrs: [
            (function of(ref, name) {
              return new this(ref, name);
            })
          ],
          parse: function(obj, parse) {
            return function(values) {
              return obj.of({ root: this, curr: this }).reduce(function(v, k, i, r) {
                if (k == 'fields' || k == 'nodes') {
                  return parse.call(r.root.child({ name: k, parent: r.curr }), v, 1, r.root.__);
                }else {
                  return parse.call(r.root.child({ name: k, parent: r.curr, code: v.attr ? v.attr.code : k }), v, 2, r.root.__);
                }
              }, values);
            }
          },
          init: function(type, klass, sys) {
            var $store = klass.$store.ctor;
            var schema = klass.prop('$schema', sys.root.child('schema', klass.$ctor));
            klass.prop('$index', schema.node('$index'));
            klass.prop('$store', schema.node('$store'));
            var record = klass.find('Record');
            klass.prop('$record', record.$ctor);
            record.prop('$schema', schema);
            klass.prop('$store', schema.node('$store'));
            klass.prop('$app', schema.child('$app'));
            klass.prop('conf', sys.get('utils.extend')(klass.prop('conf').clone(), type.conf));
            klass.prop('parse', type.parse(sys.klass('Obj'), klass.prop('parse')));
          }
        };
      }),
    // === Cell === //
      (function() {
        return {
          klass: function Cell(f) {
            this.v = undefined, this.isDefined = false, this.queue = [];
            if (f) this.f = f;
            else if (!this.f) this.f = unit;
          },
          ext: [
            (function get(k) {
              if (this.isDefined) {
                //JavaScript as an Embedded DSL 429 430 G. Kossakowski et al.
                //k(this.v);
                this.enqueue(this.atom(k, this.v));
              }else {
                this.queue.push(k);
              }
            }),
            (function set(v) {
              if (this.isDefined) {
                throw "can’t set value twice"
              }else {
                this.run(this.f(v));
              }
            }),
            (function atom(k, v) {
              return function() {
                k(v); return true;
              }
            }),
            (function run(r) {
              if (this.isDefined) {
                throw "can’t set value twice"
              }else {
                this.v = r; this.isDefined = true,
                this.queue.splice(0).bind(function(f) {
                  f(r) //non-trivial spawn could be used here })
                }).run();
              }
            })
          ],
          attrs: [
            (function of(f) {
              return new this(f);
            })
          ],
          cont: function(cell) {
            return function(v) {
              cell.set(v);
            }
          },
          kont: function(klass) {
            return function(cell) {
              return (cell._cont || (cell._cont = klass.of(function $_pure(k) {
                cell.get(k);
              })));
            }
          },
          init: function(type, klass, sys) {
            var fn = sys.root.get('sys.fn'), utils = sys.get('utils');
            klass.$ctor.map = utils.get('compose')(fn.$const)(utils.get('andThen')(klass.of));
            klass.prop('enqueue', sys.get('process.nextTick.enqueue'));
            klass.prop('cont', utils.get('call')(type.cont));
            var cont = this.find('Cont');
            this.find('Node').prop('cell', klass.of);
            klass.prop('kont', utils.get('call')(type.kont(cont)));
          }
        };
      }),
    // === Value === //
      (function() {
        return {
          klass: function Value(x, l) {
            this.id = this.id();
            if (x) this.mv = x;
            this.mv._locked = l !== false;
          },
          ext: [
            (function of(v, l) {
              return this.constructor.of(v, l);
            }),
            (function lock(lock) {
              if (!this._locked && lock !== false) this._locked = true;
              return this;
            }),
            (function unlock() {
              if (this.isLocked(this.mv)) this.mv._locked = false;
              else if (this.isLocked()) this._locked = false;
              return this.mv;
            }),
            (function isLocked(v) {
              return v ? this.__.isLocked(v) : (this._locked === true || this.__.isLocked(this.mv));
            }),
            (function wasLocked(v) {
              return v ? this.__.wasLocked(v) : (this._locked === false || this.__.wasLocked(this.mv));
            }),
            (function holdLock(v) {
              return this.of(v, this._locked !== false);
            }),
            (function releaseLock() {
              return this.of(this.unlock(), false);
            }),
            (function map(f) {
              return this.of(this.mv.map(f), false);
            }),
            (function bind(f) {
              return this.mv && !this.isLocked(this.mv) ? this.unlock().bind(f) : this.of(this.mv.bind(f), false);
            }),
            (function resolve(f, g) {
              return this.mv && !this.isLocked(this.mv) ? this.unlock().resolve(f, g) : this.of(this.mv.resolve(f, g), false);
            }),
            (function pure() {
               return this.mv && !this.isLocked(this.mv) ? this.unlock().pure() : this.mv.pure(); 
            }),
            (function create() {
              var args = [].slice.call(arguments);
              return this.cell().bind(function(v) {
                return function $_pure(k) {
                  v.create.apply(v, args).run(k);
                }
              });
            }),
            (function run(k) {
              return this.mv && !this.isLocked(this.mv) ? this.mv.run(k) : k(this);
            })
          ],
          isLocked: function() {
            function isLocked(x) {
              return x && x._locked;
            }
            return isLocked;
          },
          wasLocked: function() {
            function wasLocked(x) {
              return x && x._locked === false;
            }
            return wasLocked;
          },
          unlock: function(isLocked) {
            function unlock(v) {
              if (isLocked(v) && !(v._locked = false)) return v;
              return v;
            }   
            return unlock;
          },
          attrs: [
            (function of(v, l) {
              return new this(v, l);
            })
          ],
          value: function(v) {
            return function() {
              return v.of(this instanceof v.$ctor ? this.mv : this);
            }
          },
          cell: function($cell) {
            return function() {
              var cell = this._cell;
              if (!cell) {
                cell = this._cell = $cell();
              }
              if (!cell.isBound) {
                cell.isBound = true;
                this.mv.bind(cell.cont()).run();
              }
              return cell.kont();
            }
          },
          init: function(type, klass, sys) {
            klass.$ctor.isLocked  = type.isLocked(klass);
            klass.$ctor.wasLocked = type.wasLocked(klass);
            klass.$ctor.unlock    = type.unlock(klass.$ctor.isLocked);
            klass.prop('cell', type.cell(this.find('Cell').of));
            this.find('Cont').prop('$value', type.value(klass));
          }
        };
      })
  ),

  (function MakeThreads() {

    return [].slice.call(arguments);
  })(
    // === IMPORT / PARSE === //
      (function $$THREADS() {
        return (this.ctor.base.prototype.atom = unit(this.store('utils.importFuncs')([].slice.call(arguments), this.store().child('threads'))).get('atom'));
      }),
    // === VALUES === //
      (function lazyValue(v) { return (function() { return v; }); }),
      (function lazyFunction(f) { return (function() { return f(); }); }),
      (function atom(f, t) {
        return function() {
          return f(t);
        };
      }),
      (function ftor(f) {
        return function(x) {
          return f.run(x);
        };
      }),
      (function atomize(f) {
        return function() {
          var args = arguments;
          return atom(function() {
            return f.apply(null, args);
          });
        };
      }),
      (function bindLazy(v, f) {
        return function() {
          return f(v())();
        };
      }),
      (function $_atomLazy($_bindLazy) {
        return function atomLazy(f) {
          return function(v) {
            return $_bindLazy(v, f);
          };
        };
      }),
      (function $_mapLazy($_atom) {
        return function mapLazy(f) {
          return function(v) {
            return $_atom(f, v);
          }
        }
      }),
    // === INSTRUCTIONS === //
      (function pure(value)   { return { pure: true,  value: value }; }),
      (function roll(functor) { return { pure: false, value: functor }; }),
      (function $_makeThread($_pure) {
        return function makeThread(value) {
          return function() { return $_pure(value); };
        };
      }),
      (function $_wrap($_roll) {
        return function wrap(instruction) {
          return function() { return $_roll(instruction); };
        }
      }),
      (function makeInstruction() {
        var modeConfig = {
          yield:  { ps9:  true  },
          cont:   { cont: true  },
          suspend:{ susp: true, ps9: true },
          done:   { done: true  },
          fork:   { us0:  true, ps1: true },
          branch: { us9:  true  }
        };
        return function makeInstruction(mode, next) {
          return { mode: mode, next: next, cf: modeConfig[mode] };
        };
      })(),
      (function $_instructionMap($_makeInstruction) {
        return function instructionMap(instruction, f) {
          return $_makeInstruction(instruction.mode, instruction.next.map(f));
        }
      }),
    // === BIND AND LIFT === //
      (function $_bindThread($_bindLazy, $_instructionMap, $_wrap, $_roll, $_lazyValue) {
        return function bindThread(lazyValue, f) {
          return $_bindLazy(lazyValue, function(free) {
            return free.cont ? (free.kont || (free.kont = $_lazyValue(free)))
            : (free.pure || !free.value
              ? f(free.value || free)
              : (free.kont || (free.kont = $_lazyValue($_roll($_instructionMap(free.value, function(v) {
                return bindThread(v, f);
              }))))));
          });
        }
      }),
      (function $_lift($_bindLazy, $_makeThread) {
        return function lift(lazyValue) {
          return $_bindLazy(lazyValue, $_makeThread);
        }
      }),
      (function $_atomThread($_bindThread) {
        return function atomThread(f) {
          return function(v) {
            return $_bindThread(v, f);
          };
        };
      }),
      (function $_liftFn($_makeThread) {
        return function liftFn(fn) {
          return function(value, free, inst) {
            return makeThread(fn(value, free, inst));
          }
        }
      }),
      (function $_liftF($_instructionMap, $_makeThread, $_wrap) {
        return function(instruction) {
          return $_wrap($_instructionMap(instruction, $_makeThread));
        }
      }),
      (function $_mapThread($_bindThread, $_makeThread) {
        return function mapThread(lazyValue, f) {
          return $_bindThread(lazyValue, function(v) {
            return $_makeThread(f(v));
          });
        }
      }),

    // === RUN, YIELD, DONE
      (function $_yyield($liftF, $_makeInstruction) {
        return function yyield() {
          return $_liftF($_makeInstruction('yield', [null]));
        }
      }),
      (function runThreads(threads, status) {
        var free, inst, next, count = 0, index = 0;
        return function(info) {
          if (++status.count && (status.length = threads.length) > 0) {
            free = threads[0](info);
            if (free && free.pure === false) {
              if (!free.cont) {
                threads.shift();
                inst = free.value;
                next = inst.next;
                if (inst.cf.ps9) {
                  threads.push.apply(threads, next);
                }else if (inst.cf.us0) {
                  threads.unshift(next[0]);
                  threads.push.apply(threads, next.slice(1));
                }
              }
              count++;
            }else {
              threads.shift();
            }
            if (inst && inst.cf.susp && count == threads.length && (info.suspend = true))
              count = 0;

            if (threads.length > status.maxlen) status.maxlen = threads.length;
          }
          return !(status.length = threads.length);
        }
      }),
      (function addThreads(make, wrap) {
        return function $_addThreads($_runThreads, $_lazyValue) {
          return function addThreads(threads, enqueue, name) {
            return make(wrap, $_lazyValue, $_runThreads, threads, enqueue, {
              name: name, count: 0, maxlen: 0
            });
          }
        };
      })(
        (function(wrap, lazy, make, threads, enqueue, status) {
          return {
            enqueue: wrap(make(threads, status), threads, enqueue),
            status: lazy(status)
          };
        }),
        (function(run, threads, enqueue) {
          return function() {
            if (!(threads.length * threads.push.apply(threads, arguments))) {
              enqueue(run);
            }
          }
        })
      ),

      (function makeBind() {
        return [].slice.call(arguments).apply();
      })(
        (function(make, bind, create, cache, wrap, suspend) {
          return function $_makeBind($_wrap, $_roll, $_atom, $_ftor, $_makeInstruction, $_bindLazy, $_lazyValue, $_pure, $_mapLazy, $_runThreads) {
            return make(bind, create, cache, wrap, {
              wrap: $_wrap, roll: $_roll, atom: $_atom, ftor: $_ftor,
              makeInstruction: $_makeInstruction, suspend: suspend,
              bindLazy: $_bindLazy, lazyValue: $_lazyValue, pure: $_pure, mapLazy: $_mapLazy
            });
          }
        }),
        (function make(bind, create, cache, wrap, func) {
          return bind(cache(create(func)), wrap, func);
        }),
        (function bind(bound, wrap, func) {
          return function makeBind(f, x, t) {
            return wrap.call(func, bound.call(func, f), x || {}, t);
          }
        }),
        (function ftor(ctor, ext) {
          return function(x) {
            return ext.call(ctor, x);
          }
        })(
          (function $ftor(ftor) {
            this.ftor = ftor.of(ftor.run().bind(this));
          }),
          (function(x) {
            this.prototype = {
              constructor: this,
              cache: function(key, value) {
                return (this[key] = x.lazyValue(value))();
              },
              push: function(v) {
                return (this.values || (this.values = [])).push(v);
              },
              flush: function() {
                return (this.values || (this.values = [])).splice(0);
              },
              cont: function() {
                return this.cache('cont', { pure: false, cont: true });
              },
              next: function(v) {
                return x.roll(x.makeInstruction('yield', [ this.run(v) ]));
              },
              wrap: function(v) {
                return x.wrap(x.makeInstruction('yield', [ this.run(v) ]));
              },
              susp: function(v) {
                return this.cache('susp', x.roll(x.makeInstruction('suspend', [ this.run(v) ])));
              },
              bind: function(v, f) {
                return this.cache('bind', x.roll(x.makeInstruction('yield', [ x.atom(f, v) ])));
              },
              lift: function(v) {
                return new this.constructor(this.ftor.lift(v));
              },
              then: function(v) {
                return this.run(v);
              },
              done: function(v) {
                return x.pure(v);
              },
              run: function() {
                return (this.run = x.mapLazy(x.ftor(this.ftor)));
              }
            };
            return this;
          })
        ),
        (function cache(b) {
          return function(ftor) {
            var x = new b(ftor);
            x.run();
            return x;
          }
        }),
        (function wrap(b, x, t) {
          if (t) b.suspend = this.suspend(t);
          return b;
        }),
        (function suspend(t) {
          return function(v) {
            return this.done(t.of(this.run(v)));
          }
        })
      ),
    // === ARR THREAD
      (function makeArr(x, f, k) {
        return function() {
          if (x.i < x.arr.length) {
            x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
            if (k && x.i == x.arr.length) {
              x.res = k(x.res);
            }
          }
          return x.i < x.arr.length ? x.next : x.pure;
        }
      }),
      (function $_arrThread($_makeArr, $_makeInstruction, $_lazyValue) {
        return function arrThread(f, k, m) {
          return function(arr) {
            var x  = { arr: arr, i: 0, res: arr.map($_lazyValue()) };
            x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeArr(x, f, k) ]) };
            x.pure = { pure: true,  value: x.res };
            return $_lazyValue(x.next);
          }
        }
      }),
      (function arrThread(f) {
        return function(x) {
          if (x.i < x.arr.length) {
            x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
            if (k && x.i == x.arr.length) {
              x.res = k(x.res);
            }
          }
          return x.i < x.arr.length ? x.next : x.pure;
        }
      }),
    // === QUEUE THREAD
      (function makeQueue(x, f, k) {
        return function() {
          if (x.arr.length) {
            if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
              if (x.i) x.arr.splice(x.i, 1);
              else x.arr.shift();
            else
              x.i++;
            if (k && !x.arr.length) k(x);
          }
          return x.arr.length ? x.cont : x.pure;
        }
      }),
      (function $_queueThread($_makeQueue, $_makeInstruction, $_lazyValue) {
        return function queueThread(f, k, m) {
          return function(arr) {
            var x  = { arr: arr, i: 0, item: 0, run: 0 };
            x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeQueue(x, f, k) ]) };
            x.cont = { pure: false, cont: true };
            x.pure = { pure: true,  value: [] };
            x.push = x.pure.value.push.bind(x.pure.value);
            return $_lazyValue(x.next);
          }
        }
      }),
      (function queueThread(x) {
        if (x.arr.length) {
          if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
            if (x.i) x.arr.splice(x.i, 1);
            else x.arr.shift();
          else
            x.i++;
          if (k && !x.arr.length) k(x);
        }
        return x.arr.length ? x.cont : x.pure;
      }),
    // === LIST THREAD
      (function makeList(x) {
        if (x.arr.length) {
          x.arr = x.arr.filter(x.fn);
        }
        return x.arr.length ? x.next : x.pure;
      }),
      (function $_listThread($_makeList, $_makeInstruction, $_atom, $_lazyValue) {
        return function listThread(f) {
          return function(arr) {
            var x  = { arr: arr.slice(0), fn: f };
            x.push = x.arr.push.bind(x.arr);
            x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_atom($_makeList, x) ]) };
            x.cont = { pure: false, cont: true };
            x.pure = { pure: true,  value: x.arr.slice(0) };
            return x.next;
          }
        }
      }),
    // === FOLD THREAD
      (function makeFold(x) {
        if (x.arr.length) {
          x.arr = x.arr.filter(x.fn);
        }
        return x.arr.length ? x.next : x.pure;
      }),
      (function $_listThread($_makeList, $_makeInstruction, $_atom, $_lazyValue) {
        return function listThread(f, m) {
          return function(arr) {
            var x  = { arr: arr.slice(0), fn: f };
            x.push = x.arr.push.bind(x.arr);
            x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_atom($_makeList, x) ]) };
            x.cont = { pure: false, cont: true };
            x.pure = { pure: true,  value: x.arr.slice(0) };
            return x.next;
          }
        }
      })
  ),

  (function MakeTypes2() {

    return [].slice.call(arguments);
  })(
    // === Coyoneda === //
      (function Coyoneda() {
        return {
          parent: 'Functor',
          klass: function Coyoneda(f, x) {
            this.$$init(f, x);
          },
          ext: [
            (function $$init(f, x) {
              this.id = this.ctor.$id = this.id();
              if (f) this.mf = f;
              else if (!this.mf) this.mf = unit;
              if (typeof x != 'undefined') this.mv = x;
            }),
            (function map(f) {
              return new this.constructor(this.$fn.compose(this.mf)(f), this.mv);
            }),
            (function $bimap(f, g) {
              return function(x) {
                return f(g)(x); 
              }
            }),
            (function bimap(f, g) {
              return this.of(this.$bimap(this.mf(f), g), this.mv);
            }),
            (function bind(f, x) {
              return new this.constructor(this.$fn.compose(typeof x != 'undefined' ? this.$fn.lift(this.mv, this.mf, x) : this.mf)(f), x || this.mv);
            }),
            (function chain(f, x) {
              return (f ? this.$fn.compose(this.mf)(f) : this.mf)(x || this.mv);
            }),
            (function ap(x) {
              return (this.test(x) ? x : this.klass('maybe').of(x)).map(this.run.bind(this));
            }),
            (function apply(monad) {
              return this.test(monad) ? monad.ap(this).run() : this.run(monad);
            }),
            (function lift(x) {
              return new this.constructor(this.$fn.lift(this.mv, this.mf, x), x);
            }),
            (function ftor() {
              return this.$fn.ftor(this);
            }),
            (function run(x) {
              return typeof x != 'undefined' ? (typeof this.mv != 'undefined' ? (x instanceof Function ? x(this.mf(this.mv)) : this.mf(this.mv)(x)) : this.mf(x)) : (typeof this.mv != 'undefined' ? this.mf(this.mv) : this.mf);
            })
          ],
          attrs: [
            (function of(f, x) {
              if (!(f instanceof Function)) return new this(function(v) {
                return function(t) {
                  return t ? v.lift(t).run() : v.run;
                }
              }, f);
              return new this(f || unit, x);
            }),
            (function lift(x, f) {
              return new this(f || unit, x);
            }),
            (function $of() {
              var ctor = this;
              return function() {
                return ctor.of.apply(ctor, arguments);
              }
            })
          ],
          lift: function(v, f, x) {
            return typeof v != 'undefined' ? f(v) : (typeof x != 'undefined' ? f : f());
          },
          init: function(type, klass, sys) {
            klass.prop('$fn', {
              compose: klass.find('Compose').prop('$fn'),
              lift: type.lift, ftor: sys.get('threads.ftor')
            });
          }
        };
      }),
    // === Data === //
      (function() {
        return {
          parent: 'Store',
          klass: function Data(x) {
            this.$super();
            this._step = 0;
            if (x && this.is(x)) this._ref = x;
            else if (x) this.parse(x);
          },
          ext: [
            (function next() {
              return this.at(this._step < this.length() ? this._step++ : ((this._step = 0) || this._step++));
            }),
            (function curr() {
              return this.at((this._step || 1) - 1);
            }),
            (function done() {
              return this._step == this.length();
            }),
            (function map(f, c) {
              if (typeof f == 'object') {
                return this.constructor.of(this.reduce(function(r, v, k, i, o) {
                  r.res[k] = r.obj.get(k) || v;
                  return r;
                }, { res: {}, obj: f }).res);
              }else {
                return this.__.prototype.map.call(this, f);
              }
            }),
            (function assign(x, d) {
              return this.constructor.of(this.reduce(function(r, v, k, i, o) {
                if (v instanceof Function) r.res[k] = v(r.obj, k);
                else if (r.obj[v]) r.res[k] = r.obj[v];
                return r;
              }, { res: d ? d.clone(x) : x, obj: x }).res);
            }),
            (function cont() {
              return this.state().evalStateT(this.coyo());
            }),
            (function ap(data) {
              return data instanceof this.constructor ? this.map(data) : this.ap(this.of(data));
            })
          ],
          attrs: [
            (function of(x) {
              return (new this(x)).maybe();
            })
          ],
          io: function() {
            return this.find('io').pure(function(data) {
              return this.fx(function(state) {
                if (state.step < data.length()) {
                  return data.at(state.step++);
                }else {
                  state.step = 0;
                  return data.klass('io').pure(unit).toMaybe().to('cont');
                }
              }).toMaybe();
            });
          },
          coyo: function() {
            return this.find('Coyoneda').of(function(io) {
              return function(state) {
                return io.run(state).chain(function(result) {
                  return this.test(result) ? result : this;
                });
              }
            });
          },
          $coyo: function(coyo, io) {
            return function() {
              return coyo.lift(io.run(this));
            }
          },
          run: function(data) {
            return function(monad) {
              return data.run().ap(monad).chain(function(result) {
                return this.test(result) ? result : this;
              });
            }
          },
          state: function($cont, $run) {
            return this.find('StateT').$fn.gets(function(state) {
              var value = { step: 0 };
              var monad = state.lift(value);
              var bound = state.of($run(monad)).bind(function(result) {
                return value.step ? ($cont.is(result) ? result.lift(bound) : $cont.of(result).lift(bound)) : result;
              });
              return $cont.of(monad.run()).lift(bound);
            }, this.find('Cont').$ctor);
          },
          $state: function(state) {
            return function() {
              return state;
            }
          },
          $make: function($io) {
            return function() {
              return $io.run(this);
            }
          },
          $map: function() {
            return this.lift(function(map, data) {
              return map.of(data).ap(map);
            });
          },
          $assign: function() {
            return this.lift(function(map, defs) {
              return this.fx(function(data) {
                return map.assign(data, defs);
              });
            });
          },
          init: function(type, klass, sys) {
            this.root().$data(klass);
            var cont = this.find('Cont');
            var coyo = type.coyo.call(this);
            klass.prop('coyo', type.$coyo(coyo, type.io.call(this)));
            klass.prop('state', type.$state(type.state.call(this, cont, type.run)));
            klass.prop('map', type.$make(type.$map.call(this.find('io'))));
            klass.prop('$assign', type.$make(type.$assign.call(this.find('io'))));
          }
        };
      }),
    // === Free === //
      (function() {
        return {
          klass: function Free(f, x, t) {
            this.$$init(f, x, t);
          },
          ext: [
            (function $$init(f, x, t) {
              this._id = this.ctor.$id = this.id();
              this._x  = this.$fn.ftor.is(f) ? (x ? f.lift(x) : f) : this.$fn.ftor.of(this.$fn.makeBind(this.$fn.coyo.is(f) ? f : this.$fn.coyo.of(f), {}, this), x);
              this._t  = t || this._t || '$enqueue';
            }),
            (function of(f, x) {
              return this.constructor.of(f, x);
            }),
            (function map(f) {
              return new this.constructor(this._x.map(this.$fn.map(f)), null, this._t);
            }),
            (function lift(x) {
              return new this.constructor(this._x.lift(x).lift());
            }),
            (function bind(f, x) {
              return new this.constructor(this._x.map(this.$fn.atomThread(this.$fn.makeBind(this.$fn.coyo.is(f) ? f : this.$fn.coyo.of(f), x || {}, this).run)), null, this._t);
            }),
            (function run(x, f) {
              return this[this._t].enqueue(this._x.chain(f ? this.$fn.map(f) : null, x));
            }),
            (function cont(x) {
              return this.$fn.cont.of(this.$fn.kont(new this.constructor(this._x.lift(x))));
            }),
            (function info() {
              return this[this._t];
            })
          ],
          $ext: function() {
            return [
              { name: '$fn', value: this.threads.select('atomThread', 'makeBind') },
              { name: '$enqueue', value: this.threads.set('enqueue', this.threads.get('addThreads')([], this.enqueue, '$enqueue')) },
              { name: '$anim', value: this.threads.set('anim',
                this.threads.get('addThreads')([], this.process.get('animFrame.enqueue'), '$anim'))
              }
            ];
          },
          attrs: (function() {
            return [].slice.call(arguments).apply();
          })(
            (function(t, ftor, coyo, c, of, arr, que, lst, wrap, raf) {
              var cast  = c(t);
              var bindL = t.get('bindLazy');
              var lazyV = t.get('lazyValue');
              return [
                cast,
                of(cast),
                arr(coyo, bindL, lazyV, t.get('arrThread'), wrap),
                que(coyo, bindL, lazyV, t.get('queueThread'), wrap),
                lst(coyo, bindL, lazyV, t.get('listThread'), wrap),
                raf(coyo, t.get('listThread'))
              ];
            }),
            this.get('threads'),
            this.klass('Functor'),
            this.klass('Coyoneda'),
            (function(cmd) {
              return function cast(v) {
                if (v instanceof Function) {
                  return v;
                }else if (v) {
                  return cmd.get('lazyValue')(v);
                }
              }
            }),
            (function(cast) {
              return function of(f, x) {
                return new this(f, x);
              }
            }),
            (function(coyo, bindLazy, lazyValue, arrThread, wrapThread) {
              return function arr(a, f) {
                return wrapThread(new this(coyo.of(arrThread(f), a)))(a);
              }
            }),
            (function(coyo, bindLazy, lazyValue, queThread, wrapThread) {
              return function queue(f) {
                return wrapThread(new this(coyo.is(f) ? f : coyo.of(f)));
              }
            }),
            (function(coyo, bindLazy, lazyValue, listThread, wrapThread) {
              return function list(f, m) {
                return wrapThread(new this(coyo.is(f) ? f : coyo.of(listThread(f, m))).lift());
              }
            }),
            (function wrap(thread) {
              return function $lift(arr) {
                var stats = { count: 0, size: 0, max: 0 };
                return {
                  id: thread._id,
                  info: function() {
                    return stats;
                  },
                  bind: function(f, x) {
                    return wrap(thread.bind(f, x))(arr);
                  },
                  fork: function(obj) {
                    return $lift(arr[(stats.bottom = arr.push(obj ? obj : { arr: [] })) - 1].arr);
                  },
                  length: function() {
                    return arr.length;
                  },
                  push: function(args, appl) {
                    if (++stats.count && !(arr.length * (appl === true ? arr.push.apply(arr, args) : arr.push(args)))) {
                      stats.size = arr.length; 
                      thread.run(arr);
                    }else if (arr.length > stats.max) {
                      stats.max  = arr.length;
                    }
                    return this;
                  },
                  lift: function(x) {
                    return wrap(thread.lift(x))(arr);
                  },
                  add: function() {
                    arr.push.apply(arr, arguments);
                    return this;
                  },
                  run: function(f) {
                    thread.run(arr, f);
                    return this;
                  }
                };
              }
            }),
            (function(coyo, listThread) {
              return function raf(f) {
                return new this(coyo.is(f) ? f : coyo.of(listThread(f, 'suspend')));
              }
            })
          ),
          cont: function() {
            return this.parse({
              klass: function ContF(mv, mf) {
                this.$$init(mv, mf);
              },
              ext: {
                mf: unit
              },
              init: function(type, klass, sys) {
                klass.prop('of', this.prop('of').bind(this.proto()));
                klass.prop('constructor', this.$ctor);
              }
            });
          },
          kont: function(free) {
            return function $_pure(k) {
              free.run(k);
            }
          },
          map: function(f) {
            return this.atomThread(this.wrap(f));
          },
          ftor: function() {
            return this.extend(function CoyoF(f, x) {
              this.$$init(f, x);
            });
          },
          free: function(free) {
            return function() {
              return free.$ctor.queue(this);
            }
          },
          init: function(type, klass, sys) {
            var $st = klass.$store.root.ref();
            var $fn = type.$ext.call({
              get: $st.get('utils.target'),
              threads: $st.get('threads'),
              process: $st.get('process'), enqueue: $st.get('process.nextTick.enqueue')
            }).reduce(function(r, v) { r.prop(v.name, v.value); return r; }, klass).prop('$fn');
            $fn.cast = klass.$ctor.cast;
            $fn.coyo = klass.find('Coyoneda');
            $fn.coyo.prop('free', type.free(klass));
            $fn.ftor = type.ftor.call($fn.coyo);
            $fn.cont = type.cont.call(klass.find('Cont'));
            $fn.kont = type.kont;
            $fn.wrap = sys.get('utils.andThen')(sys.get('threads.makeThread'));
            $fn.map  = sys.get('utils.compose')($fn.wrap)($fn.atomThread);
          }
        };
      }),
    // === Control === //
      (function() {
        return {
          parent: 'Cont',
          klass: function Control(x, f) {
            this.$super(x, f);
          },
          ext: [
            (function $$init(x, f) {
              if (x) this.mv = this.$$parse(x);
            }),
            (function $$parse(x) {
              return x instanceof Array ? (x.length == 1 ? this.$cast(x.shift()) : this.$fn.parallel.apply(undefined, x.map(this.$cast))) : this.$cast(x);
            }),
            { name: 'async', value: this.get('async').select('series', 'count', 'times', 'inject', 'eject', 'delay') },
            (function times(x) {
              var t = parseInt(x || 0) || 0;
              if (t > 1) {
                return this.of(this.async.times(x, this.lazy(this.mv)));
              }else {
                return this;
              }
            }),
            (function delay(ms) {
              return this.of(this.async.delay(this.mv, ms));
            }),
            (function then() {
              return this.of(this.async.series(this.mv, this.$$parse([].slice.call(arguments))));
            }),
            (function parallel() {
              return this.of(this.$fn.parallel(this.mv, this.$$parse([].slice.call(arguments))));
            }),
            (function parse(succ, fail) {
              return function(result) {
                return succ(result);
              }
            }),
            (function eject(succ, fail) {
              return this.of(this.async.eject(this.mv, this.parse(succ, fail)));
            })
          ],
          of: function(of) {
            return function() {
              return of.call(this, [].slice.call(arguments));
            }
          },
          cntrl: function(cntrl) {
            return function() {
              return cntrl.of(this.cont());
            }
          },
          init: function(type, klass, sys) {
            klass.of = type.of(klass.of);
            this.prop('$control', type.cntrl(klass));
            klass.prop('$fn', klass.prop('$fn').clone({
              array: sys.get('async.array'),
              series: sys.get('async.series'),
              parallel: sys.get('async.parallel'),
              cast: sys.get('utils.andThen')(klass.prop('$cast'))
            }));
          }
        };
      }),
    // === Signal === //
      (function() {
        return {
          name: 'Signal',
          klass: function Signal(ref) {
            this._id = this.ctor.$id = this.id();
            this._listener = ref;
            this._values   = [];
            this._handlers = [];
          },
          ext: [
            (function throttle(sink, ms) {
              var stoid = 0, value, skipcount = 0;
              if (ms) sink.throttle = ms;
              return function(evt) {
                value = evt;
                if (stoid) {
                  if (skipcount%100==0) console.log('THROTTLE', skipcount);
                  skipcount++;
                }else {
                  stoid = setTimeout(function() {
                    stoid = 0;
                    sink.run(value);
                  }, sink.throttle);
                }
              }
            }),
            (function make(info, handler) {
              if (info && info.uid == this._listener.uid && info.hid) {
                info.hid = this.$fn.hid();
                return info;
              }else {
                var hndl = {
                  uid: this._listener.uid, hid: this.$fn.hid(), opts: info.opts || {},
                  elem: info.element, count: 0, eid: 0, pid: 0, cnt: 0, name: info.name, ref: info.selector,
                  filter: info.filter, run: handler
                };
                hndl.atom = info.throttle ? this.throttle(hndl, info.throttle) : this.$fn.lazy(handler, hndl);
                return hndl;
              }
            }),
            (function toggle(onoff) {
              var lstr = this._listener, state;
              if (lstr.state == 'on' && onoff !== 'on') {
                state = lstr.off(lstr.elem, lstr.name, lstr.run);
                lstr.state = state.state;
                if (!lstr.on) lstr.on = state.on;
              }else if (onoff !== 'off') {
                state = lstr.on(lstr.elem, lstr.name, lstr.run);
                lstr.state = state.state;
                if (!lstr.off) lstr.off = state.off;
              }
              return lstr;
            }),
            (function add(info, handler) {
              if (this._listener.state == 'off') this.toggle('on');
              var hndl = this.make(info, handler), idx;
              if ((idx = this._handlers.indexOf(hndl)) < 0) {
                return this._handlers[this._handlers.push(hndl)-1];
              }else {
                console.log('!DUPLICATE!', hndl, this);
                return this._handlers[idx] = hndl;
              }
            }),
            (function remove(info) {
              var idx = 0, arr = this._handlers, hnd, test;
              while (idx < arr.length && (test = arr[idx])) {
                if (info.hid) {
                  if (info.hid != test.hid && ++idx) continue;
                  /* !FOUND! */
                }else if (info.target) {
                  if (info.ref.concat('.', info.target).indexOf(test.ref.replace('.%', '')) < 0 && ++idx) continue;
                  else if (info.ref.indexOf(test.elem.identifier()) && ++idx) continue;
                }else {
                  if (info.ref != test.ref) continue;
                }
                hnd = arr.splice(idx, 1).shift(); break;
              }
              if (!this._handlers.length) this.toggle('off');
              return hnd;
            }),
            (function filter(item) {
              return function(res, hndl) {
                //if (item.count) debugger;
                item.count++;
                if (hndl.eid < item.eid && hndl.filter(item)) {
                  hndl.eid = item.eid; res.push(hndl.atom(item));
                }
                return res;
              }
            }),
            (function run(value) {
              return this._handlers.reduce(this.filter(this._listener.create(value)), []);
            })
          ],
          attrs: [
            (function of(identifier) {
              return new this(identifier);
            })
          ],
          lazy: function(f, x) {
            return function(v) {
              return function() {
                return f(v, x);
              }
            }
          },
          init: function(type, klass, sys) {
            klass.prop('$fn', {
              hid: this.makeID(''), lazy: type.lazy
            });
          }
        };
      }),
    // === Queue === //
      (function() {
        return {
          name: 'Queue',
          parent: 'Store',
          klass: function Queue(ref, name) {
            this.$super.call(this, ref, name);
            this.ctor.$id = this.uid();
          },
          ext: [
            (function thread() {
              return this.free;
            }),
            (function enqueue(item) {
              item.eid = this.eid();
              this.get(item.type).run(item).map(this.thread.push);
              return this;
            }),
            (function proxy(type, item) {
              return this.enqueue(item.clone({ type: type }));
            }),
            (function wrap() {
              var type = this.parent().store();
              this.thread = type.get('thread') || type.set('thread', type.thread());
              return this.enqueue.bind(this);
            }),
            (function create(listener) {
              return (this._signal || (this.constructor.prototype._signal = this.ctor.find('Signal'))).of(listener);
            }),
            (function handler(stream) {
              this.handlers.push(stream);
              return this;
            }),
            (function make(/* type, name, id, item */) {
              var args = [].slice.call(arguments);
              var listener = args.pop(); listener.uid = this.uid();
              listener.create = args.pop(); listener.reference = args.join('.');
              return this.set(listener.name, this.create(listener));
            })
          ],
          free: function() {
            return this.find('Free').$ctor.queue(this.find('Coyoneda').of(function() {
              return function(v) {
                v.dequeue();
                return v.length ? this.cont() : this.done();
              }
            }))([]);
          },
          init: function(type, klass, sys) {
            klass.prop('free', type.free.call(this).lift([]));
            klass.prop('eid', this.makeID(false));
          }
        };
      }),
    // === Event === //
      (function() {
        return {
          name: 'Events',
          parent: 'Node',
          klass: function Events(x) {
            this.$super(x || (x = {}));
            this.stats = this.stats(this.parent().uid(), 'events');
            this.initdata();
            this.thread = this.set('thread', this.thread());
          },
          ext: [
            (function initdata() {
              this._lstnrs = this._lstnrs || (this._lstnrs = this.instance('listeners', this.__, false));//this.node('listeners'));
              this._active = this._active || (this._active = this._lstnrs.set('active', []));
            }),
            (function thread() {
              return this.free([]).lift(this._active);
            }),
            (function addEventListener(/* instance, name, selector, target, opts */) {
              var args = [].slice.call(arguments), instance = args.shift(), lstr;
              if (args.length == 1 && typeof args.first() == 'object') {
              }else {
                var name = args.shift();
                var target = args.pop(), opts = args.length && typeof args.last() == 'object' ? args.pop() : {};
                var selector = args.length ? args.shift() : '*';
                var hndl = typeof target == 'string' ? instance[target].bind(instance) : target;
                var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                var ref = instance.identifier();
                return active[active.push({
                  uid: instance.uid(),
                  ref: ref,
                  match: ref + '.',
                  level: instance.level(),
                  name: name, target: hndl,
                  opts: opts, run: hndl.run || hndl
                })-1];
              }
            }),
            (function removeEventListener(info) {
              if (info.sid || info.uid) {
                var signal = this.find(info.sid || info.uid).get(info.type || info.name || 'change');
                if (signal) return signal.remove(info);
              }else if (this._active && this._active.length) {
                var index = 0, signal;
                while (index < this._active.length) {
                  if (this._active[index].name == info) signal = this._active.splice(index, 1);
                  else index++;
                }
                return signal;
              }
            }),
            (function makeEvent(source, args, base) {
              var type   = args.shift();
              var field  = args.shift();
              var path   = field.split('.');
              var target = path.pop();
              var prev   = source.get(target);
              return {
                src:     'data',
                count:    0,
                uid:      source.uid(),
                level:    source.level(),
                type:     type,
                target:   target,
                field:    path.length ? [ path[path.length-1], field ].join('.') : field,
                ref:      path.unshift(source.identifier()) && path.join('.'),
                action:   args.shift(),
                value:    args.pop(),
                previous: prev,
                touched:  []
              };
            }),
            (function emit(source, args, base) {//* source, name, target, info */) {
              if (args !== 'queue' && source && source.uid && this._active) {
                if (this._active.length) {
                  this.stats(source.uid(), args[0], 1);
                  this.thread.push(this.makeEvent(source, args, base));
                }else {
                  //console.log(this, arguments)
                }
              }
            })
          ],
          attrs: [
            (function of(opts) {
              return new this(opts);
            })
          ],
          free: function() {
            return this.find('Free').$ctor.queue(this.find('Coyoneda').of(function(handlers) {
              return function(values) {
                var item = values.shift();
                handlers.map(function(hndl) {
                  if (item.ref === hndl.ref || item.ref.indexOf(hndl.match) === 0) {
                    hndl.run(item); hndl.eid = item.eid;
                  }
                  item.count++;
                });
                return values.length ? this.cont() : this.done();
              }
            }));
          },
          stats: function(node, func, prop) {
            return function(type, name) {
              return func((node.get(type) || node.child(type)).set(name, {}), prop);
            }
          },
          func: function(stats, prop) {
            return function(uid, type, count) {
              return prop(stats[uid] || (stats[uid] = {}), type, count);
            }
          },
          prop: function(stats, type, count) {
            return (stats[type] || (stats[type] = 1)) && ++stats[type];
          },
          init: function(type, klass, sys) {
            klass.prop('free', type.free.call(this));
            klass.prop('isEvents', true);
            var root = sys.root;
            klass.prop('stats', type.stats(root.child('stats'), type.func, type.prop));
            root.child('events', klass.$ctor);
          }
        };
      }),
    // === Listener === //
      (function() {
        return {
          name: 'Listener',
          parent: 'IO',
          klass: function Listener(x) {
            this.$$init(x);
          },
          ext: (function() {
            return [].slice.call(arguments).pure(0, true);
          })(
            (function(items) {
              return function() {
                return items.first().apply(this.root.store(), items.slice(1));
              }
            }),
            (function(makeQueue, mbAddEL1, mbAddEL2, mbELEMListener, addELEMENTListener,
              mbEVTbind1, wrapDISPATCHER, mbEVTcntrTUP, eON, eOFF,
                evtONOFF, mbEvtADD) {
              
              var maybe   = this.get('utils.maybe');
              var tuple   = this.get('utils.tuple');
              var bin     = this.get('utils.bin');
              var fromCB  = this.get('utils.fromCallback');
              var compose = this.get('sys.fn.compose');

              var maybeAddEventListener = maybe(mbAddEL1)(mbAddEL2);

              var maybeListener = maybe(mbELEMListener);

              var maybeEventBinder = maybe(mbEVTbind1);

              var maybeEventControl = maybe(mbEVTcntrTUP)(tuple(eON)(eOFF));

              var maybeEventElem = maybeListener(
                maybe(addELEMENTListener)(maybeEventControl(bin(evtONOFF))));

              function makeEventContainerElement(element) {
                return maybeAddEventListener(maybeEventElem(element || document.body));
              };

              return [
                { name: 'makeQueue', value: makeQueue },
                { name: 'getQueue', value: makeQueue(this.ref().child('queue', this.ctor.find('Queue').$ctor)) },
                { name: 'addElementListener', value: addELEMENTListener },
                { name: 'wrapDispatcher', value: wrapDISPATCHER },
                { name: 'maybeListener', value: maybeListener },
                { name: 'maybeAddEventListener', value: maybeAddEventListener },
                { name: 'maybeEventElem', value: makeEventContainerElement },
                { name: 'maybeEventControl', value: maybeEventControl },
                { name: 'addEventListener', value: mbEvtADD },
                //{ name: 'throttle', value: throttle },
                { name: 'maybeEventBinder', value: maybeEventBinder },
                { name: 'eventOnOffControl', value: evtONOFF },
                { name: 'fromCallback', value: fromCB }
              ];

            }),
            (function makeQueue(queue) {
              return function(name, type) {
                if (!name) return queue;
                var child = queue.child(name);
                child._type = type || name;
                return child;
              }
            }),
            (function addEL1(wrap) {
              return function(make) {
                return wrap(make);
              }
            }),
            (function addEL2(make) {
              return function(name, handler) {
                return make(name, handler);
              }
            }),
            (function maybeElementListener(handler) {
              return function(elem) {
                return handler(elem);
              };
            }),
            (function addElementListener(addListener) {
              return function(elem) {
                return function(name, handler) {
                  return addListener(elem, name, handler);
                };
              };
            }),
            (function createSelectorFunc(matchFunction) {
              return function(element) {
                return function(selector) {
                  return matchFunction(element, selector);
                }
              }
            }),
            (function wrapDispatcher(dispatcher) {
              return function(addListener) {
                return function(name) {
                  return addListener(name, dispatcher);
                }
              }
            }),
            (function tupledEventOnOffFuncs(tup) {
              return function(continuation) {
                return tup(continuation);
              }
            }),
            (function on(elem, name, handler) {
              elem.addEventListener(name, handler);
              return {
                name: name,
                elem: elem,
                run: handler,
                state: 'on'
              };
            }),
            (function off(elem, name, handler) {
              elem.removeEventListener(name, handler);
              return {
                name: name,
                elem: elem,
                run: handler,
                state: 'off'
              };
            }),
            (function eventOnOffControl(on, off) {
              function $on(elem, name, handler) {
                var state = on(elem, name, handler);
                state.off = $off;
                return state;
              };
              function $off(elem, name, handler) {
                var state = off(elem, name, handler);
                state.on  = $on;
                return state;
              };
              return $on;
            }),
            (function add(/* element, type, name, selector, run, throttle */) {
              var args    = [].slice.call(arguments), ref = args.shift(), handler;
              var type    = args.shift(), store = this.getQueue(type), name, node, throttle, run;
              if (args.length == 1 && typeof args.first() == 'object') {
                handler = args.shift();
                name    = handler.name;
                node    = this.run(name);
                return node.add(handler);
              }else {
                name     = args.shift(), node = this.run(name);
                throttle = args.length && typeof args.last() != 'function' ? args.pop() : 0;
                run      = args.pop();

                var opts     = args.length && typeof args.last() == 'object' ? args.pop() : {};
                var selector = args.length && typeof args[0] == 'string' ? args.shift() : null;
                var element  = store.get('createElement')(ref);

                handler  = {
                  type: type, name: name, element: element,
                  selector: selector, throttle: throttle, opts: opts,
                  filter: store.get('selectorFunc')(element, selector),
                  run: run
                };
                return node.add(handler, run);
              }
            })
          ),
          data: {
            dom: [
              (function(make, run) {
                return make(run);
              })(
                (function make(fn) {
                  return function matches(element, selector) {
                    return function(evt) {
                      return fn(element, selector, evt);
                    }
                  };
                }),
                (function run(element, selector, evt) {
                  if (evt.stop) return false;

                  var elem = evt.target;
                  while (elem) {
                    if (!selector || elem.matches(selector)) break;
                    else if (elem == element) return false;
                    else elem = elem.parentElement;
                  }
                  if (elem) {
                    evt.currentTarget = elem;
                    evt.value = (elem.getAttribute('data-value') || elem.getAttribute('data-id') || elem.value || elem.name || elem.innerText || '').toLowerCase();
                    while (elem) {
                      if (!element) break;
                      else if (elem == element) break;
                      else elem = elem.parentElement;
                    }
                  }
                  return !!elem;
                })
              ),
              (function createEvent(evt) {
                return {
                  src: 'dom',
                  eid: evt.eid,
                  sid: this.uid,
                  pid: evt.pid || 0,
                  cnt: evt.cnt || 0,
                  type: evt.type,
                  keys: { alt: evt.altKey, ctrl: evt.ctrlKey, shift: evt.shiftKey, code: evt.keyCode || 0 },
                  count: evt.count || 0,
                  target: evt.target,
                  currentTarget: null,
                  relatedTarget: evt.relatedTarget,
                  x: evt.clientX || evt.x || -1,
                  y: evt.clientY || evt.y || -1
                };
              }),
              (function createElement(element) {
                return typeof element == 'string'
                ? document.getElementById(element) : element;
              })
            ],
            store: [
              (function matches(element, selector) {
                var ref = element.identifier();
                var sel = selector.split('.');
                var trg = sel[sel.length-1];
                return function(evt) {
                  if (evt.stop || !evt.target) return false;
                  if (!selector || (evt.target.matches(trg) && element.lookup(sel.slice(0, -1)).chain(function(elem) {
                    return elem && elem.equals instanceof Function ? elem.equals(evt.uid) : false;
                  })) || (evt.ref.replace(ref, '')+'.'+evt.target).substr(1).matches(selector)) {
                    if (!element) return true;
                    return element.pertains(evt);
                  }
                  return false;
                }
              }),
              (function createEvent(evt) {
                return {
                  src: 'data',
                  eid: evt.eid,
                  uid: evt.uid,
                  sid: this.uid,
                  pid: evt.pid || 0,
                  cnt: evt.cnt || 0,
                  ref: evt.ref,
                  type: evt.type,
                  count: evt.count || 0,
                  level: evt.level,
                  target: evt.target,
                  field: evt.field,
                  action: evt.action,
                  value: evt.value,
                  previous: evt.previous,
                  touched: evt.touched || []
                };
              }),
              (function createElement(element) {
                return typeof element == 'string'
                ? sys.get(element) : element;
              })
            ]
          },
          base: (function(init, make) {
            return function(klass) {
              return init(klass.$ctor.lift((klass.$ctor.base = make)));
            }
          })(
            (function(make) {
              return function init(name, type) {
                return make.run(this.prototype.getQueue(name, type));
              }
            }),
            (function(base, elem) {
              var node, disp, name = elem.nid ? elem.nid() : (elem._cid || elem.id || ('v' + base.uid()));
              if (!name || !(node = base.get(name))) {
                node = base.child(name);
                if (!name) name = node.nid();
                if (!elem.id) elem.id = name;
              }
              var type = node.get('type') || node.set('type', base._type);
              var disp = node.get('dispatcher')
                || node.set('dispatcher', this.wrapDispatcher(node.store().wrap())(this.maybeEventElem(elem)));
              return this.constructor.make.run(node);
            })
          ),
          make: (function(node, name) {
            return node.get(name) ||
              node.store().make(
                node.identifier(), name, node.closest('queue').get(node.get('type'), 'createEvent'),
                  node.get('dispatcher')(name));
          }),
          init: function(type, klass, sys) {
            var $ctor = klass.$ctor;
            var root  = sys.root;
            var lift  = $ctor.lift  = klass.parent().get('type.$ctor').lift;
            var pure  = $ctor.$pure = klass.parent().get('type.$ctor').pure.bind($ctor);
            var func  = $ctor.prototype;
            var init  = $ctor.init  = type.base(klass);
            var make  = $ctor.make  = $ctor.lift(type.make);

            var maybe = root.get('utils.maybe');
            var queue = root.get('queue');

            var dom   = queue.child('dom').parse(type.data.dom);
            var store = queue.child('store').parse(type.data.store);

            dom.set('selectorFunc', dom.get('matches'));
            store.set('selectorFunc', store.get('matches'));

            var ref = this.find('Ref');
            var $store = ref.prop('$store', sys.get().child('record'));
            var lstnr  = sys.klass('Listener').$ctor;
            $store.listener = lstnr.init('record', 'store');
            $store._events  = sys.get('events').child({ name: 'events', parent: $store });
          }
        };
      }),
    // === Model === //
      (function() {
        return {
          parent: 'Node',
          klass: function Model(x) {
            this.$super(x);
            this._meta = this.node('meta');
            this._refs = this.node('refs');
            this._models.push(this);
          },
          ext: [
            { name: '_children', value: 'nodes' },
            { name: '_models', value: [] },
            (function parent() {
              if (this._parent.cid() === 'nodes') {
                return this._parent.parent();
              }else {
                return this._parent;
              }
            }),
            (function model() {
              return this;
            }),
            (function client() {
              return this.find(this.cid().replace(/[^0-9]/g, ''));
            }),
            (function $ref(record, parent) {
              return this._refs.lookup(record.cid()).orElse(function() {
                return this._refs.set(record.cid(), record.$ref(this, parent || this));
              }, this).unit();
            }),
            (function create(name, schema) {
              return this.child(name, this.constructor, this.$model).schema(name, schema);
            }),
            (function schema(code, path) {
              this._meta.set(code, path || 'schema.$app');
              return this;
            }),
            (function make(values) {
              return this.$schema.get(this._meta.get(this.cid())).control('main').add(this.cid(), values === true || (values ? (values.attr ? values : { attr: values }) : {}));
            }),
            (function form(form, values) {
              var name = this.cid();
              var node = this.child(name, this.$record, this);
              form.fields(this.make(true), node.reference().join('.'), true);
              this.observe('change', name + '.%', form.handler('binding'));
              node.clear();
              node.parse(this.make(values), true);
              form.set('data.main', node);
              return this;
            }),
            (function current(code) {
              return code ? this.locate(code) : this.maybe().map(function(node) {
                return node.get(node.get('current'));
              });
            }),
            (function retrieve(dbid) {
              return this.$index.lookup(dbid || this.get('current')).map(uid => sys.find(uid));
            }),
            (function locate() {
              var args = [].slice.call(arguments).flat().join('.').split('.'), key;
              if (args.length) {
                if (args[0] === 'current' && args.shift()) {
                  return args.length ? this.retrieve().get(args) : this.retrieve();
                }else if (args.length > 1) {
                  return this.retrieve(args.shift()).get(args);
                }else {
                  return this.retrieve(args.shift());
                }
              }else {
                return this.retrieve();
              }
            }),
            (function insert(dbid, node) {
              if (!this.$index.get(dbid)) {
                this.$index.set(dbid, node.uid());//{ uid: node.uid(), refs: [] });
              }
              return node;
            }),
            (function record(dbid) {
              var child;
              if (dbid.indexOf('mare') === 0 || dbid.indexOf('madi') === 0) {
                child = this.retrieve(dbid).orElse(function() {
                  return this.$record.prototype.child.call(this, { name: dbid, dbid: dbid }, this.$record);
                }, this.$db).unit();
              }else {
                child = this.$model.children().child(this.set('current', dbid), this.$record, this.$model);
              }
              return child;
            }),
            (function load(/* code, dbid */) {
              var args = [].slice.call(arguments);
              var dbid = args.pop();
              var code = args.length ? args.shift() : undefined;
              return (code ? this.lookup(code) : this.maybe()).map(function(model) {
                if (dbid) {
                  return model.record(model.set('current', dbid));
                }else {
                  return model.get('%current');
                }
              });
            }),
            (function reference() {
              return this.relative(this.$model);
            }),
            (function related(code) {
              return this.get(this.cid()).maybe().lift(function(node, schema) {
                return node.get(schema.cid());
              }).ap(this.$schema.get(this._meta.get(this.cid())).getByCode(code));
            }),
            (function source() {
              return (this._source || (this._source = this.$fn.source.run(this)));
            })
          ],
          filter: function() {
            return sys.klass('IO').pure(function(fn) {
              return this.fx(function(evt) {
                var flag = evt.value && evt.value.isStore && evt.target.match(/^(?:[0-9]+|mare\_[0-9]+|madi\_[0-9]+)$/) ? 'pass' : 'skip';
                ++fn[flag] && ++fn.total;
                if (fn.total%250==0) console.log('total: ', fn.total, 'pass: ', fn.pass, 'skip: ', fn.skip);
                return flag === 'pass' ? fn.right(evt) : fn.left(evt);
              });
            }).run(sys.get('utils').select('left','right').clone({ pass: 0, skip: 0, total: 0 }));
          },
          indexer: function(model) {
            return sys.klass('IO').pure(function(node) {
              return function(client) {
                // console.log('indexer', client.cid(), client.identifier());
                return node.set('client', client);
              };
            }).pipe();
          },
          source: function() {
            return sys.klass('IO').of(function(index, io, pos) {
              return io.ap(io.$pure(function(record) {
                // console.log('index.ensure', record.uid(), record.cid(), record.identifier(true).slice(pos));
                return index.ensure(record.identifier(true).slice(pos));
              }));
            }).lift(function(make, model) {
              var store = model.$source.ensure([ model.cid() ]);
              model.observe('change', '%', model.$fn.filter);
              return make(store, model.$fn.indexer, 3);
            });
          },
          flush: function(source) {
            return function(evt) {
              var parts = source.is(evt.value) ? evt.value.identifier(true).slice(2) : evt.ref.split('.').slice(2);
              return source.maybe(parts).map(function(index) {
                return index.get('client');
              }).map(function(client) {
                if (client.load) client.load(evt);
                //console.log('flush.success', evt.uid, evt.ref, evt.target);
                return evt;
              }).orElse(function() {
                console.log('flush.fail', evt.uid, evt.ref, evt.target);
              });
            }
          },
          model: function($klass) {
            return function(opts) {
              return this.child(opts, $klass.$ctor);
            }
          },
          store: (function(make) {
            return function(handler) {
              return make(handler);
            }
          })(
            (function(store) {
              return function(api) {
                return api.transformer(this.cid(), store.run(this));
              }
            })
          ),
          handler: (function(main, wrap, handler) {
            return main(handler.nest().lift(wrap));
          })(
            (function(render) {
              return sys.klass('IO').lift(function(model, result) {
                var data = result.dbid ? result : result[result.keys().shift()];
                return render.run(data.obj()).run(model.record(data.dbid));
              });
            }),
            (function(io, data) {
              return this.$lift(function(record, handler) {
                return this.fx(function(client) {
                  var ref = record.source(client);
                  var rec = io.run(handler).run(client);
                  var src = record.$parse(data.omit([ 'nodes' ].concat(data.nodes)));
                  return rec.run(data).run(ref);
                });
              });
            }),
            (function(main, nest) {
              return nest.call(sys.klass('IO').pure(main));
            })(
              (function(handler) {
                return this.$lift(function(parent, data) {
                  return this.nest().lift(function(lifted, ref) {
                    var rec = ref.client(parent);
                    var loc = ref.locate();
                    return handler.run(parent).run(data).bind(function(client) {
                      var rec = lifted.run(client).sequence(loc);
                      if (data && data.format === 'named' && data.nodes && data.nodes.length) {
                        return data.nodes.map((name) => {
                          return data[name].length ? data[name].ap(rec) : [];
                        }).filter((nodes) => {
                          return nodes.length;
                        }).list().orElse(client).unit();
                      }else if (data && data.nodes && data.nodes.length) {
                        return data.nodes.ap(rec).collect();
                      }else {
                        return client;
                      }
                    }).cont();
                  });
                });
              }),
              (function() {
                return this.nest().lift(function(process, handler) {
                  return this.fx(function(parent) {
                    return process.run(handler).run(parent);
                  });
                });
              })
            )
          ),
          $handler: function(handler) {
            return function() {
              return handler.run(this);
            }
          },
          api: function(path) {
            return this.root('api').lookup(path.split('/').join('.')).lift(function(api, model) {
              return api.get(model.cid()) || model.$store(api);
            }).ap(this).chain(function(api) {
              return api.request();
            });
          },
          pipe: function(model) {
            return function(evt) {
              if (evt.level > 3) {
                var parts = evt.ref.split('.').slice(3);
                return sys.$find(evt).prop('parent').prop('root').map((root) => {
                  return model.lookup(root.madi()).prop('emit', evt.type, parts.concat(evt.target).join('.'), evt.action, evt.value);
                });
              }
            }
          },
          init: function(type, klass, sys) {
            var model   = klass.prop('$model', sys.root.child('model', klass.$ctor));
            var source  = klass.prop('$source', model.node('source'));
            var handler = klass.prop('$handler', type.$handler(type.handler));
            var store   = klass.prop('$store', type.store(type.handler));
            var store   = klass.prop('$api', type.api);
            var record  = klass.find('Record');
            var control = klass.prop('$control', sys.get('schema.$app').control('main'));
            var root    = klass.prop('root', sys.get);
            klass.prop('$fn', {
              source: type.source(model), indexer: type.indexer(),
              filter: type.filter().pipe(sys.get('utils.tuple')(unit)(type.flush(source))).wrapIO()
            });
            klass.prop('$schema', sys.root);//.get('schema'));//klass.find('Schema').$ctor);
            klass.prop('$record', record.$ctor);
            klass.prop('$index', sys.get('index.dbid'));
            record.prop('$model', model);
            var lstnr = sys.klass('Listener').$ctor;
            model.listener = lstnr.init('instance', 'store');
            model._events  = sys.get('events').child({ name: 'events', parent: model });
            var db = klass.prop('$db', model.child('db'));
            db.observe('change', '%', type.pipe(model));
          }
        };
      }),
    // === Component === //
      (function() {
        return {
          parent: 'Node',
          klass: function Component(x) {
            var opts = x || {};
            if (!opts.parent) opts.parent = this._node;
            this.$$init(opts);

            if (opts.events) {
              this._events = opts.events;
            }else {
              this._events = (opts.parent._events || opts.parent.get('events')).child({ name: 'events', parent: this });
              this.connect();
            }

            if (opts.view) this.view = this.konst(this.set('view', opts.view));
            this._started = 1;

            this.node('$fn');
            this.set('type', (opts.type || this.constructor.name).toDash());
            
            this.parse(opts);
            this.update(opts);
          },
          ext: [
            { name: '_children', value: 'nodes' },
            (function initialize() {
              //console.log(this.identifier(), 'initialize');
            }),
            (function mounted() {
              //console.log(this.identifier(), 'mounted');
            }),
            (function unmounted() {
              //console.log(this.identifier(), 'unmounted');
            }),
            (function ready() {
              //console.log(this.identifier(), 'ready');
            }),
            (function io() {
              return (this._io || (this._io = this.klass('io').of(this.uid)));
            }),
            (function load(record) {
              //console.log([ 'cmp.load', this.identifier(true).slice(2).join('.'), record.identifier(true).slice(2).join('.'), record.read().prop('madi').unit(), record ]);
              return this;
            }),
            (function bindpath(path) {
              return this.view().parent('$fn.attrs').run({ 'data-bind-path' : this.state('path', path) });
            }),
            (function parse(conf) {
              return this.configure(conf);
            }),
            (function monitor() {
              return (this._monitor || (this.ctor.prop('_monitor', this.lookup('root.components').chain(function(comps) {
                return sys.eff('dom.elements.observer').run(comps.set('domobs', []))(document.body);
              }))));
            }),
            (function focus(selector) {
              return this.$fn('find').map(function(el) {
                if (el) {
                  el.focus();
                  el.select();
                }
                return el;
              }).run(selector);
            }),
            (function onReady(evt, hndl) {
              this.removeEventListener(hndl);
              this.enqueue(this.comp(function() {
                this.configure();
                if (this.state('$attach')) this.state('attach', this.state('$attach'));
                if (this.state('$mounted')) this.state('mounted', this.state('$mounted'));
                return true; 
              }));
            }),
            (function onAttach(evt, hndl) {
              this.removeEventListener(hndl);
              this.enqueue(this.comp(function() {
                this.initialize();
                return true; 
              }));
            }),
            (function onMount(evt, hndl) {
              this.enqueue(this.comp(function() {
                this.mounted();
                return true; 
              }));
            }),
            (function onUnmount(evt, hndl) {
              this.enqueue(this.comp(function() {
                this.unmounted();
                return true; 
              }));
            }),
            (function navigate(route) {
              return this.maybe().map(function(comp) {
                return comp.module();
              }).map(function(mod) {
                return mod.get('router');
              }).map(function(rtr) {
                return rtr.navigate(route);
              })
            }),
            (function origin(plural) {

              return plural ? 'components' : 'component';
            }),
            (function attr() {
              return { 'class' : this.constructor.name.toLowerCase() + ' ' + this.origin() };
            }),
            (function view() {
              return (this.view = this.konst(this.child('view', this.deps ? this.deps('components.view') : this.klass('View').$ctor)))();
            }),
            (function bindnode(node) {
              return this.get('data').set('model', node);
              //return this.view().parent('$fn.attrs').run({ 'data-bind-node': this.state('node', node) });
            }),
            (function bindpath(path, node) {
              var bind = { 'data-bind-path' : this.state('path', path) };
              if (node) this.get('data').set('model', node);
              else this.get('data').$record('model');
              this.view().parent('$fn.attrs').run(bind);
              return this;
            }),
            (function attach(selector) {
              return this.view().parent('$fn.attach').ap(selector ? (selector.unit ? selector.unit() : selector) : this.parent().$el()).run().map(this.bin(function(comp, el) {
                var elem = el.parentElement, hndl;
                if (!comp.state('attach')) hndl = comp.observe('change', 'state.attach', 'onAttach');
                comp.state(comp.state('ready') ? 'attach' : '$attach', elem.id || elem.className);
                return elem;
              }));
            }),
            (function mount() {
              var pt = this;
              var ts = (new Date()).getTime();
              var ms = pt.state('mounted') || 0;
              if (!ms) hndl = pt.observe('change', 'state.mounted', 'onMount');
              if (ts > ms) ms = pt.state(pt.state('ready') ? 'mounted' : '$mounted', ts);
              return ms;
            }),
            (function unmount() {
              var pt = this;
              var ts = (new Date()).getTime();
              var ms = pt.state('unmount') || 0;
              if (!ms) hndl = pt.observe('change', 'state.unmount', 'onUnmount');
              if (ts > ms) ms = pt.state('unmount', ts);
              return ms;
            }),
            (function display(state) {
              return (this._display || (this._display = this.klass('io').of(this.view().parent('$fn.display')).lift(function(display, comp) {
                return this.fx(function(value) {
                  return comp.state('display') !== value ? display.run(comp.state('display', value)) : value;
                }).toMaybe();
              }).run(this))).run(state === true ? 'block' : (state || 'none'));
            }),
            (function update() {}),
            (function queue(path) {
              return this.module().queue(path);
            }),
            (function $fn(name) {
              return this.view().parent().get('$fn', name);
            }),
            (function $el(selector) {
              return this.view().$el(selector);
            }),
            (function on(name, selector, handler, throttle) {
              return this.view().on(name, selector, typeof handler == 'string' ? this.handler(handler) : handler, parseInt(throttle || '') || 0);
            }),
            (function route(ext) {
              return 'components/'+this._cid+'/'+this._cid+(ext ? ('.'+ext) : '');
            }),
            (function eff(name, value) {
              return this.lookup('view').orElse(this).chain(function(comp) {
                return value ? (comp.$eff[name] = value) : (name ? comp.$eff[name] : comp.$eff);
              });
            }),
            (function component() {
              var args = [].slice.call(arguments);
              var opts = typeof args.last() === 'object' ? args.pop() : {};
              var ref  = args.shift().split('.');
              var type = args.length ? args.join('.') : ref.join('.');
              var path = type ? type.split('.') : ref.split('.');
              var name = ref.pop();
              var prnt = ref.length ? this.ensure(ref) : this;
              var comp = prnt.get(name);
              var cmps = this.deps ? this.deps(path.length > 1 ? path.shift() : 'components') : null;
              if (comp) {
                return cmps ? comp : comp.cont();
              }else {
                var code = path.length ? path.join('.') : name;
                if (!cmps) {
                  comp = sys.eff('sys.loader.component').run([ 'components', code, code ].join('/')).bind(function(c) {
                    return c.create({ name: name, parent: prnt }).pure();
                  });
                }else if (cmps[code] && cmps[code].create) {
                  comp = cmps[code].create(opts.clone({ name: name, parent: prnt })); 
                }else if (cmps[code]) {
                  comp = cmps[code];
                }else if (cmps['$'+code]) {
                  comp = cmps['$'+code].create(opts.clone({ name: name, parent: prnt }));
                }else if (cmps[code.replace('.', '.$')]) {
                  comp = cmps[code.replace('.', '.$')].create(opts.clone({ name: name, parent: prnt }));
                }else if (!type) {
                  comp = prnt.klass('Component').of(opts.clone({ name: name, parent: prnt }));
                }
              }
              return comp;
            }),
            (function module() {
              if (this.cid() == 'components') return this;
              else if (this.parent().cid() == 'components') return this.parent();

              var module = this.klass('Module');
              return this.closest(module) || this.closest('components').filter(function(c) {
                if (module.is(c)) {
                  if (c.$el().map(function(el) {
                    return el.offsetParent !== null;
                  }).run()) return true;
                }
                return false;
              }).first();
            }),
            (function loca() {
              var path = this.deps('name').split('.'), node;
              if (path.length > 1) {
                node = sys.get('assets').lookup(path).lift(function(node, comp) {
                  return node.get(comp.get('type'));
                }).ap(this);
              }
              return node && node.isSome() ? node : sys.get('assets').lookup(this.origin(true)).lift(function(assets, comp) {
                return assets.lookup(comp.get('type')).orElse(assets.get(comp.cid())).chain(function(node) {
                  return node.get(comp.get('type'));
                });
              }).ap(this);
            }),
            (function make(cont) {
              return this.loca().lift(function(loca, component) {
                var cell = loca.get('js'), kont;
                if (!cell) {
                  cell = component.cell();
                  cell.create = component.constructor.create;
                  loca.set('js', cell).set(component.constructor);
                  kont = cont;
                }else {
                  kont = cell.kont();
                }
                component._cont || (component._cont = kont.bind(component.bin(function(comp, klass) {
                  if (comp.conf.events)  comp.data({ events: comp.conf.events });
                  if (comp.conf.proxy)   comp.data({ proxy: comp.conf.proxy });
                  if (comp.conf.control) comp.control().update(comp.conf.control);
                  if (comp.conf.data  && comp.conf.data.events) comp.data({ events: comp.conf.data.events });
                  return comp.events();
                })).bind(function(comp) {
                  comp.observe('change', 'state.ready', 'onReady');
                  comp.ctor.$ready(comp);
                  return comp;
                }));
                return component;
              }).ap(this).unit();
            }),
            (function cont() {
              var cell = this._cell;
              if (!cell) {
                cell = this._cell = this.cell();
              }
              return cell.kont();
            }),
            (function run(k) {
              var cell = this._cell;
              if (!cell) {
                cell = this._cell = this.cell();
              }
              cell.get(k);
              if (!cell.isBound) {
                cell.isBound = true;
                if (this._cont) this._cont.bind(cell.cont()).run();
                else cell.set(this);
              }
              return this;
            }),
            (function once(k) {
              var cell = this._cell;
              if (cell) cell.get(k);
              else return this.run(k);
              return this;
            }),
            (function chain(f) {
              return this.cont().bind(f);
            }),
            (function pure() {
              var comp = this;
              return function $_pure(k) {
                comp.run(k);
              };
            }),
            (function kont() {
              return this.klass('Cont').of(this.pure());
            })
          ],
          attrs: [
            (function of(opts) {
              var args  = [].slice.apply(arguments);
              var conf  = typeof args[0] == 'object' ? args.shift() : {};
              var node  = this.ctor.prop('_node');//components.ref();
              conf.type = this.name.toTypeName();
              if (!conf.name && args.length && typeof args[0] == 'string') conf.name = args.shift();

              if (args.length && typeof args[0] == 'object') {
                if (args.length == 1) {
                  conf.opts = args.shift();
                  if (conf.opts.data) (conf.data = conf.opts.data) && (delete conf.opts.data); 
                }else if (conf.data = args.shift()) {

                }
              }
              if (!conf.opts && args.length && typeof args[0] == 'object') conf.opts = args.shift();
              if (!conf.parent) conf.parent = node;

              return conf.parent.exists(conf) || conf.parent.child(conf, this);
            })
          ],
          comp: function(comp, f) {
            return function() {
              return f.apply(comp, [].slice.call(arguments));
            }
          },
          done: function(cell) {
            return function(k) {
              var c = cell.of();
              c.get(k);
              return c;
            }
          },
          model: function(model) {
            return function(name) {
              return model.instance(name, 'schema.$app');
            }
          },
          init: function(type, klass, sys) {
            var proto   = klass.proto(), ctor = klass.$ctor, root = sys.root;
            proto.conf  = { opts: { js: true, css: false, tmpl: true }, def: { main: {}, current: {} } };
            proto.$eff  = {};
            proto.cmpt  = klass.$ctor;
            proto.comp  = root.get('utils.call1')(type.comp);
            proto.done  = type.done(this.find('Cell'));
            proto.model = type.model(sys.get('model'));
          }
        };
      }),
    // === Module === //
      (function() {
        return {
          parent: 'Component',
          klass: function Module(x) {
            var prnt = x.parent;
            var main = this.isModule(prnt);

            this.$super(x);
            this.set('modules', []);
            if (main) {
              main.push('modules', this);
            }
            var scope = this.identifier(true);
            //if (this.get('root.config.modules', scope.length < 3 ? this.cid() : scope.slice(2).merge('modules').slice(0, -1), 'modules')) {
            if (!this.get('router') && this.get('root.router')) {
              var name = this.cid();
              var root = scope.length > 3 ? this.parent('router') : this.get('root.router');
              var rtrm = root.get(name);
              if (rtrm) {
                this.observe('change', 'router', 'router');
                this.set('router', rtrm);
              }else {
                root.observe('change', name, this.handler('router'));
              }
            }
          },
          ext: [
            (function loca() {
              return sys.get('assets').lookup(this.ctor.get('info.loca').split('/'));
              return sys.get('assets').lookup(this.origin(true)).lift(function(assets, comp) {
                var rel = comp.relative(comp.get('root.components')), node;
                if (rel.length > 1) {
                  return assets.get(comp.identifier(true).slice(2).slice(0, -1)) || assets.get(comp.get('type'), comp.get('type'));
                  // node = assets.get(rel.slice(1)) || assets.get(rel.slice(0, -1), comp.get('type'));
                  // return node.get(comp.get('type'));
                }else {
                  return assets.get(comp.get('type'), comp.get('type'));
                }
              }).ap(this);
            }),
            (function map(f) {
              return this._store.map(f);
            }),
            (function isModule(value) {
              return value && value instanceof this.___ ? value : false;
            }),
            (function router(evt, hndl) {
              var rtrm = evt.value, node;
              if (evt.action == 'create' && rtrm.cid() == this.cid()) {
                if (evt.uid == this.uid()) {
                  node = this;
                }else {
                  node = this.find(evt);
                  this.set('router', rtrm);
                }
                node.removeEventListener(hndl);
                if (!rtrm.started()) rtrm.startup();
              }
            }),
            (function origin(plural) {

              return plural ? 'modules' : 'module';
            }),
            (function queue(path) {
              return this.listener.getQueue(this.cid()).get(path);
            }),
            (function connect() {
              var ctor = this.klass('Listener').$ctor;
              var lstr = this.listener = ctor.init(this.cid(), 'store');
              if (!this.dispatcher) this.dispatcher = lstr.run(this);

              return this.klass('maybe').of(this.walk('parent', function(v) {
                return v._events;
              })).lift(function(evts, comp) {
                comp._events = evts._events.child({ name: 'events', parent: comp });
                return comp;
              }).ap(this.maybe());
            }),
            (function(launch, ready, base, start, wrap, init, load, route, display, create) {
              return function routes() {
                ready(launch(this.get('root.components')));
                return base({

                  module: this,
                  coyo: sys.klass('coyoneda'),
                  loader: sys.eff('sys.loader.component').init()

                }, start, wrap, init, load, route, display, create);
              }
            })(
              (function $launch(components) {
                return function() {
                  components.initialize();
                  components.state('ready', true);
                }
              }),
              (function $nativeOnDocReady(fn) {
                // First and foremost - already ready??
                if (document.readyState === "complete") {
                  fn();
                  // Mozilla, Opera and webkit nightlies currently support this event
                }else if ( document.addEventListener ) {
                  // Use the handy event callback
                  document.addEventListener("DOMContentLoaded", function() {
                    document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
                    fn();
                  }, false);

                  // If IE event model is used
                } else if (document.attachEvent) {
                  // ensure firing before onload,
                  // maybe late but safe also for iframes
                  document.attachEvent("onreadystatechange", function() {
                    if ( document.readyState === "complete" ) {
                      document.detachEvent( "onreadystatechange", arguments.callee );
                      fn();
                    }
                  });
                }
              }),
              (function $base($items, $start, $wrap, $init, $load, $route, $display, $create) {
                // init - sends the router applied on the router coyo to wrap
                // init - returns a function that receives the route and takes care of the rest
                return $init($route.call($items), $wrap($load.call($items), $display.call($items)), $create);
              }),
              (function $start(initial) {
                return function(router, modules) {
                  return initial(router, modules)(router, modules);
                }
              }),
              (function $wrap(load, display) {
                return function wrap(base) {
                  return function(route) {
                    return load.apply(base.lift(route)).lift(display);
                  }
                }
              }),
              (function $init(route, wrap, create) {
                return function init(router, modules) {
                  return create(init, wrap(route.lift(router)))(router, modules);
                }
              }),
              (function $load() {
                return this.coyo.of(function $loader(loader) {
                  return function(scope) {
                    return loader.run(scope.ref, { name: scope.name, ref: scope.path });
                  }
                }, this.loader);
              }),
              (function $route() {
                return this.coyo.of(function $loader(router) {
                  return function(current) {
                    var info = router.get('info', current);
                    var path = [ 'modules' ].concat(router.scope()).concat([ info.module, info.module ]).join('/');
                    if (info.ref) {
                      return { name: current, ref: [ 'modules' ].concat([ info.ref, info.ref.split('/').pop() ]).join('/'), path: path };
                    }else {
                      return { name: current, ref: path };
                    }
                  }
                });
              }),
              (function $display() {
                return this.coyo.of(function(show) {
                  return show.parent().get('modules').filter(function(m) {
                    if (show.equals(m)) return true;
                    m.display('none');
                  }).first();
                }).map(function(show) {
                  show.attach();
                  show.mount();
                  show.walk('parent', function(v) {
                    if (v.equals('components')) {
                      return true;
                    }else {
                      v.display('block');
                    }
                  });
                  show.display('block').chain(function() {
                    var root = document.body;
                    var main = show.parent();
                    var curr = main.state('current');
                    if (curr) {
                      show.parent().lookup(curr).prop('unmount');
                      root.classList.remove(curr);
                    }
                    root.classList.add(main.state('current', show.cid()));
                  });
                });
              }),
              (function $create(init, make) {
                return function $recur(router, modules) {
                  return modules.bind(function(v, i, o) {
                    if (v.route) {
                      router.addRoute(v.route, { description: v.label, module: v.name || v.route, ref: v.module || '' }, v.alias)(make(v.route));
                    }
                    if (v.modules) {
                      return init(
                        router.getScopeRouter(v.route),
                        v.modules.values()
                        //(v.modules = sys.get().of({ name: 'modules', parent: o }).parse(v.modules).vals())
                      );
                    }
                  });
                }
              })
            )
          ],
          $el: {
            fn: function() {
              return document.getElementById('root');
            },
            io: function(elem) {
              return this.pure(function(selector) {
                return !selector || selector == '*' ? elem() : elem().querySelector(selector);
              }).toMaybe();
            },
            fx: function(io) {
              return function(selector) {
                return io.run(selector);
              }
            }                    
          },
          $attach: function(attach) {
            return function() {
              return this.parent().view().attach(this).lift(function(selector, child) {
                return attach.call(child, selector);
              }).ap(this);
            }
          },
          $onAttach: function() {
            return this.$el('#loader').chain(function(elem) {
              elem.style.cssText = '';
              return elem;
            });
          },
          init: function(type, klass, sys) {
            var comp = this.find('Component'), root = sys.root;
            klass.prop('___', klass.$ctor);
            klass.prop('attach', type.$attach(klass.prop('attach')));
            var node = comp.prop('_node', root.child('components', klass.$ctor));
            node.$el = type.$el.fx(type.$el.io.call(this.find('IO').$ctor, type.$el.fn));
            node.state('current', 'home');
            var disp = comp.prop('listener', node.listener);
            var lstr = this.find('Listener').$ctor;
            comp.prop('dom', lstr.init('dom'));

            node.onAttach = type.$onAttach;
            node.observe('change', 'state.ready', 'onAttach');
          }
        };
      }),
    // === Deps === //
      (function() {
        return {
          parent: 'Value',
          klass: function Deps(x, f) {
            this.id = this.id();
            if (x) this.mv = x;
            if (f) this.mf = f;
            else if (!this.mf) this.mf = unit;
          },
          ext: [
            (function apply(k) {
              return this.mv.get(this.mf(k));
            }),
            (function run(k) {
              return this.mv && !this._locked ? this.apply(k) : k(this);
            })
          ],
          attrs: [
            (function of(v) {
              return this.cast(v);
            })
          ],
          wrap: function(io) {
            return function() {
              return io.run.apply(io, arguments);
            }
          },
          cast: function(klass, wrap) {
            return function(v) {
              if (v instanceof klass.$ctor) {
                return v.unlock();
              }else {
                return wrap(klass.find('IO').pure(v));
              }
            }
          },
          init: function(type, klass, sys) {
            klass.$ctor.cast = type.cast(klass.parent(), type.wrap);
            klass.prop('cast', klass.$ctor.cast);
            //sys.get('components').deps = sys.get('utils.$const')(undefined);
          }
        };
      }),
    // === User === //
      (function() {
        return {
          parent: 'Node',
          klass: function User(x) {
            this.$super(x);
          },
          ext: [
            (function user() {
              return sys.get('config').lookup('user');
            }),
            (function auth() {
              var LocalStorage = sys.get('utils.localStorage'), user = this;
              var local = LocalStorage.getItem('whpk_user'), parsed = JSON.parse(local);

              this.user().map(function(usr) {
                return user.parse(usr.values());
              });

              if (parsed && typeof parsed == 'object') {
                user.parse(parsed);
                var date = new Date();
                var test = user.set('ts_previous', user.get('ts_current'));
                var prev = test ? new Date(test) : null;
                var curr = new Date(user.set('ts_current',  date.toISOString()));
                if (prev && user.set('ts_diff', (curr - (prev || curr)) / 1000) < 300) {
                  user.set('state', 'on');
                }else {
                  user.set('state', 'off');
                }
              }else {
                user.clear();
                user.set('state', 'off');
              }
              LocalStorage.setItem('whpk_user', JSON.stringify(JSON.decycle({
                ts_previous: user.get('ts_previous'),
                ts_current: user.get('ts_current'),
                ts_diff: user.get('ts_diff')
              })).trim());

              return this.state();
            }),
            (function request() {
              return (this._request || (this._request = sys.klass('Cont').extend(
                function UserCont(mv, mf) {
                  this.$super(mv, mf);
                }, {
                  mf: sys.get('async.request')
                }, {
                  of: function(url, data) {
                    return new this({
                      url: url, parse: true, data: data ? JSON.stringify(data) : null,
                      type: data ? 'POST' : 'GET'
                    });
                  }
                }
              ).$ctor));
            }),
            (function local() {
              return this.maybe().of(this.assert('state', 'on'));
            }),
            (function state() {
              return sys.get('config').lookup('auth').map(this.bin(function(user, auth) {
                var url = auth.get('url.state');
                if (url) {
                  return user.request().of(url).bind(function(state) {
                    return user.parse(state).values(true);
                  }).bind(auth.get('test') || unit).cont();
                }
              })).orElse(this.local()).unit();
            }),
            (function login(data) {
              return sys.get('config').lookup('auth').map(this.bin(function(user, auth) {
                var url = auth.get('url.login');
                if (url) {
                  return user.request().of(url, data).bind(function(state) {
                    return user.parse(state).values(true);
                  }).bind(auth.get('test') || unit);
                }
              })).orElse(this.local()).unit();
            }),
            (function logout() {
              return sys.get('config').lookup('auth').map(this.bin(function(user, auth) {
                var url = auth.get('url.logout');
                if (url) {
                  return user.request().of(url).bind(function(state) {
                    return user.parse(state).values(true);
                  }).bind(auth.get('test') || unit);
                }
              })).orElse(this.local()).unit();
            })
          ]
        };
      })
  ),

  (function MakeApp() {
 
    return [].slice.call(arguments);
  })(
    (function $$APPLICATION(run) {

      if (!this.get('sys.isWorker')) run();
    }),
    (function() {
      define(function() {
        return this.klass('Cont').of(this, function(sys) {
          var store = sys.get('assets.core').store();
          var user  = sys.get().child('user', sys.klass('User').$ctor);
          return Array.of(
            store.get('effect.cont').cont(),
            store.get('config.cont').cont()
          ).lift(function() {
            return Array.of(
              store.get('router.cont').cont(),
              store.get('storage.cont').cont(),
              store.get('worker.cont').cont()
            ).lift(function(router) {
              return user.auth();
            }).bind(function(state) {
              var router = sys.get('router');
              var curr = sys.get('config.router.force') || router.getFromHash();
              if (!state || curr == 'auth') {
                router.setRoute('auth');
              }else {
                router.setRoute(curr);
                if ((curr || sys.get('config.modules.application.load')) && curr != 'app') {
                  return sys.eff('sys.loader.component').run('modules/application/application', 'app').cont();
                }
              }
            }).run(function() {
              sys.get('components').maybe().chain(function(comps) {
                var rtr = sys.get('router');
                rtr.ctor.prop('addRoutes', sys.get('utils.call1')(comps.routes()));
                rtr.addRoutes(rtr.parent('config.modules').vals()).run(function() {
                  rtr.startup();
                });
              });
            });
          }).cont().cont();
        }).attr('name', 'core.app');
      });
    })
  )

);
