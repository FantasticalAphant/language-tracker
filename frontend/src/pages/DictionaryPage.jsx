import {Combobox, ComboboxInput} from '@headlessui/react'
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline'
import {useEffect, useState} from "react";
import List from "../components/List.jsx";
import Navbar from "../components/NavBar.jsx";

export default function DictionaryPage() {
    const [data, setData] = useState([])
    const [query, setQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    query
                        ? `http://localhost:8000/dictionary?keyword=${query}`
                        : "http://localhost:8000/dictionary"
                );
                const data = await response.json();
                console.log(data);
                console.log(query);
                setData(data);
            } catch (err) {
                console.log(err);
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
                <Navbar currentTab={"Dictionary"}/>

                <div className="py-10">
                    <header>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dictionary</h1>
                        </div>
                    </header>
                    <main>
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
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            <List words={Array.isArray(data) && data || []} isOpen={isModalOpen}
                                  setIsOpen={setIsModalOpen}/>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
