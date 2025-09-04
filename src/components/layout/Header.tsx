'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 py-3 shadow-md bg-white z-999">
        <Link href="/" className="text-2xl font-bold text-black">
          MangaHub
        </Link>
        <div className="space-x-2">
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 py-3 shadow-md bg-white z-999">
      <Link href="/" className="text-2xl font-bold text-black">
        MangaHub
      </Link>

      <div className="space-x-2">
        {isAuthenticated ? (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'signout',
                  label: (
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer text-left"
                      onClick={logout}
                    >
                      Sign out
                    </Button>
                  ),
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-sm font-medium text-gray-800  truncate">
                {user?.name || user?.email}
              </span>
              <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: '#bfbfbf' }} />
            </div>
          </Dropdown>
        ) : (
          <>
            <Link href="/register">
              <Button variant="outline">Sign up</Button>
            </Link>
            <Link href="/login">
              <Button variant="primary">Sign in</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
