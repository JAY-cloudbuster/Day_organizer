# Ensure we are in the right directory
Set-Location -Path $PSScriptRoot

# Commit 1
git add server/server.js
git commit -m "feat(backend): Add schedules database table and CRUD API endpoints"

# Commit 2
git add src/store/useScheduleStore.js
git commit -m "feat(store): Implement Zustand state management for schedule feature"

# Commit 3
git add src/styles/schedule.css
git commit -m "feat(styles): Add comprehensive styling for GenZ schedule interface"

# Commit 4
git add src/index.css
git commit -m "chore(styles): Import schedule CSS into global stylesheet"

# Commit 5
git add src/components/schedule/ScheduleBlock.jsx
git commit -m "feat(components): Create interactive schedule block with pulse and timer"

# Commit 6
git add src/components/schedule/ScheduleBoard.jsx
git commit -m "feat(components): Implement scalable 24-hour schedule grid board"

# Commit 7
git add src/pages/Schedule.jsx
git commit -m "feat(pages): Build main Schedule view with templates and comparison"

# Commit 8
git add src/pages/Dashboard.jsx
git commit -m "feat(dashboard): Integrate schedule entry point into main dashboard"

# Commit 9
git add src/App.jsx
git commit -m "feat(routing): Add dedicated route for schedule workspace"

# Commit 10
git commit --allow-empty -m "chore(release): Finalize GenZ scheduler upgrade integration"

# Push all 10 commits to remote
Write-Host "Pushing all 10 commits to remote..."
git push origin HEAD

Write-Host "Done! All 10 commits have been created and pushed to the remote repository."
