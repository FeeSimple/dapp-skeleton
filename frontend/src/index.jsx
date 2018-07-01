import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update'
// const rp = require('request-promise')
const request = require('request')

const API_END_POINT           = 'http://localhost:3333'
const API_HEADER_TOKEN_KEY    = 'feesimple-token'
const API_HEADER_TOKEN_VAL    = 'fst'
// let API_OPT                   = {
//                                   method: 'POST',
//                                   uri: '',
//                                   headers: 
//                                   {
//                                     API_HEADER_TOKEN_KEY: API_HEADER_TOKEN_VAL,
//                                     'Content-Type': 'application/x-www-form-urlencoded'
//                                   },
//                                   json: true
//                                 }

var API_OPT = {
  url: URL,
  headers: {
    API_HEADER_TOKEN_KEY: API_HEADER_TOKEN_VAL
  }
}

const API_GET_TABLE            = API_END_POINT + '/table'
const API_ITEM_CREATE          = API_END_POINT + '/item/create'
const API_ITEM_COMPLETE        = API_END_POINT + '/item/complete'
const API_ITEM_REMOVE          = API_END_POINT + '/item/remove'

class TodoForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = { descripion: "" }
  }

  updateInput(e){
    this.setState({ description: e.target.value })
  }

  saveTodo(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.description)
    this.setState({ description: "" })
  }

  render() {
    return(
      <form onSubmit={this.saveTodo.bind(this)}>
        <input type="text" value={this.state.description} placeholder="Add a new TODO" onChange={this.updateInput.bind(this) }/>
        <button type="submit">Save</button>
      </form>
    )
  }
}

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      todos: []
    }

    this.loadTodos();
  }

  loadTodos() {
    const TAB_NAME = 'todos'

    API_OPT.url = API_GET_TABLE
    // API_OPT.body = {
    //   table: TAB_NAME
    // }

    console.log('loadTodos, API_OPT: ', API_OPT);

    //request.post(API_OPT, (error, response, body) => {

    request.post(API_OPT, function (err,data) {
        this.setState({ todos: data })
        console.error(data)
      })
  }

  addNewTodo(description){
    this.setState({ loading: true })
    const id = this.state.todos.length
    const newTodos = update(this.state.todos, {$push: [
      { id: (id), description: description, completed: false },
    ]});

    this.setState({ todos: newTodos })

    console.log('addNewTodo - description: ', description)

    API_OPT.uri = API_ITEM_CREATE
    API_OPT.body = {
      itemId: id,
      itemDesc: description
    }
    rp.get(API_OPT)
      .then((res) => { this.setState({ loading: false })})
      .catch((err) => { this.setState({ loading: false }); console.log(err) })
  }

  completeTodo(id, e) {
    e.preventDefault();
    this.setState({ loading: true })

    var todoIndex = this.state.todos.findIndex((todo) => { return todo.id == id });

    this.setState({
      todos: update(this.state.todos, {
        [todoIndex]: { $merge: { completed: true }}
      })
    })

    API_OPT.uri = API_ITEM_COMPLETE
    API_OPT.body = {
      itemId: id
    }
    rp.get(API_OPT)
      .then((res) => { this.setState({ loading: false }) })
      .catch((err) => { this.setState({ loading: false }); console.log(err) })
  }

  removeTodo(id, e) {
    e.preventDefault();
    this.setState({ loading: true })

    var todoIndex = this.state.todos.findIndex((todo) => { return todo.id == id });
    this.setState({ todos: this.state.todos.filter(todo => todo.id != id) })

    API_OPT.uri = API_ITEM_REMOVE
    API_OPT.body = {
      itemId: id
    }
    rp.get(API_OPT)
      .then((res) => { this.setState({ loading: false }); })
      .catch((err) => { this.setState({ loading: false }); console.log(err) })
  }

  renderTodoItem(todo) {
    return (
      <li key={todo.id}>
        {todo.completed ?
         <span>[x] </span> :
         <input type="checkbox" onClick={this.completeTodo.bind(this, todo.id)} checked={false} /> }
        {todo.description}
        { " " }
        {todo.completed ? <a href="#" onClick={this.removeTodo.bind(this, todo.id)}>(remove)</a> : ""}
      </li>
    );
  }

  render() {
    return (
      <div>
        <h3>My TODOs: {this.state.loading ? <small>(saving...)</small> : ""}</h3>
        {this.state.todos.map(this.renderTodoItem.bind(this))}
        <br />
        <TodoForm onSubmit={this.addNewTodo.bind(this)} />
      </div>
    );
  }
}

ReactDOM.render(<TodoList />, document.getElementById('app'));

module.hot.accept();
