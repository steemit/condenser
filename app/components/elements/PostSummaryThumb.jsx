import React from 'react';

export default class PostSummaryThumb extends React.Component {
  handleImageLoaded() {
    if (this.props.isNsfw) {
      this.cp = new window.ClosePixelation(this.img, this.canvas)
      try {
        this.cp.render([
          {
            resolution: 10,
            alpha: 1,
            size: 10,
          }
        ])
      }
      catch(e) {
        // draw fallback image on canvas
        this.cp.ctx.drawImage( this.defaultImage, 0, 0 )
      }
    }
  }

  handleImageErrored() {
    this.setState({imageStatus: 'failed to load'});
  }

  render() {
    const {visitedClassName} = this.props;
    return (
      <a href={this.props.href} onClick={this.props.onClick}>
        <canvas className={'PostSummary__image '} //+ visitedClassName}
                style={!this.props.isNsfw ? {display: "none"} : {}}
                ref={(c) => {
                  this.canvas = c;
                }}>
        </canvas>
        <img
          // fixme uncomment this for production, since images should come from the same domain
          // fixme to use canvas or server should provide cors headers
          src={this.props.src}
          style={this.props.isNsfw ? {display: "none"} : {}}
          className={this.props.mobile ? ('PostSummary__image-mobile ' + visitedClassName) : 'PostSummary__image '}
          onLoad={this.handleImageLoaded.bind(this)}
          onError={this.handleImageErrored.bind(this)}
          ref={(img) => {
            this.img = img;
          }}>
        </img>
        <img
          ref={(img) => {
            this.defaultImage = img;
          }}
          style={{display: "none"}}
          src={`/images/18_plus.png`}
          className={'PostSummary__image '} //+ visitedClassName}*!/*/}
        >
        </img>
      </a>
    );
  }
}
