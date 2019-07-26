import React from 'react';
import { Component } from 'react';
import axios from 'axios';
import './App.css';

class LoginPage extends Component {
  render() {
    return (
      <div>
        <textarea onChange={(e) => this.setState({ username: e.target.value })} />
        <textarea onChange={(e) => this.setState({ password: e.target.value })} />
        <button onClick={
          () => axios
            .post('/login', { username: this.state.username, password: this.state.password }, { withCredentials: true })
            .then((response) => {
              if (response.status >= 200 && response.status < 300) {
                window.location = '/index.html';
              }
            })
          }
        >
          {'Login'}
        </button>
        <button
          onClick={
            () => 
            axios.post(
                '/register', {
                  username: this.state.username,
                  password: this.state.password
                }, {
                  withCredentials: true
            }).then(
              (response) => {
                if (response.status >= 200 && response.status < 300){
                  window.location = '/index.html';
                }
              }
            )
          }
        >
          {'Register'}
        </button>
      </div>
    );
  }
}

export default LoginPage;
