import img from '../assets/full-logo.png'

export default function Home() {
    return (
        <div className="flex flex-col h-[100%] items-center justify-center">
            <img src={img} alt="ECC" className="h-[90%]" />
        </div>
    );
}