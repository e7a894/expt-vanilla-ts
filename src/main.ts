import './style.css';
import './components/organisms/TodoList';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <p>ToDo List</p>
    <todo-list></todo-list>
  </div>
`;