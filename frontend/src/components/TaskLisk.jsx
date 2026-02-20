import { useCallback, useEffect, useState } from "react";
import { getTasks, createTask, deleteTask } from "../services/api";
import "./TaskList.css";
export default function TaskList({ onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');

    const loadTasks = useCallback(async () => {
        try{
        const data = await getTasks();
        setTasks(Array.isArray(data) ? data : []);
    }catch(error){
         console.error("erro ao carregar as tarefas:", error);
         setTasks([]);
    }}, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            await createTask({ title });
            setTitle('');
            await loadTasks();
        } catch (error) {
            console.error("erro ao criar tarefa:", error);
        }
    }

    async function handleDelete(id) {
        await deleteTask(id);
        loadTasks();
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Task List</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    onLogout();
                }}>Logout</button>
            </div>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="New Task" 
                />
                <button type="submit">Add</button>
            </form>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.title}
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}