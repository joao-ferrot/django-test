const api_url='http://localhost:8000/api/';

export async function getTasks(){
    const  respose=await fetch (`${api_url}/tasks/`);
    return Response.json();
}
export async function createTask(task) {
    const response=await fetch(`${api_url}/tasks/`, {
        method:'POST',
        headers:{},
        body:JSON.stringify(task),
    
});
return response.json();

}

export async function deleteTask(id) {
    await fetch(`${api_url}/tasks/${id}/`, {
        method:'DELETE',
    });
    return response.json();
}