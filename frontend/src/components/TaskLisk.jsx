import { useCallback, useEffect, useState } from "react";
import { getTasks, createTask, deleteTask } from "../services/api";

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');

    const loadTasks = useCallback(async () => {
        const data = await getTasks();
        setTasks(data.results ?? data);
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    async function handleSubmit(e) {
        e.preventDefault();
        await createTask({ title });
        setTitle('');
        loadTasks();
    }

    async function handleDelete(id) {
        await deleteTask(id);
        loadTasks();
    }

    return (
        <div>
            <h1>Task List</h1>
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