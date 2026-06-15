const fs = require('fs');
let src = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Insert 'export const dynamic' after 'use client' line
src = src.replace(
  "'use client'\r\n",
  "'use client'\r\nexport const dynamic = 'force-dynamic'\r\n"
);

// 2. Rename import
src = src.replace(
  "import dynamic from 'next/dynamic'",
  "import nextDynamic from 'next/dynamic'"
);

// 3. Replace all 'const X = dynamic(' with nextDynamic
src = src.replace(/const (\w+) = dynamic\(/g, 'const $1 = nextDynamic(');

// 4. Add showPerfMonitor state after deviceInfo line
src = src.replace(
  'const deviceInfo: DeviceInfo = useDeviceDetection()\r\n',
  'const deviceInfo: DeviceInfo = useDeviceDetection()\r\n  const [showPerfMonitor, setShowPerfMonitor] = useState(false)\r\n'
);

// 5. Add defer effect after useOfflineStorage()
src = src.replace(
  'useOfflineStorage()\r\n',
  'useOfflineStorage()\r\n\r\n  // Defer PerformanceMonitor until after page is interactive (reduces TBT)\r\n  useEffect(() => {\r\n    const t = setTimeout(() => setShowPerfMonitor(true), 4000)\r\n    return () => clearTimeout(t)\r\n  }, [])\r\n'
);

// 6. Wrap PerformanceMonitor usage
src = src.replace(
  '<PerformanceMonitor isDarkMode={isDarkMode} deviceInfo={deviceInfo} />',
  '{showPerfMonitor && <PerformanceMonitor isDarkMode={isDarkMode} deviceInfo={deviceInfo} />}'
);

fs.writeFileSync('app/page.tsx', src, 'utf8');

const checks = [
  ["export const dynamic = 'force-dynamic'", 'force-dynamic export'],
  ["import nextDynamic from 'next/dynamic'", 'nextDynamic import'],
  ['showPerfMonitor', 'showPerfMonitor state'],
  ['Defer PerformanceMonitor', 'defer effect'],
  ['{showPerfMonitor &&', 'conditional render'],
];
checks.forEach(([needle, label]) => {
  console.log(src.includes(needle) ? '[OK]  ' + label : '[FAIL] ' + label);
});
console.log('nextDynamic call count:', (src.match(/nextDynamic\(/g)||[]).length);
console.log('old dynamic( remaining:', (src.match(/= dynamic\(/g)||[]).length);
