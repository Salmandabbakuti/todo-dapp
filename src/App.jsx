import { useEffect, useState } from 'react';
import { ethers, Contract } from 'ethers';
import { TiTick } from 'react-icons/ti'
import Notify from 'bnc-notify'
import './App.css';


// initialize notify
const notify = Notify({
  dappId: process.env.REACT_APP_BNC_NOTIFY_DAPP_ID,
  networkId: 3,
  darkMode: true
});

const abi = [
  "function addTodo(string _task)",
  "function markTodoAsCompleted(uint256 _id)",
  "function getMyTodos() view returns (tuple(uint256 id, string task, uint256 createdAt, bool isCompleted)[])",
];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [contract, setContract] = useState(null);
  const [todoInput, setTodoInput] = useState('');

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!todoInput || /^\s*$/.test(todoInput)) {
      return;
    }
    contract.addTodo(todoInput).then((tx) => {
      notify.hash(tx.hash);
    }).catch((err) => {
      console.log(err);
    });
  };

  const handleMarkTodoAsCompleted = (id) => {
    contract.markTodoAsCompleted(id).then((tx) => {
      notify.hash(tx.hash);
    }).catch((err) => {
      console.log(err);
    });
  };


  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' }).catch((err) => console.error(err));
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          console.log(`Using account ${accounts[0]}`);
        } else {
          console.error('No accounts found');
        }
      });
      // listen for messages from metamask
      window.ethereum.on('message', (message) => console.log(message));
      // listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log(`Chain changed to ${chainId}`);
        window.location.reload();
      });
      // Subscribe to provider connection
      window.ethereum.on("connect", (info) => {
        console.log('Connected to network:', info);
      });
      // Subscribe to provider disconnection
      window.ethereum.on("disconnect", (error) => {
        console.log('disconnected from network: ', error);
      });
    } else {
      console.error('No ethereum browser detected');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();
        console.log('chainId:', chainId);
        const signer = provider.getSigner();
        if (chainId !== 3) {
          console.error('Wrong Network. Please connect to the Ropsten testnet');
          return
        }
        const contract = new Contract('0x0bb2Eebadd4361ca757FEddb59989Ab2e9b9f246', abi, signer);
        setContract(contract);
        const todos = await contract.getMyTodos();
        setTodos(todos);
        console.log(todos);
      }
    }
    init().catch((error) => console.error(error));
  }, []);

  const Todo = ({ todos }) => {
    return todos.map((todo, index) => (
      <div className={todo.isCompleted ? 'todo-row complete' : 'todo-row'} key={index}>
        <div key={todo.id}>
          {todo.task}
        </div>
        <div>
          {new Date(todo.createdAt * 1000).toLocaleString()}
        </div>
        <div className="icons">
          {!todo.isCompleted && < TiTick className='edit-icon' onClick={() => handleMarkTodoAsCompleted(todo.id)} />}
        </div>
      </div>
    ))
  }
  return (
    <div className="todo-app">
      <div>
        <h1>What's the Plan for Today?</h1>
        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            placeholder="Add a todo"
            value={todoInput}
            name="text"
            className="todo-input"
            onChange={(e) => setTodoInput(e.target.value)}
          />
          <button className="todo-button">Add todo</button>
        </form>
        {todos.map((todo, index) => (
          <div className={todo.isCompleted ? 'todo-row complete' : 'todo-row'} key={index}>
            <div key={todo.id}>
              {todo.task}
            </div>
            <div>
              {new Date(todo.createdAt * 1000).toLocaleString()}
            </div>
            <div className="icons">
              {!todo.isCompleted && < TiTick className='edit-icon' onClick={() => handleMarkTodoAsCompleted(todo.id)} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
