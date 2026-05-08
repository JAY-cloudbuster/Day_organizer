const http = require('http');

const API_URL = 'http://localhost:5000';
let token = '';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(API_URL + path, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    // 1. Register or Login
    console.log("Registering test user...");
    let authRes = await request('POST', '/api/auth/register', { email: `test${Date.now()}@test.com`, password: 'password123' });
    if (authRes.status !== 200 && authRes.status !== 409) {
      console.log("Register failed", authRes);
      return;
    }
    
    authRes = await request('POST', '/api/auth/login', { email: authRes.body.error ? 'test@test.com' : authRes.body.user?.email, password: 'password123' });
    // Wait, let's just create a fixed user
    authRes = await request('POST', '/api/auth/register', { email: 'test@test.com', password: 'password123' });
    authRes = await request('POST', '/api/auth/login', { email: 'test@test.com', password: 'password123' });
    
    token = authRes.body.token;
    console.log("Got token:", token ? "YES" : "NO");

    // 2. List Projects
    let listRes = await request('GET', '/api/projects');
    console.log("Initial projects:", listRes.body.projects?.length);

    // 3. Create Project
    let createRes = await request('POST', '/api/projects', { title: 'Test Project' });
    console.log("Create response:", createRes.status, createRes.body);
    const projectId = createRes.body.id;

    // 4. List Projects
    listRes = await request('GET', '/api/projects');
    console.log("Projects after creation:", listRes.body.projects?.length);
    console.log("Contains new project?", listRes.body.projects?.some(p => p.id === projectId));

    // 5. Delete Project
    let delRes = await request('DELETE', `/api/projects/${projectId}`);
    console.log("Delete response:", delRes.status, delRes.body);

    // 6. List Projects
    listRes = await request('GET', '/api/projects');
    console.log("Projects after deletion:", listRes.body.projects?.length);
    console.log("Contains deleted project?", listRes.body.projects?.some(p => p.id === projectId));

  } catch (e) {
    console.error(e);
  }
}

run();
