import {useState} from "react";
import TextArea from "../components/TextArea.jsx";
import Layout from "../components/Layout.jsx";

export default function TranslatorPage() {
    const [data, setData] = useState([])
    const [text, setText] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/translator', {
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
            <Layout headerName={"Translator (DeepL)"} tabName={"Translator"}>
                <ul className="list-disc">
                    <TextArea onTextSubmit={handleSubmit} text={text} setText={setText}
                              action={"translate"}/>
                </ul>
            </Layout>
            {data && data.text}
        </>
    )
}
