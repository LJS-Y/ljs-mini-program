/**
 * @module date
 * @description 日期常用处理方法
 *  */
import LJSbase from './base'
import LJSnum from './num'

/**
 * IOS时间格式不兼容处理
 *
 * 时间支持 Date / 时间戳(number) / 日期字符串三种形态：
 * 非字符串或不含 '-' 的值原样返回，只有字符串才做 '-'→'/' 等替换。
 *
 * @param {Date|string|number} time 时间。Date 对象、时间戳、或 'yyyy-MM-dd HH:mm:ss' 字符串
 * @param {String[]} [replaceKey=['-','/']] 替换规则，[原字符, 目标字符]
 * @return {String|Date|number} 转换后的时间（无需转换时原样返回）
 * @example this.$LJSdate.timeChange('2025-06-09 09:30:00.000') // '2025/06/09 09:30:00'
 */
export function timeChange(time, replaceKey = ['-', '/']) {
  if (LJSbase.fieldCheck(time) || time.toString().indexOf(replaceKey[0]) === -1) return time
  time = time.replaceAll(replaceKey[0], replaceKey[1])
  // 2025/06/09 09:30:00.000，IOS设备不支持，去除.000
  if (time.indexOf('.') > -1) {
    time = time.split('.')[0]
  }
  // 处理只有年月的格式，IOS报错，自动补入默认/01日值
  if (time.lastIndexOf(replaceKey[1]) === 4) {
    time = time + '/01'
  }
  return time
}

/**
 * 通过传入的时间获取固定格式日期
 *
 * 注 1：原 JSDoc 标 `@param {Date}` 有误。实现会先经 timeChange 转换，
 *       实际支持 Date / 时间戳(number) / 日期字符串三种形态（示例本身传的也是时间戳）。
 * 注 2：返回值恒为字符串（time 为空时原样返回入参，调用方应先做判空）。
 *
 * @param {Date|string|number} time 时间。Date 对象、时间戳、或 'yyyy-MM-dd HH:mm:ss' 字符串
 * @param {String} [pattern='{y}-{m}-{d} {h}:{i}:{s}'] 输出格式，支持 {y} {m} {d} {h} {i} {s} {MS}
 * @returns {string} 格式化后的日期字符串
 * @example this.$LJSdate.formatTime(Date.now(), '{y}-{m}-{d} {h}:{i}:{s}') // '2021-12-22 09:56:58'
 * @example this.$LJSdate.formatTime('2025-06-09 09:30:00', '{y}/{m}/{d}')  // '2025/06/09'
 */
export function formatTime(time, pattern) {
  if (LJSbase.fieldCheck(time)) return time
  time = timeChange(time)
  const date = new Date(time)
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  const formatObj = {
    y: date.getFullYear(),
    m: LJSnum.numberB0(date.getMonth() + 1),
    d: LJSnum.numberB0(date.getDate()),
    h: LJSnum.numberB0(date.getHours()),
    i: LJSnum.numberB0(date.getMinutes()),
    s: LJSnum.numberB0(date.getSeconds()),
    MS: date.getMilliseconds(),
  }
  return format.replace(/{(y|m|d|h|i|s|MS)+}/g, (result, key) => {
    const value = formatObj[key]
    return value
  })
}

/**
 * 定制日期
 * 如前一天、前一个月、前一年
 *
 * 注：原 JSDoc 标 `@param {Date}` 有误。实现同样先经 timeChange 转换，
 * 支持 Date / 时间戳(number) / 日期字符串（示例传的也是时间戳）。
 *
 * @param {Date|string|number} time 时间。Date 对象、时间戳、或 'yyyy-MM-dd' 字符串
 * @param {String} [pattern='{y}-{m}-{d}'] 输出格式，只处理年、月、日
 * @param {Number} [span=0] 步幅，正数为未来日期，负数为过去日期
 * @return {String|Date|string|number} 指定格式的日期；time 为空时原样返回
 * @example this.$LJSdate.customizedDate(Date.now(), '{y}-{m}-{d}', -1) // 2024-03-28 → 2024-03-27
 */
export function customizedDate(time, pattern, span = 0) {
  if (LJSbase.fieldCheck(time)) return time
  time = timeChange(time)
  if (span === 0) {
    let t = new Date(time).getTime()
    return formatTime(t, pattern)
  }
  if (pattern === '{y}-{m}-{d}') {
    let t = new Date(time).getTime()
    t = t + 3600 * 1000 * 24 * span
    return formatTime(t, pattern)
  } else if (pattern === '{y}-{m}') {
    // time = '2024-01'
    const direction = span / Math.abs(span)
    let t = new Date(time)
    let str = ''
    const month = t.getMonth() + 1
    let y = 0
    let m = 0
    if (direction === -1) {
      y = t.getFullYear() + Math.floor((month + span) / 12)
      m = 12 * Math.abs(y - t.getFullYear()) + month + span
      if ((month + span) % 12 === 0) {
        y += direction
        m = 12
      }
    } else if (direction === 1) {
      if (month + span <= 12) {
        y = t.getFullYear()
        m = month + span
      } else {
        if ((month + span) % 12 !== 0) {
          y = t.getFullYear() + Math.floor((month + span) / 12)
          m = month + span - Math.abs(y - t.getFullYear()) * 12
        } else {
          const addY = (month + span) / 12
          y = t.getFullYear() + (addY > 1 ? addY - 1 : addY)
          m = month + span - Math.abs(y - t.getFullYear()) * 12
        }
      }
    }
    str = y + '-' + LJSnum.numberB0(m)
    return str
  } else if (pattern === '{y}') {
    let t = new Date(time)
    return (t.getFullYear() + span).toString()
  }
}

/**
 * 时间处理函数：传入[开始日期, 结束日期]，期望返回数据为[2020-10-01 00:00:00, 2020-10-01 23:59:59]
 * @param {Array} dates [开始日期, 结束日期]
 * @param {Number} tag 1，补时分秒；2，补分秒；3，补秒
 * @returns {Array} 返回一个所需规格的[开始日期, 结束日期]
 * @example this.$LJSdate.dateQjChange(["2020-10-01", "2020-10-07"], 1)，返回["2020-10-01 00:00:00", "2020-10-07 23:59:59"]
 * */
export function dateQjChange(dates, tag = 1) {
  if (dates[0] === '' || dates[0] === null) {
    return dates
  }
  dates[0] = timeChange(dates[0])
  dates[1] = timeChange(dates[1])
  const d1 = new Date(dates[0])
  const d2 = new Date(dates[1])
  if (tag === undefined) {
    tag = 1
  }
  switch (tag) {
    case 1:
      return [
        d1.getFullYear() + '-' + LJSnum.numberB0(d1.getMonth() + 1) + '-' + LJSnum.numberB0(d1.getDate()) + ' 00:00:00',
        d2.getFullYear() + '-' + LJSnum.numberB0(d2.getMonth() + 1) + '-' + LJSnum.numberB0(d2.getDate()) + ' 23:59:59',
      ]
    case 2:
      return [
        d1.getFullYear() +
          '-' +
          LJSnum.numberB0(d1.getMonth() + 1) +
          '-' +
          LJSnum.numberB0(d1.getDate()) +
          ' ' +
          LJSnum.numberB0(d1.getHours()) +
          ':00:00',
        d2.getFullYear() +
          '-' +
          LJSnum.numberB0(d2.getMonth() + 1) +
          '-' +
          LJSnum.numberB0(d2.getDate()) +
          ' ' +
          LJSnum.numberB0(d2.getHours()) +
          ':59:59',
      ]
    case 3:
      return [
        d1.getFullYear() +
          '-' +
          LJSnum.numberB0(d1.getMonth() + 1) +
          '-' +
          LJSnum.numberB0(d1.getDate()) +
          ' ' +
          LJSnum.numberB0(d1.getHours()) +
          ':' +
          LJSnum.numberB0(d1.getMinutes()) +
          ':00',
        d2.getFullYear() +
          '-' +
          LJSnum.numberB0(d2.getMonth() + 1) +
          '-' +
          LJSnum.numberB0(d2.getDate()) +
          ' ' +
          LJSnum.numberB0(d2.getHours()) +
          ':' +
          LJSnum.numberB0(d2.getMinutes()) +
          ':59',
      ]
  }
  return dates
}

/**
 * 根据时间戳返回时长，如3小时15分23秒
 * @param {Number} time 时长，毫秒数的时长
 * @param {Array} showTag 展示的标签，['天', '小时', '分钟', '秒', '毫秒']。可根据需要修改时间单位，如：['d', 'h', 'm', 's', 'ms']。
 * @param {Boolean} showAll 是否完整展示，默认为false。true：0天2小时4分钟21秒876毫秒；false：2小时4分钟21秒876毫秒。
 * @param {Boolean} onlyTime 是否只返回时间集合，默认为false，当为true时showAll参数无效。true：[0, 2, 4, 21, 876]；false：2小时4分钟21秒876毫秒。
 * @returns {String} 返回3小时15分23秒
 * @example
const runTime = this.$LJSdate.timeRunDistance({
  time: 3600*1000*24 + 3600*1000*2 + 60*1000*4 + 1000* 21 + 876,
  showAll: false
})
console.log(runTime);
 * */
export function timeRunDistance({time = 0, showTag = ['天', '小时', '分钟', '秒', '毫秒'], showAll = false, onlyTime = false}) {
  let zf = 1;
  if (time < 0) zf = -1; 
  time = Math.abs(time);
  
  const hm = 1000; // 1秒
  const m = 60 * hm; // 1分钟
  const h = 60 * m; // 1小时
  const d = 24 * h; // 1天
  const times = [0, 0, 0, 0, 0];
  // 天
  if (time >= d) {
    const num = Math.floor(time / d);
    times[0] = zf * num;
    time -= d * num;
  }
  // 小时
  if (time >= h) {
    const num = Math.floor(time / h);
    times[1] = zf * num;
    time -= h * num;
  }
  // 分钟
  if (time >= m) {
    const num = Math.floor(time / m);
    times[2] = zf * num;
    time -= m * num;
  }
  // 秒
  if (time >= hm) {
    const num = Math.floor(time / hm);
    times[3] = zf * num;
    time -= hm * num;
  }
  // 毫秒
  times[4] = zf * time;
  if (onlyTime) {
    return times;
  }
  
  let tag = showAll;
  let str = '';
  times.forEach((t, i) => {
    if (!tag && t !== 0) {
      tag = true;
    }
    if (tag) {
      str += t + showTag[i];
    }
  });
  return str;
}

/**
 * 区间日期
 * 统一处理方法，常用于默认的区间日期表单
 * @param {number} day 跨度
 * @param {Boolean} time 是否开启时分秒
 * @returns {Array} 返回默认起止日期
 * @example this.$LJSdate.initSearchDate()，返回["2020-10-01", "2020-10-10"]
 * */
export function initSearchDate(day = 10, time = false) {
  let start = ''
  let end = ''
  let formatValue = '{y}-{m}-{d}'
  if (time) {
    formatValue = '{y}-{m}-{d} {h}:{i}:{s}'
  }
  start = formatTime(new Date().getTime() - 3600 * 1000 * 24 * (day - 1), formatValue)
  end = formatTime(new Date(), formatValue)
  return [start, end]
}

/**
 * 获取当月，当年，近n年的区间
 * @param {String} type 类型：datetime,date,month,year
 * @param {Number} n 年类型的跨度
 * @returns {Array} 返回默认起止日期
 * @example this.$LJSdate.initSearchDateQj()，返回["2020-10-01", "2020-10-10"]
 * */
export function initSearchDateQj(type = 'date', n = 0) {
  const date = new Date()
  let start = ''
  let end = ''
  switch (type) {
    case 'datetime':
      start = formatTime(date, '{y}-{m}-{d} 00:00:00')
      end = formatTime(date, '{y}-{m}-{d} {h}:{i}:{s}')
      break
    case 'date':
      start = formatTime(date, '{y}-{m}-01')
      end = formatTime(date, '{y}-{m}-{d}')
      break
    case 'month':
      start = formatTime(date, '{y}-01')
      end = formatTime(date, '{y}-{m}')
      break
    case 'year':
      start = date.getFullYear() - (n + 1) * 5
      end = date.getFullYear()
      break
  }
  return [start, end]
}

export default {
	timeChange,
  formatTime,
  customizedDate,
  dateQjChange,
  timeRunDistance,
  initSearchDate,
  initSearchDateQj,
}
