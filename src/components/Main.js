require('normalize.css');
require('styles/App.css');
global.jQuery = require('jquery');
require('bootstrap-webpack');
import Firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import reactMixin from 'react-mixin';
import CommentBox from './CommentBox';
import _ from 'lodash';
import React from 'react';
import Markdown from 'react-remarkable'

let yeomanImage = require('../images/yeoman.png');

class AppComponent extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.state = {
			userData: [],
			currentUser: {},
      loggedInUser: {},
      users: {},
      comments: {},
		}
		this.onCommentSubmit = this.onCommentSubmit.bind(this)
    this.selectUser = this.selectUser.bind(this)
	}

	componentDidMount() {
	  var ref = new Firebase('https://one-to-one.firebaseio.com');
		ref.authWithOAuthPopup('github', (error, authData) => {
			if (error) {
		    	console.log('Login Failed!', error);
		    }
		    this.setState({loggedIn: true})
        this.bindAsObject(ref.child(`comments`), 'comments');

        this.bindAsObject(ref.child(`users`), 'users');
        this.setState({loggedInUser: authData.uid})
		    this.setState({currentUser: authData})
        ref.child(`users/${authData.uid}`).update(authData);
	  	})
	}

	onCommentSubmit(comment, cb) {
		var ref = new Firebase(`https://one-to-one.firebaseio.com/comments/${this.state.currentUser.uid}`);
		ref.push({ author: this.state.loggedInUser, comment: comment, timestamp: Firebase.ServerValue.TIMESTAMP });
		cb();
	}

  selectUser(e) {
    this.setState({
      currentUser: this.state.users[e.target.value]
    })
  }

  render() {
  	const entries = this.state.comments[this.state.currentUser.uid]
    ?  _.sortBy(_.toArray(this.state.comments[this.state.currentUser.uid],'timestamp')).reverse().map((entry) => {
      return (<div>
              <li className="media">
                <a href="#" className="pull-left">
                  <img src={this.state.users[entry.author] && this.state.users[entry.author].github.profileImageURL} alt className="img-circle">
                  </img>
                </a>
                <div className="media-body">
                  <span className="text-muted pull-right">
                    <small className="textMuted">{new Date(entry.timestamp).toString()}</small>
                  </span>
                  <p>
                    <Markdown>{entry.comment}</Markdown>
                  </p>
                </div>
              </li>
              </div>);
  	         })
            : <div></div>;

    const userList = Object.keys(this.state.users).map((key) => {
      return {
        uid: this.state.users[key].uid,
        displayName: this.state.users[key].github && this.state.users[key].github.displayName,
      }
    });
    const users = userList.map((user) => {
      const selected = user.uid === this.state.loggedInUser ? 'selected' : false;
      return <option value={user.uid} selected={selected}>{user.displayName}</option>
    })    

    const selector = this.state.users[this.state.loggedInUser] && this.state.users[this.state.loggedInUser].isAdmin
    ? <div className="className=nav nav-bar navbar-right"><select onChange={this.selectUser}>{users}</select></div>
    : <div></div>

  	const template = this.state.loggedInUser
  	? (
      <div className="container">
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <div class="navbar-header">
            <p className="navbar-brand">{this.state.users[this.state.loggedInUser] && this.state.users[this.state.loggedInUser].github.displayName}</p>
            <div className="nav nav-bar navbar-right">{selector}</div>
        </div>
      </div>
      </nav>

      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            <h2>Comments on {this.state.currentUser.github && this.state.currentUser.github.displayName}</h2>
            <br></br>
          </div>
          <div className="row">
            <div className="col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-4 col-sm-offset-4">
              <div className="twt-wrapper">
                <div className="panel planel-info">
                  <div className="panel-body">
                    <CommentBox onCommentSubmit={this.onCommentSubmit}/>
                    <ul className="media-list">
                    {entries}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>)
  	 : <div>You are not logged in</div>

    return (
    <div>
      {template}
    </div>
    );
  }
}

reactMixin(AppComponent.prototype, ReactFireMixin);

AppComponent.defaultProps = {
};

export default AppComponent;
