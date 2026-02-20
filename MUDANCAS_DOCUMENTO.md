# 📋 Documentação Completa de Todas as Mudanças - Django + React Task API

## Resumo Executivo
Este documento detalha todas as correções e implementações realizadas para transformar um projeto Django + React não funcional em uma aplicação completa de autenticação JWT e gerenciamento de tarefas.

---

## 🔧 MUDANÇAS REALIZADAS

### 1. FRONTEND - Correção de Erro de Syntax (App.jsx)
**Arquivo:** `frontend/src/App.jsx`  
**Problema:** Importação incompleta causando SyntaxError  
```javascript
// ❌ ANTES - Linha 2 estava incompleta
import Login from
function App(){

// ✅ DEPOIS
import Login from "./components/Login";

function App(){
```
**Motivo:** Toda importação ES6 com `from` deve ser seguida por um caminho (string literal)

---

### 2. FRONTEND - Correção do Componente Login (Login.jsx)
**Arquivo:** `frontend/src/components/Login.jsx`  
**Problemas Corrigidos:**

#### 2.1 - Nome da Função em Minúsculo (React exige MAIÚSCULA)
```javascript
// ❌ ANTES - Linha 4
export default function login({})

// ✅ DEPOIS
export default function Login({ onLogin })
```
**Por que:** React só renderiza componentes com primeira letra MAIÚSCULA. Com `login` minúsculo, React ignorava completamente o componente.

#### 2.2 - Typo no Nome da Função Handler
```javascript
// ❌ ANTES - Linha 11
async function handLeSubmit(e){

// ✅ DEPOIS
async function handleSubmit(e){
```
**Por que:** Typo simples que causava erro de referência na linha 31

#### 2.3 - Removida Chamada de Função Não Definida
```javascript
// ❌ ANTES - Linha 17
await login(username,password);
onLogin();  // ← Não era definida

// ✅ DEPOIS
await login(username,password);
onLogin();  // ← Agora recebido como prop
```

#### 2.4 - Adicionado Prop onLogin
```javascript
// ✅ Agora recebe como parâmetro
export default function Login({ onLogin }){
    // ...
    async function handleSubmit(e){
        // ...
        if(login bem-sucedido){
            onLogin();  // ← Chama função do componente pai
        }
    }
}
```

#### 2.5 - Atualização do onSubmit no Form
```javascript
// ❌ ANTES
<form onSubmit={handLeSubmit} className="login-form">

// ✅ DEPOIS
<form onSubmit={handleSubmit} className="login-form">
```

---

### 3. BACKEND - Criação do Endpoint de Login (views.py)
**Arquivo:** `backend/tasks/views.py`  
**Implementação:** Novo endpoint JWT para autenticação

```python
# ✅ ADICIONADO - Importações necessárias
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

# ✅ ADICIONADO - Nova view de login
@api_view(['POST'])
def login(request):
    """
    Autentica usuário e retorna JWT tokens
    
    Request body JSON esperado:
    {
        "username": "seu_usuario",
        "password": "sua_senha"
    }
    
    Response (sucesso 200):
    {
        "access": "eyJ0eX...",
        "refresh": "eyJ0eX..."
    }
    
    Response (falha 401):
    {
        "error": "Credenciais inválidas"
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Autentica contra banco de dados Django
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Cria tokens JWT para o usuário
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    
    return Response(
        {'error': 'Credenciais inválidas'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )
```

**Mudanças no TaskViewSet:**
```python
# ❌ ANTES
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

# ✅ DEPOIS - Adiciona permissão de autenticação obrigatória
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]  # ← NOVO
```

**Por que:** 
- Sem `IsAuthenticated`, qualquer pessoa poderia acessar tarefas
- Com JWT, apenas usuários autenticados conseguem fazer requisições à API de tarefas

---

### 4. BACKEND - Registro da Rota de Login (urls.py)
**Arquivo:** `backend/tasks/urls.py`

```python
# ❌ ANTES
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet,basename='task')

urlpatterns = router.urls

# ✅ DEPOIS
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TaskViewSet, login  # ← Importa nova view

router = DefaultRouter()
router.register(r'tasks', TaskViewSet,basename='task')

urlpatterns = [
    path('login/', login, name='login'),  # ← Nova rota
] + router.urls
```

**Fluxo de requisição:**
- Cliente POST em `http://localhost:8000/api/login/` com credenciais
- View `login()` autentica e retorna JWT tokens
- Cliente armazena `access` token no localStorage

---

### 5. BACKEND - Configuração CORS (settings.py)
**Arquivo:** `backend/core/settings.py`

#### 5.1 - Adicionado CORS_ALLOWED_ORIGINS
```python
# ✅ ADICIONADO no final do arquivo
CORS_ALLOWED_ORIGINS=[
    "http://localhost:5173",      # Vite dev server (padrão)
    "http://127.0.0.1:5173",      # IP local (alternativa)
]
```

**Por que:** 
- Sem CORS configurado, requisições do frontend (localhost:5173) eram bloqueadas pelo backend (localhost:8000)
- Erro: "CORS policy: No 'Access-Control-Allow-Origin' header"

#### 5.2 - Reordenação do Middleware CORS (CRÍTICO!)
```python
# ❌ ANTES - CorsMiddleware no final
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_browser_reload.middleware.BrowserReloadMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ← Posição errada!
]

# ✅ DEPOIS - CorsMiddleware antes de CommonMiddleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ← Deve vir logo após SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_browser_reload.middleware.BrowserReloadMiddleware',
]
```

**Por que é crítico:**
- Middleware é processado em **ordem sequencial**
- `CorsMiddleware` deve processar ANTES de `CommonMiddleware`
- Caso contrário, não adiciona headers CORS na resposta

---

### 6. BACKEND - Correção do Modelo Task (models.py)
**Arquivo:** `backend/tasks/models.py`

```python
# ❌ ANTES - Método __str__ desindentado (está fora da classe!)
class Task(models.Model):
    title=models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

def __str__(self):  # ← FORA da classe! Erro de sintaxe
    return self.title

# ✅ DEPOIS - Método corretamente dentro da classe
class Task(models.Model):
    title=models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):  # ← Dentro da classe com 4 espaços de indentação
        return self.title
```

**Impacto:** 
- Isso causaria SyntaxError ao tentar fazer migrações do Django
- Modelo não seria criado corretamente no banco de dados

---

### 7. FRONTEND - Gerenciamento de Autenticação (App.jsx)
**Arquivo:** `frontend/src/App.jsx`

```javascript
// ❌ ANTES - Renderiza Login e TaskList simultaneamente
import TaskList from "./components/TaskLisk";
import Login from "./components/Login";

function App(){
  return (
    <div className="App">
      <TaskList />    {/* Sempre mostra */}
      <Login />       {/* Sempre mostra */}
    </div>
  );
}

// ✅ DEPOIS - Renderiza CONDICIONALMENTE baseado em autenticação
import { useState } from "react";
import TaskList from "./components/TaskLisk";
import Login from "./components/Login";

function App(){
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <TaskList onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
```

**Lógica:**
- Estado `isAuthenticated` controla qual componente é renderizado
- `isAuthenticated = false` → Mostra Login
- `isAuthenticated = true` → Mostra TaskList
- Login chama `onLogin()` → Muda estado para true
- Logout chama `onLogout()` → Muda estado para false

---

### 8. FRONTEND - Serviço de API com JWT (api.js)
**Arquivo:** `frontend/src/services/api.js`

#### 8.1 - Função de Login com Armazenamento de Token
```javascript
// ✅ NOVA FUNÇÃO
export async function login(username, password){
    const response=await fetch (`http://localhost:8000/api/login/`, {
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
    // 🔑 Armazena token no localStorage para requisições futuras
    localStorage.setItem('token', data.access);
    return data;
}
```

#### 8.2 - Função Auxiliar para Headers com Token
```javascript
// ✅ NOVA FUNÇÃO - Centraliza lógica de headers
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        // Se houver token, adiciona ao header Authorization
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}
```

**Explicação do spread operator:**
```javascript
// Se token = "abc123def"
const headers = {
    'Content-Type': 'application/json',
    ...(true && { 'Authorization': 'Bearer abc123def' })
}
// Resultado:
// {
//   'Content-Type': 'application/json',
//   'Authorization': 'Bearer abc123def'
// }

// Se token = null (não logado)
const headers = {
    'Content-Type': 'application/json',
    ...(false && { 'Authorization': 'Bearer null' })
}
// Resultado:
// {
//   'Content-Type': 'application/json'
//   // Authorization não é incluído
// }
```

#### 8.3 - Atualização do getTasks com Tratamento de Paginação
```javascript
// ✅ MELHORADO - Usa getHeaders() e trata paginação
export async function getTasks(){
    const response=await fetch (`http://localhost:8000/api/tasks/`, {
        headers: getHeaders()  // ← Adiciona JWT token
    });
    const data = await response.json();
    
    // Django REST Framework pode retornar paginado:
    // { "count": 10, "results": [...] }
    // Ou array direto: [...]
    return Array.isArray(data) ? data : (data.results || []);
}
```

#### 8.4 - Atualização de createTask
```javascript
// ✅ ANTES - Sem JWT, URL duplicada
export async function createTask(task) {
    const response=await fetch(`http://localhost:8000/api//tasks/`, {  // ← Barra duplicada!
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(task),
    });
    return response.json();
}

// ✅ DEPOIS - Com JWT, sem barra duplicada
export async function createTask(task) {
    const response=await fetch(`http://localhost:8000/api/tasks/`, {
        method:'POST',
        headers: getHeaders(),  // ← Usa função centralizada
        body:JSON.stringify(task),
    });
    return response.json();
}
```

#### 8.5 - Atualização de deleteTask
```javascript
// ✅ ANTES - Sem JWT
export async function deleteTask(id) {
    await fetch(`http://localhost:8000/api/tasks/${id}/`, {
        method:'DELETE',
    });
}

// ✅ DEPOIS - Com JWT
export async function deleteTask(id) {
    await fetch(`http://localhost:8000/api/tasks/${id}/`, {
        method:'DELETE',
        headers: getHeaders()  // ← Adiciona token
    });
}
```

**Fluxo completo de autenticação:**
```
1. Login.jsx → login(username, password)
2. api.js → POST /api/login/ → Recebe access token
3. api.js → localStorage.setItem('token', access)
4. Login.jsx → onLogin() → App.jsx muda para isAuthenticated=true
5. TaskList.jsx carrega getTasks()
6. api.js → Lê token do localStorage
7. api.js → Adiciona "Authorization: Bearer {token}" ao header
8. Backend valida JWT e retorna tarefas
```

---

### 9. FRONTEND - Componente TaskList (TaskLisk.jsx)
**Arquivo:** `frontend/src/components/TaskLisk.jsx`

#### 9.1 - Adicionado Prop onLogout
```javascript
// ❌ ANTES
export default function TaskList() {

// ✅ DEPOIS
export default function TaskList({ onLogout }) {
```

#### 9.2 - Melhorado Tratamento de Erro no loadTasks
```javascript
// ❌ ANTES - Catch sem informação
catch{
    console.error(" erro ao carregar  as tarefas");
    setTasks([]);
}

// ✅ DEPOIS - Catch com detalhe do erro
catch(error){
    console.error("erro ao carregar as tarefas:", error);
    setTasks([]);
}
```

#### 9.3 - Removido setTimeout Desnecessário
```javascript
// ❌ ANTES - setTimeout quebrado
useEffect(() => {
    const timeoutId = setTimeout(() => {
        loadTasks();
    })  // ← Faltou fechar setTimeout!
}, [loadTasks]);

// ✅ DEPOIS - Simples e direto
useEffect(() => {
    loadTasks();
}, [loadTasks]);
```

#### 9.4 - Melhorado handleSubmit
```javascript
// ❌ ANTES - Sem validação nem catch
async function handleSubmit(e) {
    e.preventDefault();
    await createTask({ title });
    setTitle('');
    loadTasks();
}

// ✅ DEPOIS - Com validação e tratamento de erro
async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;  // Valida título vazio
    try {
        await createTask({ title });
        setTitle('');
        await loadTasks();
    } catch (error) {
        console.error("erro ao criar tarefa:", error);
    }
}
```

#### 9.5 - Adicionado Botão de Logout
```javascript
// ✅ ADICIONADO - Header com botão logout
return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Task List</h1>
            <button onClick={() => {
                localStorage.removeItem('token');  // Remove token
                onLogout();  // Chama função do pai
            }}>Logout</button>
        </div>
        {/* resto do componente */}
    </div>
);
```

---

## 📊 Fluxo Completo da Aplicação

### 1. Início da Aplicação
```
user acessa http://localhost:5173
        ↓
App.jsx renderiza
        ↓
isAuthenticated = false (inicial)
        ↓
Renderiza Login.jsx
```

### 2. Processo de Login
```
user digita username e password
        ↓
click em "Entrar"
        ↓
handleSubmit() em Login.jsx
        ↓
login(username, password) em api.js
        ↓
POST http://localhost:8000/api/login/
        ↓
Backend autentica com django.contrib.auth
        ↓
Response com JWT tokens
        ↓
api.js armazena em localStorage
        ↓
onLogin() callback chamado
        ↓
App.jsx muda isAuthenticated = true
        ↓
Renderiza TaskList.jsx
        ↓
useEffect carrega tarefas com token no header
```

### 3. Requisição com Token JWT
```
getTasks() precisa buscar tarefas
        ↓
getHeaders() lê token do localStorage
        ↓
headers.Authorization = "Bearer {token}"
        ↓
GET /api/tasks/ com header
        ↓
Backend valida JWT em middleware
        ↓
TaskViewSet verifica permission_classes=[IsAuthenticated]
        ↓
Se válido: retorna tarefas do usuário
Se inválido: retorna 401 Unauthorized
```

### 4. Logout
```
user clica em "Logout"
        ↓
localStorage.removeItem('token')
        ↓
onLogout() chamado
        ↓
App.jsx muda isAuthenticated = false
        ↓
Renderiza Login.jsx novamente
```

---

## 🔐 Segurança - O Que Foi Implementado

### 1. Autenticação JWT
- **O que é:** Json Web Token - padrão moderno de autenticação stateless
- **Como funciona:** 
  - Backend gera token criptografado com informações do usuário
  - Cliente armazena e envia em cada requisição
  - Backend valida assinatura do token
  
### 2. Password Hashing
- Django automaticamente faz hash de senhas com PBKDF2
- Senhas **nunca** são armazenadas em texto plano

### 3. CORS (Cross-Origin Resource Sharing)
- Frontend (5173) e Backend (8000) rodam em portas diferentes
- CORS valida que frontend autorizado pode acessar backend
- Sem CORS: requisições bloqueadas por browser (segurança)

### 4. Token Expiration
```python
# settings.py
SIMPLE_JWT={
    'ACCESS_TOKEN_LIFETIME':timedelta(minutes=30),  # Token expira em 30min
    'REFRESH_TOKEN_LIFETIME':timedelta(days=1),     # Refresh vive 1 dia
}
```

### 5. Permissões por Usuário
```python
permission_classes = [IsAuthenticated]  # Apenas usuários autenticados
```

---

## 📝 Checklist de Resolução

- [x] Erro: Importação incompleta em App.jsx
- [x] Erro: Componente Login com nome minúsculo
- [x] Erro: Typo em handleSubmit (handLeSubmit)
- [x] Erro: Chamada undefined onLogin()
- [x] Erro: Modelo Task mal indentado
- [x] Erro: CORS bloqueando requisições
- [x] Erro: Ordem errada do middleware CORS
- [x] Erro: URL com barra duplicada (/api//tasks/)
- [x] Erro: Paginação não tratada no frontend
- [x] Erro: TaskList e Login aparecendo simultaneamente
- [x] Erro: Sem autenticação JWT implementada
- [x] Erro: Permissões não forçando autenticação

---

## 🎓 Conceitos Aprendidos

### Frontend (React)
1. **Props** - Passar dados entre componentes
2. **Estado (useState)** - Gerenciar dados dinâmicos
3. **useEffect** - Efeitos colaterais e lifecycle
4. **useCallback** - Memoizar funções para evitar re-renders
5. **localStorage** - Persistência de dados no navegador
6. **Renderização Condicional** - Mostrar UI baseada em condições
7. **JWT Tokens** - Autenticação stateless

### Backend (Django)
1. **ViewSets** - Classes que combinam CRUD
2. **Serializers** - Converter Python objects para JSON
3. **Autenticação JWT** - simple-jwt library
4. **Permissões** - IsAuthenticated e AllowAny
5. **Middleware** - Processamento de requisições
6. **CORS** - Controlar acesso cross-origin
7. **Modelos ORM** - Mapping de banco em classes Python

### API REST
1. **Métodos HTTP** - GET, POST, DELETE, OPTIONS
2. **Status Codes** - 200, 201, 401, 404, 500
3. **Headers** - Content-Type, Authorization
4. **Bearer Tokens** - Padrão "Authorization: Bearer {token}"
5. **Paginação** - data.results vs array direto

---

## 🐛 Erros Comuns Evitados

### Erro 1: CORS Middleware na Posição Errada
```
❌ ANTES: ['Security', 'Sessions', 'Common', 'CSRF', ..., 'CORS']
✅ DEPOIS: ['Security', 'CORS', 'Sessions', 'Common', 'CSRF', ...]
```

### Erro 2: React Componente com Nome Minúsculo
```
❌ function myComponent()
✅ function MyComponent()
```

### Erro 3: Não Validar Resposta Paginada
```
❌ return response.json()  // Pode ser {results: [...]}
✅ return Array.isArray(data) ? data : (data.results || [])
```

### Erro 4: Sem try/catch em Requisições Async
```
❌ async function load() {
    const data = await fetch(...)
}

✅ async function load() {
    try{
        const data = await fetch(...)
    }catch(error){
        console.error(error)
    }
}
```

### Erro 5: Token Não Enviado em Headers
```
❌ fetch('/api/tasks')  // Token não vai!

✅ fetch('/api/tasks', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
```

---

## 📁 Arquivos Modificados - Resumo

| Arquivo | Mudanças | Tipo |
|---------|----------|------|
| `app.jsx` | Adicionado useState, renderização condicional | Frontend |
| `Login.jsx` | Nome MAIÚSCULA, prop onLogin, handleSubmit | Frontend |
| `TaskLisk.jsx` | Prop onLogout, try/catch, botão logout | Frontend |
| `api.js` | Login, getHeaders, JWT, paginação | Frontend |
| `views.py` | Função login, IsAuthenticated | Backend |
| `urls.py` | Rota /login/, import da view | Backend |
| `models.py` | __str__ corrigido indentação | Backend |
| `settings.py` | CORS_ALLOWED_ORIGINS, reordenação middleware | Backend |

---

## 🚀 Próximos Passos (Sugestões)

1. **Melhorias de UX:**
   - Adicionar loading spinner durante login
   - Toast/alerts para sucesso/erro
   - Validação de campos frontend

2. **Melhorias de Segurança:**
   - Refresh token rotation
   - HttpOnly cookies para tokens
   - Rate limiting no login

3. **Funcionalidades:**
   - Editar tarefas
   - Marcar tarefas como completo
   - Filtros e busca
   - Categorias de tarefas

4. **Deploy:**
   - Build frontend com `npm run build`
   - Servir static files do Django
   - Variáveis de ambiente para URLs
   - HTTPS em produção

---

## 📚 Referências Úteis

- **Django REST Framework:** https://www.django-rest-framework.org/
- **Simple JWT:** https://django-rest-framework-simplejwt.readthedocs.io/
- **React Hooks:** https://react.dev/reference/react
- **CORS:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **JWT:** https://jwt.io/

---

**Documento criado:** 20 de fevereiro de 2026  
**Versão:** 1.0  
**Status:** Aplicação Funcional ✅
