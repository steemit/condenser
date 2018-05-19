import React, { Component, PropTypes } from "react";
import Slider from "react-slick";

export default class WelcomeSlider extends Component {

  static propTypes = {
    slides: PropTypes.array,
  }

  defaultProps = {
    slides: []
  }

  render() {
    const { slides } = this.props;

    const settings = {
      vertical: true,
      dots: true,
      arrows: false,
      infinite: true,
      adaptiveHeight: true,
      autoplay: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      className: 'welcome-slider',
      dotsClass: 'welcome-slider-dots',
      customPaging: i => (
        <div
          style={{
            width: "30px",
            color: "blue",
            border: "1px blue solid"
          }}
        >
          {i + 1}
        </div>
      )
    }

    return (
      <Slider {...settings}>
        {slides.map((slide, i) => 
          <div key={i} className="welcome-slider-slide">
            <div className="welcome-slider-slide__quote">
              <div className="name">{slide.name}</div>
              <div className="description">{slide.description}</div>
            </div>
          </div>
        )}
      </Slider>
    )
  }
}