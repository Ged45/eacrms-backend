import { swaggerSpec } from '../src/docs/swagger';

const paths = Object.keys(swaggerSpec.paths || {});
console.log('paths count:', paths.length);
console.log(paths.slice(0,50).join('\n'));
console.log('\ncontains payments endpoints?');
console.log('/payments/mock/webhook' in (swaggerSpec.paths || {}));
console.log('/payments/history' in (swaggerSpec.paths || {}));
console.log('/payments/{paymentId}/status' in (swaggerSpec.paths || {}));
console.log('/events/{eventId}/registrations' in (swaggerSpec.paths || {}));
