'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, Users, KeyRound, FileText, BookOpen, UserCheck,
  BarChart3, ChevronDown, ChevronRight, Eye
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  {
    label: 'Dashboard',
    href: '/',
    icon: BarChart3,
    children: [],
  },
  {
    label: 'OPSEC',
    href: '/opsec',
    icon: Eye,
    children: [
      { label: 'Overview', href: '/opsec' },
      { label: 'CPI Registry', href: '/opsec/cpi' },
      { label: 'Threat Assessments', href: '/opsec/threats' },
      { label: 'Indicators', href: '/opsec/indicators' },
      { label: 'Countermeasures', href: '/opsec/countermeasures' },
    ],
  },
  {
    label: 'Personnel Security',
    href: '/personnel',
    icon: Users,
    children: [
      { label: 'Clearance Roster', href: '/personnel' },
    ],
  },
  {
    label: 'Access Control',
    href: '/access-control',
    icon: KeyRound,
    children: [
      { label: 'Badge Management', href: '/access-control' },
    ],
  },
  {
    label: 'Document Control',
    href: '/document-control',
    icon: FileText,
    children: [
      { label: 'Classified Inventory', href: '/document-control' },
    ],
  },
  {
    label: 'Training & Compliance',
    href: '/training',
    icon: BookOpen,
    children: [
      { label: 'CDSE Tracker', href: '/training' },
    ],
  },
  {
    label: 'Visitor Management',
    href: '/visitor',
    icon: UserCheck,
    children: [
      { label: 'Visit Requests', href: '/visitor' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string[]>(['/opsec', pathname.split('/').slice(0, 2).join('/')]);

  const toggle = (href: string) =>
    setOpen((prev) => prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]);

  const isActive = (href: string) => pathname === href;
  const isParentActive = (href: string) => pathname.startsWith(href) && href !== '/';

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col overflow-y-auto z-20"
      style={{ background: '#0d1526', borderRight: '1px solid #1e293b' }}>
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-600">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 leading-tight">SecureOps</div>
          <div className="text-xs text-slate-500 leading-tight">Security Management</div>
        </div>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children.length > 1;
          const expanded = open.includes(item.href);
          const parentActive = isParentActive(item.href) || isActive(item.href);

          return (
            <div key={item.href}>
              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm group transition-colors ${
                  parentActive && !hasChildren
                    ? 'bg-blue-600/20 text-blue-300'
                    : parentActive
                    ? 'text-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                onClick={() => hasChildren ? toggle(item.href) : undefined}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                  onClick={(e) => hasChildren && e.preventDefault()}
                >
                  <Icon size={15} className={parentActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="truncate font-medium">{item.label}</span>
                </Link>
                {hasChildren && (
                  <span className="ml-1 text-slate-600">
                    {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </span>
                )}
              </div>

              {hasChildren && expanded && (
                <div className="mt-0.5 ml-5 border-l border-slate-800 pl-3 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-2 py-1 rounded text-xs transition-colors ${
                        isActive(child.href)
                          ? 'text-blue-300 bg-blue-600/10'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="text-xs text-slate-600">CLASSIFICATION GUIDE</div>
        <div className="mt-1.5 space-y-0.5">
          {[
            { label: 'TS/SCI', color: 'bg-orange-500' },
            { label: 'TOP SECRET', color: 'bg-red-500' },
            { label: 'SECRET', color: 'bg-yellow-500' },
            { label: 'CONFIDENTIAL', color: 'bg-blue-500' },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${c.color}`} />
              <span className="text-xs text-slate-500">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
