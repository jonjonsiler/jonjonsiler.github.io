import React from 'react';
import cx from 'classnames';
import './Loading.scss';
export class Loading extends React.Component {
  render() {
    //This is a css loading icon from https://loading.io/css/
    // making this a global component so that we can use it throughout the app
    const containerClasses = cx({
      loadingContainer: true,
      fill: !this.props.noFill,
      inline: this.props.inline
    })
    const ellipsisClasses = cx({
      'lds-ellipsis': true,
      'auto-fit': this.props.autoFit
    })
    return (
      <div className={containerClasses} data-testid="loading"><div className={ellipsisClasses}><div></div><div></div><div></div><div></div></div></div>
    );
  }
}

export default Loading;
