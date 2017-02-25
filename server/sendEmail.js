import sendgrid from 'sendgrid';
import config from '../config';

const sg = sendgrid(config.sendgrid.key);

export default function sendEmail(template, to, params, from = null) {
    // if (process.env.NODE_ENV !== 'production') {
    //     console.log(`mail: to <${to}>, from <${from}>, template ${template} (not sent due to not production env)`);
    //     return;
    // }
    const tmpl_id = config.sendgrid.templates[template];
    if (!tmpl_id) throw new Error(`can't find template ${template}`);
    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            template_id: tmpl_id,
            personalizations: [
                {to: [{email: to}],
                 substitutions: params},
            ],
            from: {email: from || config.sendgrid.from}
        }
    });

    sg.API(request)
    .then(response => {
        // console.log(`<------------- sent '${template}' email to '${to}'`, response.statusCode);
    })
    .catch(error => {
        // console.error(`<------------- failed to send '${template}' email to '${to}'`, error);
    });
}
