import {useEffect, useState} from "react";
import List from "../components/List.jsx";
import Navbar from "../components/NavBar.jsx";

// TODO: make current change when the user clicks on a tab
const tabs = [
    {name: 1, current: true},
    {name: 2, current: false},
    {name: 3, current: false},
    {name: 4, current: false},
    {name: 5, current: false},
    {name: 6, current: false},
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


export default function HSKListsPage() {
    const [data, setData] = useState([])
    const [activeTab, setActiveTab] = useState(1);

    useEffect(() => {
        fetch(`http://localhost:8000/level/${activeTab}/words`)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setData(data)
            })
            .catch(err => console.log(err));
    }, [activeTab]);


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
                <Navbar currentTab={"HSK Lists"}/>

                <div className="py-10">
                    <header>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">HSK Lists</h1>
                        </div>
                    </header>
                    <main>
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            {/*section heading start*/}
                            <div className="border-b border-gray-200">
                                <div className="sm:flex sm:items-baseline justify-between">
                                    <div className="sm:flex sm:items-baseline">
                                        <h3 className="text-base font-semibold leading-6 text-gray-900">Level</h3>
                                        <div className="mt-4 sm:ml-10 sm:mt-0">
                                            <nav className="-mb-px flex space-x-8">
                                                {tabs.map((tab) => (
                                                    <a
                                                        key={tab.name}
                                                        href={"javascript:;"}
                                                        onClick={() => setActiveTab(tab.name)}
                                                        aria-current={tab.name === activeTab ? 'page' : undefined}
                                                        className={classNames(
                                                            tab.name === activeTab
                                                                ? 'border-indigo-500 text-indigo-600'
                                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                            'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
                                                        )}
                                                    >
                                                        {tab.name}
                                                    </a>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                    <span
                                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 ml-auto">
        {data.length} Words
      </span>
                                </div>
                            </div>
                            <div>
                                <ul className="pt-3">
                                    <List words={data}/>
                                </ul>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
