import {useEffect, useState} from "react";
import Layout from "../components/Layout.jsx";
import {useParams} from "react-router";

export default function SentencePage() {
    const {sentenceId} = useParams();
    const [sentence, setSentence] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            console.log(sentenceId)
            const response = await fetch(`http://localhost:8000/sentence/${sentenceId}`);
            const data = await response.json();
            setSentence(data);
            console.log(data)
        }
        fetchData();
    }, [sentenceId])

    return (
        <div>
            <Layout>
                <p className="text-3xl">{sentence.text}</p>
            </Layout>
        </div>
    )
}