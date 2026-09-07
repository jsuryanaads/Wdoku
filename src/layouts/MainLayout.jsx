import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  );
}
