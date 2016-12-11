
import assert from 'assert'
import secureRandom from 'secure-random'
import links, * as linksRe from 'app/utils/Links'

describe('Links', () => {
    it('all', () => {
        match(linksRe.any(), '"https://example.com', 'https://example.com')
        match(linksRe.any(), 'https://example.com\"', 'https://example.com')
        match(linksRe.any(), 'https://example.com\'', 'https://example.com')
        match(linksRe.any(), 'https://example.com<', 'https://example.com')
        match(linksRe.any(), 'https://example.com>', 'https://example.com')
        match(linksRe.any(), 'https://example.com\n', 'https://example.com')
        match(linksRe.any(), ' https://example.com ', 'https://example.com')
        match(linksRe.any(), 'https://example.com ', 'https://example.com')
        match(linksRe.any(), 'https://example.com.', 'https://example.com')
        match(linksRe.any(), 'https://example.com/page.', 'https://example.com/page')
        match(linksRe.any(), 'https://example.com,', 'https://example.com')
        match(linksRe.any(), 'https://example.com/page,', 'https://example.com/page')
    })
    it('multiple matches', () => {
        const all = linksRe.any('ig')
        let match = all.exec('\nhttps://example.com/1\nhttps://example.com/2')
        assert.equal(match[0], 'https://example.com/1')
        match = all.exec('https://example.com/1 https://example.com/2')
        assert.equal(match[0], 'https://example.com/2')
    })
    it('by domain', () => {
        const locals = ['https://localhost/', 'http://steemit.com', 'http://steemit.com/group']
        match(linksRe.local(), locals)
        matchNot(linksRe.remote(), locals)

        const remotes = ['https://example.com/', 'http://abc.co']
        match(linksRe.remote(), remotes)
        matchNot(linksRe.local(), remotes)
        // match(linksRe({external: false}), largeData + 'https://steemit.com2/next', 'https://steemit.com2/next')
    })
    it('by image', () => {
        match(linksRe.image(), 'https://example.com/a.jpeg')
        match(linksRe.image(), 'https://example.com/a/b.jpeg')
        match(linksRe.image(), '![](https://example.com/img2/nehoshtanit.jpg)', 'https://example.com/img2/nehoshtanit.jpg')
        match(linksRe.image(), '<img src="https://example.com/img2/nehoshtanit.jpg"', 'https://example.com/img2/nehoshtanit.jpg')
        match(linksRe.image(), 'http://example.com\nhttps://example.com/a.jpeg', 'https://example.com/a.jpeg')
        match(linksRe.image(), 'http://i.imgur.com/MWufFQi.jpg\")', 'http://i.imgur.com/MWufFQi.jpg')
        matchNot(linksRe.image(), ['http://imgur.com/iznWRVq', 'https://openmerchantaccount.com/'])
    })
})

// 1st in the browser it is very expensive to re-create a regular expression many times, however, in nodejs is is very in-expensive (it is as if it is caching it).
describe('Performance', () => {
    const largeData = secureRandom.randomBuffer(1024 * 10).toString('hex')
    it('any, ' + largeData.length + ' bytes x 10,000', () => {
        for (let i = 0; i < 10000; i++) {
            const match = (largeData + 'https://example.com').match(linksRe.any())
            assert(match, 'no match')
            assert(match[0] === 'https://example.com', 'no match')
        }
    })
    it('image (large), ' + largeData.length + ' bytes x 10,000', () => {
        for (let i = 0; i < 10000; i++) {
            matchNot(linksRe.image(), 'https://lh3.googleusercontent.com/OehcduRZPcVIX_2tlOKgYHADtBvorTfL4JtjfGAPWZyiiI9p_g2ZKEUKfuv3By-aiVfirXaYvEsViJEbxts6IeVYqidnpgkkkXAe0Q79_ARXX6CU5hBK2sZaHKa20U3jBzYbMxT-OVNX8-JYf-GYa2geUQa6pVpUDY35iaiiNBObF-TMIUOqm0P61gCdukTFwLgld2BBlxoVNNt_w6VglYHJP0W4izVNkEu7ugrU-qf2Iw9hb22SGIFNpbzL_ldomDMthIuYfKSYGsqe2ClvNKRz-_vVCQr7ggRXra16uQOdUUv5IVnkK67p9yR8ioajJ4tiGdzazYVow46pbeZ76i9_NoEYnOEX2_a7niofnC5BgAjoQEeoes1cMWVM7V8ZSexBA-cxmi0EVLds4RBkInvaUZjVL7h3oJ5I19GugPTzlyVyYtkf1ej6LNttkagqHgMck87UQGvCbwDX9ECTngffwQPYZlZKnthW0DlkFGgHN8T9uqEpl-3ki50gTa6gC0Q16mEeDRKZe7_g5Sw52OjMsfWxmBBWWMSHzlQKKAIKMKKaD6Td0O_zpiXXp7Fyl7z_iESvCpOAUAIKnyJyF_Y0UYktEmw=w2066-h1377-no')
        }
    })
    it('image, ' + largeData.length + ' bytes x 10,000', () => {
        for (let i = 0; i < 10000; i++) {
            const match = (largeData + 'https://example.com/img.jpeg').match(linksRe.image())
            assert(match, 'no match')
            assert(match[0] === 'https://example.com/img.jpeg', 'no match')
        }
    })
    it('remote, ' + largeData.length + ' bytes x 10,000', () => {
        for (let i = 0; i < 10000; i++) {
            const match = (largeData + 'https://example.com').match(linksRe.remote())
            assert(match, 'no match')
            assert(match[0] === 'https://example.com', 'no match')
        }
    })
    it('youTube', () => {
        match(linksRe.youTube(), 'https://youtu.be/xG7ajrbj4zs?t=7s')
        match(linksRe.youTube(), 'https://www.youtube.com/watch?v=xG7ajrbj4zs&t=14s')
        match(linksRe.youTube(), 'https://www.youtube.com/watch?v=xG7ajrbj4zs&feature=youtu.be&t=14s')
    })
    it('youTubeId', () => {
        match(links.youTubeId, 'https://youtu.be/xG7ajrbj4zs?t=7s', 'xG7ajrbj4zs', 1)
        match(links.youTubeId, 'https://www.youtube.com/watch?v=xG7ajrbj4zs&t=14s', 'xG7ajrbj4zs', 1)
        match(links.youTubeId, 'https://www.youtube.com/watch?v=xG7ajrbj4zs&feature=youtu.be&t=14s', 'xG7ajrbj4zs', 1)
    })
})

const match = (...args) => compare(true, ...args)
const matchNot = (...args) => compare(false, ...args)
const compare = (matching, re, input, output = input, pos = 0) => {
    if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i++)
            compare(matching, re, input[i], output[i])
        return
    }
    // console.log('compare, input', input)
    // console.log('compare, output', output)
    const m = input.match(re)
    if(matching) {
        assert(m, `No match --> ${input} --> output ${output} --> using ${re.toString()}`)
        // console.log('m', m)
        assert.equal(m[pos], output, `Unmatched ${m[pos]} --> input ${input} --> output ${output} --> using ${re.toString()}`)
    } else {
        assert(!m, `False match --> input ${input} --> output ${output} --> using ${re.toString()}`)
    }
}
