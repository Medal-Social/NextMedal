
const { getComponentSchema } = require('./src/app/actions/get-component-schema');

async function test() {
  const result = await getComponentSchema('hero');
  console.log('Code length:', result.code?.length);
  console.log('HTML length:', result.html?.length);
  console.log('HTML preview:', result.html?.substring(0, 100));
}

test();

