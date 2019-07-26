import React from 'react';
import { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state={posts:[]};
  }
  componentDidMount() {
    axios
      .get('/posts', {withCredentials:true})
      .then( (response) => {
        if(response.data instanceof Array)
          this.setState({posts: response.data});
        else
          window.location = '/login.html'
      })
  }
  getLikeText(likeList) {
    var text = ""
    if(likeList.length === 0) {
      return "No one likes this. Sad.";
    }
    if(likeList.length === 1) {
      return `${likeList[0]} likes this.`;
    }
    if(likeList.length === 2) {
      return `${likeList[0]} and ${likeList[1]} like this.`;
    }
    if(likeList.length === 3) {
      return `${likeList[0]}, ${likeList[1]} and ${likeList[2]} like this.`;
    }
    return `${likeList[0]}, ${likeList[1]} and ${likeList.length - 2} more like this.`;
  }

  render() {
    return (
      <div className="App">
        {
          this.state.posts.map((post)=>{
            return (
              <div>
                <div>{post.content}</div>
                <div>{post.poster}</div>
                <div>{`posted at: ${post.date}`}</div>
                <div>{this.getLikeText(comment.likes)}</div>
                <button onClick={()=>axios.post('/toggleLike', {_id: post._id})}>{'Like or Unlike'}</button>
                <div>{'Comments'}</div>
                {post.comments.map((comment)=>{
                  return (
                    <div>
                      <div>{comment.content}</div>
                      <div>{comment.poster}</div>
                      <div>{`posted at: ${comment.date}`}</div>
                      <div>{this.getLikeText(comment.likes)}</div>
                      <button onClick={()=>axios.post('/toggleLike', {_id: post._id, commentId: comment._id})}>{'Like or Unlike'}</button>
                    </div>
                  )
                })}
                <textarea onChange={(e) => this.setState({content: e.target.value})} />
                <button onClick={()=>axios.post('/newComment', {_id: post._id, content: this.state.content})}>{'Post'}</button>
              </div>
            )
        })}
        <div>
          <textarea onChange={(e) => this.setState({content: e.target.value})} />
          <button onClick={()=>axios.post('newPost', {content: this.state.content})}>{'Post'}</button>
        </div>
      </div>
    );
  }
}

export default App;
