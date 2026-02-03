
async function runTest() {
    const baseUrl = 'http://localhost:5000/api';

    console.log('--- Starting Verification ---');

    try {
        
        console.log('1. Registering Admin...');
        const adminEmail = `admin_${Date.now()}@verify.com`; 
        let res = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Admin', email: adminEmail, password: 'pass', role: 'admin' })
        });

        let adminData = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(adminData));
        if (adminData.token) console.log('   Success: Admin Registered');

        const adminToken = adminData.token;

       
        console.log('2. Creating Event...');
        res = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({ title: 'Verify Event', description: 'Testing', date: new Date(), venue: 'Test Lab' })
        });
        let eventData = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(eventData));
        if (eventData._id) console.log('   Success: Event Created');

        const eventId = eventData._id;

        
        console.log('3. Registering Student...');
        const studentEmail = `student_${Date.now()}@verify.com`;
        res = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Student', email: studentEmail, password: 'pass', role: 'student' })
        });
        let studentData = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(studentData));
        if (studentData.token) console.log('   Success: Student Registered');

        const studentToken = studentData.token;

       
        console.log('4. Registering for Event...');
        res = await fetch(`${baseUrl}/events/${eventId}/register`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        let regData = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(regData));
        console.log('   Success: Registered for Event');

        
        console.log('5. Verifying My Events...');
        res = await fetch(`${baseUrl}/events/myevents`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        let myEvents = await res.json();
        if (Array.isArray(myEvents) && myEvents.length > 0) {
            console.log('   Success: Event found in My Events');
        } else {
            console.log('   Failed:', myEvents);
        }

    } catch (e) {
        console.error('ERROR:', e);
    }
}

runTest();
