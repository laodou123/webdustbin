import { MenuFoldOutlined } from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { Gauge, Settings, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  {
    key: '/dashboard',
    icon: <Gauge />,
    label: <NavLink to='/dashboard'>Dashboard</NavLink>
  },
  {
    key: '/dustbin',
    icon: <Trash />,
    label: <NavLink to='/dustbin'>Dustbin</NavLink>
  },
  {
    key: '/setting',
    icon: <Settings />,
    label: <NavLink to='/setting'>Setting</NavLink>
  }
];
const { Sider } = Layout;
const SiderBar = ({collapsed, setCollapsed, isPc}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    const targetMenu = menuItems.find((item) => location.pathname.startsWith(item.key));
    setSelectedKeys([targetMenu?.key || '/dashboard']);
  }, [location.pathname]);

  return (
    <Sider
      className='flex flex-col md:relative fixed top-0 left-0 h-full z-20'
      collapsible
      trigger={null}
      collapsed={collapsed}
      collapsedWidth={isPc ? 80 : 0}
    >
      {!isPc && !collapsed && (
        <div className='fixed top-0 left-0 h-full w-full bg-black/10' onClick={() => setCollapsed(true)} />
      )}
      <div className='flex items-center justify-center h-16 px-3 mb-6'>
        <Button
          type='text'
          // icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className={`!bg-gray-200 flex-1 p-1.5 rounded-md flex items-center ${collapsed ? '!justify-center' : '!justify-between'} text-lg font-bold cursor-pointer`}
        >
          SRB
          {collapsed ? '' : <MenuFoldOutlined />}
        </Button>
      </div>
      <Menu
        mode='inline'
        items={menuItems}
        className='flex-1'
        theme='dark'
        selectedKeys={selectedKeys}
      />
    </Sider>
  );
}

export default SiderBar;
