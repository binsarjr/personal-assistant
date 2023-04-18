import assert from 'assert'
import { it } from 'mocha'
import { decodeText } from '../src/Lib/unicodeStegano'
describe('unicode stegano', () => {
  it('test get hide message', () => {
    const secret =
      '‌‌‌‌‍‬‬‬30‌‌‌‌‍‬‌﻿‌‌‌‌‍﻿‌﻿k‌‌‌‌‍‍﻿﻿‌‌‌‌‍‬‍‬‌‌‌‌‍‬﻿‌‌‌‌‌‍‬‌‍ ‌‌‌‌‍‬‍﻿buat‌‌‌‌‍﻿‬﻿ orang‌‌‌‌‍‬﻿‍ pertama‌‌‌‌‌﻿‌﻿ ‌‌‌‌‍‬﻿‌yang‌‌‌‌‍‬‬‍‌‌‌‌‍‬‬‌ bisa‌‌‌‌‌﻿‍‌‌‌‌‌‍﻿‍‌ ‌‌‌‌‍‍﻿﻿‌‌‌‌‍‬‍‌‌‌‌‌‌﻿‌﻿baca‌‌‌‌‍‬﻿‬ ‌‌‌‌‍‬‍﻿‌‌‌‌‍‬‌‍‌‌‌‌‍‬﻿‬‌‌‌‌‍‍﻿﻿‌‌‌‌‍‬﻿‍pesan‌‌‌‌‌﻿‍‌‌‌‌‌‍﻿‍‌ ‌‌‌‌‌﻿‍‌‌‌‌‌‍‍﻿﻿‌‌‌‌‍‬‌‬‌‌‌‌‍‬‌‍‌‌‌‌‍﻿‍‌‌‌‌‌‌﻿‌‍rahasia ‌‌‌‌‍‬﻿‬‌‌‌‌‍﻿﻿‍ini'
    const decoded = decodeText(secret)
    assert.equal(decoded.hiddenText, 'jcs_flag{m3lih4t_d3ngan_m4t4_bat1n}')
  })
  it('test no hide message', () => {
    const decoded = decodeText("Hello world")
    assert.equal(decoded.hiddenText,"")
  })
})
