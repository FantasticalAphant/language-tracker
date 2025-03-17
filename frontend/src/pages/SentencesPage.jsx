import {Combobox, ComboboxInput} from '@headlessui/react'
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";
import Layout from "../components/Layout.jsx";
import {Link} from "react-router-dom";
import {API_URL} from "../../utils/api.js";
import {useNavigate} from "react-router";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export default function SentencesPage() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const navigateRandomSentence = () => {
        const sentenceId = getRandomInt(1, 73513)
        navigate(`/sentences/${sentenceId}`)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    query
                        ? `${API_URL}/sentences?keyword=${query}`
                        : `${API_URL}/sentences`
                );
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [query]);

    const name = "Sentences";

    return (
        <>
            <Layout tabName={name} headerName={name}>
                <Combobox>
                    <div className="relative">
                        <MagnifyingGlassIcon
                            className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                        <ComboboxInput
                            autoFocus
                            className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                            placeholder="Search..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </Combobox>

                <button
                    type="buttton"
                    className="my-3 bg-emerald-100 p-1 rounded-md shadow font-semibold hover:bg-emerald-200"
                    onClick={navigateRandomSentence}
                >
                    Random Sentence
                </button>

                <div>
                    <ul>
                        {Array.isArray(data) && data.map((item, index) => (
                            <li key={index}>
                                <Link to={`/sentences/${item.id}`}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </Layout>
        </>
    )
}
