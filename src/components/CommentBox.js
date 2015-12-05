import React from 'react';
require('normalize.css');
require('styles/CommentBox.css');
global.jQuery = require('jquery');
require('bootstrap-webpack');

class AppComponent extends React.Component {
	constructor() {
		super();
		this.state = {
			text: null
		}
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleTextChange = this.handleTextChange.bind(this)
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.onCommentSubmit(this.state.text, (err) => {
			if (err) {
				this.setState({
					err: err
				});
				return;
			}
			this.setState({
				text: ''
			})
		})

	}
	handleTextChange(e) {
		this.setState({text: e.target.value})
	}

  render() {
    return (
      <div>
      {this.state.err}
      	<form onSubmit={this.handleSubmit}>
      		<textarea className="form-control" rows="3" value={this.state.text} onChange={this.handleTextChange}></textarea>
      		<br></br>
      		<button className="btn btn-primary btn-sm pull-right" type="submit">Post comment</button>
	    	<div className="clearfix"></div>
	    	<hr></hr>
	    </form>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;