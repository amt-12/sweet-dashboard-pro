export const FEATURE_GROUPS = {
  main: [
    'Dashboard',
    'Orders',
    'Customize Order',
    'Products',
    'Gallery',
    'Contacts',
    'Customers',
    'Payments',
    'Delivery',
    'Analytics',
    'Settings',
  ],
  productDetails: [
    'Categories',
    'Flavors',
    'Weights',
    'Types',
    'Occasions',
    'Shapes',
    'Themes',
    'Nutrition',
    'Ingredients',
  ],
  about: ['Origin Story', 'Values', 'Team'],
} as const;

export const MENU_FEATURES = [...FEATURE_GROUPS.main];
export const SUBMENU_FEATURES = [...FEATURE_GROUPS.productDetails, ...FEATURE_GROUPS.about];
export const ALL_FEATURES = [...MENU_FEATURES, ...SUBMENU_FEATURES];

export const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/customize-order': 'Customize Order',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/flavors': 'Flavors',
  '/admin/weights': 'Weights',
  '/admin/types': 'Types',
  '/admin/occasions': 'Occasions',
  '/admin/shapes': 'Shapes',
  '/admin/themes': 'Themes',
  '/admin/nutrition': 'Nutrition',
  '/admin/ingredients': 'Ingredients',
  '/admin/gallery': 'Gallery',
  '/admin/contacts': 'Contacts',
  '/admin/customers': 'Customers',
  '/admin/payments': 'Payments',
  '/admin/delivery': 'Delivery',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
  '/admin/admins': 'Admins',
  '/admin/roles': 'Roles',
  '/admin/about/origin-story': 'Origin Story',
  '/admin/about/values': 'Values',
  '/admin/team': 'Team',
};

export const getPermissionForPath = (path: string) => {
  const direct = ADMIN_ROUTE_PERMISSIONS[path];
  if (direct) return direct;

  const candidate = Object.keys(ADMIN_ROUTE_PERMISSIONS)
    .filter((key) => path === key || path.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];

  return candidate ? ADMIN_ROUTE_PERMISSIONS[candidate] : undefined;
};
