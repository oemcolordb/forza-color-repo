import os
import glob

search_dirs = [
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\components",
    r"C:\Users\xxx\Documents\GitHub\forza-color-repo\app",
]

client_hooks = ["useState", "useEffect", "useRef", "useCallback", "useMemo", "useReducer",
                "useContext", "useId", "useLayoutEffect", "useImperativeHandle",
                "useRouter", "usePathname", "useSearchParams"]

for search_dir in search_dirs:
    files = glob.glob(os.path.join(search_dir, "**", "*.tsx"), recursive=True)
    files += glob.glob(os.path.join(search_dir, "**", "*.jsx"), recursive=True)
    files += glob.glob(os.path.join(search_dir, "**", "*.js"), recursive=True)
    
    for file in files:
        # Skip node_modules, .next, api routes
        if ".next" in file or "node_modules" in file:
            continue
        
        try:
            with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except:
            continue
        
        # If already has 'use client', skip
        if "'use client'" in content or '"use client"' in content:
            continue
        
        # Check if uses any client hooks
        uses_hook = any(f"= {hook}(" in content or f" {hook}(" in content for hook in client_hooks)
        
        # Also check for JSX with event handlers that require client
        has_onclick = "onClick" in content or "onChange" in content or "onSubmit" in content
        
        if uses_hook or has_onclick:
            print(f"MISSING 'use client': {file}")
