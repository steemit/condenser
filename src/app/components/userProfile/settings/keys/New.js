import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import { Form, Field } from 'react-final-form';
import tt from 'counterpart';

import { CardContent } from 'golos-ui/Card';

const Ol = styled.ol`
    list-style: none;
    counter-reset: li;
    margin: 0 0 0 15px;
`

const Li = styled.li`
    counter-increment: li;
    font-family: ${({theme}) => theme.fontFamily};
    font-size: 16px;

    &::before {
        content: counter(li);
        display: inline-block;
        font-family: ${({theme}) => theme.fontFamily};
        font-weight: 900;
        font-size: 14px;

        color: #2879FF;
        width: 1em;

        margin-left: -1.5em;
        margin-right: 10px;

        text-align: right;
        direction: rtl;
    }
`

export default class New extends PureComponent {
    static propTypes = {
        options: PropTypes.object,
        isChanging: PropTypes.bool,
        onSubmitGate: PropTypes.func,
    };

    render() {
        const { isChanging, onSubmitGate } = this.props;
        const data = {};

        return (
            <Form onSubmit={onSubmitGate} initialValues={data}>
                {({ handleSubmit, submitError, form, submitting, pristine, values }) => (
                    <form onSubmit={handleSubmit}>
                        <CardContent column>

                            <div style={{ border: '1px solid #2879FF', borderRadius: '6px', padding: '18px' }}>
                                <Ol>
                                    {[
                                        'one',
                                        'second',
                                        'third',
                                        'fourth',
                                        'fifth',
                                        'sixth',
                                        'seventh',
                                    ].map(value => (
                                        <Li key={value} dangerouslySetInnerHTML={{
                                            __html: tt(`g.the_rules_of_APP_NAME.${value}`),
                                        }} />
                                    ))}
                                </Ol>
                            </div>
                        </CardContent>
                    </form>
                )}
            </Form>
        );
    }
}
