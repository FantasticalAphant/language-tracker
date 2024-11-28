import {Combobox, ComboboxInput} from '@headlessui/react'
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";
import Layout from "../components/Layout.jsx";
import {Link} from "react-router-dom";

export default function SentencesPage() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    query
                        ? `http://localhost:8000/sentences?keyword=${query}`
                        : "http://localhost:8000/sentences"
                );
                const result = await response.json();
                console.log(result);
                setData(result);
            } catch (error) {
                console.log("Error fetching data:", error);
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
                <div className="mt-3">
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
