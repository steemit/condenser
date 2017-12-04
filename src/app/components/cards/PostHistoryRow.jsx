import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';

export default class PostHistoryRow extends React.Component {
    render() {
        const op = this.props.op;
        console.log( "op: ", op );
        const context = this.props.context; /// account perspective

        const parent_author = op[1].op[1].parent_author;
        const author = op[1].op[1].author;
        const parent_link = "/@" + parent_author;
        const author_link = "/@" + author;
        const parent_perm = op[1].op[1].parent_permlink;
        const permlink = op[1].op[1].permlink;
        let in_reply_to = <span />;
        if (parent_author && parent_author != context)
            in_reply_to = <span>{tt('g.in_reply_to') + ' '}<Link to={parent_link}>@{parent_author}</Link></span>;
        else if (parent_author == context)
            in_reply_to = <span><Link to={author_link}>@{author}</Link> {tt('g.replied_to', {account: parent_author})}</span>;

        //    const content_markdown = op[1].op[1].body;
        //    const body = (<MarkdownViewer formId={} text={content_markdown} jsonMetadata={} />)
        const post_link = '/' + op[1].op[1].parent_permlink + author_link + '/' + permlink;

        return( <div>

          <div className="row">
            <div className="column small-12" >
              <h4><Link to={post_link}>{op[1].op[1].title}</Link></h4>
            </div>
          </div>
          <div className="row">
            <div className="column small-12" >
              <Icon name="clock" className="space-right" />
              <TimeAgoWrapper date={op[1].timestamp} /> {in_reply_to}
            </div>
          </div>
        </div>);
    }
}
