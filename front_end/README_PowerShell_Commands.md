# PowerShell Commands for Development Server

## Issue

PowerShell doesn't recognize `&&` as a valid statement separator like bash/cmd does.

## Solutions

### Option 1: Use semicolon (`;`) instead of `&&`

```powershell
cd front_end; python -m http.server 3000
```

### Option 2: Use separate commands

```powershell
cd front_end
python -m http.server 3000
```

### Option 3: Use `&` for sequential execution

```powershell
cd front_end & python -m http.server 3000
```

### Option 4: Use PowerShell's conditional execution

```powershell
cd front_end && python -m http.server 3000  # This won't work
```

Instead use:

```powershell
if (cd front_end) { python -m http.server 3000 }
```

## Recommended Approach

For development, use Option 2 (separate commands) as it's the most reliable:

```powershell
cd front_end
python -m http.server 3000
```

This will start the development server on `http://localhost:3000`

## Alternative: Create a batch file

Create `start_server.bat`:

```batch
cd front_end
python -m http.server 3000
pause
```

Then just run:

```powershell
.\start_server.bat
```
