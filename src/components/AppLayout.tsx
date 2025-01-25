import { Badge, Button, Flex, Layout } from 'antd';
import { Search, Bell } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardContext, DashboardProvider } from '@/context/dashboard-store';
import SiderBar from './SiderBar';

const { Content } = Layout;

const AppLayout = () => {
  const {setSearchTerm, noReadCount, setNoReadCount, setNotifyOpen, isPc} = useContext(DashboardContext);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCollapsed(!isPc);
  }, [isPc]);

  const isDashboard = useMemo(() => location.pathname === '/dashboard', [location.pathname]);

  return (
    <Layout>
      <SiderBar collapsed={collapsed} setCollapsed={setCollapsed} isPc={isPc} />
      <Layout>
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/75 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!isPc && (<Button
                  type='text'
                  // icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(false)}
                  className={`!bg-gray-200 flex-1 p-1.5 rounded-md flex items-center justify-center text-lg font-bold cursor-pointer`}
                >
                  SRB
                </Button>)}
                <h1 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text">
                  Smart Dustbins
                </h1>
              </div>
              {isDashboard && (<div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="search"
                    placeholder="Search dustbins..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {/* <Button
                    ghost
                    type='text'
                    className="rounded-full hover:bg-gray-100"
                  >
                    <RefreshCcw className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button> */}
                  <Badge count={noReadCount}>
                    <Button
                      ghost
                      type='text'
                      className="rounded-full hover:bg-gray-100"
                      onClick={() => {
                        setNoReadCount(0);
                        setNotifyOpen(true);
                      }}
                    >
                      <Bell className="h-5 w-5 text-gray-500" />
                    </Button>
                  </Badge>
                  {/* <Button
                    ghost
                    type='text'
                    className="rounded-full hover:bg-gray-100"
                  >
                    <Settings className="h-5 w-5 text-gray-500" />
                  </Button> */}
                </div>
              </div>)}
            </div>
          </div>
        </header>
        <Content
          className='flex overflow-auto'
        >
          <Outlet />
        </Content>
        {/* Footer */}
        <footer
            className={`text-center py-3`}
          >
            <Flex justify='center'>
              <span>
                © {new Date().getFullYear()} Smart Dustbins. All rights reserved.
              </span>
              <div className="mt-2">{/* Example Social Media Links */}</div>
            </Flex>
          </footer>
      </Layout>
    </Layout>
  )
};

export default (props) => (
  <DashboardProvider>
    <AppLayout {...props} />
  </DashboardProvider>
);
