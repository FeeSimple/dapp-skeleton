import React from 'react'
import ReactDOM from 'react-dom'
import EOS from 'eosjs'
import update from 'react-addons-update';

// Define the account used to deploy the contract.
// This account will be used to reference the contract.
const contractAccount = {
    name: 'useraaaaaaaa',
    privKey: '5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr'
}

// Define the local nodeos endpoint connected to the remote testnet blockchain
const localNodeos = 'http://127.0.0.1:8877'

// Basic configuration of the EOS client
const config = {
    chainId: '1c6ae7719a2a3b4ecb19584a30ff510ba1b6ded86e1fd8b8fc22f1179c622a32',
    keyProvider: contractAccount.privKey,
    httpEndpoint: localNodeos,

    expireInSeconds: 60,
    broadcast: true,
    debug: false, // set to true for debugging the transaction
    sign: true
}

// Instantiate the EOS client used for blockchain/contract interaction
const eosClient = EOS(config)

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
    eosClient.getTableRows(contractAccount.name, contractAccount.name, TAB_NAME)
      .then((data) => {
        this.setState({ todos: data })
        console.error(data);
      }).catch((e) => {
        console.error(e);
      })
  }

  addNewTodo(description){
    this.setState({ loading: true })
    const id = this.state.todos.length
    const newTodos = update(this.state.todos, {$push: [
      { id: (id), description: description, completed: false },
    ]});

    this.setState({ todos: newTodos })

    eosClient.contract(contractAccount.name).then((contract) => {
      contract.create(
        contractAccount.name,
        (id),
        description,
        { authorization: [contractAccount.name] }
      ).then((res) => { this.setState({ loading: false })})
      .catch((err) => { this.setState({ loading: false }); console.log(err) })
    })
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

    eosClient.contract(contractAccount.name).then((contract) => {
      contract.complete(
        contractAccount.name,
        (this.state.todos.length),
        { authorization: [contractAccount.name] }
      ).then((res) => { this.setState({ loading: false }) })
      .catch((err) => { this.setState({ loading: false }); console.log(err) })
    })
  }

  removeTodo(id, e) {
    e.preventDefault();
    this.setState({ loading: true })

    var todoIndex = this.state.todos.findIndex((todo) => { return todo.id == id });
    this.setState({ todos: this.state.todos.filter(todo => todo.id != id) })

    eosClient.contract(contractAccount.name).then((contract) => {
      contract.destroy(
        contractAccount.name,
        (todoIndex),
        { authorization: [contractAccount.name] }
      ).then((res) => { this.setState({ loading: false }); })
      .catch((err) => { this.setState({ loading: false }); console.log(err) })
    })
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
