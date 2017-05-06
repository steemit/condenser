import React, { Component } from 'react';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Remarkable from 'remarkable'

const remarkable = new Remarkable({
    breaks: true,
    linkify: true
})

function VideoContainer({url, content}) {
    return (
        <div className='VideoContainer'>
            <div  className="VideoContainer__content" >
                <div className='VideoContainer__head'>
                    <a href={url} target="blank"><img src={content.thumbnail} /></a>
                </div>
                <div className='VideoContainer__body'>
                    <p className="VideoContainer__body_title"><a href={url} target="blank">{content.title}</a></p>
                    <p className="VideoContainer__body_desc">{content.description}</p>
                </div>
                <div className='VideoContainer__footer'>
                    <a href={url}>{content.providerName}</a>
                </div>
            </div>
        </div>
    );
}

function VkContainer({content}) {

	if (content.error) {
		return  <div>
			{content.error.title} <br />
			{content.error.body}
        </div>
	}

	const postBody = remarkable.render(content.description)
	const description = <span dangerouslySetInnerHTML={{__html: postBody}} />

    let thumbnailWrapper  = <div></div>
    if (content.vkData.repost) {
        const repost = content.vkData.repost;
		thumbnailWrapper = <div className="VkContainer__thumbnail_repost">
            <a href={repost.href} className="repost-thumb"><img src={repost.thumb}/></a>
            <div className="repost">
                <a href={repost.href} className="repost-href" target="blank">{repost.title}</a>
                <a href={repost.linkUrl} className="repost-link" target="blank">{repost.linkTitle}</a>
            </div>
        </div>
    } else {
		thumbnailWrapper = <div className="VkContainer__thumbnail_wrapper">
            <a href={content.reqUrl} className="thumb" target="blank"> <img src={content.thumbnail} alt={content.title}/> </a>
        </div>
    }

    return (
      <div className="VkContainer">
          <div className="VkContainer__author_info">
              <a href={content.vkData.authorHref} className="VkContainer__avatar" style={{backgroundImage: 'url(' + content.vkData.authorAvatar + ')'}} target="blank"></a>
              <a href={content.vkData.authorHref} className="VkContainer__info_full_name" target="blank">{content.title}</a>
          </div>
              {thumbnailWrapper}
          <div className="VkContainer__body_container">
              {description}
          </div>
          <div className="VkContainer__provider_name">
              <a href={content.reqUrl} target="blank">{content.providerName}</a>
          </div>
      </div>
    );
}

export default class EmbedView extends Component {
    static propTypes = {
        contentUrl : React.PropTypes.string.isRequired
    };

    constructor() {
        super();
        this.state = {
            oEmbedData : {},
            isLoaded : false,
            isError: false
        }
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'EmbedView');

    fetchOEmbedData = (url) => {
        const requestURl = '/embed/v1/content/' + encodeURIComponent(url);
        fetch(requestURl)
            .then((response) => {
               if (response.ok) return response.json();
               else return Promise.reject(response.status);
            })
            .then((json) => {
                if (json && json.success) {
                this.setState({oEmbedData : json, isLoaded: true});
            } else {
                throw new Error("status 404 " + requestURl);
            }
            })
            .catch((error)=> {
                this.setState({isError: true});
                console.log("embed request failed " + error);
            });
    };

    componentDidMount() {
        this.fetchOEmbedData(this.props.contentUrl);
    }

    render() {
        const { contentUrl } = this.props;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.isError;

        const embedContainer = <div className ='EmbedView__container'>
            {!isLoaded && <center> <LoadingIndicator type="circle" /> </center>}
            {isLoaded && this.state.oEmbedData.type == 'vk'
                ? < VkContainer content={this.state.oEmbedData} />
                : <VideoContainer url={contentUrl} content={this.state.oEmbedData} />}
        </div>

        return (
            <span>
                {isError ? <a href={contentUrl}>{contentUrl}</a> : embedContainer }
            </span>
        );
      }

}
