import logo from './assets/logo.png';
import slogan from './assets/headerlogo.png';

export const Header = () => {
    return (
        <header className="w-full bg-[#f3eee9] px-6 py-4 flex justify-between items-center">
            <img src={logo} alt="ECC 로고" className="h-12" />
            <img src={slogan} alt="Let's Study English Together!" className="h-12" />
            <button className="bg-[#3c5d5d] text-white px-4 py-2 rounded-xl font-semibold">
                Sign in / up
            </button>
        </header>

    )
}