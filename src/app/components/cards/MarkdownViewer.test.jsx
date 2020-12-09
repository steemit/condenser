import React from 'react';
import reactForm from 'app/utils/ReactForm';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import { MarkdownViewer } from './MarkdownViewer';

require('app/Translator');

configure({ adapter: new Adapter() });

class FormWrapper extends React.Component {
    constructor(props) {
        super();
        this.state = {};
        reactForm({
            fields: ['viewer'],
            initialValues: { v: [] },
            validation: values => {
                return {
                    allowNoImage: true,
                };
            },
            instance: this,
            name: 'testwrapper',
        });
    }

    render() {
        const { mdv } = this.state;
        return <MarkdownViewer {...mdv.props} />;
    }
}
describe('MarkdownViewer', () => {
    /*
	it("Embedded from BitChute", () => {
	
	
	
		const wrapper = mount(<FormWrapper text='<iframe width="640" height="360" scrolling="no" frameborder="0" style="border: none;" src="https://www.bitchute.com/embed/O3g5ueCitKFh/"></iframe>'
		
		
		
	});*/

    it('true is true', () => {
        expect(true).toBe(true);
    });
});
