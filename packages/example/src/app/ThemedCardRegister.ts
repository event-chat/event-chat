const lightStyles = `
:host {
  display: block;
  border: 1px solid #ccc;
}
`
const darkStyles = `
:host {
  display: block;
  border: 1px solid #555;
}
`

class ThemedCard extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return ['theme']
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'theme') {
      if (newValue === 'dark') {
        this.dataset.theme = 'dark'
      } else {
        delete this.dataset.theme
      }
      this.render()
    }
  }

  connectedCallback() {
    this.render()
  }

  render() {
    const theme = this.getAttribute('theme') ?? 'light'
    const style = document.createElement('style')
    style.textContent = theme === 'dark' ? darkStyles : lightStyles

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = ''
      this.shadowRoot.appendChild(style)
      this.shadowRoot.appendChild(document.createElement('slot'))
    }
  }
}

export default ThemedCard
