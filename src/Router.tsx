import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Join from "./components/Join";
import Login from "./components/Login";

export default function Router() {
    const location = useLocation();
    return (
        <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Join />} />
        </Routes>
    )
}