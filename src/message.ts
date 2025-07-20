export class MessageComponent {
  constructor() {
    this.showMessage = this.showMessage.bind(this)
    this.showError = this.showError.bind(this)
    this.hideMessage = this.hideMessage.bind(this)
  }
  message = ""
  alertClass = ""

  showMessage(msg: string, field?: string): void {
    this.alertClass = "alert alert-info"
    this.message = msg
  }
  showError(msg: string, field?: string): void {
    this.alertClass = "alert alert-danger"
    this.message = msg
  }
  hideMessage(field?: string): void {
    this.alertClass = ""
    this.message = ""
  }
}
