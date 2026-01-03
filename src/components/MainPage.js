import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";
import truckImage from '../images/truck1.jpg';
import '../App.css';
import { Headphones, ClipboardList, Share2, Hand, Lock, FileText, FileSpreadsheet, Users, BarChart3, RefreshCw, CheckCircle, ChevronUp } from "lucide-react";
import axios from "axios";
import Alert from "./Alert";

function MainPage() {
    const [formData, setFormData] = useState({
        contact_name: "",
        contact_email: "",
        contact_msg: "",
    });

    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();


    // New state for scroll-to-top button visibility
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("contact_name", formData.contact_name);
        fd.append("contact_email", formData.contact_email);
        fd.append("contact_msg", formData.contact_msg);

        try {
            const res = await axios.post(
                "http://localhost/my_app/Backend/api/contact.php",
                fd
            );
            setAlertType("success");
            setAlertMessage(res.data.message);
            setShowAlert(true);

            setFormData({ contact_name: "", contact_email: "", contact_msg: "" });
        } catch (error) {
            setAlertType("error");
            setAlertMessage("Something went wrong!");
            setShowAlert(true);
        }

        setTimeout(() => setShowAlert(false), 3000);
    };

    // Feature icons and titles
    const features = [
        { icon: <Headphones size={32} />, title: "24x7 Tech Support" },
        { icon: <ClipboardList size={32} />, title: "Affordable Subscription Plans" },
        { icon: <Share2 size={32} />, title: "Direct Share" },
        { icon: <Hand size={32} />, title: "Easy To Use" },
        { icon: <Lock size={32} />, title: "High End Data Security" },
        { icon: <FileText size={32} />, title: "Invoice Generator" },
        { icon: <FileSpreadsheet size={32} />, title: "Load Invoice Feature" },
        { icon: <FileText size={32} />, title: "Lorry Receipt Bilty Maker" },
        { icon: <Users size={32} />, title: "Multi Account Login" },
        { icon: <BarChart3 size={32} />, title: "Multiple Data Reports" },
        { icon: <RefreshCw size={32} />, title: "Realtime Data Sync" },
        { icon: <CheckCircle size={32} />, title: "Receipt Acknowledgement" },
    ];

    // Refs for sections
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const contactRef = useRef(null);
    const feRef = useRef(null);


    // Scroll to respective section on route change
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;

        const id = location.hash.replace("#", "");
        const el = document.getElementById(id);

        if (el) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth" });
            }, 50);
        }
    }, [location.hash]);

    // Scroll event listener to toggle scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        navigate("/", { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="font-sans bg-offwhite">

            {/* Insert Header if needed */}
            {/* <Header /> */}

            {/* Home Section */}
            <div id="home" ref={homeRef} className="bg-[#fffef9] py-12">

                <div className="container mx-auto px-6 lg:flex lg:items-center lg:gap-12 ">
                    {/* Text Section */}
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Smart Logistics Software to Streamline Your Operations
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Manage every step of your supply chain from one powerful platform.
                            From shipment tracking and route optimization to inventory management and customer updates —
                            our software helps you save time, reduce costs, and deliver faster.
                        </p>

                        {/* Buttons */}
                        <div className="mt-8 flex gap-4">
                            <a
                                href="/signup"
                                className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 transition"
                            >
                                Get Started
                            </a>
                            <a
                                href="/about"
                                className="px-6 py-3 border border-green-700 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition"
                            >
                                Learn More →
                            </a>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
                        <img
                            src={truckImage}
                            alt="Truck"
                            className="w-90 h-80 object-cover rounded-xl shadow-lg transition-transform duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* About Section */}
            <section
                id="about"
                ref={aboutRef}
                className="bg-[#fffef9] mt-22 py-12 px-6 my-20"
            >

                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                        About <span className="text-green-700">Importo</span>
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        Importo is an <strong className="text-gray-900">Online Transport Billy/LR, Loading Advice, Invoice Maker </strong>
                        through which you can create professional and elegant looking Transport Billy/LR, Loading Advice, and Invoices,
                        and share them with anyone right from your phone or desktop.
                    </p>
                    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed">
                            Manage your blity book effortlessly. Quickly find the right blity using our smart search.
                            Share receiving signature links to get instant confirmation of delivery from the consignee
                            or receiving party, and much more—all in just a few seconds.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" ref={feRef} className="bg-[#fffef9] py-20 px-6">

                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-14">
                        The Features of <span className="text-red-400">Importo</span>
                    </h2>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-start text-left transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400 text-white font-semibold text-sm mb-4">
                                📄 LORRY RECEIPT / BILTY MAKER
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                                Simply create professional and elegant looking transport Bilty, LR within a minute and share with anyone right from your phone or desktop.
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-start text-left transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-400 text-white font-semibold text-sm mb-4">
                                🧾 INVOICE GENERATOR
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                                Create your Parchi/Load Advices online and send it to the truck loading party within a second.
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-start text-left transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold text-sm mb-4">
                                🧾 INVOICE
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                                Make attractive, professional invoices in a single click with the invoice generator from Roadwe App.
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-start text-left transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold text-sm mb-4">
                                📊 LEDGER
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                                Ledger feature helps you to make an accounting ledger or journal to manage your business transactions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* New Features */}
                <section className="bg-[#fffef9] py-20 px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-14">
                            New <span className="text-green-700">Features</span>
                        </h2>

                        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <div className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-gray-300 mb-4 text-gray-700">
                                        {feature.icon}
                                    </div>
                                    <p className="text-gray-800 font-semibold">{feature.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </section>

            {/* Contact Section */}
            <div
                id="contact"
                ref={contactRef}
                className="bg-[#fffef9] min-h-screen flex flex-col items-center justify-center px-4 py-10"
            >

                <h2 className="text-4xl font-extrabold text-gray-900 mb-7">
                    Contact <span className="text-red-400">Us</span>
                </h2>
                <p className="text-center text-gray-600 mb-8 text-sm md:text-base">
                    Have questions? We’d love to hear from you. Fill out the form below and we’ll get in touch.
                </p>
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-md p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="contact_name"
                                    id="contact_name"
                                    value={formData.contact_name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full rounded-lg p-2.5 bg-[#fffef9] shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="contact_email"
                                    id="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full rounded-lg p-2.5 bg-[#fffef9] shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    rows="3"
                                    name="contact_msg"
                                    id="contact_msg"
                                    value={formData.contact_msg}
                                    onChange={handleChange}
                                    placeholder="Write your message here..."
                                    className="w-full rounded-lg p-2.5 bg-[#fffef9] shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-700 text-white py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-green-800 transition"
                            >
                                Send Message
                            </button>
                        </form>

                        {/* Contact Info */}
                        <div className="flex flex-col justify-center space-y-6 text-center md:text-left text-sm">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">📍 Address</h3>
                                <p className="text-gray-600">123 Transport Street, Ahmedabad, India</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">📞 Phone</h3>
                                <p className="text-gray-600">+91 9558798089</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">✉️ Email</h3>
                                <p className="text-gray-600">support@importo.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="w-full bg-[#1a1a1a] mt-10">
                <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-gray-300">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">About Importo</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Importo is your trusted logistics partner. We provide efficient, secure,
                            and reliable transportation solutions across India.
                            Our mission is to make logistics smooth and stress-free.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/" className="hover:text-green-400 transition">Home</a>
                            </li>
                            <li>
                                <a href="/#features" className="hover:text-green-400 transition">Features</a>
                            </li>
                            <li>
                                <a href="/#about" className="hover:text-green-400 transition">About Us</a>
                            </li>
                            <li>
                                <a href="/#contact" className="hover:text-green-400 transition">Contact</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <p className="text-gray-400 text-sm">📍 123 Transport Street, City, India</p>
                        <p className="text-gray-400 text-sm">📞 +91 98765 43210</p>
                        <p className="text-gray-400 text-sm">✉️ support@importo.com</p>

                        
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    aria-label="Website"
                                    className="text-gray-400 hover:text-green-400 transition bg-transparent p-0"
                                >
                                    🌐
                                </button>

                                <button
                                    type="button"
                                    aria-label="Facebook"
                                    className="text-gray-400 hover:text-green-400 transition bg-transparent p-0"
                                >
                                    📘
                                </button>

                                <button
                                    type="button"
                                    aria-label="Twitter"
                                    className="text-gray-400 hover:text-green-400 transition bg-transparent p-0"
                                >
                                    🐦
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-10 py-6 text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} <span className="font-semibold text-green-400">Importo</span>.
                        All rights reserved. | Designed with ❤️ for logistics excellence.
                    </div>
            </footer>

            {/* Scroll-to-Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 bg-green-700 hover:bg-green-800 text-white p-3 rounded-full shadow-lg transition"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}

            <Alert
                show={showAlert}
                type={alertType}
                message={alertMessage}
            />
        </div>
    );
}

export default MainPage;
