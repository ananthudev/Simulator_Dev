# Linux Build Optimization Guide

This guide explains how to package the Astra GUI application as minimal-size Linux executables.

## Quick Start

### Method 1: Automated Build Script (Recommended)

```bash
cd front_end
npm run build:minimal
```

### Method 2: Shell Script (Linux/WSL)

```bash
cd front_end
chmod +x build-scripts/build-minimal.sh
npm run build:minimal-sh
```

### Method 3: Manual Build

```bash
cd front_end
npm run clean
npm run build:linux-minimal
```

## Optimization Features

### File Exclusions

The optimized build excludes:

**Development Files:**

- All test directories (`tests/`, `cypress/`, `mock-server/`)
- Test data (`test_data/`, `Outputs/`)
- IDE configurations (`.vscode/`)
- Git files (`.git/`, `.gitignore`)

**Documentation:**

- All `.md` files (README, CHANGELOG, etc.)
- License files
- Documentation guides

**Test Code:**

- `test_*.html` and `test_*.js` files
- Any file containing "test" in the name
- Development helper scripts

**Node Modules Optimization:**

- Test directories in dependencies
- Documentation files in dependencies
- Source maps (`.map` files)
- TypeScript definitions (`.d.ts` files)
- Example and demo code

### Build Configuration Optimizations

**Compression:**

- Maximum compression enabled
- Optimized file selection
- Minimal file patterns

**Output Formats:**

- AppImage (portable)
- tar.gz (compressed archive)
- Both x64 architecture only

### Size Reduction Estimates

| Component           | Original Size | Optimized Size | Reduction  |
| ------------------- | ------------- | -------------- | ---------- |
| Test Files          | ~500MB        | 0MB            | 100%       |
| Documentation       | ~50MB         | 0MB            | 100%       |
| Node Modules        | ~200MB        | ~100MB         | 50%        |
| Development Tools   | ~100MB        | 0MB            | 100%       |
| **Total Estimated** | **~850MB**    | **~200-300MB** | **65-75%** |

## Build Commands Explained

### `npm run build:minimal`

- Runs the Node.js cleanup script
- Removes all unnecessary files
- Optimizes node_modules
- Builds with maximum compression
- Shows final package sizes

### `npm run build:minimal-sh`

- Shell script version for Linux/Unix systems
- More aggressive cleanup
- Better for CI/CD pipelines
- Provides detailed progress feedback

### `npm run build:linux-minimal`

- Direct build with optimization flags
- No cleanup (use after manual cleanup)
- Fastest build time

### `npm run clean`

- Removes previous build artifacts
- Cleans `dist/`, `release/`, `build-output/` directories

## Manual Cleanup (Advanced)

If you want to manually clean before building:

```bash
# Remove test directories
rm -rf tests/ cypress/ mock-server/ test_data/ Outputs/ .vscode/

# Remove documentation
find . -name "*.md" -delete
find . -name "README*" -delete

# Remove test files
find . -name "test_*.html" -delete
find . -name "test_*.js" -delete
find . -name "*test*.js" -delete

# Clean node_modules
find node_modules -type d -name "test*" -exec rm -rf {} +
find node_modules -name "*.md" -delete
find node_modules -name "*.map" -delete

# Build
npm run build:linux
```

## Output Files

After building, check the `release/` directory:

```bash
ls -lh release/
```

Expected outputs:

- `Astra GUI-1.0.0.AppImage` (portable executable)
- `astra-gui-1.0.0.tar.gz` (compressed archive)

## Installation on Target Systems

### AppImage (Recommended)

```bash
# Make executable
chmod +x "Astra GUI-1.0.0.AppImage"

# Run directly
./"Astra GUI-1.0.0.AppImage"

# Or install to system (optional)
./Astra\ GUI-1.0.0.AppImage --appimage-extract
sudo mv squashfs-root /opt/astra-gui
sudo ln -s /opt/astra-gui/AppRun /usr/local/bin/astra-gui
```

### tar.gz Archive

```bash
# Extract
tar -xzf astra-gui-1.0.0.tar.gz

# Run
cd astra-gui-1.0.0/
./astra-gui
```

## Troubleshooting

### Build Fails

1. Ensure Node.js 16+ is installed
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Try manual cleanup first

### Large File Size

1. Check if test files were properly removed
2. Verify node_modules optimization
3. Use the automated build script

### Missing Dependencies

```bash
# Install production dependencies only
npm install --production

# Or reinstall everything
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **Use SSD storage** for faster builds
2. **Close other applications** during build
3. **Use the automated scripts** for best results
4. **Build on the target platform** when possible

## Final Size Expectations

- **Minimal build**: 150-250MB
- **Standard build**: 400-600MB
- **Development build**: 800MB+

The actual size depends on your system and the specific dependencies included.
