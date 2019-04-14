/**
 * @description 将EasyLINQ()作为一个工厂方法，返回init()函数的实例对象
 * @注意：箭头函数 this 的指向（不仅仅是this，其实super,new.target等）由外围最近一层非箭头函数决定
 */
(function () {
  /**
   * @description 匿名函数创建一个函数
   * @type {function(*=): Window.easylinq.init}
   * @return 返回init()函数的实例对象
   */
  const EasyLINQ = (dataItems) => new EasyLINQ.fn.init(dataItems);
  if (window) {
    window.easylinq = window.EasyLINQ = (dataItems) => new EasyLINQ.fn.init(dataItems);
  }
  const _ = {
    notNull(obj) {
      return typeof obj === 'object' && Object.keys(obj).length !== 0
    },
    notFunc(fn) {
      return typeof fn !== 'function'
    },
    paraToFuc(para) {
      let callback = null;
      if (!_.notNull(para)) {
        throw new Error('params needs object');
      }
      const key = Object.keys(para)[0];
      const value = Object.values(para)[0];
      if (Object.prototype.toString.call(value) === "[object RegExp]") {
        return callback = function (item) {
          return this[key] && value.test(item[key])
        }
      } else {
        return callback = function () {
          return this[key]
        }
      }
    }
  };
//EasyLINQ 对象原型
  EasyLINQ.fn = EasyLINQ.prototype = {
    // init: (data) => {
    //   this.items = data;
    // },
    init: function (data) {
      this.items = data;
    },
    easyLINQ: '1.00',
    constructor: EasyLINQ,
    echo() {
      return this.items;
    },
    elementAt(i) {
      return this.items[i];
    },
    where(clause) {
      if (_.notFunc(clause)) {
        clause = _.paraToFuc(clause);
      }
      const arr = this.items;
      const list = arr.reduce((total, current) => (clause.apply(current, [current]) && total.push(current), total), []);
      return EasyLINQ(list);
    },
    select(clause) {
      let field = clause, callback, value;
      const func = function () {
        return field.split(',').reduce((obj, current) => (this[current] ? obj[current] = this[current] : null, obj), {})
      };
      const singleFuc = function () {
        return this[field]
      };
      if (_.notFunc(clause)) {
        field.indexOf(',') === -1 ? callback = singleFuc : callback = func;
      }
      const newArray = this.items.reduce((arr, current) => (value = callback.apply(current), value && arr.push(value), arr), []);
      return EasyLINQ(newArray);
    },
    orderBy(clause) {
      const tempArray = JSON.parse(JSON.stringify(this.items));
      if (_.notFunc(clause)) {
        let field = clause;
        clause = function () {
          return this[field]
        }
      }
      const results = tempArray.sort((a, b) => {
        let x = clause.apply(a, [a]), y = clause.apply(b, [b]);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
      return EasyLINQ(results);
    },
    concat(array) {
      const arr = array.items || array;
      return JSLINQ(this.items.concat(arr));
    },
    count: function (clause) {
      if (clause === undefined) {
        return this.items.length;
      } else {
        return this.where(clause).items.length;
      }
    },
    first(clause) {
      if (clause !== undefined) {
        return this.Where(clause).First();
      } else {
        if (this.items.length > 0) {
          return this.items[0];
        } else {
          return null;
        }
      }
    },
    last(clause) {
      if (clause !== undefined) {
        return this.Where(clause).Last();
      }
      else {
        if (this.items.length > 0) {
          return this.items[this.items.length - 1];
        } else {
          return null;
        }
      }
    },
    any(clause) {
      for (let i = 0; i < this.items.length; i++) {
        if (clause.apply(this.items[i], [this.items[i], i])) {
          return true;
        }
      }
      return false;
    },
    all(clause) {
      for (let i = 0; i < this.items.length; i++) {
        if (!clause(this.items[i])) {
          return false;
        }
      }
      return true;
    },
    take(count) {
      return this.where((item, index) => index < count);
    },
    skip(count) {
      return this.where((item, index) => index > count);
    }
  };

  (function (fn) {
    fn.Echo = fn.ECHO = fn.echo;
    fn.ElementAt = fn.elementAt;
    fn.Where = fn.where;
    fn.Select = fn.select;
    fn.OrderBy = fn.orderBy;
    fn.Concat = fn.concat;
    fn.Count = fn.count;
    fn.First = fn.first;
    fn.Last = fn.last;
    fn.Any = fn.any;
    fn.Take = fn.take;
    fn.Skip = fn.skip;
  }(EasyLINQ.fn));

  EasyLINQ.fn.init.prototype = EasyLINQ.fn;
})();

