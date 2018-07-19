import React, { Component } from 'react';
import { connect } from 'react-redux';
import user from 'app/redux/User';
import Hero from 'src/app/components/welcome/Hero';
import About from 'src/app/components/welcome/About';
import Initial from 'src/app/components/welcome/Initial';
import Differences from 'src/app/components/welcome/Differences';
import Mobile from 'src/app/components/welcome/Mobile';
import Reviews from 'src/app/components/welcome/Reviews';
import Questions from 'src/app/components/welcome/Questions';

class Welcome extends Component {
    state = {
        tagsLoading: false,
        tagsActiveId: false,
        tagsCards: {},
        questionsLoading: false,
        questionsCards: [],
    };

    slides = require('./slides.json');
    tags = require('./tags.json');
    questions = require('./questions.json');

    async componentDidMount() {
        this.fetchTagContents(this.tags[3]);

        // questions posts
        this.setState({ questionsLoading: true });

        try {
            const posts = await Promise.all(
                this.questions.map(item =>
                    this.props.getContent({
                        author: item.author,
                        permlink: item.permlink,
                    })
                )
            );

            await this.props.getAccount({
                usernames: posts.map(post => post.author),
            });

            this.setState({
                questionsLoading: false,
                questionsCards: posts,
            });
        } catch (err) {
            this.setState({ questionsLoading: false });
        }
    }

    fetchTagContents = async tag => {
        // if tag's posts already cached
        if (this.state.tagsCards[tag.id]) {
            this.setState({ tagsActiveId: tag.id });
            return;
        }

        this.setState({
            tagsLoading: true,
            tagsActiveId: false,
        });

        try {
            const posts = await Promise.all(
                tag.items.map(item =>
                    this.props.getContent({
                        author: item.author,
                        permlink: item.permlink,
                    })
                )
            );

            await this.props.getAccount({
                usernames: posts.map(post => post.author),
            });

            this.setState({
                tagsLoading: false,
                tagsActiveId: tag.id,
                tagsCards: {
                    ...this.state.tagsCards,
                    [tag.id]: posts,
                },
            });
        } catch (err) {
            this.setState({ tagsLoading: false, tagsActiveId: false });
        }
    };

    render() {
        const {
            tagsLoading,
            tagsActiveId,
            tagsCards,
            questionsLoading,
            questionsCards,
        } = this.state;

        return (
            <div>
                <Hero />
                <About />
                <Initial
                    tags={this.tags}
                    tagsLoading={tagsLoading}
                    tagsActiveId={tagsActiveId}
                    tagsCards={tagsCards}
                />
                <Differences />
                <Mobile />
                <Reviews slides={this.slides} />
                <Questions
                    questionsLoading={questionsLoading}
                    questionsCards={questionsCards}
                />
            </div>
        );
    }
}

export default connect(
    null,
    dispatch => ({
        getContent: payload =>
            new Promise((resolve, reject) => {
                dispatch({
                    type: 'GET_CONTENT',
                    payload: { ...payload, resolve, reject },
                });
            }),
        getAccount: payload =>
            new Promise((resolve, reject) => {
                dispatch(
                    user.actions.getAccount({ ...payload, resolve, reject })
                );
            }),
    })
)(Welcome);
