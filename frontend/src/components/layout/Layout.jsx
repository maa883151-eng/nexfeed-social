import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      <Sidebar />
      <main className="flex-1 ml-64 mr-80 min-h-screen border-x border-white/10">
        {children}
      </main>
      <RightPanel />
    </div>
  );
}
