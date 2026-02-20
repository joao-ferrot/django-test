const api_url='http://localhost:8000/api/';

export async function login(username, password){
    const response=await fetch (`${api_url}login/`, {
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify({username, password}),
    });
    if(!response.ok){
        throw new Error('Login falhou');
    }
    const data = await response.json();
    localStorage.setItem('token', data.access);
    return data;
}

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

export async function getTasks(){
    const response=await fetch (`${api_url}tasks/`, {
        headers: getHeaders()
    });
    const data = await response.json();
    // Se é paginado, retorna o array de resultados, senão retorna o array direto
    return Array.isArray(data) ? data : (data.results || []);
}

export async function createTask(task) {
    const response=await fetch(`${api_url}tasks/`, {
        method:'POST',
        headers: getHeaders(),
        body:JSON.stringify(task),
    });
    return response.json();
}

export async function deleteTask(id) {
    await fetch(`${api_url}tasks/${id}/`, {
        method:'DELETE',
        headers: getHeaders()
    });
}
