create table Todos(
	todo_id serial primary key,
	title varchar(300)
);
insert into Todos(title) values ('Buy groceries'),('Morning Routine'),('Pack for picnic');
select * from Todos;

create table Tasks(
	taskId serial primary key,
	task varchar(300),
	completed boolean,
	todo_id int references Todos(todo_id)
);

insert into Tasks(task,completed,todo_id)values('Tomato',true,1);
select * from Tasks;

insert into Tasks(task,completed,todo_id)values('Eggs',true,1),('Onion',true,1),('Carrot',true,1),('Bread',true,1);
select * from Tasks;
