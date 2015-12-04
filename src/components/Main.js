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
			currentUser: null,
		}
		this.onCommentSubmit = this.onCommentSubmit.bind(this)
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
		    this.setState({currentUser: authData})
		    this.bindAsArray(ref.child(`users/${authData.uid}`), 'userData');

	  	})
	}

	onCommentSubmit(value, cb) {
		var ref = new Firebase(`https://one-to-one.firebaseio.com/users/${this.state.currentUser.uid}`);
		ref.push(value);
		cb();
	}

  render() {
  	const entries = this.state.userData.reverse().map((entry) => {
  		return <div className="row">
  						<div className="col-md-12">
  			   			<p className="text-left">{entry['.value']}</p>
  			   			<span className="pull-right">
  			   			<img src={this.state.currentUser.github.profileImageURL} alt="Profile picture" height="42" width="42"/>
  			   			</span>
  			   		</div>
  			   		<hr></hr>
  			   	</div>
  	})

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
