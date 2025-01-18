import {useEffect, useState} from "react";
import Layout from "../components/Layout.jsx";
import {useParams} from "react-router";
import {API_URL} from "../../utils/api.js";

export default function SentencePage() {
    const {sentenceId} = useParams();
    const [sentence, setSentence] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${API_URL}/sentence/${sentenceId}`);
            const data = await response.json();
            setSentence(data);
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