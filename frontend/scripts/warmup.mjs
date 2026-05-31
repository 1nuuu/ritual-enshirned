import http from 'http';

const routes = ['/', '/dashboard', '/collection', '/hall-of-fame'];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function warmup() {
  console.log('Warming up routes...');
  await delay(3000);
  for (const route of routes) {
    try {
      await new Promise((resolve) => {
        http
          .get(`http://localhost:3000${route}`, (res) => {
            res.resume();
            res.on('end', resolve);
          })
          .on('error', resolve);
      });
      console.log(`✓ ${route}`);
      await delay(400);
    } catch {}
  }
  console.log('All routes warmed up.');
}

warmup();
