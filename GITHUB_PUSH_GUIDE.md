# GitHub Push Karne Ka Guide (Hinglish)

## Step 1: Git Install Check Karo

Pehle check karo ki Git installed hai ya nahi:

```bash
git --version
```

Agar nahi hai, to download karo: https://git-scm.com/downloads

## Step 1.5: Git Config Setup (Pehli Baar Zaroori!)

**Pehli baar Git use karne se pehle yeh commands run karo:**

```powershell
# Apna name set karo (GitHub username ya real name)
git config --global user.name "Your Name"

# Apna email set karo (GitHub account ka email)
git config --global user.email "your.email@example.com"
```

**Example:**
```powershell
git config --global user.name "Pranav"
git config --global user.email "pranav@gmail.com"
```

**Note:** 
- `--global` ka matlab hai yeh settings har project ke liye apply hongi
- Email wahi use karo jo GitHub account mein hai
- Check karne ke liye: `git config --list`

## Step 2: Git Repository Initialize Karo

Apne project folder mein jao aur git initialize karo:

```bash
cd "D:\Whatsapp-automation tool"
git init
```

## Step 3: .gitignore File Banao

Sensitive files (jaise credentials) ko GitHub par push nahi karna chahiye. `.gitignore` file banao:

**Important:** Apne `main.py` mein credentials hain - unhe remove karna padega ya environment variables use karni padegi!

## Step 4: Files Add Karo

```bash
git add .
```

Ya specific files add karo:
```bash
git add main.py requirements.txt
```

## Step 5: First Commit Karo

```bash
git commit -m "Initial commit: WhatsApp automation tool"
```

## Step 6: GitHub Par Repository Banao

1. GitHub.com par jao aur login karo
2. Top right corner par **"+"** button click karo
3. **"New repository"** select karo
4. Repository name dalo: `Whatsapp-automation-tool` (ya kuch bhi)
5. **Public** ya **Private** select karo
6. **"Create repository"** click karo
7. **DON'T** initialize with README (kyunki aap already code hai)

## Step 7: Remote Add Karo

GitHub ne jo commands diye honge, unhe run karo. Example:

```bash
git remote add origin https://github.com/YOUR_USERNAME/Whatsapp-automation-tool.git
```

(YOUR_USERNAME ki jagah apna GitHub username dalo)

## Step 8: Branch Name Set Karo (Optional but Recommended)

```bash
git branch -M main
```

## Step 9: Push Karo

```bash
git push -u origin main
```

Agar pehli baar ho to GitHub credentials mangenge (username aur password/token).

## Important Security Note! ⚠️

**Apne `main.py` mein credentials hardcoded hain:**
- ACCOUNT_SID
- ACCOUNT_TOKEN

**Ye GitHub par push mat karo!** Koi bhi dekh sakta hai aur use kar sakta hai.

### Solution: Environment Variables Use Karo

1. `.env` file banao (GitHub par push nahi hogi)
2. Credentials ko `.env` mein rakho
3. `python-dotenv` package install karo
4. Code mein environment variables se read karo

## Complete Commands (Copy-Paste Ready)

**PowerShell Commands (Windows):**

```powershell
# Step 1: Git initialize
git init

# Step 2: Add files
git add .

# Step 3: Commit
git commit -m "Initial commit: WhatsApp automation tool"

# Step 4: Remote add (apna URL dalo - GitHub se milega)
# Example: git remote add origin https://github.com/pranav123/whatsapp-automation.git
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# YOUR_USERNAME = Apna GitHub username (GitHub.com par login karke top right corner mein dikhega)
# REPO_NAME = Jo repository name aapne banaya (Step 6 mein)

# Step 5: Branch set
git branch -M main

# Step 6: Push
git push -u origin main
```

**Note:** `.env` file automatically ignore ho jayegi (`.gitignore` mein hai), isliye credentials safe rahenge!

## Agar Error Aaye

**"Authentication failed" error:**
- GitHub ab password accept nahi karta
- Personal Access Token (PAT) banana padega
- Settings → Developer settings → Personal access tokens → Generate new token

**"Repository not found" error:**
- Remote URL check karo
- GitHub par repository actually bana hai ya nahi verify karo

## Baad Mein Changes Push Karne Ke Liye

```bash
git add .
git commit -m "Description of changes"
git push
```

---

**Note:** Pehle credentials ko secure karo, phir push karo!

