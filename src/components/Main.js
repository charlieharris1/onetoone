require('normalize.css');
require('styles/App.css');
global.jQuery = require('jquery');
require('bootstrap-webpack');
import Firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import reactMixin from 'react-mixin';
import CommentBox from './CommentBox';

import React from 'react';

let yeomanImage = require('../images/yeoman.png');

class AppComponent extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.state = {
			loggedIn: false,
			userData: [],
			currentUser: {},
      loggedInUser: {},
      users: [],
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
		    console.log(authData)
		    console.log('Login was successfull!')
		    this.setState({loggedIn: true})
        authData.isAdmin = true;
        this.setState({loggedInUser: authData})
		    this.setState({currentUser: authData})
		    this.bindAsArray(ref.child(`comments/${authData.uid}`), 'userData');

        this.bindAsObject(ref.child(`users`), 'users');

        ref.child(`users/${authData.uid}`).set(authData);
	  	})
	}

	onCommentSubmit(comment, cb) {
		var ref = new Firebase(`https://one-to-one.firebaseio.com/comments/${this.state.currentUser.uid}`);
		ref.push({ author: this.state.loggedInUser.uid, comment: comment });
		cb();
	}

  selectUser(e) {
    console.log(e.target)
    console.log('seting user to',e.target.value,'from',this.state.users)
    this.setState({
      currentUser: this.state.users[e.target.value]
    })
  }

  render() {
  	const entries = this.state.userData.reverse().map((entry) => {
  		return <div className="row">
  						<div className="col-md-12">
  			   			<p className="text-left">{entry['.comment']}</p>
  			   			<span className="pull-right">
  			   			<img src={this.state.currentUser.github.profileImageURL} alt="Profile picture" height="42" width="42"/>
  			   			</span>
  			   		</div>
  			   		<hr></hr>
  			   	</div>
  	})

    console.log('current user',this.state.currentUser)

  	const template = this.state.loggedIn
  	? (<div class="container">
  		 <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
  			<div className="container">
  			<p className="navbar-brand">{this.state.currentUser && this.state.currentUser.github.displayName}</p>
  			</div>
  		</nav>
   			<h1>Comments on {this.state.currentUser && this.state.currentUser.github.displayName}</h1>
   		<div className="pull-right">
      	{this.state.loggedIn && 'logged in'}
      </div>
      <CommentBox onCommentSubmit={this.onCommentSubmit} />
      	<div className="col-md-9">
      	<div className="well">
      	{entries}
      </div>
      </div>
      <div>
      </div></div>)
  	: '<div>You are not logged in</div>'

    const userList = Object.keys(this.state.users).map((key) => {
      return {
        uid: this.state.users[key].uid,
        displayName: this.state.users[key].github && this.state.users[key].github.displayName,
      }
    });
    const users = userList.map((user) => {
      console.log(user)
      return <option value={user.uid}>{user.displayName}</option>
    })

    const selector = this.state.loggedInUser.isAdmin
    ? <select onChange={this.selectUser}>{users}</select>
    : <div></div>

    return (
    <div>
      {selector}
      {template}
    </div>
    );
  }
}

reactMixin(AppComponent.prototype, ReactFireMixin);

AppComponent.defaultProps = {
};

export default AppComponent;
