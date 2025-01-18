import {Combobox, ComboboxInput} from '@headlessui/react'
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";
import List from "../components/List.jsx";
import Layout from "../components/Layout.jsx";
import {API_URL} from "../../utils/api.js";

export default function DictionaryPage() {
    const [data, setData] = useState([])
    const [query, setQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    query
                        ? `${API_URL}/dictionary?keyword=${query}`
                        : `${API_URL}/dictionary`
                );
                const data = await response.json();
                setData(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [query]);

    const name = "Dictionary";

    return (
        <>
            <Layout headerName={name} tabName={name}>
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
                <div className="pt-3">
                    <List words={Array.isArray(data) && data || []} isOpen={isModalOpen}
                          setIsOpen={setIsModalOpen}/>
                </div>
            </Layout>
        </>
    )
}
