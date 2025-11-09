# Usage: Edit $repoUrl then run this script from the repo root.
param(
  [string]$RepoUrl
)

if (-not $RepoUrl) {
  Write-Error "Please provide -RepoUrl https://github.com/youruser/yourrepo.git"
  exit 1
}

# Create a split branch containing only backend/
git subtree split --prefix backend -b backend-split

# Add remote and push the split branch as main
git remote add backend-origin $RepoUrl 2>$null
git push backend-origin backend-split:main

Write-Host "Pushed backend folder to $RepoUrl as branch 'main' via split branch 'backend-split'."