import logo from './assets/logo.png';
import slogan from './assets/headerlogo.png';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="w-full bg-c-beige px-10 py-4 flex justify-between items-center shadow-md">
            <img src={logo} alt="ECC 로고" className="h-12 cursor-pointer" onClick={() => navigate("/")} />
            <img src={slogan} alt="Let's Study English Together!" className="h-10" />
            <button className="bg-c-green text-white px-7 py-3 rounded-xl font-semibold" onClick={() => navigate("/login")}>
                Sign in / up
            </button>
        </header>
    )
}

export const Footer = () => {
    return (
        <footer className="w-full h-[8%] bg-c-beige text-center text-[0.65rem] text-c-gray flex items-center justify-center">
            © 서울과학기술대학교 중앙동아리 ECC | contact: we.develop.your@gmail.com
        </footer>
    );
};
