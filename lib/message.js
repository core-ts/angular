"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var MessageComponent = (function () {
  function MessageComponent() {
    this.message = ""
    this.alertClass = ""
    this.showMessage = this.showMessage.bind(this)
    this.showError = this.showError.bind(this)
    this.hideMessage = this.hideMessage.bind(this)
  }
  MessageComponent.prototype.showMessage = function (msg, field) {
    this.alertClass = "alert alert-info"
    this.message = msg
  }
  MessageComponent.prototype.showError = function (msg, field) {
    this.alertClass = "alert alert-danger"
    this.message = msg
  }
  MessageComponent.prototype.hideMessage = function (field) {
    this.alertClass = ""
    this.message = ""
  }
  return MessageComponent
})()
exports.MessageComponent = MessageComponent
