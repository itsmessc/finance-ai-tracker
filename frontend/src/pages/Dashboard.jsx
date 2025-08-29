import { useSelector } from 'react-redux'
import Layout from '../components/Layout'

export default function Dashboard() {
    const user = useSelector((s) => s.auth.user)
    return (
        <Layout>
            <h2 className="text-lg font-medium">Dashboard</h2>
            <p className="mt-4">Welcome, {user?.name}</p>
        </Layout>
    )
}
