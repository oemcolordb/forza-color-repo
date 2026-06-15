fetch('http://localhost:3000/')
  .then(r => r.text())
  .then(t => {
    const preMatch = t.match(/<pre>([^<]*)<\/pre>/);
    console.log('Error inside <pre>:', preMatch ? preMatch[1] : 'No <pre> found');
    console.log('Full response slice:', t.slice(0, 1000));
  })
  .catch(console.error);
