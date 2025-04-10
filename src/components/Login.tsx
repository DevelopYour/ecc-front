import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/user";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        console.log("Logging in with:", { username, password });

        loginUser(username, password)
            .then((response) => {
                console.log("Login successful:", response);
            })
            .catch((error) => {
                console.error("Login failed:", error);
            });
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-full">
            <div className="p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <div className="mb-4">
                    <label className="block text-c-gray mb-2" htmlFor="username">
                        ID (학번)
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-c-green"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-c-gray mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-c-green"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full bg-c-greenLight text-white py-2 rounded hover:bg-c-green transition"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate("/signup")}
                    className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default Login;