/**
 * Check whether the value is an actual Object or not.
 * @param {*} value
 * @returns {Boolean}
 */
export default function isObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
