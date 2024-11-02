import Layout from "../components/Layout.jsx";

export default function HomePage() {
    const name = "Dashboard";

    return (
        <>
            <Layout tabName={name} headerName={name}>
                Content here
            </Layout>
        </>
    )
}
