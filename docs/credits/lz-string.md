# LZ-String

`play/js/lz-string.js` uses the LZ-String implementation already bundled in the pinned Dogeminer 2 source (`play-B7Micxas.js`, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`). Its global is renamed to `DogeMinerLZString` to avoid unrelated scripts. This keeps Base64 and UTF16 `.doge` decoding compatible without a network dependency.

LZ-String is Copyright (c) 2013 Pieroxy and distributed under the [MIT license](https://github.com/pieroxy/lz-string/blob/master/LICENSE.md). The license is retained in `lz-string-LICENSE.txt` alongside this file.
