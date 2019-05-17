import React from 'react';
import { Component } from 'react';
import logo from './logo.svg';
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
          this.setState({posts: response.data})
        else
          window.location = '/login.html'
      })
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
                <div>{'Comments'}</div>
                {post.comments.map((comment)=>{
                  return (
                    <div>
                      <div>{comment.content}</div>
                      <div>{comment.poster}</div>
                      <div>{`posted at: ${post.date}`}</div>
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
