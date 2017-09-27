import postmark from 'postmark';
import config from 'config';

const client = new postmark.Client(config.get('postmark.key'));

export default function sendEmail(template, to, params, from = null) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`mail: to <${to}>, from <${config.get('postmark.from')}>, template ${template} (not sent due to not production env)`);
        return;
    }
    const templateId = config.get('postmark.templates')[template];
    if (!templateId) throw new Error(`can't find postmark email template ${template}`);
    client.sendEmailWithTemplate({
        'From': config.get('postmark.from'),
        'TemplateId': templateId,
        'To': to,
        'TemplateModel': params
    }, function(error, result) {
      if(error) {
        console.error(`  <-- failed to send '${template}' email to '${to}'`, error.message);
        return;
      }
      console.info(`  <-- sent '${template}' email to '${to}'`)
    });
}
