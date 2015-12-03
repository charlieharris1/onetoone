import React from 'react';

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
	      <textarea rows="4" cols="50" value={this.state.text} onChange={this.handleTextChange}></textarea>
	      <button type="submit">Submit</button>
	     </form>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;