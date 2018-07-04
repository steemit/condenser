import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import tt from 'counterpart';
import TagInput from 'app/components/elements/postEditor/TagInput';
import TagsEditLine from 'app/components/elements/postEditor/TagsEditLine';
import PostOptions from 'app/components/elements/postEditor/PostOptions/PostOptions';
import Button from 'app/components/elements/common/Button';
import Hint from 'app/components/elements/common/Hint';
import { NSFW_TAG } from 'app/utils/tags';
import './PostFooter.scss';

export default class PostFooter extends React.PureComponent {
    static propTypes = {
        editMode: PropTypes.bool,
        tags: PropTypes.array,
        postDisabled: PropTypes.bool,
        onPayoutTypeChange: PropTypes.func.isRequired,
        onTagsChange: PropTypes.func.isRequired,
        onPostClick: PropTypes.func.isRequired,
        onResetClick: PropTypes.func.isRequired,
        onCancelClick: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            temporaryErrorText: null,
            multiLine: true,
        };
    }

    componentDidMount() {
        this.setState({
            multiLine: this.refs.root.clientWidth > 950,
        });
    }

    componentWillUnmount() {
        clearTimeout(this._temporaryErrorTimeout);
    }

    render() {
        const { editMode, tags, postDisabled, onTagsChange } = this.props;
        const { temporaryErrorText, multiLine } = this.state;

        return (
            <div
                className={cn('PostFooter', {
                    PostFooter_edit: editMode,
                    'PostFooter_fix-height': multiLine,
                })}
                ref="root"
            >
                <div className="PostFooter__line">
                    <div className="PostFooter__tags">
                        <TagInput tags={tags} onChange={onTagsChange} />
                        {multiLine ? (
                            <TagsEditLine
                                tags={tags}
                                inline
                                className="PostFooter__inline-tags-line"
                                hidePopular={editMode}
                                onChange={this.props.onTagsChange}
                            />
                        ) : null}
                    </div>
                    <PostOptions
                        nsfw={this.props.tags.includes(NSFW_TAG)}
                        onNsfwClick={this._onNsfwClick}
                        payoutType={this.props.payoutType}
                        editMode={editMode}
                        onPayoutChange={this.props.onPayoutTypeChange}
                    />
                    <div className="PostFooter__buttons">
                        <div className="PostFooter__button">
                            {editMode ? (
                                <Button onClick={this.props.onCancelClick}>
                                    {tt('g.cancel')}
                                </Button>
                            ) : (
                                <Button onClick={this.props.onResetClick}>
                                    {tt('g.clear')}
                                </Button>
                            )}
                        </div>
                        <div className="PostFooter__button">
                            {temporaryErrorText ? (
                                <Hint error>{temporaryErrorText}</Hint>
                            ) : null}
                            <Button primary disabled={postDisabled} onClick={this.props.onPostClick}>
                                {editMode
                                    ? tt('post_editor.update')
                                    : tt('g.post')}
                            </Button>
                        </div>
                    </div>
                </div>
                {multiLine ? null : (
                    <TagsEditLine
                        className="PostFooter__tags-line"
                        tags={tags}
                        hidePopular={editMode}
                        onChange={onTagsChange}
                    />
                )}
            </div>
        );
    }

    showPostError(errorText) {
        clearTimeout(this._temporaryErrorTimeout);

        this.setState({
            temporaryErrorText: errorText,
        });

        this._temporaryErrorTimeout = setTimeout(() => {
            this.setState({
                temporaryErrorText: null,
            });
        }, 5000);
    }

    _onNsfwClick = () => {
        const tags = this.props.tags;
        let newTags;

        if (tags.includes(NSFW_TAG)) {
            newTags = tags.filter(t => t !== NSFW_TAG);
        } else {
            newTags = tags.concat(NSFW_TAG);
        }

        this.props.onTagsChange(newTags);
    };
}
