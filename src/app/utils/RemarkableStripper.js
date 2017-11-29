import Remarkable from 'remarkable'

const remarkable = new Remarkable()
export default remarkable

/** Removes all markdown leaving just plain text */
const remarkableStripper = md => {
    md.renderer.render = (tokens, options, env) => {
        let str = ''
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'inline') {
                str += md.renderer.render(tokens[i].children, options, env);
            } else {
                // console.log('content', tokens[i])
                const content = tokens[i].content
                str += (content || '') + ' '
            }
        }
        return str
    }
}

remarkable.use(remarkableStripper) // removes all markdown
