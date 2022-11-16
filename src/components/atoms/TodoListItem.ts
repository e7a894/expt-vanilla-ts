
declare global {
  interface HTMLElementTagNameMap {
    'todo-list-item': TodoListItem
  }

  interface HTMLElementEventMap {
    'onToggle': CustomEvent;
    'onRemove': CustomEvent;
  }
}

class TodoListItem extends HTMLElement {
  static {
    if (!customElements.get('todo-list-item')) customElements.define('todo-list-item', this);
  }

  static get observedAttributes() {
    return ['index', 'checked', 'label'];
  }

  attributeChangeCallback(name: string, /*oldValue: any,*/ newValue: any) { // not used oldValue so far
    switch (name) {
      case 'index':
        this.index = newValue;
        break;
      case 'checked':
        this.checked = newValue;
        break;
      case 'label':
        this.label = newValue;
        break;
      default:
        break;
    }

    this.#render();
  }

  readonly #template: HTMLTemplateElement;
  readonly #elmChecked: HTMLInputElement | null;
  readonly #elmLabel: HTMLLabelElement | null;
  readonly #elmRemove: HTMLButtonElement | null;
  readonly #lsnToggle: () => void;
  readonly #lsnRemove: () => void;
  
  constructor(arg?: { checked?: boolean, label?: string }) {
    super();
    this.#template = document.createElement('template');
    this.#template.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <input class="checkbox" type="checkbox" />
      <label class="label"></label>
      <button class="remove" type="button">remove</button>
    `;
    this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) throw Error('Browser does not suppert Shadow DOM');
    this.shadowRoot.appendChild(this.#template.content.cloneNode(true));

    this.checked = arg?.checked || false;
    this.label = arg?.label || '';

    this.#elmChecked = this.shadowRoot.querySelector('.checkbox');
    this.#elmLabel = this.shadowRoot.querySelector('.label');
    this.#elmRemove = this.shadowRoot.querySelector('.remove');

    this.#lsnToggle = this.#dispatchToggle.bind(this);
    this.#lsnRemove = this.#dispatchRemove.bind(this);
  }

  connectedCallback() {
    this.#elmChecked?.addEventListener('click', this.#lsnToggle);
    this.#elmRemove?.addEventListener('click', this.#lsnRemove);    
    this.#render();
  }

  disconnectedCallback() {
    this.#elmChecked?.removeEventListener('click', this.#lsnToggle);
    this.#elmRemove?.removeEventListener('click', this.#lsnRemove);
  }

  clearListener() {}

  #render() {
    if (!this.#elmLabel) throw Error('elmLabel is undefined');
    if (!this.#elmChecked) throw Error('elmChecked is undefined');
    this.#elmChecked.checked = this.checked;
    this.#elmLabel.textContent = this.label;
  }

  #dispatchToggle() {
    this.dispatchEvent(new CustomEvent(
      'onToggle',
      {
        detail: { index: this.index },
        bubbles: true,
        composed: true
      }
    ));
  }

  #dispatchRemove() {
    this.dispatchEvent(new CustomEvent(
      'onRemove',
      {
        detail: { index: this.index },
        bubbles: true,
        composed: true
      }
    ));
  }

  get index() {
    return this.getAttribute('index');
  }

  set index(val) {
    if (val) {
      this.setAttribute('index', val);
    } else {
      this.removeAttribute('index');
    }
  }

  get label() {
    return this.getAttribute('label');
  }

  set label(val) {
    if (val) {
      this.setAttribute('label', val);
    } else {
      this.removeAttribute('label');
    }
  }

  get checked(): boolean {
    return JSON.parse(this.getAttribute('checked') ?? 'false');
  }

  set checked(val: boolean) {
    if (val) {
      this.setAttribute('checked', `${val}`);
    } else {
      this.removeAttribute('checked');
    }
  }
}

export default TodoListItem;