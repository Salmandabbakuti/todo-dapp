// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract TodoList {

    struct Todo {
        uint id;
        string task;
        uint createdAt;
        bool isCompleted;
    }

    mapping(address => Todo[]) todos;


    function addTodo(string calldata _task) public {
        todos[msg.sender].push(Todo(todos[msg.sender].length, _task, block.timestamp, false));
    }

    function markTodoAsCompleted(uint _id) public {
        todos[msg.sender][_id].isCompleted = true;
    }
    
    function getMyTodos() public view returns (Todo[] memory) {
        return todos[msg.sender];
    }
}