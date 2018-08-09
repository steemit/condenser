import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Slider from 'react-slick';
import styled from 'styled-components';
import Userpic from 'app/components/elements/Userpic';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Root = styled.div`
    .welcome-slider {
        display: flex !important;
        align-items: center;
    }

    .welcome-slider__dots {
        position: relative;
        list-style: none;

        li {
            text-align: center;
            margin: 5px 0;
        }

        .Userpic {
            cursor: pointer;
        }

        .slick-active .Userpic {
            width: 60px !important;
            height: 60px !important;
        }
    }
`;

const SliderSlide = styled(Link)`
    position: relative;
    display: block;
    padding: 0 63px;

    &:after,
    &:before {
        position: absolute;
        content: '';
        width: 39px;
        height: 26px;
        background: url('/images/new/welcome/slider-slide.svg');
        background-size: 39px 26px;
    }

    &:before {
        top: 3px;
        left: 0;
    }

    &:after {
        right: 0;
        bottom: 3px;
    }

    @media screen and (max-width: 800px) {
        padding: 40px 0 34px;

        &:before {
            top: 0;
            left: 0;
        }

        &:after {
            right: 0;
            bottom: 0;
        }
    }
`;

const QuoteName = styled.div`
    margin-bottom: 15px;
    line-height: 1.39;
    font-weight: bold;
    font-size: 21px;
    color: #fff;
`;

const QuoteDescription = styled.div`
    font-size: 17px;
    font-weight: 300;
    line-height: 1.5;
    color: #fff;
`;

export default class WelcomeSlider extends Component {
    static propTypes = {
        slides: PropTypes.array,
    };

    static defaultProps = {
        slides: [],
    };

    render() {
        const { slides } = this.props;

        const settings = {
            //  vertical: true,
            dots: true,
            fade: true,
            arrows: false,
            infinite: true,
            adaptiveHeight: true,
            autoplay: true,
            pauseOnHover: true,
            focusOnSelect: true,
            speed: 500,
            autoplaySpeed: 6000,
            slidesToShow: 1,
            slidesToScroll: 1,
            className: 'welcome-slider',
            dotsClass: 'welcome-slider__dots',
            customPaging: this._renderPagingItem,
        };

        return (
            <Root>
                <Slider {...settings}>
                    {slides.map((slide, i) => (
                        <SliderSlide key={i} to={slide.link}>
                            <QuoteName>
                                {slide.name}, {slide.position}
                            </QuoteName>
                            <QuoteDescription>
                                {slide.description}
                            </QuoteDescription>
                        </SliderSlide>
                    ))}
                </Slider>
            </Root>
        );
    }

    _renderPagingItem = i => {
        const { slides } = this.props;

        return <Userpic imageUrl={slides[i].avatar} width={40} height={40} />;
    };
}
