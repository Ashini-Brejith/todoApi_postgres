const express = require('express')
const app = express();
const port = 3000;
const db = require('./db');
const jetitId = require('@jetit/id');
const cors = require('cors');

app.use(express.json());
app.use(cors());


//display todo
app.get("/todo", async (req,res)=>{
    try{
        const todos = await db.query('SELECT * from Todos WHERE deleted = false');
        console.log("Todos fetched from Todos table: ",snakeToCamel(todos.rows));
        res.status(200).json({message:"Todo retrieved successfully", todos: snakeToCamel(todos.rows)});
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

//display tasks
app.get('/todo/:todoId/tasks', async (req,res)=>{

    const todoId = req.params.todoId;
    try{
    const tasks = await db.query('SELECT * from Tasks WHERE todo_id = $1 AND deleted = false', [todoId]);
    console.log(`tasks under ${todoId}: `,tasks.rows);
    res.status(200).json({message:"Task retrieved successfully", tasks:snakeToCamel(tasks.rows)});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

//add todo
app.post('/todo', async (req, res)=>{
    const todoId = jetitId.generateID('HEX');
    const title = req.body.title;
    console.log(title);
    
    try{
    const result = await db.query('INSERT INTO Todos (todo_id,title) VALUES ($1,$2) RETURNING todo_id,title',[todoId,title]);
    res.status(201).json({message:'Todo added successfully', title:snakeToCamel(title)});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});     

//add task
app.post('/todo/:todoId/tasks', async (req,res)=>{
    const todoId = req.params.todoId;   
    const taskId = jetitId.generateID('HEX');
    const task = req.body.task;
    const completed = req.body.completed || false

    try{
        await db.query('INSERT INTO Tasks (task_id,task,completed,todo_id) VALUES ($1,$2,$3,$4)',[taskId,task,completed,todoId]);
        res.status(201).json({mesaage: "Task added successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

//edit a todo title 
app.put("/todo/:todoId", async (req,res)=>{
    const todoId = req.params.todoId;
    const newTitle = req.body.title;
    try{
        await db.query('UPDATE Todos SET title = $1 WHERE todo_id = $2',[newTitle,todoId]);
        res.status(200).json({message:"Todo updated successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }  
});

//edit a task
app.put("/todo/:todoId/tasks/:taskId", async(req,res)=>{
    const todoId = req.params.todoId;
    const taskId = req.params.taskId;
    
    const task = req.body.task;
    const completed = req.body.completed;

    try{
        if(task !== undefined && completed !== undefined){ 
        await db.query('UPDATE Tasks SET task = $1, completed = $2 WHERE todo_id = $3 AND task_id = $4',
            [task, completed, todoId,taskId]);
        }
        else if(completed !== undefined){
            await db.query('UPDATE Tasks SET completed = $1 Where todo_id = $2 AND task_id = $3',
                [completed, todoId, taskId]);
        }    
        res.status(200).json({message:"Task updated successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

//delete an todo
app.delete('/todo/:todoId',async (req,res)=>{
    const todoId = req.params.todoId;
    try{
        await db.query('UPDATE Todos SET deleted = TRUE WHERE todo_id = $1',[todoId]);
        res.status(200).json({message:"Todo deleted successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

//delete a task
app.delete('/todo/:todoId/tasks/:taskId',async (req,res)=>{
    const todoId = req.params.todoId;
    const taskId = req.params.taskId;
    try{
        await db.query('UPDATE Tasks SET deleted = TRUE WHERE todo_id = $1 AND task_id = $2',[todoId, taskId]);
        res.status(200).json({message:"Task deleted successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

function snakeToCamel(obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => snakeToCamel(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        acc[camelKey] = snakeToCamel(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})