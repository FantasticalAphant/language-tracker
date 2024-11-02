import {Combobox, ComboboxInput} from '@headlessui/react'
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";
import Navbar from "../components/NavBar.jsx";

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
                <Navbar currentTab={"Sentences"}/>

                <div className="py-10">
                    <header>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Sentences
                                ({data.length})</h1>
                        </div>
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
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>
                        </Combobox>
                    </header>
                    <main>
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            <ul>
                                {Array.isArray(data) && data.map((item, index) => (
                                    <li key={index}>{item.text}</li>
                                ))}
                            </ul>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
