import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Flex from 'golos-ui/Flex';
import Icon from 'golos-ui/Icon';
import Card, {
    CardTitle as StyledCardTitle,
    CardRow,
    CardColumn,
} from 'golos-ui/Card';
import {
    FormGroup,
    FormGroupRow,
    Label,
    LabelRow as StyledLabelRow,
    Input,
    Select,
    Textarea,
} from 'golos-ui/Form';
import { DialogFooter, DialogButton } from 'golos-ui/Dialog';

const CardTitle = styled(StyledCardTitle)`
    padding: 0 40px;

    @media (max-width: 576px) {
        padding: 0 16px;
    }
`;

const CardContent = styled.div`
    padding: 40px;

    @media (max-width: 576px) {
        padding: 37px 16px;
    }
`;

const LabelRow = styled(StyledLabelRow)`
    flex-basis: 28px;
    color: #393636;
`;
LabelRow.displayName = 'LabelRow';

export default class SettingsShow extends PureComponent {
    renderCommonSettings() {
        return (
            <Fragment>
                <CardTitle>Общие настройки</CardTitle>
                <CardContent>
                    <FormGroup>
                        <Label>Выберите язык интерфейса</Label>
                        <Select>
                            <option>Русский</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Выберите валюту</Label>
                        <Select>
                            <option>USD</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Отображение наград</Label>
                        <Select>
                            <option>Два знака после запятой</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Выберите тему</Label>
                        <Select>
                            <option>Стандартная</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Контент для взрослых</Label>
                        <Select>
                            <option>Всегда предупреждать</option>
                        </Select>
                    </FormGroup>
                </CardContent>
            </Fragment>
        );
    }

    renderPrivateSettings() {
        return (
            <Fragment>
                <CardTitle>Личная информация</CardTitle>
                <CardContent>
                    <FormGroup>
                        <Label>Отображаемое имя</Label>
                        <Input placeholder="Имя Фамилия" />
                    </FormGroup>
                    <FormGroup>
                        <Label>О себе</Label>
                        <Textarea
                            placeholder={
                                'Чему училися\nГде и кем работаю\nМои проекты\nИнтересы\nСемья\nЖизненное кредо'
                            }
                            rows={6}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Город</Label>
                        <Select placeholder="Выберите свой город">
                            <option>Москва</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label>Ваш сайт</Label>
                        <Input placeholder="Ссылка на сайт" />
                    </FormGroup>
                    <FormGroup>
                        <Label>Социальные сети</Label>
                        <FormGroupRow>
                            <LabelRow>
                                <Icon
                                    name="facebook"
                                    width="13px"
                                    height="24px"
                                />
                            </LabelRow>
                            <Input placeholder="Ссылка на Facebook" />
                        </FormGroupRow>
                        <FormGroupRow>
                            <LabelRow>
                                <Icon name="vk" width="28px" height="18px" />
                            </LabelRow>
                            <Input placeholder="Ссылка на Вконтаке" />
                        </FormGroupRow>
                        <FormGroupRow>
                            <LabelRow>
                                <Icon name="instagram" size="23px" />
                            </LabelRow>
                            <Input placeholder="Ссылка на Instagran" />
                        </FormGroupRow>
                        <FormGroupRow>
                            <LabelRow>
                                <Icon
                                    name="twitter"
                                    width="26px"
                                    height="22px"
                                />
                            </LabelRow>
                            <Input placeholder="Ссылка на Twitter" />
                        </FormGroupRow>
                    </FormGroup>
                </CardContent>
            </Fragment>
        );
    }

    render() {
        return (
            <Card transparent style={{ flexBasis: '739px' }}>
                <CardRow>
                    <CardColumn>{this.renderCommonSettings()}</CardColumn>
                    <CardColumn>{this.renderPrivateSettings()}</CardColumn>
                </CardRow>
                <DialogFooter>
                    <DialogButton primary>Обновить</DialogButton>
                </DialogFooter>
            </Card>
        );
    }
}
