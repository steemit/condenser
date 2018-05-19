import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Slider from 'react-slick'
import Userpic from 'app/components/elements/Userpic'

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
          <Link key={i} className="welcome-slider-slide" to={slide.link}>
            <div className="welcome-slider-slide__quote">
              <div className="name">{slide.name}<div className="position">, {slide.position}</div></div>
              <div className="description">{slide.description}</div>
            </div>
          </Link>
        )}
      </Slider>
    )
  }
}