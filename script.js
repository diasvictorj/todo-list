/* eslint-disable comma-dangle */
const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let ulLists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];

const listContainer = document.querySelector('.ul-lists');
const newListInput = document.querySelector('[data-new-list-input]');
const listTitleElement = document.querySelector('[data-list-title]');
const listDisplayContainer = document.querySelector(
  '[data-list-display-container]'
);
const deleteAll = document.getElementById('delete-all');
deleteAll.addEventListener('click', apagaTudo);

const removeCompleted = document.getElementById('remove-completed');
removeCompleted.addEventListener('click', apagaSelecionadas);

const deleteListBTN = document.querySelector('[data-delete-list-button]');
deleteListBTN.addEventListener('click', () => {
  newListInput.value = null;
  ulLists = ulLists.filter((e) => e.id !== selectedListId);

  selectedListId = null;
  saveNRender();
});

const textBox = document.getElementById('text-box');
const ul = document.getElementById('task-list');

const newListForm = document.querySelector('[data-new-list-form]');
newListForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  if (listName == null || listName === '') return;
  const list = createList(listName);
  newListInput.value = null;
  ulLists.push(list);
  saveNRender();
});

function saveNRender() {
  save();
  renderUlList();
}
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(ulLists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function createList(name) {
  return { id: Date.now().toString(), name, tasks: [] };
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function renderUlList() {
  clearElement(listContainer);
  renderListOfTasks();
  const selectedListElement = ulLists.find((e) => e.id === selectedListId);
  if (selectedListElement === null || selectedListElement === undefined) {
    listDisplayContainer.style.display = 'none';
    return;
  }
  listDisplayContainer.style.display = '';
  listTitleElement.innerText = selectedListElement.name;
  renderTaskCount(selectedListElement);
  clearElement(ul);
  if (selectedListElement.tasks === []) {
    return null;
  }
  selectedListElement.tasks.forEach((e) => {
    renderTask(e.taskName, e.isTaskCompleted);
  });
}

function renderTaskCount(list) {
  const listCountElement = document.querySelector('[data-list-count]');
  const incompleteTaskCount = list.tasks.filter(
    (task) => !task.isTaskCompleted
  ).length;
  const taskString = incompleteTaskCount === 1 ? 'tarefa' : 'tarefas';
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} pendentes`;
}
function renderListOfTasks() {
  const al = 'active-list';
  ulLists.forEach((list) => {
    const listElement = document.createElement('li');
    listElement.addEventListener('click', (e) => {
      const upd8listContainer = [
        ...document.querySelector('.ul-lists').childNodes,
      ];
      upd8listContainer.forEach((li) => li.classList.remove(al));
      e.target.classList.toggle(al);
      selectedListId = e.target.dataset.listId;
      saveNRender();
    });
    listElement.dataset.listId = list.id;
    listElement.innerText = list.name;
    if (list.id === selectedListId) listElement.classList.add(al);
    listContainer.appendChild(listElement);
  });
}

function renderTask(textoInserido, completed) {
  const item = document.createElement('li');
  if (completed) item.classList.add('completed');
  const draggable = document.createAttribute('draggable');
  draggable.value = true;
  item.setAttributeNode(draggable);
  item.innerText = textoInserido;
  ul.appendChild(item);
  item.addEventListener('click', (e) => lineColor(e));
  item.addEventListener('dblclick', (e) => completeTask(e));
  item.addEventListener('dragstart', (e) => {
    e.target.classList.add('dragging');
  });
  item.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
  });
}

function updtadeState(textoInserido) {
  const listIdx = ulLists.findIndex((e) => e.id === selectedListId);
  ulLists[listIdx].tasks = [
    ...ulLists[listIdx].tasks,
    { taskName: textoInserido, isTaskCompleted: false },
  ];
  saveNRender();
}

/* Função para criar criar a tarefa */
function criaTarefa() {
  if (textBox.value === '') {
    alert('Insira uma tarefa válida, zé!');
    return null;
  }
  renderTask(textBox.value, false);
  updtadeState(textBox.value);
  textBox.value = '';
}

/* Inicializando o botão adcionar */
const createTaskBtn = document.getElementById('criar-tarefa');
createTaskBtn.addEventListener('click', criaTarefa);
/* Inicializando variavel que contém a linha selecionada */
let itemSelecionado;
/* seleção de item na lista */
let linhaSelecionada = false;

/* Função para colorir a linha selecionada */
function lineColor(event) {
  if (linhaSelecionada) {
    itemSelecionado.classList.toggle('selected');
  }
  itemSelecionado = event.target;
  itemSelecionado.classList.toggle('selected');
  linhaSelecionada = true;
}

function completeTask(event) {
  const selectedListIdx = ulLists.findIndex((e) => e.id === selectedListId);
  event.target.classList.toggle('completed');
  const eIndex = ulLists[selectedListIdx].tasks.findIndex(
    (j) => j.taskName === event.target.innerText
  );
  if (eIndex < 0) return null;
  ulLists[selectedListIdx].tasks[eIndex].isTaskCompleted =
    !ulLists[selectedListIdx].tasks[eIndex].isTaskCompleted;
  renderTaskCount(ulLists[selectedListIdx]);
  save();
}

function removeElement(li) {
  const selectedListIdx = ulLists.findIndex((e) => e.id === selectedListId);
  const eIndex = ulLists[selectedListIdx].tasks.findIndex(
    (j) => j.taskName === li.innerText
  );
  ulLists[selectedListIdx].tasks.splice(eIndex, 1);
  updateById(ulLists[selectedListIdx].tasks);
  saveNRender();
}
function updateById(newTaskList) {
  const listIdx = ulLists.findIndex((e) => e.id === selectedListId);
  ulLists[listIdx].tasks = [...newTaskList];
}
/* Função para apagar todos os elementos da lista */
function apagaTudo() {
  updateById([]);
  saveNRender();
}
/* Função para apagar  os elementos completos da lista */
function apagaSelecionadas() {
  const li = document.querySelectorAll('li');
  const conditions = ['completed', 'selected completed'];
  for (let i = 0; i < li.length; i += 1) {
    if (conditions.includes(li[i].className)) {
      removeElement(li[i]);
      li[i].remove();
    }
  }
}

/* incializando botão delete unico */
const deleteBtn = document.getElementById('delete');
deleteBtn.addEventListener('click', () => {
  const li = document.querySelectorAll('li');
  for (let i = 0; i < li.length; i += 1) {
    if (li[i].className === 'selected') {
      removeElement(li[i]);
    }
  }
});

/* drag elements */
ul.addEventListener('dragover', (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(ul, e.clientY);
  const drag = document.querySelector('.dragging');
  if (afterElement == null) ul.appendChild(drag);
  ul.insertBefore(drag, afterElement);
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll('li:not(.dragging)'),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
}

renderUlList();
