**gencodings** provides two binary-to-text encodings and decodings
for use in JavaScript, including Node.js.  These are similar to
Base64 encoding, in that they provide a way to represent binary data
in pure ASCII.

GEncodings have a number of desirable properties, such as preserving
order, having a 1-1 length relationship, and providing maximum
information from partial data.  The links below point to a fuller
specification that explains the design.

This library provides these two GEncodings:

*  **[G60](https://github.com/galenhuntington/g60)** allows binary data
 to be rendered as an alphanumeric string.

*  **[G86](https://github.com/galenhuntington/g86)** is for rendering
 binary data more compactly by using nearly all ASCII characters,
 including punctuation.  However, it still avoids characters that
 may be problematic in HTML/XML, source code, and cookies.

An existing encoding, [Crockford
Base-32](https://www.crockford.com/base32.html), is recommended if
it is desired to have a case-insensitive encoding, at the cost of
requiring more characters.

##  Usage

The functions `g60Encode`, `g60Decode`, `g86Encode`, `g86Decode`
are exported.  Also exported are the objects `G60` and `G86`, each
of which have properties `encode` and `decode`.

The encoders take an ArrayBuffer and return a JavaScript string,
while the decoders do the reverse.

```javascript
import { G60, g86Decode } from "gencodings";

console.log(g60Encode(g86Decode("0H_fZQ{)BO)~boV#*k#m[R{{J2)ahL$Xwhks56l[")));
// -> 8TAB1GT5CjX4TGY6u6kxc8eGTdR7P3g8U1uLn3jsXM2H
```

