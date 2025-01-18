import Layout from "../components/Layout.jsx";
import {useNavigate} from "react-router";
import {useAuth} from "../contexts/UseAuth.jsx";
import {Navigate} from "react-router-dom";
import {API_URL} from "../../utils/api.js";

export default function SignUpPage() {
    const {login, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/" replace/>
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // TODO: move password check to before the user clicks submit
        // maybe through keypress event?
        if (e.target.password.value !== e.target["confirm-password"].value) {
            console.log("Passwords do not match")
            throw new Error("Not matching")
        }

        const formData = new URLSearchParams();
        formData.append('username', e.target.username.value);
        formData.append('password', e.target.password.value);

        try {
            let response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password"),
                })
            });

            // TODO: update the signup page if authentication fails
            if (!response.ok) {
                throw new Error("Signup failed")
            }

            // log the user in
            response = await fetch(`${API_URL}/token`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            // TODO: update the login page if authentication fails
            if (!response.ok) {
                throw new Error("Login failed")
            }

            const {access_token} = await response.json();
            login(access_token);

            navigate("/word_lists")
        } catch (error) {
            // TODO: make the errors more explicit
            console.error("Failed: ", error)
        }
    }

    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
            <Layout>
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            alt="Your Company"
                            src="/cap.png"
                            className="mx-auto h-10 w-auto"
                        />
                        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                            Register for an account
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                                    Email address:
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="block w-full rounded-md border-0 pl-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        Password:
                                    </label>
                                </div>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        className="block w-full rounded-md border-0 pl-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="confirm-password"
                                           className="block text-sm/6 font-medium text-gray-900">
                                        Confirm password:
                                    </label>
                                </div>
                                <div className="mt-1">
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        className="block w-full rounded-md border-0 pl-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    )
}
