import React from 'react';
import tt from 'counterpart';

class PostTemplateSelector extends React.Component {
    static propTypes = {
        username: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired,
    };

    render() {
        const { username } = this.props;
        if (!username || typeof window === 'undefined') {
            return null;
        }

        const lsEntryName = `steemPostTemplates-${username}`;
        let userTemplates = window.localStorage.getItem(lsEntryName);
        if (userTemplates) {
            userTemplates = JSON.parse(userTemplates);
        } else {
            userTemplates = null;
        }

        const handleTemplateSelection = (event, create = false) => {
            const selectedTemplateName = event.target.value;
            this.props.onChange(
                create ? `create_${selectedTemplateName}` : selectedTemplateName
            );
        };

        return (
            <div>
                <div className="row">
                    <div className="column">
                        <h4>{tt('post_template_selector_jsx.templates')}</h4>
                        <p>
                            {tt(
                                'post_template_selector_jsx.templates_description'
                            )}
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 medium-6 large-12 columns">
                        {userTemplates && (
                            <select onChange={handleTemplateSelection}>
                                <option value="">
                                    {tt(
                                        'post_template_selector_jsx.choose_template'
                                    )}
                                </option>
                                {userTemplates.map((template, idx) => (
                                    <option value={template.name} key={idx}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!userTemplates && (
                            <span>
                                {tt(
                                    'post_template_selector_jsx.create_template_first'
                                )}
                            </span>
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 medium-6 large-12 columns">
                        <input
                            id="new_template_name"
                            type="text"
                            className="input-group-field bold"
                            placeholder={tt(
                                'post_template_selector_jsx.new_template_name'
                            )}
                            onChange={event => {
                                handleTemplateSelection(event, true);
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default PostTemplateSelector;
