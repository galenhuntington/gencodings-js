const chars = {
   60: "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
   86: "!#$%()*+-./0123456789:=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~",
};

const rchars = {};
const getRchars = set => {
   if (!(set in rchars)) {
      const rc = new Array(128);
      for (let i = 0; i < set; i++) {
         rc[chars[set].charCodeAt(i)] = i;
      }
      rchars[set] = rc;
   }
   return rchars[set];
};

const precount = (set, str) => {
   const rc = getRchars(set);
   let count = 0;
   for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c < 128 && rc[c] !== undefined) count++;
   }
   return count;
};

const readView = (view, i) => (i < view.byteLength ? view.getUint8(i) : 0);

const div = (a, b) => Math.floor(a / b);

const renderBase = (base, val, len) => {
   const chs = chars[base];
   let str = "";
   for (let i = 0; i < len; i++) {
      str = chs[val % base] + str;
      val = div(val, base);
   }
   return str;
};

const readBase = (base, str, ix, len) => {
   const rc = getRchars(base);
   let val = 0,
      i = 0;
   while (i < len) {
      const c = str.charCodeAt(ix);
      const v = rc[c];
      if (isNaN(c) || rc[c] !== undefined) {
         val = base * val + (v || 0);
         i++;
      } else if (!String.fromCharCode(c).match(/\s/)) {
         throw new Error("Illegal character '" + c + "' at position " + ix);
      }
      ix++;
   }
   return [ix, val];
};

export const g86Encode = buf => {
   const view = new DataView(buf);
   const len = buf.byteLength;
   const strlen = Math.ceil((len * 5) / 4);
   let str = "",
      ix = 0,
      out = 0;
   while (ix < len) {
      let val = 0;
      do {
         val = 258 * val + readView(view, ix);
      } while (++ix % 4);
      const chunk = renderBase(86, val, 5);
      out += 5;
      str += out > strlen ? chunk.substr(0, 5 + strlen - out) : chunk;
   }
   return str;
};

export const g86Decode = str => {
   const size = precount(86, str);
   const len = div(size * 4, 5);
   const buf = new ArrayBuffer(len);
   const view = new Uint8Array(buf);
   let ix = 0,
      out = 0;
   const set = (i, v) => out + i < len && (view[out + i] = v);
   while (ix < str.length) {
      let val;
      [ix, val] = readBase(86, str, ix, 5);
      for (let i = 3; i >= 0; i--) {
         set(i, val % 258);
         val = div(val, 258);
      }
      out += 4;
   }
   return buf;
};

export const g60Encode = buf => {
   const view = new DataView(buf);
   const get = i => readView(view, i);
   const len = buf.byteLength;
   const strlen = Math.ceil((len * 11) / 8);
   let str = "",
      ix = 0,
      out = 0;
   while (ix < len) {
      const D = get(ix + 3);
      const E = get(ix + 4);
      const chunk =
         renderBase(
            60,
            3024000 * get(ix) +
               10800 * get(ix + 1) +
               40 * get(ix + 2) +
               div(48 * (D >= 128) + 9 * D + div(E, 30), 60),
            5
         ) +
         renderBase(
            60,
            6998400000 * (D % 128) +
               25920000 * E +
               86400 * get(ix + 5) +
               300 * get(ix + 6) +
               get(ix + 7),
            6
         );
      ix += 8;
      out += 11;
      str += out > strlen ? chunk.substr(0, 11 + strlen - out) : chunk;
   }
   return str;
};

export const g60Decode = str => {
   const size = precount(60, str);
   const len = div(size * 4, 5);
   const buf = new ArrayBuffer(div(size * 8, 11));
   const view = new Uint8Array(buf);
   let ix = 0;
   let out = 0;
   const set = (i, v) => out + i < len && (view[out + i] = v);
   while (ix < str.length) {
      let val = 0;
      [ix, val] = readBase(60, str, ix, 6);
      const E1 = val % 1200;
      set(3, (val % 2400 >= 1200) * 128 + div(E1, 9));
      val = div(val, 2400);
      set(2, val % 270);
      val = div(val, 270);
      set(1, val % 280);
      set(0, div(val, 280));
      [ix, val] = readBase(60, str, ix, 5);
      set(7, val % 300);
      val = div(val, 300);
      set(6, val % 288);
      val = div(val, 288);
      set(5, val % 300);
      val = div(val, 300);
      set(4, val + (E1 % 9) * 30);
      out += 8;
   }
   return buf;
};

export const G60 = { decode: g60Decode, encode: g60Encode };
export const G86 = { decode: g86Decode, encode: g86Encode };

