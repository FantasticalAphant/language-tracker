import {useEffect, useState} from "react";
import List from "../components/List.jsx";
import Layout from "../components/Layout.jsx";
import {API_URL} from "../../utils/api.js";

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
        fetch(`${API_URL}/level/${activeTab}/words`)
            .then(res => res.json())
            .then(data => {
                setData(data)
            })
            .catch(err => console.error(err));
    }, [activeTab]);


    return (
        <>
            <Layout headerName={"HSK Lists"} tabName={"HSK Lists"}>
                <div className="border-b border-gray-200">
                    <div className="sm:flex sm:items-baseline justify-between">
                        <div className="sm:flex sm:items-baseline">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Level</h3>
                            <div className="mt-4 sm:ml-10 sm:mt-0">
                                <nav className="-mb-px flex space-x-8">
                                    {tabs.map((tab) => (
                                        <button
                                            type="button"
                                            key={tab.name}
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
                                        </button>
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
            </Layout>
        </>
    )
}
