export default async () => {
  const args = {};
  process.argv.forEach(arg => {
    const [k, ...v] = arg.split(':')
    let val = v.join(':') || true;
    if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }
    args[k] = val;
  });
  return args;
}
