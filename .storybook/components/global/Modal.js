import React from 'react';
import FaClose from 'react-icons/lib/fa/close';
import doNotUseAccessibleStaticElementInteractions from "A11y/doNotUseAccessibleStaticElementInteractions.js";

/*
 * A modal component which dims and centers itself in the PARENT div (not the whole screen)
 */
export default class Modal extends React.Component {
  constructor (props){
    super(props);
    this.state = {
      addCloseButtonTimeout: null,
      closeButton: this.props.closeButton
    }
    this.childOnClick = this.childOnClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount(){
    if(this.props.delayedCloseButton){
      let addCloseButton = () => {
        this.setState({
          closeButton: true,
          addCloseButtonTimeout: null,
        });
      }

      let addCloseButtonTimeout = window.setTimeout(addCloseButton, 30000);
      this.setState({
        addCloseButtonTimeout: addCloseButtonTimeout,
      });
    }
  }

  componentWillUnmount(){
    if(this.state.addCloseButtonTimeout){
      window.clearTimeout(this.state.addCloseButtonTimeout);
    }
  }

  closeModal(){
    if (this.closeHandled) return;

    this.closeHandled = true;

    if(this.state.addCloseButtonTimeout){
      window.clearTimeout(this.state.addCloseButtonTimeout);
    }
    this.props.closeModal();
  }

  //keep a click on the modal content from triggering the closeModal call
  childOnClick(e){
    e.stopPropagation();
  }

  render() {
    let closeButton = this.state.closeButton ? (
      <div className="closeButton" {...doNotUseAccessibleStaticElementInteractions({onClick: this.closeModal})}>
        <FaClose size="28"/>
      </div>)
      : null;

    const accessibleModalBackgroundClick = this.props.backgroundClose ?
      {...doNotUseAccessibleStaticElementInteractions({onClick: this.props.closeModal})} : {};

    const accessibleModalAttributes = {
      role: 'alertdialog',
      tabIndex: -1,
      onClick: this.childOnClick,
    }
    return (
      <div className={`modalBackground`} {...accessibleModalBackgroundClick}>
        <div className={`modalContainer ${this.props.hideBackground ? 'noBackground' : ''}`} {...accessibleModalAttributes}>
          {closeButton}
          {this.props.children}
        </div>
      </div>
    );
  }
}
