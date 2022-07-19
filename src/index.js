const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const {username}=request.headers;   
    const user=users.find(user => user.username===username);
    
    if(!user) {
      return response.status(404).json({error:"Usuario não encontrado"});
    }

      request.users=user;
      return next();
    
}

app.post('/users', (request, response) => {
  const {name,username}=request.body;

  const UserValidation=users.some(user => user.username==username);

  if(UserValidation) {

    return response.status(400).json({error:"Já existe um utilizador com este nome de usuario "})

  }else{

    const user={
      id:uuidv4(),
      name,
      username,
      todos:[]
    }
    users.push(user);
    return response.status(201).json(user); 
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {users}=request;
    return response.status(200).json(users.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const {title,deadline}=request.body;
    const {users} = request;

    const todos={
      id: uuidv4(), 
      title: title,
      done: false, 
      deadline:new Date(deadline), 
      created_at: new Date().toLocaleDateString()
  };

  users.todos.push(todos)

  return response.status(201).json(todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    
  const {title,deadline}=request.body;
  const {users} = request;
  const {id}=request.params;
  const todo=users.todos.find(todo =>todo.id === id);
  if(!todo){
    return response.status(404).json({error:"Tarefa não existente"})
  }
  todo.title=title;
  todo.deadline=new Date(deadline);
  return response.json(todo);
 
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {users} = request;
  const {id}=request.params;
  const todo=users.todos.find(todo =>todo.id === id);

  if(!todo){
    return response.status(404).json({error:"Tarefa não existente"})
  }
  todo.done=true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   const {users} = request;
   const {id}=request.params;
   const todoIndex=users.todos.findIndex(todo => todo.id === id);
   if(todoIndex===-1){
    return response.status(404).json({error:"Tarefa não existente"});
  }
  users.todos.splice(todoIndex,1)
  return response.status(204).json();
});

module.exports = app;