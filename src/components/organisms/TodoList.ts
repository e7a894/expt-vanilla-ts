import TodoListItem from '../molecules/TodoListItem'; // todo: seek better way
import '../molecules/TodoListItem';

export default class /*TodoList*/ extends HTMLElement { // not used class name so far
  static {
    if (!customElements.get('todo-list')) customElements.define('todo-list', this);
  }

  readonly #template: HTMLTemplateElement;
  readonly #items: TodoListItem[];
  readonly #elmInput: HTMLInputElement | null;
  readonly #elmSubmit: HTMLButtonElement | null;
  readonly #container: HTMLElement | null;

  constructor() {
    super();
    this.#template = document.createElement('template');
    this.#template.innerHTML = `
      <form>
        <input type="text"></input>
        <button class="submit" type="button">submit</button>
      </form>
      <div class="container"></div>
    `;
    this.#items = [new TodoListItem({ label: 'aaa' })];

    this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) throw Error('Browser does not suppert Shadow DOM');
    this.shadowRoot.appendChild(this.#template.content.cloneNode(true));
    
    this.#elmInput = this.shadowRoot.querySelector('input');
    this.#elmSubmit = this.shadowRoot.querySelector('.submit');
    this.#container = this.shadowRoot.querySelector('.container');
  }

  connectedCallback() {
    if (!this.#elmSubmit) throw Error('elmSubmit is undefined');
    this.#elmSubmit.addEventListener('click', this.#add.bind(this));
    this.#render();
  }

  disconnectedCallback() {
    if (!this.#container) return;
    for (const item of Array.from(this.#container.children)) {
      (item as TodoListItem).clearListener(); // todo: seek better way
    }
  }

  #render() {
    if (!this.#container) throw Error('caontainer is null');
    this.#container.innerHTML = '';

    for (const [index, item] of this.#items.entries()) {
      const todoListItem = document.createElement('todo-list-item') as TodoListItem;
      todoListItem.index = `${index}`;
      todoListItem.checked = item.checked;
      todoListItem.label = item.label;
      const onToggleListener = this.#toggle.bind(this);
      const onRemoveListener = this.#remove.bind(this);
      todoListItem.addEventListener('onToggle', onToggleListener);
      todoListItem.addEventListener('onRemove', onRemoveListener);
      todoListItem.clearListener = () => {
        todoListItem.removeEventListener('onToggle', onToggleListener);
        todoListItem.removeEventListener('onRemove', onRemoveListener);
      };
      this.#container.appendChild(todoListItem);
    }
  }

  #add() {
    if (!this.#elmInput?.value) return;

    const todoListItem = new TodoListItem({ label: this.#elmInput.value });
    this.#items.unshift(todoListItem);
    this.#elmInput.value = '';
    this.#render();
  }

  #toggle(e: CustomEvent) {
    const todoListItem = this.#items.find((_, index) => index === Number(e.detail.index));
    if (!todoListItem) return;
    todoListItem.checked = !todoListItem.checked;
    this.#render();
  }

  #remove(e: CustomEvent) {
    const index = Number(e.detail.index);
    this.#items.splice(index, 1);
    this.#render();
  }
}