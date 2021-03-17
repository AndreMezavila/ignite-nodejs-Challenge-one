const { response, request } = require('express');
const Express = require('express');
const {v4: uuidv4} = require("uuid");
const app = Express();

app.use(Express.json());

const users = [];


function checksExistsUserAccount(request,response,next){
    const { username } = request.headers;

    const userExist = users.find((user) => user.username === username);

    if(!userExist){
        return response.status(400).json({error: "User not found"});
    }

    request.user = userExist;

    return next();
}

function checksExistsTodo(request,response,next){
    const { id } = request.params;
    const { user } = request;

    const todo = user.todos.find(todo => todo.id === id);

    if(!todo){
        return response.status(400).json({error: "Todo not found"});
    }

    request.todo = todo;

    return next();
}


app.post('/users',(request,response) =>{
    const { name,username } = request.body;

    const userFind = users.find(user => user.username === username);

    if (userFind){
        return response.status(400).json({error: "The user already exists!"})
    }

    users.push({ 
        id: uuidv4(), 
        name, 
        username, 
        todos: []
    });

    return response.status(201).json({"message":"User created successfully"});
})

app.get('/users',(request,response) =>{
   return response.json(users);
})


app.get('/todos',checksExistsUserAccount,(request, response) => {
    const { user } = request;
    return response.json(user.todos);
    
});  

app.post('/todos',checksExistsUserAccount,(request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;

    const todo = { 
        id: uuidv4(),
        title,
        done: false, 
        deadline: new Date(deadline), 
        created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);

  });


app.put('/todos/:id',checksExistsUserAccount,checksExistsTodo,(request, response) => {
    const {todo } = request;
    const { title, deadline } = request.body;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount,checksExistsTodo,(request, response) => {
    const {todo } = request;
    todo.done = true;
    return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount,checksExistsTodo,(request, response) => {
    const {user,todo } = request;
    user.todos.splice(todo,1);
    return response.status(200).json(user.todos);

  });

app.listen(3333);