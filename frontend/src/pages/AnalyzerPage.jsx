import {useState} from "react";
import TextArea from "../components/TextArea.jsx";
import Navbar from "../components/NavBar.jsx";

export default function AnalyzerPage() {
    const [data, setData] = useState([])
    const [text, setText] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/analyzer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({text: text}),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            setData(data)
            setText("");
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
            <div className="min-h-full">
                <Navbar currentTab={"Analyzer"}/>

                <div className="py-10">
                    <header>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Text
                                Analyzer</h1>
                        </div>
                    </header>
                    <main>
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            <ul className="list-disc">
                                <TextArea onTextSubmit={handleSubmit} text={text} setText={setText}
                                          action={"analyze"}/>
                            </ul>
                        </div>
                    </main>
                    {data && JSON.stringify(data.text)}
                </div>
            </div>
        </>
    )
}
