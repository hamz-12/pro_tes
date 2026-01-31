import os

def print_smart_tree(directory, prefix="", blacklist=None):
    """
    Recursively prints a visual tree while skipping cache and build folders.
    """
    if blacklist is None:
        blacklist = {
            '__pycache__', '.pytest_cache', 'node_modules', 
            '.git', '.idea', '.vscode', 'build', 'dist', 
            '.venv', 'venv', 'env', '.DS_Store', '.next'
        }

    try:
        # Filter out blacklisted items
        items = [item for item in os.listdir(directory) if item not in blacklist]
    except PermissionError:
        return

    # Sort: Folders first, then files
    items.sort(key=lambda x: (not os.path.isdir(os.path.join(directory, x)), x.lower()))

    for i, item in enumerate(items):
        path = os.path.join(directory, item)
        is_last = (i == len(items) - 1)
        
        # Branch styling
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{item}")
        
        if os.path.isdir(path):
            # Extend the vertical line if not the last item
            extension = "    " if is_last else "│   "
            print_smart_tree(path, prefix + extension, blacklist)

def display_structure():
    # Detect the current working directory
    root_dir = os.getcwd()
    
    print(f"\n{'#'*60}")
    print(f" PROJECT MAP: {os.path.basename(root_dir).upper()}")
    print(f" Filters: Hiding Cache, node_modules, and Virtual Envs")
    print(f"{'#'*60}\n.")

    # Explicitly target frontend and backend if they exist
    for target in ["backend", "frontend"]:
        target_path = os.path.join(root_dir, target)
        if os.path.exists(target_path):
            print(f"├── {target}/")
            print_smart_tree(target_path, prefix="│   ")
        else:
            print(f"├── {target}/ (Not Found)")

    print(f"\n{'#'*60}")

if __name__ == "__main__":
    display_structure()