import React, {PropTypes} from 'react';
import PostSummary from 'app/components/cards/PostSummary';
import Post from 'app/components/pages/Post';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import debounce from 'lodash.debounce';
import {find, findIndex} from 'lodash';
import Icon from 'app/components/elements/Icon';

class NavButtons extends React.Component {
  trackAnalytics = eventType => {
      console.log(eventType, 'analytics track')
      analytics.track(eventType)
  }

  onNextClick(e) {console.log(this, e, " IN onNextClick Handler function. ");
    if (!this.props.flag) return console.log('false props.flag found')

    let posts = this.props.posts
    let category = this.props.category;

    if (typeof category !=='string') console.warn("category type is not string, instead, it s an ", typeof category, " and looks like", category)
    if (!category || category == 'blog') {
      this.onBackButton(e); return;
    }
    let currentPath = window.location.pathname.split('?')[0].split('/@');
    if (currentPath.length>1) {
      currentPath = currentPath[1];

      let postIndex = findIndex(posts, (post)=>{
        return currentPath === post;
      })
      if (postIndex < 0) {
        this.onBackButton(e); return;
      }
      if (postIndex >= posts.length - 2) {
        let loadMore = this.props.loadMore
        console.log(loadMore)
        if (this.props.loadMore) {
          if (loadMore && posts && posts.length > 0) loadMore(posts[posts.length - 1], category);
          this.props.loadMore()
        }
        setTimeout(function(){window.scrollTo(0, 0)}, 600);
      }
      if (posts.length>postIndex+1) {
        postIndex += 1
      } else {postIndex = 0}
      console.log('switching to post ', postIndex)

      let nextPost = posts[postIndex];
      let nextUrl = `/${category}/@${nextPost}`

      this.onPostClick(nextPost, nextUrl)
      trackAnalytics('next article clicked')
    }
  }

  onPrevClick(e) {
    console.log(this, " IN onPrevClick Handler function. ");
    let posts = this.props.posts
    let category = this.props.category
    if (!category || category == 'blog') {
      this.onBackButton(e); return;
    }
    let currentPath = window.location.pathname.split('?')[0].split('/@');
    if (currentPath.length>1) {
      currentPath = currentPath[1];
      let postIndex = findIndex(posts, (post)=>{
        return currentPath === post;
      })
      if (postIndex < 0) {
        this.onBackButton(e); return;
      }
      if (postIndex == 0) {
        this.onBackButton(e); return;
      } else {postIndex -= 1}
      console.log('switching to post ', postIndex)
      let nextPost = posts[postIndex];
      let nextUrl = `/${category}/@${nextPost}`
      this.onPostClick(nextPost, nextUrl)

        // setTimeout(function(){window.scrollTo(0, 0)}, 600);
      // send "'post switched to next' event"
      analytics.track
    }
  }
  render (){
    return <div className="PostsList__nav_container">
      <button className="button prev-button" type="button" title="предыдущий пост" onClick={this.onPrevClick}>&lt;</button>
      <button className="button next-button" type="button" title="следующий пост" onClick={this.onNextClick}>&gt;</button>
    </div>
  }

}

export {NavButtons as default}
