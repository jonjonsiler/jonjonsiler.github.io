import type { NavLink } from '@/models';
import {
  FiHome,
  FiLayers,
  FiGrid,
  FiBox,
  FiFileText,
  FiUser,
} from 'react-icons/fi';

export const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: FiHome },
  { href: '/landing', label: 'Landing', icon: FiLayers },
  { href: '/generic', label: 'Generic', icon: FiGrid },
  { href: '/elements', label: 'Elements', icon: FiBox },
  { href: '/posts', label: 'Posts', icon: FiFileText },
  { href: '/about', label: 'About', icon: FiUser },
];