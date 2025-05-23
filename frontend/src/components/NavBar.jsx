import {Disclosure, DisclosureButton, Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react'
import {Bars3Icon, BellIcon, XMarkIcon} from '@heroicons/react/24/outline'
import {Link, Navigate} from "react-router-dom";
import {useAuth} from "../contexts/UseAuth.jsx";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

// eslint-disable-next-line react/prop-types
export default function Navbar({currentTab}) {
    const {isAuthenticated, logout} = useAuth();

    const navigation = [
        {name: 'Dictionary', href: '/dictionary', current: false},
        {name: 'HSK Lists', href: '/hsk_lists', current: false},
        {name: 'Sentences', href: '/sentences', current: false},
        {name: 'Analyzer', href: '/analyzer', current: false},
        {name: 'Translator', href: '/translator', current: false},
        {name: 'Reader', href: '/reader', current: false},
        {name: 'Video Transcripts', href: '/video_transcripts', current: false},
        {name: 'Word Lists', href: '/word_lists', current: false},
    ].map(item => ({
        ...item,
        current: item.name === currentTab
    }))

    const userNavigation = [
        {
            name: 'Your Profile', href: '#', onClick: () => {
                console.log("Go to Profile")
            }
        },
        {
            name: 'Settings', href: '#', onClick: () => {
                console.log("Go to Settings")
            }
        },
        {
            name: 'Sign out', href: '#', onClick: () => {
                logout();
                return <Navigate to="/" replace/>
            }
        },
    ]

    return (
        <Disclosure as="nav" className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {/* Mobile menu button */}
                        <DisclosureButton
                            className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="absolute -inset-0.5"/>
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden"/>
                            <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block"/>
                        </DisclosureButton>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            <Link to="/">
                                <img
                                    alt="Home Page"
                                    src="/cap.png"
                                    className="h-8 w-auto transition-all duration-300 hover:scale-110 hover:brightness-125"
                                />
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={classNames(
                                        item.current ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {isAuthenticated ? <div
                        className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <button
                            type="button"
                            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <span className="absolute -inset-1.5"/>
                            <span className="sr-only">View notifications</span>
                            <BellIcon aria-hidden="true" className="h-6 w-6"/>
                        </button>

                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                            <div>
                                <MenuButton
                                    className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <span className="absolute -inset-1.5"/>
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        alt=""
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        className="h-8 w-8 rounded-full"
                                    />
                                </MenuButton>
                            </div>
                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                            >
                                {userNavigation.map((item) => (
                                    <MenuItem key={item.name}>
                                        <a href={item.href}
                                           onClick={(e) => {
                                               e.preventDefault();
                                               item.onClick();
                                           }}
                                           className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                                            {item.name}
                                        </a>
                                    </MenuItem>
                                ))}
                            </MenuItems>
                        </Menu>
                    </div> : <Link to={"/login"} className="content-center">Log In</Link>}
                </div>
            </div>
        </Disclosure>
    )
}
