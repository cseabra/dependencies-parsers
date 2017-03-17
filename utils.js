/**
 * Remove duplicadas de arrays (http://jsfiddle.net/46S7g/)
 * @param a 
 * @param b 
 * @param c 
 */
function toUnique(a, b, c) {//array,placeholder,placeholder
    b = a.length;
    while (c = --b) while (c--) a[b] !== a[c] || a.splice(c, 1);
    return a;
}

module.exports = {
    toUnique : toUnique
};