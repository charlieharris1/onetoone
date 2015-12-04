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
      return (<div className="well">
        <div className="row">
          <div className="col-xs-3">
            {new Date(entry.timestamp).toString()}
            <img src={this.state.users[entry.author] && this.state.users[entry.author].github.profileImageURL} alt="Profile picture" height="42" width="42" />
          </div>
          <div className="col-xs-9">
            <Markdown>{entry.comment}</Markdown>
          </div>
        </div>
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
    ? <select onChange={this.selectUser}>{users}</select>
    : <div></div>

  	const template = this.state.loggedInUser
  	? (
      <div>
  		  <nav className="navbar navbar-inverse navbar-static-top" role="navigation">
          <div className="navbar-header">
    			   <p className="navbar-brand">{this.state.users[this.state.loggedInUser] && this.state.users[this.state.loggedInUser].github.displayName}</p>
          </div>
          <div className="nav navbar-nav navbar-right">
            <button className="btn">Log out</button>
          </div>
  		  </nav>
      <div className="row">
        <div className="col-xs-12 selector">
          <span className="pull-left">Comments on {this.state.currentUser.github && this.state.currentUser.github.displayName}</span>
          <div className="pull-right">{selector}</div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-6">
            {entries}
          </div>
    
          <div className="col-xs-6">
            <CommentBox onCommentSubmit={this.onCommentSubmit} />
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
