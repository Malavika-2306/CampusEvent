# 1. Register a new student
$regUrl = "http://localhost:5000/api/auth/register"
$random = Get-Random
$studentEmail = "student$random@test.com"
$studentBody = @{
    name = "Test Student"
    email = $studentEmail
    password = "password123"
    role = "student"
} | ConvertTo-Json

Write-Host "Registering student: $studentEmail"
$studentReg = Invoke-RestMethod -Uri $regUrl -Method Post -Body $studentBody -ContentType "application/json"
$token = $studentReg.token
Write-Host "Got Token: $token"

# 2. Register an admin (to create event)
$adminEmail = "admin$random@test.com"
$adminBody = @{
    name = "Test Admin"
    email = $adminEmail
    password = "password123"
    role = "admin"
} | ConvertTo-Json

Write-Host "Registering admin: $adminEmail"
$adminReg = Invoke-RestMethod -Uri $regUrl -Method Post -Body $adminBody -ContentType "application/json"
$adminToken = $adminReg.token

# 3. Create Event
$eventUrl = "http://localhost:5000/api/events"
$today = Get-Date -Format "yyyy-MM-ddTHH:mm"
$eventBody = @{
    title = "Debug Event"
    description = "Testing registration"
    date = $today
    venue = "Debug Hall"
} | ConvertTo-Json

Write-Host "Creating Event..."
$event = Invoke-RestMethod -Uri $eventUrl -Method Post -Body $eventBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" }
$eventId = $event._id
Write-Host "Created Event ID: $eventId"

# 4. Register for Event (as Student)
$registerUrl = "http://localhost:5000/api/events/$eventId/register"
$regBody = @{
    name = "Test Student"
    email = $studentEmail
    department = "CS"
    phoneNumber = "1234567890"
} | ConvertTo-Json

Write-Host "Attempting Registration..."
try {
    $result = Invoke-RestMethod -Uri $registerUrl -Method Post -Body $regBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Registration SUCCESS!"
    $result | ConvertTo-Json
} catch {
    Write-Host "Registration FAILED"
    Write-Host $_.Exception.Message
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errorResponse = $streamReader.ReadToEnd()
    Write-Host "Error Details: $errorResponse"
}
