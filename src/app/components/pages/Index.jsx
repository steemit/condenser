import React from 'react';
import SvgImage from 'app/components/elements/SvgImage';
import { translateHtml } from 'app/Translator';

const mailchimp_form = `
<!-- Begin MailChimp Signup Form -->
<div id="mc_embed_signup text-center">
<form action="//steemit.us13.list-manage.com/subscribe/post?u=66efbe94e8b1cf5f44ef6aac5&amp;id=3f204846eb" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate medium-5 large-5 small-6 columns center" novalidate>
    <div id="mc_embed_signup_scroll">

<div class="mc-field-group">
  <input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL" placeholder="Email me when it is ready">
</div>
  <div id="mce-responses" class="clear">
    <div class="response" id="mce-error-response" style="display:none"></div>
    <div class="response" id="mce-success-response" style="display:none"></div>
  </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
    <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_66efbe94e8b1cf5f44ef6aac5_3f204846eb" tabindex="-1" value=""></div>
    <div class="clear text-center"><input type="submit" value="SUBMIT" name="subscribe" id="mc-embedded-subscribe" class="button action"></div>
    </div>
</form>
</div>
<script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script><script type='text/javascript'>(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
<!--End mc_embed_signup-->
`;

export default class Index extends React.Component {

    constructor(params) {
        super(params);
        this.state = {
            submitted: false,
            error: ''
        };
    }

    //onSubmit(e) {
    //    e.preventDefault();
    //    const email = e.target.elements.email.value;
    //    console.log('-- Index.onSubmit -->', email);
    //}

    render() {
        return (
            <div className="Index">
                <div className="text-center">
                    {/*<img src={require('app/assets/images/steemit.svg')} />*/}
                    <SvgImage name="steemit" width="480px" height="240px" />
                </div>
                <h1 className="center text-center">
                    {translateHtml('APP_NAME_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content')}.
                </h1>
                <br />
                <br />
            </div>);
    }
};
