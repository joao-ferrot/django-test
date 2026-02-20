import { useState } from "react";
import { login } from "../services/api";
import "./Login.css";

export default function Login({ onLogin }){
    const [username, setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [error, setError]=useState('');
    const [loading,setLoading]=useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setError('');
        setLoading(true);
        try{
            await login(username,password);
            onLogin();
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }

    }

    return(
    <div className="login-wrapper">
        <div className="login-card">
            <h1 className="login-title">Tasks</h1>
            <p className="login-subtitle">Faça login para continuar</p>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                    <label htmlFor="username">usuario</label>

                    <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e)=> setUsername(e.target.value)}
                    placeholder="digite seu usuario"
                    required 
                    autoFocus/>

                </div>

                <div className="login-field">
                    <label htmlFor="password">senha</label>
                    <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required/>


                </div>
                {error && <p className="login-error">{error}</p>}
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? "Carregando..." : "Entrar"}
                </button>
            </form>
        </div>
    </div>
);

}