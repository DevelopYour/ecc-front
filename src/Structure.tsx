import logo from './assets/logo.png';
import slogan from './assets/headerlogo.png';

export const Header = () => {
    return (
        <header className="w-full h-[10%] bg-[#f3eee9] px-10 py-4 flex justify-between items-center">
            <img src={logo} alt="ECC 로고" className="h-[100%]" />
            <img src={slogan} alt="Let's Study English Together!" className="h-[90%]" />
            <button className="bg-[#3c5d5d] text-white px-7 py-3 rounded-xl font-semibold">
                Sign in / up
            </button>
        </header>
    )
}

export const Footer = () => {
    return (
        <footer className="w-full h-[5%] bg-[#f3eee9] text-center text-[0.65rem] text-gray-600 flex items-center justify-center">
            © 서울과학기술대학교 중앙동아리 ECC | contact: we.develop.your@gmail.com
        </footer>
    );
};
