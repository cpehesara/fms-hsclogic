import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className="flex min-h-screen bg-brand-bg">
            <Sidebar />
            <div className='flex-1 ml-56 flex flex-col min-h-screen'>
                <Topbar />
                <main className="flex-1 p-5 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;