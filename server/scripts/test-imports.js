import c from './cases-criminal.js';
import co from './cases-constitutional.js';
import f from './cases-family.js';
import o from './cases-other.js';
console.log('Criminal:', c.length);
console.log('Constitutional:', co.length);
console.log('Family:', f.length);
console.log('Other:', o.length);
console.log('Total new:', c.length + co.length + f.length + o.length);
