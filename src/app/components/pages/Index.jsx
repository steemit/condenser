import React from 'react';
import SvgImage from 'app/components/elements/SvgImage';
import { translateHtml } from 'app/Translator';

export default class Index extends React.Component {
    render() {
        return (
            <div className="Index">
                <div className="text-center">
                    <SvgImage name="steemit" width="480px" height="240px" />
                </div>
                <h1 className="center text-center">
                    {translateHtml(
                        'APP_NAME_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content'
                    )}.
                </h1>
                <br />
                <br />
            </div>
        );
    }
}
