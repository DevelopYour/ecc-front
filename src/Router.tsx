import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/Home";

export default function Router() {
    const location = useLocation();
    return (
        <main className="h-[85%] flex flex-col items-center justify-center py-12">
            <Routes location={location}>
                <Route path="/" element={<Home />} />
            </Routes>
        </main>
    )
}